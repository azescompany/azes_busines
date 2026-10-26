/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/features/ai-assistant/components/AiChatMessages/AiChatMessages.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Scrollable chat transcript for azes-ui AI sheet
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useEffect, useRef } from 'react';
import { MuiBox, Typography } from '@azes/ui-web';

import type { AiChatMessage } from '../../models/types.js';

export type AiChatMessagesProps = {
  messages: readonly AiChatMessage[];
  emptyLabel: string;
  isStreaming: boolean;
  /** Optional live tool status (e.g. set_color_mode). */
  toolStatus?: string | null;
};

/** Message list — user bubbles end-aligned; assistant start-aligned. */
export function AiChatMessages({
  messages,
  emptyLabel,
  isStreaming,
  toolStatus,
}: AiChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [messages, isStreaming, toolStatus]);

  if (messages.length === 0) {
    return (
      <MuiBox
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          py: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          {emptyLabel}
        </Typography>
      </MuiBox>
    );
  }

  return (
    <MuiBox
      sx={{
        flex: 1,
        overflow: 'auto',
        px: 2,
        py: 2,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {messages.map((msg) => {
        const isUser = msg.role === 'user';
        return (
          <MuiBox
            key={msg.id}
            sx={(theme) => ({
              alignSelf: isUser ? 'flex-end' : 'flex-start',
              maxWidth: { xs: '92%', sm: '88%' },
              px: 1.5,
              py: 1,
              borderRadius: `${theme.shape.radiusMd}px`,
              bgcolor: isUser
                ? theme.vars.palette.primary.main
                : theme.vars.palette.background.muted,
              color: isUser
                ? theme.vars.palette.primary.contrastText
                : theme.vars.palette.text.primary,
              borderWidth: isUser ? 0 : 1,
              borderStyle: 'solid',
              borderColor: theme.vars.palette.border.default,
            })}
          >
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {msg.content || (isStreaming && !isUser ? '…' : '')}
            </Typography>
          </MuiBox>
        );
      })}
      {toolStatus ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ alignSelf: 'flex-start', px: 0.5 }}
        >
          {toolStatus}
        </Typography>
      ) : null}
      <div ref={bottomRef} />
    </MuiBox>
  );
}
