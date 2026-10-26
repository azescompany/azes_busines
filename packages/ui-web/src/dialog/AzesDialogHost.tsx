/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: packages/ui-web/src/dialog/AzesDialogHost.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-10
 * ║ Updated: 2026-10-11
 * ║ Purpose: Single visible dialog surface for the global queue
 * ║ Layer: package
 * ╚══════════════════════════════════════════════════════════════╝
 */

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import type { TransitionProps } from '@mui/material/transitions';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useId, type ReactElement, type ReactNode } from 'react';

import {
  IconClose,
  IconDelete,
  IconError,
  IconHelp,
  IconInfo,
  IconSuccess,
  IconWarning,
} from '../icons';
import type { ResolvedDialogOptions } from './defaults';
import { isAlertDialogVariant } from './defaults';
import {
  getDialogContentStackSx,
  getDialogDescriptionSx,
  getDialogIconSx,
  getDialogPaperSx,
  getDialogTitleSx,
  resolveDialogTone,
} from './dialogStyles';
import type { AzesDialogLabels, AzesDialogVariant } from './types';

export type AzesDialogHostProps = {
  open: boolean;
  options: ResolvedDialogOptions | null;
  labels: AzesDialogLabels;
  confirming: boolean;
  errorMessage: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

function DefaultVariantIcon({ variant }: { variant: AzesDialogVariant }): ReactNode {
  switch (variant) {
    case 'confirm':
      return <IconHelp aria-hidden />;
    case 'danger':
      return <IconDelete aria-hidden />;
    case 'info':
      return <IconInfo aria-hidden />;
    case 'success':
      return <IconSuccess aria-hidden />;
    case 'warning':
      return <IconWarning aria-hidden />;
    case 'error':
      return <IconError aria-hidden />;
    case 'custom':
      return null;
    default:
      return <IconHelp aria-hidden />;
  }
}

function DialogTransition(props: TransitionProps & { children: ReactElement }) {
  return <Fade {...props} timeout={180} />;
}

export function AzesDialogHost({
  open,
  options,
  labels,
  confirming,
  errorMessage,
  onCancel,
  onConfirm,
}: AzesDialogHostProps) {
  const theme = useTheme();
  const titleId = useId();
  const descriptionId = useId();
  const statusId = useId();
  const fullScreenMobile = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true });

  if (!options) {
    return null;
  }

  const variant = options.variant;
  const tone = resolveDialogTone(variant);
  const iconNode =
    options.icon === false ? null : options.icon !== undefined ? (
      options.icon
    ) : (
      <DefaultVariantIcon variant={variant} />
    );
  const showIcon = iconNode != null;
  const hasDescription = options.description != null && options.description !== '';
  const role = isAlertDialogVariant(variant) ? 'alertdialog' : 'dialog';
  const confirmColor = variant === 'danger' || variant === 'error' ? 'error' : 'primary';
  const focusCancel = !options.hideCancel && options.autoFocus === 'cancel';
  const focusConfirm = !focusCancel && !options.hideFooter;
  const describedBy = [
    hasDescription ? descriptionId : null,
    errorMessage || confirming ? statusId : null,
  ]
    .filter(Boolean)
    .join(' ');
  const isFullScreen = Boolean(options.fullScreenOnMobile && fullScreenMobile);
  const idleConfirmLabel = errorMessage ? labels.retry : options.confirmLabel;
  const busyConfirmLabel = labels.confirming;

  return (
    <Dialog
      open={open}
      onClose={(_event, reason) => {
        if (confirming) return;
        if (reason === 'backdropClick' && !options.closeOnBackdrop) return;
        if (reason === 'escapeKeyDown' && !options.closeOnBackdrop) return;
        onCancel();
      }}
      maxWidth={options.maxWidth}
      fullWidth
      fullScreen={isFullScreen}
      role={role}
      aria-labelledby={titleId}
      aria-describedby={describedBy || undefined}
      slots={{ transition: DialogTransition }}
      slotProps={{
        paper: {
          sx: {
            ...getDialogPaperSx(theme, {
              paddingless: options.paddingless,
              hideFooter: options.hideFooter,
              fullScreen: isFullScreen,
            }),
            boxShadow: theme.azes.customShadows.card,
            // Confirm busy must not flash a paper scrollbar from tiny reflows.
            ...(!isFullScreen ? { overflow: 'hidden' } : null),
          },
          'aria-busy': confirming || undefined,
        },
      }}
    >
      <DialogContent
        sx={{
          ...getDialogContentStackSx(theme),
          position: 'relative',
          // Override MUI DialogContent `overflow-y: auto` — busy state used to
          // insert a status node and tip the content into a spurious scrollbar.
          overflowY: isFullScreen ? 'auto' : 'hidden',
          ...(options.paddingless ? { p: 0, '&:first-of-type': { pt: 0 } } : null),
          ...(isFullScreen
            ? {
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }
            : null),
        }}
      >
        {(showIcon || options.showCloseButton) && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: showIcon ? 'space-between' : 'flex-end',
              width: '100%',
              gap: 1,
              mb: options.showCloseButton && !showIcon ? 0 : undefined,
              ...(options.paddingless
                ? {
                    px: theme.spacing(theme.azes.dialog.paddingInline),
                    pt: theme.spacing(theme.azes.dialog.paddingBlock),
                    position: isFullScreen ? 'sticky' : 'relative',
                    top: 0,
                    zIndex: 1,
                    backgroundColor: theme.vars.palette.background.paper,
                  }
                : null),
            }}
          >
            {showIcon && tone != null ? (
              <Box sx={{ ...getDialogIconSx(theme, tone), mb: 0 }}>{iconNode}</Box>
            ) : showIcon ? (
              <Box sx={{ mb: 0 }}>{iconNode}</Box>
            ) : (
              <span />
            )}
            {options.showCloseButton ? (
              <IconButton
                type="button"
                aria-label={labels.close}
                onClick={onCancel}
                disabled={confirming}
                size="small"
                sx={{
                  color: theme.vars.palette.text.secondary,
                  ms: 'auto',
                }}
              >
                <IconClose />
              </IconButton>
            ) : null}
          </Box>
        )}

        <DialogTitle
          id={titleId}
          component="h2"
          sx={{
            ...getDialogTitleSx(theme),
            ...(options.paddingless
              ? {
                  px: theme.spacing(theme.azes.dialog.paddingInline),
                  pt:
                    showIcon || options.showCloseButton
                      ? 0
                      : theme.spacing(theme.azes.dialog.paddingBlock),
                }
              : null),
            ...(showIcon && !options.showCloseButton
              ? { mt: theme.spacing(theme.azes.dialog.contentGap) }
              : null),
          }}
        >
          {options.title}
        </DialogTitle>

        {hasDescription ? (
          <Box
            id={descriptionId}
            component="p"
            sx={{
              ...getDialogDescriptionSx(theme),
              ...(options.paddingless
                ? { px: theme.spacing(theme.azes.dialog.paddingInline) }
                : null),
            }}
          >
            {options.description}
          </Box>
        ) : null}

        {options.content ? (
          <Box
            sx={{
              width: '100%',
              ...(options.paddingless && isFullScreen ? { flex: 1, minHeight: 0 } : null),
            }}
          >
            {options.content}
          </Box>
        ) : null}

        {errorMessage ? (
          <Box
            id={statusId}
            role="status"
            aria-live="polite"
            sx={{
              width: '100%',
              ...(options.paddingless
                ? { px: theme.spacing(theme.azes.dialog.paddingInline) }
                : null),
            }}
          >
            <Alert severity="error" sx={{ mt: theme.spacing(1) }}>
              {errorMessage}
            </Alert>
          </Box>
        ) : confirming ? (
          <Box
            id={statusId}
            role="status"
            aria-live="polite"
            sx={{
              // Out of flow — must not grow DialogContent / trigger scroll.
              position: 'absolute',
              width: 1,
              height: 1,
              padding: 0,
              margin: -1,
              overflow: 'hidden',
              clip: 'rect(0 0 0 0)',
              whiteSpace: 'nowrap',
              border: 0,
            }}
          >
            {busyConfirmLabel}
          </Box>
        ) : null}
      </DialogContent>

      {!options.hideFooter ? (
        <DialogActions>
          {!options.hideCancel ? (
            <Button
              type="button"
              color="inherit"
              variant="text"
              onClick={onCancel}
              disabled={confirming}
              autoFocus={focusCancel}
            >
              {options.cancelLabel}
            </Button>
          ) : null}
          <Button
            type="button"
            color={confirmColor}
            variant="contained"
            onClick={onConfirm}
            disabled={confirming}
            autoFocus={focusConfirm}
            aria-busy={confirming || undefined}
            aria-label={confirming ? busyConfirmLabel : undefined}
          >
            {/*
              Stack idle + busy labels in one grid cell so the footer width stays
              stable when the spinner / “Working…” state appears.
            */}
            <Box
              component="span"
              sx={{
                display: 'inline-grid',
                alignItems: 'center',
                justifyItems: 'center',
              }}
            >
              <Box
                component="span"
                sx={{
                  gridArea: '1 / 1',
                  visibility: confirming ? 'hidden' : 'visible',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                {idleConfirmLabel}
              </Box>
              <Box
                component="span"
                aria-hidden={!confirming}
                sx={{
                  gridArea: '1 / 1',
                  visibility: confirming ? 'visible' : 'hidden',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <CircularProgress color="inherit" size="1em" aria-hidden />
                {busyConfirmLabel}
              </Box>
            </Box>
          </Button>
        </DialogActions>
      ) : null}
    </Dialog>
  );
}
