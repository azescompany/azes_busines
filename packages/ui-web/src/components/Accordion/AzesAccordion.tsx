/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/components/Accordion/AzesAccordion.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-09
 * ║ Updated: 2026-10-09
 * ║ Purpose: Global search/filter + CRUD accordion panel for table pages
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import ExpandMoreOutlinedIcon from '@mui/icons-material/ExpandMoreOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import { useTheme, type SxProps, type Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

import { AzesConfirmDialog } from './AzesConfirmDialog';
import {
  getAccordionBodySx,
  getAccordionChipSx,
  getAccordionFooterSx,
  getAccordionHeaderSx,
  getAccordionSx,
} from './accordionStyles';

export type AzesAccordionActiveFilter = {
  key: string;
  label: ReactNode;
  onRemove: () => void;
};

type AzesAccordionBaseProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  headerActions?: ReactNode;
  loading?: boolean;
  error?: ReactNode;
  id?: string;
  sx?: SxProps<Theme>;
  /** Labels for the built-in dirty discard dialog (crud). */
  discardTitle?: string;
  discardDescription?: string;
  discardConfirmLabel?: string;
  discardCancelLabel?: string;
};

export type AzesAccordionSearchProps = AzesAccordionBaseProps & {
  mode: 'search';
  onSubmit: () => void;
  onReset: () => void;
  activeFilterCount?: number;
  activeFilters?: AzesAccordionActiveFilter[];
  submitLabel: string;
  resetLabel: string;
};

export type AzesAccordionCrudProps = AzesAccordionBaseProps & {
  mode: 'crud';
  intent: 'create' | 'edit';
  onSubmit: () => void;
  onCancel: () => void;
  submitting?: boolean;
  isDirty?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
};

export type AzesAccordionProps = AzesAccordionSearchProps | AzesAccordionCrudProps;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function focusFirstField(root: HTMLElement | null) {
  if (!root) return;
  const candidates = root.querySelectorAll<HTMLElement>('input, textarea, select, button, a');
  for (const el of candidates) {
    if (el.hasAttribute('disabled')) continue;
    if (el.getAttribute('type') === 'hidden') continue;
    if (el.getAttribute('tabindex') === '-1') continue;
    if (el.getAttribute('aria-hidden') === 'true') continue;
    el.focus();
    return;
  }
}

export function AzesAccordion(props: AzesAccordionProps) {
  const {
    title,
    subtitle,
    icon,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    children,
    headerActions,
    loading = false,
    error,
    id: idProp,
    sx,
    discardTitle = 'Discard changes?',
    discardDescription = 'You have unsaved changes. Leave without saving?',
    discardConfirmLabel = 'Discard',
    discardCancelLabel = 'Keep editing',
  } = props;

  const theme = useTheme();
  const reactId = useId();
  const panelId = idProp ?? `azes-accordion-${reactId}`;
  const titleId = `${panelId}-title`;
  const headerBtnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const wasOpenRef = useRef(openProp ?? defaultOpen);
  const restoreFocusRef = useRef(false);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const open = openProp ?? uncontrolledOpen;

  function setOpen(next: boolean) {
    if (openProp === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  const isCrud = props.mode === 'crud';
  const isDirty = isCrud ? Boolean(props.isDirty) : false;
  const submitting = isCrud ? Boolean(props.submitting) : false;

  function requestClose(fromCancel = false) {
    if (isCrud && isDirty) {
      setConfirmOpen(true);
      return;
    }
    restoreFocusRef.current = true;
    setOpen(false);
    if (isCrud && fromCancel) props.onCancel();
  }

  function confirmDiscard() {
    setConfirmOpen(false);
    restoreFocusRef.current = true;
    setOpen(false);
    if (isCrud) props.onCancel();
  }

  function toggle() {
    if (open) {
      requestClose(false);
      return;
    }
    setOpen(true);
  }

  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = open;
    if (!open || wasOpen) return;

    const reduce = prefersReducedMotion();
    const node = rootRef.current;
    if (node && typeof node.scrollIntoView === 'function') {
      node.scrollIntoView({
        block: 'nearest',
        behavior: reduce ? 'auto' : 'smooth',
      });
    }

    const timer = window.setTimeout(
      () => {
        focusFirstField(panelRef.current);
      },
      reduce ? 0 : theme.transitions.duration.enteringScreen,
    );

    return () => window.clearTimeout(timer);
  }, [open, theme.transitions.duration.enteringScreen]);

  useEffect(() => {
    if (open) return;
    if (!restoreFocusRef.current) return;
    restoreFocusRef.current = false;
    headerBtnRef.current?.focus();
  }, [open]);

  function onHeaderKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle();
    }
  }

  function onPanelKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape' && isCrud && open) {
      event.stopPropagation();
      requestClose(true);
    }
  }

  function handleFormSubmit(event: FormEvent) {
    event.preventDefault();
    if (loading || submitting) return;
    props.onSubmit();
  }

  const activeFilters = props.mode === 'search' ? (props.activeFilters ?? []) : [];
  const activeFilterCount =
    props.mode === 'search' ? (props.activeFilterCount ?? activeFilters.length) : 0;

  const submitLabel =
    props.mode === 'search'
      ? props.submitLabel
      : (props.submitLabel ?? (props.intent === 'edit' ? 'Save' : 'Create'));
  const secondaryLabel =
    props.mode === 'search' ? props.resetLabel : (props.cancelLabel ?? 'Cancel');

  const rootSx = getAccordionSx(theme, {
    mode: props.mode,
    intent: props.mode === 'crud' ? props.intent : undefined,
    open,
  });

  return (
    <Box
      ref={rootRef}
      sx={[rootSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])] as SxProps<Theme>}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'stretch',
          gap: 0,
          minWidth: 0,
        }}
      >
        <Box
          component="button"
          type="button"
          ref={headerBtnRef}
          id={titleId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={toggle}
          onKeyDown={onHeaderKeyDown}
          sx={getAccordionHeaderSx(theme)}
        >
          {icon ? (
            <Box
              aria-hidden
              sx={{
                display: 'grid',
                placeItems: 'center',
                color: theme.vars.palette.text.secondary,
                lineHeight: 0,
                '& .MuiSvgIcon-root': { fontSize: theme.typography.body1.fontSize },
              }}
            >
              {icon}
            </Box>
          ) : null}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography component="span" variant="subtitle2" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
              {props.mode === 'search' && activeFilterCount > 0 ? (
                <Box
                  component="span"
                  aria-label={`${activeFilterCount} active filters`}
                  sx={(t) => ({
                    ...t.typography.caption,
                    fontWeight: t.typography.fontWeightBold,
                    color: t.vars.palette.primary.contrastText,
                    backgroundColor: t.vars.palette.primary.main,
                    borderRadius: `${t.shape.radiusFull}px`,
                    minWidth: t.spacing(2.5),
                    height: t.spacing(2.5),
                    px: 0.75,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  })}
                >
                  {activeFilterCount}
                </Box>
              ) : null}
            </Box>
            {subtitle ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          <ExpandMoreOutlinedIcon
            aria-hidden
            sx={{
              color: theme.vars.palette.text.secondary,
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: theme.transitions.create('transform', {
                duration: theme.transitions.duration.shorter,
              }),
              '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
            }}
          />
        </Box>
        {headerActions ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              pr: 1,
              flexShrink: 0,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {headerActions}
          </Box>
        ) : null}
      </Box>

      {!open && props.mode === 'search' && activeFilters.length > 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            px: 2,
            pb: 1.5,
          }}
        >
          {activeFilters.map((filter) => (
            <Chip
              key={filter.key}
              size="small"
              label={filter.label}
              onDelete={filter.onRemove}
              sx={getAccordionChipSx(theme)}
            />
          ))}
        </Box>
      ) : null}

      <Collapse in={open} timeout={prefersReducedMotion() ? 0 : 'auto'} unmountOnExit={false}>
        <Box
          ref={panelRef}
          id={panelId}
          role="region"
          aria-labelledby={titleId}
          onKeyDown={onPanelKeyDown}
          sx={getAccordionBodySx(theme)}
          component="form"
          onSubmit={handleFormSubmit}
        >
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}

          <Box
            sx={{
              opacity: loading || submitting ? 0.64 : 1,
              pointerEvents: loading || submitting ? 'none' : 'auto',
            }}
          >
            {children}
          </Box>

          <Box sx={getAccordionFooterSx(theme)}>
            {props.mode === 'search' ? (
              <>
                <Button type="button" onClick={props.onReset} disabled={loading}>
                  {secondaryLabel}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress color="inherit" size={16} /> : undefined}
                >
                  {submitLabel}
                </Button>
              </>
            ) : (
              <>
                <Button type="button" onClick={() => requestClose(true)} disabled={submitting}>
                  {secondaryLabel}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting || loading}
                  startIcon={
                    submitting ? <CircularProgress color="inherit" size={16} /> : undefined
                  }
                >
                  {submitLabel}
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Collapse>

      {isCrud ? (
        <AzesConfirmDialog
          open={confirmOpen}
          title={discardTitle}
          description={discardDescription}
          confirmLabel={discardConfirmLabel}
          cancelLabel={discardCancelLabel}
          onConfirm={confirmDiscard}
          onCancel={() => setConfirmOpen(false)}
        />
      ) : null}
    </Box>
  );
}
