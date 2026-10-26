/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/sections/components.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-02
 * ║ Updated: 2026-10-19
 * ║ Purpose: Inputs, surfaces, data-display and feedback showcase sections
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useTranslation } from '@azes/i18n';
import {
  Alert,
  AlertTitle,
  Autocomplete,
  Avatar,
  AvatarGroup,
  AzesAccordion,
  Badge,
  ButtonGroup,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  LinearProgress,
  Link,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  MenuItem,
  MuiBox,
  MuiButton,
  Pagination,
  Radio,
  RadioGroup,
  Select,
  Slider,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@azes/ui-web';
import {
  AzesSkeleton,
  AzesSkeletonGroup,
  PageSkeleton,
  TableSkeleton,
} from '@azes/ui-web/skeleton';
import { useState, type ReactNode } from 'react';

import { SHOWCASE_NAMESPACE } from '../i18n/createShowcaseI18n.js';
import { SectionIntro } from './shared.js';

function DemoGroup({ label, children }: { label: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <MuiBox sx={{ display: 'grid', gap: theme.spacing(1.5) }}>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ letterSpacing: '0.12em', lineHeight: 1.4 }}
      >
        {label}
      </Typography>
      {children}
    </MuiBox>
  );
}

export function ButtonsSection() {
  const { t } = useTranslation(SHOWCASE_NAMESPACE);
  const theme = useTheme();

  return (
    <SectionIntro title={t('sections.buttons.intro')}>
      <MuiBox sx={{ display: 'grid', gap: theme.spacing(3) }}>
        <DemoGroup label={t('sections.buttons.groups.variants')}>
          <MuiBox sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <MuiButton variant="contained">{t('sections.buttons.labels.contained')}</MuiButton>
            <MuiButton variant="outlined">{t('sections.buttons.labels.outlined')}</MuiButton>
            <MuiButton variant="text">{t('sections.buttons.labels.text')}</MuiButton>
          </MuiBox>
        </DemoGroup>
        <DemoGroup label={t('sections.buttons.groups.sizes')}>
          <MuiBox sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <MuiButton size="small" variant="contained">
              {t('sections.buttons.labels.small')}
            </MuiButton>
            <MuiButton size="large" variant="contained">
              {t('sections.buttons.labels.large')}
            </MuiButton>
            <IconButton aria-label={t('sections.buttons.aria.iconExample')} color="primary">
              <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>A</Avatar>
            </IconButton>
          </MuiBox>
        </DemoGroup>
        <DemoGroup label={t('sections.buttons.groups.states')}>
          <MuiButton variant="contained" disabled>
            {t('sections.buttons.labels.disabled')}
          </MuiButton>
        </DemoGroup>
        <DemoGroup label={t('sections.buttons.groups.grouped')}>
          <ButtonGroup variant="outlined">
            <MuiButton>{t('sections.buttons.labels.one')}</MuiButton>
            <MuiButton>{t('sections.buttons.labels.two')}</MuiButton>
            <MuiButton>{t('sections.buttons.labels.three')}</MuiButton>
          </ButtonGroup>
        </DemoGroup>
        <DemoGroup label={t('sections.buttons.groups.chips')}>
          <MuiBox sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip label={t('sections.buttons.labels.chipFilter')} />
            <Chip
              label={t('sections.buttons.labels.chipClickable')}
              clickable
              onClick={() => undefined}
            />
            <Chip label={t('sections.buttons.labels.chipDeletable')} onDelete={() => undefined} />
            <Link href="#/phase-controls">{t('sections.buttons.labels.link')}</Link>
          </MuiBox>
        </DemoGroup>
      </MuiBox>
    </SectionIntro>
  );
}

export function InputsSection() {
  const { t } = useTranslation(SHOWCASE_NAMESPACE);
  const theme = useTheme();
  const options = [
    t('sections.inputs.options.account'),
    t('sections.inputs.options.admin'),
    t('sections.inputs.options.agent'),
    t('sections.inputs.options.realestate'),
  ];

  return (
    <SectionIntro title={t('sections.inputs.intro')}>
      <MuiBox sx={{ display: 'grid', gap: theme.spacing(3) }}>
        <DemoGroup label={t('sections.inputs.groups.states')}>
          <MuiBox
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            }}
          >
            <TextField
              label={t('sections.inputs.fields.default')}
              required
              helperText={t('sections.inputs.fields.defaultHelper')}
            />
            <TextField
              label={t('sections.inputs.fields.focused')}
              helperText={t('sections.inputs.fields.focusedHelper')}
              autoFocus={false}
            />
            <TextField
              label={t('sections.inputs.fields.error')}
              error
              helperText={t('sections.inputs.fields.errorHelper')}
            />
            <TextField
              label={t('sections.inputs.fields.disabled')}
              disabled
              value={t('sections.inputs.fields.disabledValue')}
            />
            <TextField
              label={t('sections.inputs.fields.readonly')}
              value={t('sections.inputs.fields.readonlyValue')}
              helperText={t('sections.inputs.fields.readonlyHelper')}
              slotProps={{ input: { readOnly: true } }}
            />
          </MuiBox>
        </DemoGroup>
        <DemoGroup label={t('sections.inputs.groups.extra')}>
          <MuiBox
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            }}
          >
            <TextField
              label={t('sections.inputs.fields.multiline')}
              multiline
              minRows={3}
              placeholder={t('sections.inputs.fields.multilinePlaceholder')}
            />
            <Autocomplete
              options={options}
              renderInput={(params) => (
                <TextField {...params} label={t('sections.inputs.fields.autocomplete')} />
              )}
            />
          </MuiBox>
        </DemoGroup>
      </MuiBox>
    </SectionIntro>
  );
}

export function FormsSection({ onSnack }: { onSnack: () => void }) {
  const { t } = useTranslation(SHOWCASE_NAMESPACE);
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down('sm'));
  const [alignment, setAlignment] = useState('left');
  const [volume, setVolume] = useState(40);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [workspace, setWorkspace] = useState<string | null>(null);
  const workspaceOptions = [
    t('sections.inputs.options.account'),
    t('sections.inputs.options.admin'),
    t('sections.inputs.options.agent'),
    t('sections.inputs.options.realestate'),
  ];

  return (
    <SectionIntro title={t('sections.forms.intro')}>
      <MuiBox sx={{ display: 'grid', gap: theme.spacing(3), maxWidth: 480 }}>
        <DemoGroup label={t('sections.forms.groups.toggles')}>
          <MuiBox sx={{ display: 'grid', gap: 1 }}>
            <FormControlLabel
              control={<Checkbox defaultChecked />}
              label={t('sections.forms.labels.subscribe')}
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label={t('sections.forms.labels.notifications')}
            />
          </MuiBox>
        </DemoGroup>
        <DemoGroup label={t('sections.forms.groups.plan')}>
          <RadioGroup defaultValue="pro" name="plan">
            <FormControlLabel
              value="starter"
              control={<Radio />}
              label={t('sections.forms.labels.starter')}
            />
            <FormControlLabel
              value="pro"
              control={<Radio />}
              label={t('sections.forms.labels.pro')}
            />
          </RadioGroup>
        </DemoGroup>
        <DemoGroup label={t('sections.forms.groups.select')}>
          <FormControl fullWidth>
            <InputLabel id="role-label">{t('sections.forms.labels.role')}</InputLabel>
            <Select
              labelId="role-label"
              label={t('sections.forms.labels.role')}
              defaultValue="member"
            >
              <MenuItem value="member">{t('sections.forms.labels.member')}</MenuItem>
              <MenuItem value="admin">{t('sections.forms.labels.admin')}</MenuItem>
            </Select>
          </FormControl>
        </DemoGroup>
        <DemoGroup label={t('sections.forms.groups.slider')}>
          <Slider
            aria-label={t('sections.forms.aria.volume')}
            value={volume}
            onChange={(_event, value) => setVolume(value as number)}
          />
        </DemoGroup>
        <DemoGroup label={t('sections.forms.groups.align')}>
          <ToggleButtonGroup
            exclusive
            value={alignment}
            onChange={(_event, value: string | null) => {
              if (value !== null) setAlignment(value);
            }}
            aria-label={t('sections.forms.aria.alignment')}
          >
            <ToggleButton value="left">{t('sections.forms.labels.left')}</ToggleButton>
            <ToggleButton value="center">{t('sections.forms.labels.center')}</ToggleButton>
            <ToggleButton value="right">{t('sections.forms.labels.right')}</ToggleButton>
          </ToggleButtonGroup>
        </DemoGroup>
        <DemoGroup label={t('sections.forms.groups.dialog')}>
          <MuiButton variant="outlined" onClick={() => setDialogOpen(true)}>
            {t('sections.forms.labels.openDialog')}
          </MuiButton>
        </DemoGroup>
      </MuiBox>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullScreen={smDown}
        aria-labelledby="controls-autocomplete-dialog-title"
      >
        <DialogTitle id="controls-autocomplete-dialog-title">
          {t('sections.forms.dialog.title')}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('sections.forms.dialog.body')}
          </Typography>
          <MuiBox sx={{ display: 'grid', gap: 2, pt: 0.5, minWidth: { sm: 360 } }}>
            <TextField
              autoFocus
              label={t('sections.forms.dialog.name')}
              helperText={t('sections.forms.dialog.nameHelper')}
              fullWidth
            />
            <Autocomplete
              options={workspaceOptions}
              value={workspace}
              onChange={(_e, value) => setWorkspace(value)}
              renderInput={(params) => (
                <TextField {...params} label={t('sections.forms.dialog.workspace')} />
              )}
            />
          </MuiBox>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setDialogOpen(false)}>
            {t('sections.forms.dialog.cancel')}
          </MuiButton>
          <MuiButton
            variant="contained"
            onClick={() => {
              setDialogOpen(false);
              onSnack();
            }}
          >
            {t('sections.forms.dialog.confirm')}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </SectionIntro>
  );
}

function CardRecipe({
  variant,
  badge,
  title,
  body,
  chip,
}: {
  variant: 'outlined' | 'elevation';
  badge: string;
  title: string;
  body: string;
  chip: string;
}) {
  const theme = useTheme();
  return (
    <Card
      variant={variant}
      sx={{
        minWidth: 0,
        ...(variant === 'elevation'
          ? {
              border: '1px solid',
              borderColor: 'border.default',
              boxShadow: theme.azes.customShadows.card,
            }
          : null),
      }}
    >
      <CardContent>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ letterSpacing: '0.1em', display: 'block', mb: 0.75 }}
        >
          {badge}
        </Typography>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {body}
        </Typography>
        <Divider sx={{ my: 1.5 }} />
        <Chip label={chip} />
      </CardContent>
    </Card>
  );
}

export function CardsSection() {
  const { t } = useTranslation(SHOWCASE_NAMESPACE);
  const theme = useTheme();

  return (
    <SectionIntro title={t('sections.cards.intro')}>
      <MuiBox sx={{ display: 'grid', gap: theme.spacing(3) }}>
        <DemoGroup label={t('sections.cards.groups.recipes')}>
          <MuiBox
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            }}
          >
            <CardRecipe
              variant="outlined"
              badge={t('sections.cards.outlined')}
              title={t('sections.cards.surfaceTitle')}
              body={t('sections.cards.surfaceBody')}
              chip={t('sections.cards.chip')}
            />
            <CardRecipe
              variant="elevation"
              badge={t('sections.cards.elevated')}
              title={t('sections.cards.surfaceTitle')}
              body={t('sections.cards.surfaceBody')}
              chip={t('sections.cards.chip')}
            />
          </MuiBox>
        </DemoGroup>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '60ch' }}>
          {t('sections.cards.whenNote')}
        </Typography>
      </MuiBox>
    </SectionIntro>
  );
}

export function DialogsSection({ onDialog }: { onDialog: () => void }) {
  return (
    <SectionIntro title="Dialog paper uses radiusLg. Prefer fullScreen below sm in product apps.">
      <MuiButton variant="contained" onClick={onDialog}>
        Open dialog
      </MuiButton>
    </SectionIntro>
  );
}

export function AlertsSection() {
  return (
    <SectionIntro title="Alerts keep icons and titles — status is never color-only.">
      <MuiBox sx={{ display: 'grid', gap: 2, maxWidth: 480 }}>
        <Alert severity="success">
          <AlertTitle>Success</AlertTitle>
          Success stays on the green token.
        </Alert>
        <Alert severity="warning">
          <AlertTitle>Warning</AlertTitle>
          Warning stays on the amber token.
        </Alert>
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          Error stays on the red token.
        </Alert>
        <Alert severity="info">
          <AlertTitle>Info</AlertTitle>
          Info stays on the navy token.
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Progress
        </Typography>
        <CircularProgress size={28} />
        <LinearProgress />
        <Typography variant="body2" color="text.secondary">
          AzesSkeleton Caspian wave (static under reduced motion)
        </Typography>
        <AzesSkeletonGroup loading label="Loading…" variant="wave">
          <MuiBox sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <AzesSkeleton shape="rect" width="100%" index={0} />
            <AzesSkeleton shape="text" width="60%" index={1} />
            <AzesSkeleton shape="button" index={2} />
          </MuiBox>
        </AzesSkeletonGroup>
        <Typography variant="body2" color="text.secondary">
          Compositions
        </Typography>
        <TableSkeleton rows={3} />
        <PageSkeleton label="Loading…" />
        <Collapse in>
          <Alert severity="info">Collapse timeout uses theme transitions.</Alert>
        </Collapse>
      </MuiBox>
    </SectionIntro>
  );
}

export function SnackbarSection({ onSnack }: { onSnack: () => void }) {
  return (
    <SectionIntro title="Global snackbar via useAzesSnackbar() — bottom-center, toast z-index, queued.">
      <MuiButton variant="contained" onClick={onSnack}>
        Show snackbar
      </MuiButton>
    </SectionIntro>
  );
}

export function TablesSection() {
  return (
    <SectionIntro title="TableContainer scrolls below md. Selected/hover rows mix primary.">
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Token</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Owner</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow hover selected>
              <TableCell>spacing.4</TableCell>
              <TableCell>16px</TableCell>
              <TableCell>Selected row</TableCell>
              <TableCell>Design</TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell>primary</TableCell>
              <TableCell>Brand seed</TableCell>
              <TableCell>Hover mix</TableCell>
              <TableCell>Theme</TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell>divider</TableCell>
              <TableCell>Border</TableCell>
              <TableCell>Head weight bold</TableCell>
              <TableCell>Surfaces</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination count={5} page={1} />
    </SectionIntro>
  );
}

export function ListsSection() {
  return (
    <SectionIntro title="ListItemButton selected/hover uses primary color-mix.">
      <List sx={{ maxWidth: 360, bgcolor: 'background.paper', borderRadius: 1 }}>
        <ListItemButton selected>
          <ListItemText primary="Selected item" secondary="Primary color-mix" />
        </ListItemButton>
        <ListItemButton>
          <ListItemText primary="Hover item" secondary="8% primary on hover" />
        </ListItemButton>
        <ListItemButton>
          <ListItemAvatar>
            <Avatar>A</Avatar>
          </ListItemAvatar>
          <ListItemText primary="With avatar" secondary="Secondary fallback" />
        </ListItemButton>
      </List>
    </SectionIntro>
  );
}

export function AvatarsSection() {
  return (
    <SectionIntro title="Avatar fallback uses secondary; Badge defaults to error for counts.">
      <MuiBox sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center' }}>
        <Avatar>A</Avatar>
        <AvatarGroup max={3}>
          <Avatar>B</Avatar>
          <Avatar>C</Avatar>
          <Avatar>D</Avatar>
          <Avatar>E</Avatar>
        </AvatarGroup>
        <Badge badgeContent={4} aria-label="4 notifications">
          <Avatar>N</Avatar>
        </Badge>
        <Badge badgeContent={12} aria-label="12 notifications">
          <MuiButton variant="outlined">Inbox</MuiButton>
        </Badge>
      </MuiBox>
    </SectionIntro>
  );
}

export function AccordionSection() {
  const { t } = useTranslation(SHOWCASE_NAMESPACE);
  const theme = useTheme();

  return (
    <SectionIntro title={t('sections.accordion.intro')}>
      <DemoGroup label={t('sections.accordion.groups.panels')}>
        <MuiBox sx={{ display: 'grid', gap: theme.spacing(1.5), maxWidth: 560 }}>
          <AzesAccordion
            id="controls-accordion-open"
            mode="search"
            defaultOpen
            title={t('sections.accordion.open.title')}
            subtitle={t('sections.accordion.open.subtitle')}
            onSubmit={() => undefined}
            onReset={() => undefined}
            submitLabel={t('sections.accordion.submit')}
            resetLabel={t('sections.accordion.reset')}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {t('sections.accordion.open.body')}
            </Typography>
            <TextField label={t('sections.accordion.field')} fullWidth size="small" />
          </AzesAccordion>

          <AzesAccordion
            id="controls-accordion-closed"
            mode="search"
            defaultOpen={false}
            title={t('sections.accordion.closed.title')}
            subtitle={t('sections.accordion.closed.subtitle')}
            onSubmit={() => undefined}
            onReset={() => undefined}
            submitLabel={t('sections.accordion.submit')}
            resetLabel={t('sections.accordion.reset')}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {t('sections.accordion.closed.body')}
            </Typography>
            <TextField label={t('sections.accordion.field')} fullWidth size="small" />
          </AzesAccordion>

          <MuiBox
            aria-disabled
            sx={{
              opacity: 0.55,
              '& > *': { pointerEvents: 'none' },
            }}
          >
            <AzesAccordion
              id="controls-accordion-disabled"
              mode="search"
              open={false}
              onOpenChange={() => undefined}
              loading
              title={t('sections.accordion.disabled.title')}
              subtitle={t('sections.accordion.disabled.subtitle')}
              onSubmit={() => undefined}
              onReset={() => undefined}
              submitLabel={t('sections.accordion.submit')}
              resetLabel={t('sections.accordion.reset')}
            >
              <Typography variant="body2" color="text.secondary">
                {t('sections.accordion.disabled.body')}
              </Typography>
            </AzesAccordion>
          </MuiBox>
        </MuiBox>
      </DemoGroup>
    </SectionIntro>
  );
}

export function TooltipsSection() {
  return (
    <SectionIntro title="Tooltip uses inverse surface and enter/leave delays from the theme.">
      <Tooltip title="Inverse surface tooltip">
        <MuiButton variant="outlined">Hover tooltip</MuiButton>
      </Tooltip>
    </SectionIntro>
  );
}

export function SectionSlot({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
