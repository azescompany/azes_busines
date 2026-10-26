/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/features/ai-assistant/components/AiChatComposer/AiChatComposer.tsx
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Sticky chat composer for azes-ui AI sheet
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { MuiBox, MuiButton, Stack, TextField } from '@azes/ui-web';
import { IconArrowForward } from '@azes/ui-web/icons';

export type AiChatComposerProps = {
  placeholder: string;
  sendLabel: string;
  sendingLabel: string;
  disabled: boolean;
  isStreaming: boolean;
  onSend: (text: string) => void;
};

/** Bottom composer — Enter sends; Shift+Enter newline. */
export function AiChatComposer({
  placeholder,
  sendLabel,
  sendingLabel,
  disabled,
  isStreaming,
  onSend,
}: AiChatComposerProps) {
  const [value, setValue] = useState('');

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || isStreaming) return;
    onSend(trimmed);
    setValue('');
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <MuiBox
      component="form"
      onSubmit={onSubmit}
      sx={(theme) => ({
        px: 2,
        py: 1.5,
        borderBlockStartWidth: 1,
        borderBlockStartStyle: 'solid',
        borderBlockStartColor: theme.vars.palette.border.default,
        bgcolor: theme.vars.palette.background.paper,
      })}
    >
      <Stack direction="row" gap={1} align="flex-end">
        <TextField
          fullWidth
          size="small"
          multiline
          maxRows={4}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled || isStreaming}
          aria-label={placeholder}
        />
        <MuiButton
          type="submit"
          variant="contained"
          size="small"
          disabled={disabled || isStreaming || value.trim().length === 0}
          aria-label={isStreaming ? sendingLabel : sendLabel}
          endIcon={<IconArrowForward fontSize="small" />}
          sx={{ flexShrink: 0, minWidth: { xs: 44, sm: 'auto' } }}
        >
          {isStreaming ? sendingLabel : sendLabel}
        </MuiButton>
      </Stack>
    </MuiBox>
  );
}
