/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/sections/foundations.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-02
 * ║ Updated: 2026-10-19
 * ║ Purpose: Foundations showcase sections (overview through motion)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useTranslation } from '@azes/i18n';
import {
  Alert,
  AzesThemeProvider,
  brandSeedOrder,
  Card,
  CardContent,
  Chip,
  Grid,
  MuiBox,
  MuiButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useColorScheme,
  useTheme,
} from '@azes/ui-web';
import { IconArrowForward } from '@azes/ui-web/icons';

import { SHOWCASE_NAMESPACE } from '../i18n/createShowcaseI18n.js';
import { SectionIntro, StackText } from './shared.js';

export function OverviewSection({ onNavigate }: { onNavigate: (id: string) => void }) {
  const theme = useTheme();
  const { t } = useTranslation(SHOWCASE_NAMESPACE);

  const jump = (id: string) => (
    <MuiButton
      key={id}
      variant="outlined"
      endIcon={<IconArrowForward fontSize="small" />}
      onClick={() => onNavigate(id)}
      aria-label={`${t('phase.goToSection')}: ${t(`sections.${id}.title`)}`}
    >
      {t(`sections.${id}.title`)}
    </MuiButton>
  );

  return (
    <StackText>
      <Typography variant="h5" component="p" sx={{ fontWeight: 700 }}>
        AZES UI
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640 }}>
        {t('sections.overview.caption')}
      </Typography>

      <Grid container spacing={2}>
        {[
          ['MUI 9.3.1', 'Recognizable Material behavior'],
          ['Light / Dark / System', 'CssVarsProvider + color schemes'],
          ['Responsive', 'Token breakpoints xs–2xl'],
          ['Accessible', 'Focus rings, skip link, AA contrast'],
        ].map(([title, body]) => (
          <Grid key={title} size={{ xs: 12, sm: 6 }}>
            <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle2">{title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {body}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography variant="subtitle1">Live theme</Typography>
      <MuiBox sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        <Chip label={`Primary ${theme.palette.primary.main}`} color="primary" variant="filled" />
        <Chip label={`Secondary ${theme.palette.secondary.main}`} variant="outlined" />
        <Chip label={theme.palette.mode} variant="outlined" />
      </MuiBox>

      <Typography variant="subtitle1">Representative components</Typography>
      <MuiBox sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        <MuiButton variant="contained">Contained</MuiButton>
        <MuiButton variant="outlined">Outlined</MuiButton>
        <Alert severity="info" sx={{ py: 0 }}>
          Status colors stay fixed
        </Alert>
      </MuiBox>

      <Card variant="outlined" sx={{ maxWidth: 420 }}>
        <CardContent>
          <Typography variant="h6">{t('sections.typography.title')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('sections.typography.caption')}
          </Typography>
          <MuiButton
            variant="text"
            size="small"
            sx={{ mt: 1 }}
            endIcon={<IconArrowForward fontSize="small" />}
            onClick={() => onNavigate('typography')}
            aria-label={`${t('phase.goToSection')}: ${t('sections.typography.title')}`}
          >
            {t('sections.typography.title')}
          </MuiButton>
        </CardContent>
      </Card>

      <Stack direction="row" gap={1} wrap>
        {jump('colors')}
        {jump('navigation')}
        {jump('buttons')}
        {jump('accessibility')}
      </Stack>

      <Typography variant="body2" color="text.secondary">
        Open the settings drawer to change mode, primary, nav layout, density, font and container.
        Those values persist in{' '}
        <Typography component="code" variant="body2">
          azes.settings.v1
        </Typography>
        . Viewport presets stay in this showcase only.
      </Typography>
    </StackText>
  );
}

function BrandSeedPreviewCard({ seed }: { seed: (typeof brandSeedOrder)[number] }) {
  const theme = useTheme();
  const { mode, systemMode } = useColorScheme();
  const resolved = mode === 'system' ? systemMode : mode;

  return (
    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', height: '100%' }}>
      <Stack gap={3}>
        <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
          {seed} · {resolved ?? 'light'}
        </Typography>
        <Stack direction="row" gap={1}>
          {[
            ['P', 'primary.main'],
            ['S', 'secondary.main'],
            ['C', 'background.default'],
            ['Paper', 'background.paper'],
            ['S1', 'surface.level1'],
            ['S2', 'surface.level2'],
            ['S3', 'surface.level3'],
          ].map(([label, token]) => (
            <MuiBox key={label} sx={{ flex: 1, minWidth: 0 }}>
              <MuiBox
                sx={{
                  height: 28,
                  bgcolor: token,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 0.5,
                }}
              />
              <Typography variant="caption" color="text.secondary" noWrap>
                {label}
              </Typography>
            </MuiBox>
          ))}
        </Stack>
        <Stack direction="row" gap={2} wrap>
          <MuiButton size="small" variant="contained">
            Primary
          </MuiButton>
          <MuiButton size="small" variant="contained" color="secondary">
            Secondary
          </MuiButton>
          <Chip size="small" color="primary" label="Chip" />
          <Chip size="small" color="secondary" label="Pair" variant="outlined" />
        </Stack>
        <Card variant="outlined">
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="body2" color="text.primary">
              Card on tinted paper
            </Typography>
            <Typography variant="caption" color="text.secondary">
              link {theme.palette.text.link} · focus {theme.palette.border.focus}
            </Typography>
          </CardContent>
        </Card>
        <TableContainer component={Paper} variant="outlined" elevation={0}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Col</TableCell>
                <TableCell>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow hover selected>
                <TableCell>Primary</TableCell>
                <TableCell>{theme.palette.primary.main}</TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell>Secondary</TableCell>
                <TableCell>{theme.palette.secondary.main}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Paper>
  );
}

export function ColorsSection() {
  const theme = useTheme();
  const swatches: Array<[string, string]> = [
    ['primary', theme.palette.primary.main],
    ['secondary', theme.palette.secondary.main],
    ['success', theme.palette.success.main],
    ['warning', theme.palette.warning.main],
    ['error', theme.palette.error.main],
    ['info', theme.palette.info.main],
  ];

  return (
    <SectionIntro title="OKLCH brand seeds, curated secondaries and primary-tinted surfaces (live theme).">
      <Typography variant="subtitle1">Active theme</Typography>
      <Grid container spacing={2}>
        {swatches.map(([name, value]) => (
          <Grid key={name} size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <MuiBox sx={{ height: 48, bgcolor: `${name}.main`, borderRadius: 1 }} />
              <Typography variant="subtitle2" sx={{ mt: 1 }}>
                {name}
              </Typography>
              <Typography variant="caption">{value}</Typography>
            </Paper>
          </Grid>
        ))}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <MuiBox
              sx={{
                height: 48,
                bgcolor: 'background.default',
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
              }}
            />
            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              background.default
            </Typography>
            <Typography variant="caption">{theme.palette.background.default}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <MuiBox
              sx={{
                height: 48,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
              }}
            />
            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              background.paper
            </Typography>
            <Typography variant="caption">{theme.palette.background.paper}</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography color="text.primary">text.primary</Typography>
            <Typography color="text.secondary">text.secondary</Typography>
            <MuiBox sx={{ mt: 1, height: 8, bgcolor: 'divider', borderRadius: 1 }} />
            <Typography variant="caption">divider · surface.level2</Typography>
            <MuiBox
              sx={{
                mt: 1,
                height: 24,
                bgcolor: 'surface.level2',
                borderRadius: 1,
                border: 1,
                borderColor: 'divider',
              }}
            />
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        12 seeds × live mode (toggle light/dark in settings)
      </Typography>
      <Grid container spacing={2}>
        {brandSeedOrder.map((seed) => (
          <Grid key={seed} size={{ xs: 12, md: 6, xl: 4 }}>
            <AzesThemeProvider primary={seed}>
              <BrandSeedPreviewCard seed={seed} />
            </AzesThemeProvider>
          </Grid>
        ))}
      </Grid>
    </SectionIntro>
  );
}

export function TypographySection() {
  return (
    <SectionIntro title="MUI typography variants mapped from design-token primitives.">
      <Typography variant="h1">Heading 1</Typography>
      <Typography variant="h2">Heading 2</Typography>
      <Typography variant="h3">Heading 3</Typography>
      <Typography variant="h4">Heading 4</Typography>
      <Typography variant="h5">Heading 5</Typography>
      <Typography variant="h6">Heading 6</Typography>
      <Typography variant="subtitle1">Subtitle 1 — navigation and card titles</Typography>
      <Typography variant="subtitle2">Subtitle 2 — dense labels</Typography>
      <Typography variant="body1">Body 1 — primary reading text from the sans stack.</Typography>
      <Typography variant="body2">Body 2 — supporting copy and metadata.</Typography>
      <Typography variant="button" sx={{ display: 'block' }}>
        Button
      </Typography>
      <Typography variant="caption">Caption</Typography>
      <Typography variant="overline" sx={{ display: 'block' }}>
        Overline
      </Typography>
    </SectionIntro>
  );
}

export function SpacingSection() {
  const theme = useTheme();
  return (
    <SectionIntro title="MUI spacing factor 4 — theme.spacing(n). No parallel spacing engine.">
      <MuiBox sx={{ display: 'flex', gap: 1, alignItems: 'end', flexWrap: 'wrap' }}>
        {[1, 2, 3, 4, 6, 8].map((step) => (
          <MuiBox key={step} sx={{ textAlign: 'center' }}>
            <MuiBox
              sx={{
                width: theme.spacing(step),
                height: theme.spacing(step),
                bgcolor: 'primary.main',
                mx: 'auto',
              }}
            />
            <Typography variant="caption">{step}</Typography>
          </MuiBox>
        ))}
      </MuiBox>
    </SectionIntro>
  );
}

export function RadiusSection() {
  const theme = useTheme();
  const radii = [
    ['sm', theme.shape.radiusSm],
    ['md', theme.shape.radiusMd],
    ['lg', theme.shape.radiusLg],
  ] as const;

  return (
    <SectionIntro title="Shape radii from design tokens on theme.shape.">
      <MuiBox sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {radii.map(([name, radius]) => (
          <MuiBox key={name} sx={{ textAlign: 'center' }}>
            <MuiBox
              sx={{
                width: 72,
                height: 72,
                bgcolor: 'primary.main',
                borderRadius: `${radius}px`,
              }}
            />
            <Typography variant="caption">
              {name} ({radius}px)
            </Typography>
          </MuiBox>
        ))}
      </MuiBox>
    </SectionIntro>
  );
}

export function ShadowsSection() {
  return (
    <SectionIntro title="Elevation ladder from theme.shadows (token-anchored).">
      <MuiBox sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {[1, 2, 4, 8].map((elevation) => (
          <Paper
            key={elevation}
            elevation={elevation}
            sx={{ width: 96, height: 96, display: 'grid', placeItems: 'center' }}
          >
            <Typography variant="caption">{elevation}</Typography>
          </Paper>
        ))}
      </MuiBox>
    </SectionIntro>
  );
}

export function MotionSection() {
  return (
    <SectionIntro title="Transitions use theme.transitions. CssBaseline shortens motion under prefers-reduced-motion.">
      <MuiButton
        variant="contained"
        sx={{
          transition: (theme) =>
            theme.transitions.create(['transform', 'box-shadow'], {
              duration: theme.transitions.duration.short,
            }),
          '&:hover': { transform: 'translateY(-2px)' },
        }}
      >
        Hover (respects reduced motion)
      </MuiButton>
      <Alert severity="info">
        Skeleton wave and Collapse also honor reduced motion (Phase 8/11).
      </Alert>
    </SectionIntro>
  );
}
