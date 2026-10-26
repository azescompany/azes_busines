/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/features/ai-assistant/hooks/useAiChat.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Chat + settings tool-call loop for azes-ui AI panel
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { useCallback, useRef, useState } from 'react';
import { useColorScheme } from '@azes/ui-web';
import { useAzesSettings, useAzesSettingsActions } from '@azes/ui-web/settings';

import { AiChatApiError, completeAiChat } from '../service/aiChatApi.js';
import { executeAiTool } from '../tools/executeAiTool.js';
import type { AiChatErrorCode, AiChatMessage, AiWireMessage } from '../models/types.js';

export type UseAiChatResult = {
  messages: AiChatMessage[];
  isStreaming: boolean;
  toolStatus: string | null;
  errorCode: AiChatErrorCode | null;
  errorMessage: string | null;
  send: (text: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
};

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const CLIENT_TIMEOUT_MS = 90_000;
const MAX_TOOL_ROUNDS = 3;

/** Local chat state with whitelist settings tools. */
export function useAiChat(): UseAiChatResult {
  const { mode, setMode } = useColorScheme();
  const settings = useAzesSettings((s) => s);
  const { set: setSettings } = useAzesSettingsActions();

  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<AiChatErrorCode | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<AiChatMessage[]>([]);
  messagesRef.current = messages;

  const modeRef = useRef(mode);
  modeRef.current = mode;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const clearError = useCallback(() => {
    setErrorCode(null);
    setErrorMessage(null);
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setIsStreaming(false);
    setToolStatus(null);
    clearError();
  }, [clearError]);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || abortRef.current) return;

      clearError();
      setToolStatus(null);
      const userMsg: AiChatMessage = { id: newId(), role: 'user', content };
      const assistantId = newId();
      const assistantMsg: AiChatMessage = { id: assistantId, role: 'assistant', content: '' };

      const history: AiWireMessage[] = [
        ...messagesRef.current.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: 'user', content },
      ];

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;
      const timeoutId = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

      const wire: AiWireMessage[] = [...history];

      try {
        for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
          const completion = await completeAiChat(
            { messages: wire, stream: false, tools: true },
            controller.signal,
          );

          const toolCalls = completion.tool_calls?.filter((tc) => tc?.function?.name && tc.id);

          if (toolCalls && toolCalls.length > 0) {
            if (completion.content.trim()) {
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: completion.content } : m)),
              );
            }

            wire.push({
              role: 'assistant',
              content: completion.content,
              tool_calls: toolCalls,
            });

            for (const call of toolCalls) {
              setToolStatus(call.function.name);
              const result = executeAiTool(call, {
                getMode: () => modeRef.current,
                setMode: (next) => {
                  setMode(next);
                },
                getSettings: () => settingsRef.current,
                setSettings,
              });
              wire.push({
                role: 'tool',
                tool_call_id: call.id,
                content: JSON.stringify(result),
              });
            }
            continue;
          }

          setToolStatus(null);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: completion.content || m.content } : m,
            ),
          );
          break;
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          setErrorCode('NETWORK');
          setErrorMessage('Request timed out or was cancelled');
          setMessages((prev) => prev.filter((m) => m.id !== assistantId || m.content.length > 0));
          return;
        }
        const code = err instanceof AiChatApiError ? err.code : 'UNKNOWN';
        const message = err instanceof Error ? err.message : 'Unknown error';
        setErrorCode(code);
        setErrorMessage(message);
        setMessages((prev) => prev.filter((m) => m.id !== assistantId || m.content.length > 0));
      } finally {
        clearTimeout(timeoutId);
        setIsStreaming(false);
        setToolStatus(null);
        abortRef.current = null;
      }
    },
    [clearError, setMode, setSettings],
  );

  return {
    messages,
    isStreaming,
    toolStatus,
    errorCode,
    errorMessage,
    send,
    clearError,
    reset,
  };
}
