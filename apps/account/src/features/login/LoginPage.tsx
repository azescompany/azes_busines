/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/account/src/features/login/LoginPage.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-20
 * ║ Purpose: Chrome & Canvas login — scatter finale + hold handoff
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import './login.animations.css';

import { getOrCreateDeviceMeta, isAzesApiError, type AzesApiError } from '@azes/api';
import { usePostApiV1AuthLogin } from '@azes/api/azes/auth';
import { sessionFromTokens, useAuthClient } from '@azes/auth';
import { useTranslation } from '@azes/i18n';
import { MuiBox, Typography, useTheme } from '@azes/ui-web';
import { navToneVars } from '@azes/ui-web/navigation';
import { useAzesSettings } from '@azes/ui-web/settings';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { redirectToAdminAfterLogin, type AdminHandoffTokens } from '../../auth/adminHandoff.js';
import {
  consumeLogoutReason,
  LOGOUT_REASON_KEY_QUERY,
  LOGOUT_REASON_QUERY,
  STAY_ON_LOGIN_QUERY,
  SUPPRESS_ADMIN_AUTO_REDIRECT_KEY,
} from '../../auth/logoutReason.js';
import { accountEnv } from '../../config/env.js';
import { ensureDeviceId } from '../../lib/deviceId.js';
import { CaspianKeyLoader, CaspianLogo } from '../../loading/index.js';
import { AuthFormCard } from './AuthFormCard.js';
import { LoginShowcase } from './components/LoginShowcase/index.js';
import { useLoginSuccessTransition } from './hooks/useLoginSuccessTransition.js';
import { LanguageMenu } from './LanguageMenu.js';
import type { LoginFormValues } from './loginSchema.js';

function azesErrorCode(error: AzesApiError): string | undefined {
  const body = error.body;
  if (!body || typeof body !== 'object') return undefined;
  const envelope = body as { error?: { code?: unknown } };
  return typeof envelope.error?.code === 'string' ? envelope.error.code : undefined;
}

function loginErrorMessage(error: AzesApiError, t: (key: string) => string): string {
  const code = azesErrorCode(error);
  if (code === 'INVALID_CREDENTIALS' || error.status === 401) {
    return t('errors.invalidCredentials');
  }
  if (code === 'ACCOUNT_DISABLED' || error.status === 403) {
    return t('errors.accountDisabled');
  }
  if (code === 'RATE_LIMITED' || error.status === 429) {
    return t('errors.rateLimited');
  }
  return error.message || `${t('errors.generic')} (${error.status})`;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return reduced;
}

function useDesktopShowcase(desktopMinWidthPx: number): boolean {
  const [desktop, setDesktop] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia(`(min-width: ${desktopMinWidthPx}px)`).matches,
  );
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const mq = window.matchMedia(`(min-width: ${desktopMinWidthPx}px)`);
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [desktopMinWidthPx]);
  return desktop;
}

function useFinePointerAutofocus(): boolean {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    setOk(window.matchMedia('(pointer: fine)').matches);
  }, []);
  return ok;
}

function prefetchAdminOrigin(): void {
  if (typeof document === 'undefined') return;
  try {
    const origin = new URL(accountEnv.adminAppUrl).origin;
    for (const rel of ['dns-prefetch', 'preconnect'] as const) {
      const sel = `link[rel="${rel}"][href="${origin}"]`;
      if (document.head.querySelector(sel)) continue;
      const link = document.createElement('link');
      link.rel = rel;
      link.href = origin;
      if (rel === 'preconnect') link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  } catch {
    // ignore
  }
}

export function LoginPage() {
  const auth = useAuthClient();
  const theme = useTheme();
  const shell = theme.azes.loginShell;
  const navColor = useAzesSettings((s) => s.navColor);
  const { t, i18n } = useTranslation(['account', 'common']);
  const [formError, setFormError] = useState<string | null>(null);
  const [logoutReason, setLogoutReason] = useState<string | null>(null);
  const [shakeToken, setShakeToken] = useState(0);
  const [handingOff, setHandingOff] = useState(false);
  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const pendingHandoffRef = useRef<AdminHandoffTokens | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const showShowcase = useDesktopShowcase(shell.desktopMinWidthPx);
  const autoFocusUsername = useFinePointerAutofocus();

  async function buildHandoffFromSession(): Promise<AdminHandoffTokens | null> {
    const session = await auth.adapter.getSession();
    const accessToken = session?.tokens.accessToken?.trim();
    if (!accessToken) return null;
    const meta = await getOrCreateDeviceMeta();
    return {
      accessToken,
      refreshToken: session?.tokens.refreshToken,
      deviceId: meta.deviceId,
      userAgent: meta.userAgent,
      platform: meta.platform,
      language: meta.language,
    };
  }

  const performRedirect = useCallback(() => {
    setHandingOff(true);
    const pending = pendingHandoffRef.current;
    const go = (tokens: AdminHandoffTokens) => {
      window.requestAnimationFrame(() => {
        redirectToAdminAfterLogin(tokens);
      });
    };
    if (pending) {
      go(pending);
      return;
    }
    void buildHandoffFromSession().then((tokens) => {
      if (tokens) go(tokens);
    });
  }, [auth]);

  const transition = useLoginSuccessTransition({
    timing: {
      collapseLeadMs: shell.collapseLeadMs,
      expandDurationMs: shell.expandDurationMs,
      scatterDurationMs: shell.scatterDurationMs,
      logoRiseDurationMs: shell.logoRiseDurationMs,
      enterStaggerMs: shell.enterStaggerMs,
      welcomeDelayMs: shell.welcomeDelayMs,
      holdDurationMs: shell.holdDurationMs,
      holdReducedMs: shell.holdReducedMs,
      exitDurationMs: shell.exitDurationMs,
      redirectHoldMs: shell.redirectHoldMs,
      reducedMotionMs: shell.reducedMotionMs,
      mobileCollapseMs: shell.mobileCollapseMs,
      fallbackRedirectMs: shell.fallbackRedirectMs,
    },
    reducedMotion,
    onRedirect: performRedirect,
  });

  const { phase, start, layerRef, isBusy, isRedirecting } = transition;
  const showSuccessOverlay = !showShowcase && phase !== 'idle';

  useEffect(() => {
    void (async () => {
      const params = new URLSearchParams(window.location.search);
      const stay = params.get(STAY_ON_LOGIN_QUERY) === '1';
      const hasLogoutReason =
        params.has(LOGOUT_REASON_QUERY) || params.has(LOGOUT_REASON_KEY_QUERY);

      if (stay) {
        params.delete(STAY_ON_LOGIN_QUERY);
        const next = params.toString();
        window.history.replaceState(
          null,
          '',
          `${window.location.pathname}${next ? `?${next}` : ''}${window.location.hash}`,
        );
        try {
          // Academy (and other apps) set azes_stay to stop Account↔app bounce loops.
          // Keep suppress until a fresh login clears it — do NOT clear just because
          // returnUrl remains in the query after stay is stripped (refresh would loop).
          sessionStorage.setItem(SUPPRESS_ADMIN_AUTO_REDIRECT_KEY, '1');
        } catch {
          // ignore
        }
      }

      if (stay || hasLogoutReason) return;
      try {
        if (sessionStorage.getItem(SUPPRESS_ADMIN_AUTO_REDIRECT_KEY) === '1') return;
      } catch {
        // ignore
      }

      const snapshot = await auth.getSessionSnapshot();
      if (!snapshot.isAuthenticated) return;
      const tokens = await buildHandoffFromSession();
      if (!tokens) return;
      setHandingOff(true);
      window.requestAnimationFrame(() => {
        redirectToAdminAfterLogin(tokens);
      });
    })();
  }, [auth]);

  useEffect(() => {
    void ensureDeviceId();
  }, []);

  useEffect(() => {
    const payload = consumeLogoutReason();
    if (payload.reasonKey) {
      const key = `common:auth.${payload.reasonKey}`;
      const translated = t(key, { defaultValue: '' });
      setLogoutReason(translated || payload.message);
      return;
    }
    setLogoutReason(payload.message);
  }, [t, i18n.language]);

  const login = usePostApiV1AuthLogin();

  const copy = useMemo(
    () => ({
      brandName: t('brand'),
      welcome: t('welcome'),
      title: t('title'),
      username: t('username'),
      password: t('password'),
      forgotPassword: t('forgotPassword'),
      rememberDevice: t('rememberDevice'),
      showPassword: t('showPassword'),
      hidePassword: t('hidePassword'),
      capsLock: t('capsLock'),
      submit: t('submit'),
      submitting: t('submitting'),
      sessionEnded: t('sessionEnded'),
      successTitle: t('success'),
      errorsGeneric: t('errors.generic'),
      securityTitle: t('security.body'),
      securityDetails: t('security.details'),
      securityMore: t('security.more'),
      securityLess: t('security.less'),
      securityDeviceId: t('security.deviceId'),
    }),
    [t],
  );

  const showcaseCopy = useMemo(
    () => ({
      brandLabel: t('brand'),
      title: t('showcase.title'),
      subtitle: t('showcase.subtitle'),
      benefits: [
        { id: 'listings', label: t('showcase.benefits.listings') },
        { id: 'stats', label: t('showcase.benefits.stats') },
        { id: 'agents', label: t('showcase.benefits.agents') },
      ],
      listings: {
        title: t('showcase.listings.title'),
        chips: [t('showcase.listings.chip0'), t('showcase.listings.chip1')] as [string, string],
        prices: [
          t('showcase.listings.p0'),
          t('showcase.listings.p1'),
          t('showcase.listings.p2'),
          t('showcase.listings.p3'),
        ] as [string, string, string, string],
      },
      stats: {
        kpis: [
          { label: t('showcase.stats.k0'), value: t('showcase.stats.v0') },
          { label: t('showcase.stats.k1'), value: t('showcase.stats.v1') },
          { label: t('showcase.stats.k2'), value: t('showcase.stats.v2') },
        ],
        stages: [t('showcase.stats.s0'), t('showcase.stats.s1'), t('showcase.stats.s2')] as [
          string,
          string,
          string,
        ],
      },
      agent: {
        roleLabel: t('showcase.agent.role'),
        verified: t('showcase.agent.verified'),
        stats: [t('showcase.agent.s0'), t('showcase.agent.s1'), t('showcase.agent.s2')] as [
          string,
          string,
          string,
        ],
        contact: t('showcase.agent.contact'),
        message: t('showcase.agent.message'),
      },
      map: {
        title: t('showcase.map.title'),
        chips: [t('showcase.map.c0'), t('showcase.map.c1'), t('showcase.map.c2')] as [
          string,
          string,
          string,
        ],
      },
      deals: {
        columns: [t('showcase.deals.c0'), t('showcase.deals.c1'), t('showcase.deals.c2')] as [
          string,
          string,
          string,
        ],
        prices: [
          t('showcase.deals.p0'),
          t('showcase.deals.p1'),
          t('showcase.deals.p2'),
          t('showcase.deals.p3'),
          t('showcase.deals.p4'),
        ] as [string, string, string, string, string],
      },
    }),
    [t],
  );

  async function handleSubmit(values: LoginFormValues) {
    if (phase !== 'idle') return;
    setFormError(null);
    setLogoutReason(null);
    try {
      sessionStorage.removeItem(SUPPRESS_ADMIN_AUTO_REDIRECT_KEY);
    } catch {
      // ignore
    }
    try {
      const device = await getOrCreateDeviceMeta();
      const response = await login.mutateAsync({
        data: {
          username: values.userName,
          password: values.password,
          deviceId: device.deviceId,
          userAgent: device.userAgent,
          platform: device.platform,
          language: device.language,
        },
      });
      if (!response.accessToken) {
        setFormError(t('errors.noToken'));
        setShakeToken((n) => n + 1);
        return;
      }
      await auth.establishSession(sessionFromTokens(response.accessToken, response.refreshToken));
      pendingHandoffRef.current = {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        deviceId: device.deviceId,
        userAgent: device.userAgent,
        platform: device.platform,
        language: device.language,
      };
      prefetchAdminOrigin();
      setLiveStatus(t('redirectingAnnounce'));
      start();
    } catch (error) {
      setShakeToken((n) => n + 1);
      if (isAzesApiError(error)) {
        setFormError(loginErrorMessage(error, t));
        return;
      }
      setFormError(error instanceof Error ? error.message : t('errors.generic'));
    }
  }

  const busy = isBusy || handingOff;
  const showHandoffLoader = handingOff || isRedirecting;
  const canvasExiting = phase !== 'idle';

  return (
    <MuiBox
      component="main"
      id="main-content"
      tabIndex={-1}
      aria-busy={busy || undefined}
      className="azes-login-shell-enter"
      sx={{
        position: 'relative',
        minHeight: '100dvh',
        overflow: 'hidden',
        ...navToneVars(theme, navColor),
        bgcolor: 'var(--azes-nav-bg)',
        ['--azes-login-canvas-end' as string]: `${shell.canvasPercent}%`,
        ['--azes-login-expand-ms' as string]: `${shell.expandDurationMs}ms`,
        ['--azes-login-expand-ease' as string]: shell.expandEasing,
        ['--azes-login-settle-ease' as string]: shell.settleEasing,
        ['--azes-login-scatter-ms' as string]: `${shell.scatterDurationMs}ms`,
        ['--azes-login-logo-rise-ms' as string]: `${shell.logoRiseDurationMs}ms`,
        ['--azes-login-fade-ms' as string]: `${shell.formFadeDurationMs}ms`,
        ['--azes-login-enter-ms' as string]: `${shell.enterDurationMs}ms`,
        ['--azes-login-stagger-ms' as string]: `${shell.enterStaggerMs}ms`,
        ['--azes-login-float-ms' as string]: `${shell.floatDurationMs}ms`,
        ['--azes-login-float-amp' as string]: theme.spacing(shell.floatAmplitudeSpacing),
        ['--azes-login-shake-ms' as string]: `${shell.shakeDurationMs}ms`,
        ['--azes-login-shake-x' as string]: theme.spacing(shell.shakeDistanceSpacing),
        ['--azes-layout-chrome-join' as string]: `${theme.azes.layout.chromeJoinRadius}px`,
      }}
    >
      {liveStatus ? (
        <MuiBox
          component="span"
          role="status"
          aria-live="polite"
          sx={{
            position: 'absolute',
            width: 1,
            height: 1,
            overflow: 'hidden',
            clipPath: 'inset(50%)',
            whiteSpace: 'nowrap',
          }}
        >
          {liveStatus}
        </MuiBox>
      ) : null}

      <MuiBox
        sx={{
          display: 'grid',
          minHeight: '100dvh',
          gridTemplateColumns: '1fr',
          p: showShowcase ? shell.chromeInsetSpacing : 0,
          gap: showShowcase ? shell.chromeInsetSpacing : 0,
          [`@media (min-width: ${shell.desktopMinWidthPx}px)`]: {
            gridTemplateColumns: showShowcase
              ? `${shell.showcasePercent}fr ${shell.canvasPercent}fr`
              : '1fr',
          },
        }}
      >
        {showShowcase ? (
          <LoginShowcase
            ref={layerRef}
            layout="chrome"
            copy={showcaseCopy}
            navTone={navColor}
            reducedMotion={reducedMotion}
            phase={phase}
            welcome={t('welcome')}
          />
        ) : (
          <MuiBox
            component="header"
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 2,
              minHeight: `${theme.azes.layout.headerHeightMobile}px`,
              color: 'var(--azes-nav-text-strong)',
              opacity: canvasExiting ? 0 : 1,
              transition: `opacity var(--azes-login-fade-ms) ease`,
            }}
          >
            <CaspianLogo
              variant="mark"
              colorMode="mono"
              surface="nav"
              tone="onChrome"
              navTone={navColor}
              label={t('brand')}
              height={theme.spacing(4)}
            />
          </MuiBox>
        )}

        {showSuccessOverlay ? (
          <LoginShowcase
            ref={layerRef}
            layout="overlay"
            copy={showcaseCopy}
            navTone={navColor}
            reducedMotion={reducedMotion}
            phase={phase}
            welcome={t('welcome')}
          />
        ) : null}

        <MuiBox
          className={['azes-login-canvas', canvasExiting ? 'azes-login-canvas--exiting' : '']
            .filter(Boolean)
            .join(' ')}
          sx={{
            position: 'relative',
            zIndex: shell.zIndexCanvas,
            display: 'flex',
            flexDirection: 'column',
            minHeight: showShowcase
              ? '100%'
              : `calc(100dvh - ${theme.azes.layout.headerHeightMobile}px)`,
            bgcolor: theme.vars.palette.background.paper,
            color: theme.vars.palette.text.primary,
            borderRadius: showShowcase
              ? 'var(--azes-layout-chrome-join)'
              : 'var(--azes-layout-chrome-join) var(--azes-layout-chrome-join) 0 0',
            boxShadow: showShowcase ? theme.azes.customShadows.card : 'none',
            overflow: 'auto',
            pt: 'env(safe-area-inset-top)',
            pb: 'env(safe-area-inset-bottom)',
          }}
        >
          <MuiBox
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: { xs: 2.5, sm: 4 },
              pt: 2,
              pb: 1,
              flexShrink: 0,
            }}
          >
            <LanguageMenu
              tone="onPaper"
              value={i18n.language}
              onChange={(code) => {
                void i18n.changeLanguage(code);
              }}
              aria-label={t('language')}
            />
          </MuiBox>

          <MuiBox
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: { xs: 2.5, sm: 4 },
              py: { xs: 2, sm: 3 },
              minHeight: 0,
            }}
          >
            <AuthFormCard
              copy={copy}
              formError={formError}
              logoutReason={logoutReason}
              isPending={login.isPending}
              transitionPhase={phase}
              shakeToken={shakeToken}
              autoFocusUsername={autoFocusUsername}
              onSubmit={handleSubmit}
            />
          </MuiBox>

          <MuiBox component="footer" sx={{ px: { xs: 2.5, sm: 4 }, py: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {t('footer', { year: new Date().getFullYear() })}
            </Typography>
          </MuiBox>
        </MuiBox>
      </MuiBox>

      {showHandoffLoader ? (
        <CaspianKeyLoader
          brandLabel={t('common:brand')}
          label={t('common:loading.handoff')}
          subtitle={t('common:loading.handoffSubtitle')}
        />
      ) : null}
    </MuiBox>
  );
}
