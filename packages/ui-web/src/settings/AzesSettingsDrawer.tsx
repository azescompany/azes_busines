/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/settings/AzesSettingsDrawer.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-04
 * ║ Updated: 2026-10-11
 * ║ Purpose: Premium settings drawer UI — gear trigger + option cards
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import ContrastOutlinedIcon from '@mui/icons-material/ContrastOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import DensityMediumOutlinedIcon from '@mui/icons-material/DensityMediumOutlined';
import DensitySmallOutlinedIcon from '@mui/icons-material/DensitySmallOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SettingsBrightnessOutlinedIcon from '@mui/icons-material/SettingsBrightnessOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined';
import VerticalAlignTopOutlinedIcon from '@mui/icons-material/VerticalAlignTopOutlined';
import ViewSidebarOutlinedIcon from '@mui/icons-material/ViewSidebarOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import WidthFullOutlinedIcon from '@mui/icons-material/WidthFullOutlined';
import WidthNormalOutlinedIcon from '@mui/icons-material/WidthNormalOutlined';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useColorScheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { fontFamilyPresets } from '@azes/design-tokens';
import { useEffect, useId, type ReactElement, type ReactNode } from 'react';

import { AzesSidePanel } from '../side-panel/AzesSidePanel';
import { useSidePanel } from '../side-panel/AzesSidePanelProvider';
import {
  brandSeedOrder,
  brandSeeds,
  resolveBrandPrimary,
  type BrandSeedName,
} from '../theme/brand';
import { AZES_FONT_PRESET_IDS } from '../theme/createAzesTheme';
import { loadAzesFont } from '../theme/loadAzesFont';
import {
  useAzesSettings,
  useAzesSettingsActions,
  useIsSettingsControlVisible,
} from './AzesSettingsProvider';
import { SettingsColorSwatchGrid } from './SettingsColorSwatchGrid';
import { SettingsModePreview } from './SettingsModePreview';
import { SettingsOptionCardGroup, type SettingsOptionColumns } from './SettingsOptionCard';
import { AZES_SETTINGS_OPTIONS, type AzesSettings } from './types';

/** Distinctive sample phrases with Azerbaijani characters for font cards. */
const FONT_SAMPLE_TEXT = 'Aa əşığ';
const FONT_SAMPLE_GLYPH = 'Ag';

type OptionKey = keyof typeof AZES_SETTINGS_OPTIONS;

export type AzesSettingsLabels = {
  title: string;
  open: string;
  close: string;
  reset: string;
  mode: string;
  primary: string;
  customPrimary: string;
  customPrimaryInvalid: string;
  navLayout: string;
  navColor: string;
  density: string;
  fontFamily: string;
  container: string;
  direction: string;
  headerMode: string;
  options: Record<string, string>;
};

export const DEFAULT_AZES_SETTINGS_LABELS: AzesSettingsLabels = {
  title: 'Settings',
  open: 'Open settings',
  close: 'Close settings',
  reset: 'Reset settings',
  mode: 'Mode',
  primary: 'Primary color',
  customPrimary: 'Custom hex',
  customPrimaryInvalid:
    'Use a 6-digit hex with at least 4.5:1 text contrast in light and dark mode.',
  navLayout: 'Navigation layout',
  navColor: 'Navigation color',
  density: 'Density',
  fontFamily: 'Font',
  container: 'Container',
  direction: 'Direction',
  headerMode: 'Header on scroll',
  options: {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    vertical: 'Vertical',
    mini: 'Mini',
    horizontal: 'Horizontal',
    integrated: 'Integrated',
    contrast: 'Contrast',
    comfortable: 'Comfortable',
    compact: 'Compact',
    inter: 'Inter',
    sourceSerif: 'Source Serif',
    nunito: 'Nunito',
    ibmPlexSans: 'IBM Plex Sans',
    fraunces: 'Fraunces',
    fluid: 'Fluid',
    // Shared key for container width + headerMode; header control uses alwaysVisible below.
    fixed: 'Fixed',
    alwaysVisible: 'Always visible',
    autoHide: 'Auto hide',
    ltr: 'LTR',
    rtl: 'RTL',
  },
};

const SETTING_OPTION_ICONS: Partial<Record<OptionKey, Record<string, ReactElement>>> = {
  headerMode: {
    fixed: <VisibilityOutlinedIcon />,
    autoHide: <VerticalAlignTopOutlinedIcon />,
  },
  navColor: {
    integrated: <ViewSidebarOutlinedIcon />,
    contrast: <ContrastOutlinedIcon />,
  },
  density: {
    comfortable: <DensityMediumOutlinedIcon />,
    compact: <DensitySmallOutlinedIcon />,
  },
  container: {
    fluid: <WidthFullOutlinedIcon />,
    fixed: <WidthNormalOutlinedIcon />,
  },
};

const SECTION_ICONS: Partial<Record<OptionKey | 'mode' | 'primary', ReactElement>> = {
  mode: <LightModeOutlinedIcon />,
  primary: <PaletteOutlinedIcon />,
  headerMode: <VisibilityOutlinedIcon />,
  navColor: <ViewSidebarOutlinedIcon />,
  density: <DensityMediumOutlinedIcon />,
  fontFamily: <TextFieldsOutlinedIcon />,
  container: <WidthFullOutlinedIcon />,
};

export type AzesSettingsSectionProps = {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
};

export function AzesSettingsSection({ title, icon, children }: AzesSettingsSectionProps) {
  const id = useId();
  return (
    <Box component="section" aria-labelledby={id} sx={{ mb: 0 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: '12px',
        }}
      >
        {icon ? (
          <Box
            aria-hidden
            sx={(theme) => ({
              display: 'grid',
              placeItems: 'center',
              color: theme.vars.palette.text.secondary,
              lineHeight: 0,
              '& .MuiSvgIcon-root': { fontSize: 18 },
            })}
          >
            {icon}
          </Box>
        ) : null}
        <Typography
          id={id}
          component="h3"
          sx={(theme) => ({
            m: 0,
            fontSize: '11.5px',
            fontWeight: 700,
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            color: theme.vars.palette.text.secondary,
          })}
        >
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  );
}

export type AzesSettingsControlProps<K extends OptionKey> = {
  settingKey: K;
  label: string;
  optionLabels?: Record<string, string>;
  columns?: SettingsOptionColumns;
};

/** Segmented option cards for an enumerated setting. Renders nothing when hidden/locked. */
export function AzesSettingsControl<K extends OptionKey>({
  settingKey,
  label,
  optionLabels = {},
  columns,
}: AzesSettingsControlProps<K>) {
  const visible = useIsSettingsControlVisible(settingKey);
  const value = useAzesSettings((s) => s[settingKey]);
  const { set } = useAzesSettingsActions();
  if (!visible) return null;

  const isFont = settingKey === 'fontFamily';
  const options = AZES_SETTINGS_OPTIONS[settingKey].map((option) => ({
    value: option,
    label: optionLabels[option] ?? option,
    icon: isFont ? undefined : SETTING_OPTION_ICONS[settingKey]?.[option],
    sampleFontFamily: isFont
      ? fontFamilyPresets[option as keyof typeof fontFamilyPresets]
      : undefined,
    sampleGlyph: isFont ? FONT_SAMPLE_GLYPH : undefined,
    sampleText: isFont ? FONT_SAMPLE_TEXT : undefined,
  }));

  const cols: SettingsOptionColumns = columns ?? (isFont ? 2 : options.length >= 3 ? 3 : 2);

  return (
    <AzesSettingsSection title={label} icon={SECTION_ICONS[settingKey]}>
      <SettingsOptionCardGroup
        label={label}
        value={String(value)}
        columns={cols}
        options={options}
        onChange={(next) => set({ [settingKey]: next } as Partial<AzesSettings>)}
      />
    </AzesSettingsSection>
  );
}

function ModeControl({ labels }: { labels: AzesSettingsLabels }) {
  const { mode, setMode } = useColorScheme();
  const value = mode ?? 'system';
  return (
    <AzesSettingsSection title={labels.mode} icon={SECTION_ICONS.mode}>
      <SettingsOptionCardGroup
        label={labels.mode}
        value={value}
        columns={3}
        options={(['light', 'dark', 'system'] as const).map((option) => ({
          value: option,
          label: labels.options[option] ?? option,
          icon:
            option === 'light' ? (
              <LightModeOutlinedIcon />
            ) : option === 'dark' ? (
              <DarkModeOutlinedIcon />
            ) : (
              <SettingsBrightnessOutlinedIcon />
            ),
          preview: <SettingsModePreview kind={option} />,
        }))}
        onChange={(next) => setMode(next as 'light' | 'dark' | 'system')}
      />
    </AzesSettingsSection>
  );
}

function PrimaryControl({ labels }: { labels: AzesSettingsLabels }) {
  const visible = useIsSettingsControlVisible('primary');
  const primary = useAzesSettings((s) => s.primary);
  const { set } = useAzesSettingsActions();
  const resolved = resolveBrandPrimary(primary).toUpperCase();
  const selectedSeed =
    brandSeedOrder.find((name) => brandSeeds[name].toUpperCase() === resolved) ?? null;
  if (!visible) return null;

  return (
    <AzesSettingsSection title={labels.primary} icon={SECTION_ICONS.primary}>
      <SettingsColorSwatchGrid
        label={labels.primary}
        selectedSeed={selectedSeed}
        onSelect={(name: BrandSeedName) => {
          set({ primary: name });
        }}
      />
    </AzesSettingsSection>
  );
}

export type AzesSettingsDrawerProps = {
  /**
   * Controlled open (legacy). Prefer `useSidePanel('settings').toggle` on the trigger
   * and omit this prop so the global side-panel host owns visibility.
   */
  open?: boolean;
  /** Called when the panel is dismissed (legacy controlled API). */
  onClose?: () => void;
  labels?: Partial<Omit<AzesSettingsLabels, 'options'>> & { options?: Record<string, string> };
  /**
   * @deprecated Custom hex UI removed. Kept for API compatibility; ignored.
   */
  allowCustomPrimary?: boolean;
  /** Extra app-specific sections rendered at the end. */
  children?: ReactNode;
};

/**
 * Settings content registered as `AzesSidePanel` id `"settings"`.
 * Shell chrome (drawer/header/close) comes from `AzesSidePanelHost` inside `AzesUiProvider`.
 */
export function AzesSettingsDrawer({
  open,
  onClose,
  labels: labelsProp,
  children,
}: AzesSettingsDrawerProps) {
  const labels: AzesSettingsLabels = {
    ...DEFAULT_AZES_SETTINGS_LABELS,
    ...labelsProp,
    options: { ...DEFAULT_AZES_SETTINGS_LABELS.options, ...labelsProp?.options },
  };
  const { reset } = useAzesSettingsActions();
  const { setMode } = useColorScheme();
  const {
    isOpen: settingsOpen,
    open: openSettings,
    close: closeSettings,
  } = useSidePanel('settings');

  // Legacy controlled open/onClose → sync with the global side panel.
  useEffect(() => {
    if (open === undefined) return;
    if (open && !settingsOpen) {
      void openSettings();
    } else if (!open && settingsOpen) {
      void closeSettings();
    }
  }, [open, settingsOpen, openSettings, closeSettings]);

  // Prefetch every preset while the panel is open so font cards preview real faces
  // without eagerly loading them at app boot.
  useEffect(() => {
    if (!settingsOpen) return;
    for (const preset of AZES_FONT_PRESET_IDS) {
      void loadAzesFont(preset);
    }
  }, [settingsOpen]);

  function handleReset() {
    reset();
    setMode('system');
  }

  return (
    <AzesSidePanel
      id="settings"
      title={labels.title}
      width="md"
      onClose={onClose}
      footer={
        <Button
          size="small"
          variant="outlined"
          startIcon={<RestartAltIcon />}
          onClick={handleReset}
          aria-label={labels.reset}
          sx={(theme) => ({
            borderRadius: theme.azesRadius.md,
            textTransform: 'none',
            borderColor: theme.vars.palette.border.default,
            color: theme.vars.palette.text.secondary,
            '&:hover': {
              borderColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} 40%, ${theme.vars.palette.border.default})`,
              backgroundColor: `color-mix(in srgb, ${theme.vars.palette.primary.main} 6%, transparent)`,
            },
          })}
        >
          {labels.reset}
        </Button>
      }
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3.5,
        }}
      >
        <ModeControl labels={labels} />
        <PrimaryControl labels={labels} />
        <AzesSettingsControl
          settingKey="navLayout"
          label={labels.navLayout}
          optionLabels={labels.options}
        />
        <AzesSettingsControl
          settingKey="headerMode"
          label={labels.headerMode}
          columns={2}
          optionLabels={{
            ...labels.options,
            // Distinct from Container "Fixed" (max-width) — this pins the app bar.
            fixed: labels.options.alwaysVisible ?? 'Always visible',
            autoHide: labels.options.autoHide ?? 'Auto hide',
          }}
        />
        <AzesSettingsControl
          settingKey="navColor"
          label={labels.navColor}
          columns={2}
          optionLabels={labels.options}
        />
        <AzesSettingsControl
          settingKey="density"
          label={labels.density}
          columns={2}
          optionLabels={labels.options}
        />
        <AzesSettingsControl
          settingKey="fontFamily"
          label={labels.fontFamily}
          columns="auto"
          optionLabels={labels.options}
        />
        <AzesSettingsControl
          settingKey="container"
          label={labels.container}
          columns={2}
          optionLabels={labels.options}
        />
        <AzesSettingsControl
          settingKey="direction"
          label={labels.direction}
          columns={2}
          optionLabels={labels.options}
        />
        {children}
      </Box>
    </AzesSidePanel>
  );
}

export type AzesSettingsButtonProps = { onClick: () => void; label?: string };

const SETTINGS_ICON_PX = 24;
/** Glass disc is 4px wider than the icon on every side. */
const SETTINGS_GLASS_PX = SETTINGS_ICON_PX + 8;

/**
 * Fixed right-edge settings gear: primary → secondary on hover; glass disc behind;
 * continuous forward spin → pause → reverse spin → pause (linear, infinite).
 */
export function AzesSettingsButton({
  onClick,
  label = DEFAULT_AZES_SETTINGS_LABELS.open,
}: AzesSettingsButtonProps) {
  return (
    <Tooltip title={label} placement="left">
      <Box
        component="button"
        type="button"
        aria-label={label}
        onClick={onClick}
        sx={(theme) => ({
          position: 'fixed',
          insetBlockStart: '50%',
          insetInlineEnd: theme.spacing(2),
          zIndex: theme.zIndex.speedDial,
          display: 'grid',
          placeItems: 'center',
          width: SETTINGS_GLASS_PX + 8,
          height: SETTINGS_GLASS_PX + 8,
          margin: 0,
          padding: 0,
          border: 0,
          background: 'transparent',
          cursor: 'pointer',
          appearance: 'none',
          WebkitAppearance: 'none',
          transform: 'translateY(-50%)',
          color: theme.vars.palette.primary.main,
          '&:hover': {
            color: theme.vars.palette.secondary.main,
          },
          '&:focus-visible': {
            outline: 'none',
            borderRadius: '50%',
            boxShadow: `0 0 0 3px color-mix(in srgb, ${theme.vars.palette.primary.main} 40%, transparent)`,
          },
          '@media (prefers-reduced-motion: reduce)': {
            '& .azes-settings-spin': {
              animation: 'none',
            },
          },
        })}
      >
        <Box
          aria-hidden
          sx={(theme) => ({
            position: 'absolute',
            width: SETTINGS_GLASS_PX,
            height: SETTINGS_GLASS_PX,
            borderRadius: '50%',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: `color-mix(in srgb, ${theme.vars.palette.common.white} 42%, ${theme.vars.palette.divider})`,
            background: `linear-gradient(
              145deg,
              color-mix(in srgb, ${theme.vars.palette.common.white} 38%, transparent) 0%,
              color-mix(in srgb, ${theme.vars.palette.common.white} 10%, transparent) 48%,
              color-mix(in srgb, ${theme.vars.palette.common.black} 8%, transparent) 100%
            )`,
            backdropFilter: 'blur(10px) saturate(1.35)',
            WebkitBackdropFilter: 'blur(10px) saturate(1.35)',
            boxShadow: [
              `inset 0 1px 0 color-mix(in srgb, ${theme.vars.palette.common.white} 55%, transparent)`,
              `inset 0 -1px 0 color-mix(in srgb, ${theme.vars.palette.common.black} 12%, transparent)`,
              `0 4px 14px color-mix(in srgb, ${theme.vars.palette.common.black} 16%, transparent)`,
            ].join(', '),
            pointerEvents: 'none',
          })}
        />
        <Box
          className="azes-settings-spin"
          sx={{
            display: 'grid',
            placeItems: 'center',
            lineHeight: 0,
            animation: 'azes-settings-gear-spin 5.5s linear infinite',
            '@keyframes azes-settings-gear-spin': {
              '0%': { transform: 'rotate(0deg)' },
              '35%': { transform: 'rotate(360deg)' },
              '50%': { transform: 'rotate(360deg)' },
              '85%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(0deg)' },
            },
          }}
        >
          <SettingsOutlinedIcon sx={{ fontSize: SETTINGS_ICON_PX }} />
        </Box>
      </Box>
    </Tooltip>
  );
}
