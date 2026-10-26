/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/components/AiAssistantPanel/AiAssistantPanel.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: AI sheet chrome — composes grounded chat feature
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useTranslation } from '@azes/i18n';
import { Alert, Drawer, MuiBox, MuiButton, Stack, Typography } from '@azes/ui-web';
import { IconAi, IconClose } from '@azes/ui-web/icons';

import {
  AiChatComposer,
  AiChatMessages,
  useAiChat,
  type AiChatErrorCode,
} from '../../features/ai-assistant/index.js';
import { SHOWCASE_NAMESPACE } from '../../i18n/createShowcaseI18n.js';

export type AiAssistantPanelProps = {
  open: boolean;
  onClose: () => void;
};

function errorI18nKey(code: AiChatErrorCode): string {
  switch (code) {
    case 'NO_API_KEY':
      return 'ai.errorNoKey';
    case 'RATE_LIMIT':
      return 'ai.errorRate';
    case 'NETWORK':
      return 'ai.errorOffline';
    default:
      return 'ai.error';
  }
}

/** Non-modal AI sheet from the bottom-end — grounded Nemotron chat via local proxy. */
export function AiAssistantPanel({ open, onClose }: AiAssistantPanelProps) {
  const { t } = useTranslation(SHOWCASE_NAMESPACE);
  const { messages, isStreaming, toolStatus, errorCode, send, clearError } = useAiChat();

  const toolStatusLabel = toolStatus ? t('ai.toolRunning', { name: toolStatus }) : null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      hideBackdrop
      disableScrollLock
      disableEnforceFocus
      disableAutoFocus
      ModalProps={{
        sx: { pointerEvents: 'none' },
      }}
      slotProps={{
        paper: {
          sx: (theme) => ({
            pointerEvents: 'auto',
            top: 'auto',
            bottom: theme.spacing(3),
            height: { xs: '55dvh', sm: 420 },
            maxHeight: '70dvh',
            width: { xs: 'calc(100% - 32px)', sm: 380 },
            maxWidth: '100%',
            marginInlineEnd: theme.spacing(3),
            borderRadius: `${theme.shape.radiusLg}px`,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: theme.vars.palette.border.default,
            boxShadow: theme.azes.customShadows.nav,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }),
        },
      }}
    >
      <Stack gap={0} style={{ height: '100%', minHeight: 0 }}>
        <MuiBox
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 3,
            py: 2,
            borderBlockEndWidth: 1,
            borderBlockEndStyle: 'solid',
            borderBlockEndColor: theme.vars.palette.border.default,
            bgcolor: theme.vars.palette.background.paper,
            flexShrink: 0,
          })}
        >
          <IconAi color="primary" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }}>
            {t('ai.title')}
          </Typography>
          <MuiButton
            size="small"
            variant="text"
            aria-label={t('ai.closeAria')}
            onClick={onClose}
            startIcon={<IconClose fontSize="small" />}
          >
            {t('ai.close')}
          </MuiButton>
        </MuiBox>

        <AiChatMessages
          messages={messages}
          emptyLabel={t('ai.empty')}
          isStreaming={isStreaming}
          toolStatus={toolStatusLabel}
        />

        {errorCode ? (
          <MuiBox sx={{ px: 2, pb: 1, flexShrink: 0 }}>
            <Alert severity="error" onClose={clearError}>
              {t(errorI18nKey(errorCode))}
            </Alert>
          </MuiBox>
        ) : null}

        <AiChatComposer
          placeholder={t('ai.inputPlaceholder')}
          sendLabel={t('ai.send')}
          sendingLabel={t('ai.sending')}
          disabled={!open}
          isStreaming={isStreaming}
          onSend={(text) => {
            void send(text);
          }}
        />
      </Stack>
    </Drawer>
  );
}
