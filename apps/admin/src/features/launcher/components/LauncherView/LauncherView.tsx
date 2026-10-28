/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/admin/src/features/launcher/components/LauncherView/LauncherView.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-28
 * ║ Updated: 2026-10-28
 * ║ Purpose: Unified launcher — same UI for demo | tenant audience
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useAuthSession, useAuthSessionReady } from '@azes/auth';
import { useTranslation, type SupportedLocale } from '@azes/i18n';
import {
  Alert,
  InputAdornment,
  MuiBox,
  Stack,
  Text,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@azes/ui-web';
import { IconSearch } from '@azes/ui-web/icons';
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router';

import { modulePath, pathTo } from '../../../../app/router/paths.js';
import { isPlatformOperator, resolveAudience } from '../../../../auth/audience.js';
import { useSessionMe } from '../../../../auth/useSessionMe.js';
import { ADMIN_NAMESPACE } from '../../../../i18n/createAdminI18n.js';
import type { ResolveVisibleModulesOptions } from '../../../../modules/index.js';
import type { AzesModuleDef } from '../../../../modules/types.js';
import { EmptyState } from '../../../../shared/adminChrome/index.js';
import { useAppsPrefs } from '../../hooks/useAppsPrefs.js';
import { useFilteredModules, type AppsViewMode } from '../../hooks/useFilteredModules.js';
import { LauncherScatterGrid } from '../LauncherScatterGrid/index.js';
import { LauncherViewSkeleton } from '../LauncherViewSkeleton/LauncherViewSkeleton.js';
import { ModuleTile } from '../ModuleTile/ModuleTile.js';

const COLS = { xs: 3, sm: 4, md: 5, lg: 6 } as const;

function currentColCount(): number {
  if (typeof window === 'undefined') return COLS.xs;
  const w = window.innerWidth;
  if (w >= 1024) return COLS.lg;
  if (w >= 768) return COLS.md;
  if (w >= 640) return COLS.sm;
  return COLS.xs;
}

export function LauncherView() {
  const { t, i18n } = useTranslation(ADMIN_NAMESPACE);
  const theme = useTheme();
  const navigate = useNavigate();
  const locale = (i18n.language?.slice(0, 2) || 'az') as SupportedLocale;
  const sessionReady = useAuthSessionReady();
  const session = useAuthSession();
  const audience = resolveAudience(sessionReady && session.isAuthenticated);
  const isTenant = audience === 'tenant';

  const meQuery = useSessionMe({ enabled: isTenant });
  const showSkeleton = isTenant && meQuery.isLoading && !meQuery.data;

  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<AppsViewMode>('grouped');
  const searchRef = useRef<HTMLInputElement>(null);
  const tileEls = useRef<Map<string, HTMLElement>>(new Map());
  const [focusIndex, setFocusIndex] = useState(0);

  const { favorites, recent, dismissDemoBanner, toggleFavorite, dismissDemoBannerAction } =
    useAppsPrefs();

  const platform = isPlatformOperator(meQuery.data?.roles, meQuery.data?.role);
  const resolveOptions = useMemo<ResolveVisibleModulesOptions>(() => {
    if (!isTenant) return { policy: 'demo' };
    if (platform) return { policy: 'platform' };
    return { policy: 'tenantStrict' };
  }, [isTenant, platform]);

  const entitlements = isTenant ? meQuery.data?.modules : undefined;

  const { visible } = useFilteredModules({
    entitlements,
    search: '',
    viewMode: 'all',
    t,
    resolveOptions,
  });

  const { filtered, grouped } = useFilteredModules({
    entitlements,
    search,
    viewMode,
    t,
    resolveOptions,
  });

  const flatIds = useMemo(() => filtered.map((m) => m.id), [filtered]);

  const favList = useMemo(
    () =>
      favorites
        .map((id) => visible.find((m) => m.id === id))
        .filter((m): m is AzesModuleDef => Boolean(m)),
    [favorites, visible],
  );

  const recentList = useMemo(() => {
    const list: AzesModuleDef[] = [];
    for (const id of recent) {
      const mod = visible.find((m) => m.id === id);
      if (mod && !favorites.includes(mod.id)) list.push(mod);
      if (list.length >= 6) break;
    }
    return list;
  }, [recent, visible, favorites]);

  const openModule = useCallback(
    (moduleId: string) => {
      navigate(pathTo(modulePath(moduleId), locale));
    },
    [navigate, locale],
  );

  useEffect(() => {
    const onSlash = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) {
        return;
      }
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', onSlash as unknown as EventListener);
    return () => window.removeEventListener('keydown', onSlash as unknown as EventListener);
  }, []);

  const onTileKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>, index: number) => {
      const cols = currentColCount();
      let next = index;
      if (event.key === 'ArrowRight') next = Math.min(flatIds.length - 1, index + 1);
      else if (event.key === 'ArrowLeft') next = Math.max(0, index - 1);
      else if (event.key === 'ArrowDown') next = Math.min(flatIds.length - 1, index + cols);
      else if (event.key === 'ArrowUp') next = Math.max(0, index - cols);
      else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const id = flatIds[index];
        if (id) openModule(id);
        return;
      } else return;

      event.preventDefault();
      setFocusIndex(next);
      const id = flatIds[next];
      if (id) tileEls.current.get(id)?.focus();
    },
    [flatIds, openModule],
  );

  const maxW = theme.azes.layout.contentMaxWidth;
  const dot = `color-mix(in srgb, ${theme.vars.palette.text.primary} 8%, transparent)`;

  if (showSkeleton) {
    return <LauncherViewSkeleton />;
  }

  const renderGrid = (
    mods: AzesModuleDef[],
    idOffset = 0,
    scrollTrigger = true,
    intensity: 'full' | 'soft' = 'full',
  ) => (
    <LauncherScatterGrid count={mods.length} scrollTrigger={scrollTrigger} intensity={intensity}>
      {mods.map((mod, index) => {
        const flatIndex = idOffset + index;
        return (
          <ModuleTile
            key={mod.id}
            module={mod}
            favorite={favorites.includes(mod.id)}
            onOpen={openModule}
            onToggleFavorite={toggleFavorite}
            tabIndex={flatIndex === focusIndex ? 0 : -1}
            tileRef={(el) => {
              if (el) tileEls.current.set(mod.id, el);
              else tileEls.current.delete(mod.id);
            }}
            onKeyDown={(e) => onTileKeyDown(e, flatIndex)}
          />
        );
      })}
    </LauncherScatterGrid>
  );

  /** Demo audience only — tenant sees live modules (no “not saved” banner). */
  const bannerVisible = audience === 'demo' && !dismissDemoBanner;

  return (
    <MuiBox
      sx={{
        mx: 'auto',
        width: '100%',
        maxWidth: maxW,
        minHeight: '60vh',
        borderRadius: `${theme.shape.radiusLg}px`,
        backgroundImage: `radial-gradient(${dot} 1px, transparent 1px)`,
        backgroundSize: '16px 16px',
        backgroundColor: 'background.default',
        px: { xs: 1, sm: 2 },
        py: { xs: 2, md: 3 },
      }}
    >
      <Stack gap={3}>
        {bannerVisible ? (
          <Alert
            severity="info"
            onClose={dismissDemoBannerAction}
            sx={{
              width: '100%',
              maxWidth: { xs: '100%', sm: theme.spacing(80) },
              mx: 'auto',
              alignItems: 'flex-start',
              '& .MuiAlert-message': {
                width: '100%',
                overflowWrap: 'anywhere',
              },
            }}
          >
            {t('apps.demoBanner')}
          </Alert>
        ) : null}

        <TextField
          inputRef={searchRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('apps.search.placeholder')}
          fullWidth
          size="medium"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch fontSize="small" />
                </InputAdornment>
              ),
            },
            htmlInput: { 'aria-label': t('apps.search.placeholder') },
          }}
          sx={{ maxWidth: { sm: 480 }, mx: 'auto', width: '100%' }}
        />

        <MuiBox sx={{ display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={viewMode}
            onChange={(_, v: AppsViewMode | null) => {
              if (v) setViewMode(v);
            }}
            aria-label={t('apps.view.label')}
          >
            <ToggleButton value="all">{t('apps.view.all')}</ToggleButton>
            <ToggleButton value="grouped">{t('apps.view.grouped')}</ToggleButton>
          </ToggleButtonGroup>
        </MuiBox>

        {(favList.length > 0 || recentList.length > 0) && !search ? (
          <Stack gap={2} align="center">
            {favList.length > 0 ? (
              <MuiBox sx={{ width: '100%' }}>
                <Stack gap={1} align="center">
                  <Text size="sm" weight="semibold" tone="muted">
                    {t('apps.favorites')}
                  </Text>
                  {renderGrid(favList, 0, true, 'full')}
                </Stack>
              </MuiBox>
            ) : null}
            {recentList.length > 0 ? (
              <MuiBox sx={{ width: '100%' }}>
                <Stack gap={1} align="center">
                  <Text size="sm" weight="semibold" tone="muted">
                    {t('apps.recent')}
                  </Text>
                  {renderGrid(recentList, 0, true, favList.length > 0 ? 'soft' : 'full')}
                </Stack>
              </MuiBox>
            ) : null}
          </Stack>
        ) : null}

        {filtered.length === 0 ? (
          <EmptyState title={t('apps.empty')} description={t('apps.emptyHint')} />
        ) : viewMode === 'grouped' && grouped ? (
          <Stack gap={3} align="center">
            {grouped.map((g, gi) => {
              const leadTaken = favList.length > 0 || recentList.length > 0;
              const intensity = !leadTaken && gi === 0 ? 'full' : 'soft';
              return (
                <MuiBox key={g.category} sx={{ width: '100%' }}>
                  <Stack gap={2} align="center">
                    <Text size="md" weight="semibold">
                      {t(`apps.category.${g.category}`)}
                    </Text>
                    {renderGrid(g.modules, 0, true, intensity)}
                  </Stack>
                </MuiBox>
              );
            })}
          </Stack>
        ) : (
          <Stack gap={2} align="center">
            <Text size="sm" weight="semibold" tone="muted">
              {t('apps.allApps')}
            </Text>
            {renderGrid(filtered, 0, false, 'full')}
          </Stack>
        )}
      </Stack>
    </MuiBox>
  );
}
