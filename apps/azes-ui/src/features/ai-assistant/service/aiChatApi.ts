/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/features/ai-assistant/service/aiChatApi.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Client → Vite /api/ai/chat (stream + tools completion)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { aiChatRequestSchema, type AiChatRequest } from '../models/schema.js';
import type { AiChatErrorCode, AiCompletionMessage, AiWireToolCall } from '../models/types.js';

export type StreamAiChatHandlers = {
  onToken: (text: string) => void;
  signal?: AbortSignal;
};

export class AiChatApiError extends Error {
  readonly code: AiChatErrorCode;
  readonly status?: number;

  constructor(code: AiChatErrorCode, message: string, status?: number) {
    super(message);
    this.name = 'AiChatApiError';
    this.code = code;
    this.status = status;
  }
}

function mapHttpCode(status: number, code?: string): AiChatErrorCode {
  if (code === 'NO_API_KEY') return 'NO_API_KEY';
  if (code === 'RATE_LIMIT' || status === 429) return 'RATE_LIMIT';
  if (status === 502 || status === 503) return 'UPSTREAM_STATUS';
  if (status >= 400 && status < 500) return 'HTTP';
  return 'UNKNOWN';
}

/** Extract assistant text deltas from OpenAI-compatible SSE. */
export function consumeSseDataLine(line: string, onToken: (text: string) => void): void {
  const trimmed = line.trim();
  if (!trimmed.startsWith('data:')) return;
  const payload = trimmed.slice(5).trim();
  if (!payload || payload === '[DONE]') return;
  try {
    const json = JSON.parse(payload) as {
      error?: string;
      code?: string;
      choices?: Array<{
        delta?: { content?: string | null; reasoning_content?: string | null };
        message?: { content?: string | null; reasoning_content?: string | null };
      }>;
    };
    if (typeof json.error === 'string' && json.error.length > 0) {
      throw new AiChatApiError(mapHttpCode(502, json.code), json.error, 502);
    }
    const delta = json.choices?.[0]?.delta;
    const deltaText = delta?.content || delta?.reasoning_content;
    if (typeof deltaText === 'string' && deltaText.length > 0) {
      onToken(deltaText);
      return;
    }
    const message = json.choices?.[0]?.message;
    const full = message?.content || message?.reasoning_content;
    if (typeof full === 'string' && full.length > 0) onToken(full);
  } catch (err) {
    if (err instanceof AiChatApiError) throw err;
  }
}

async function postChat(
  request: AiChatRequest,
  accept: string,
  signal?: AbortSignal,
): Promise<Response> {
  const parsed = aiChatRequestSchema.parse(request);
  try {
    return await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        Accept: accept,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parsed),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new AiChatApiError('NETWORK', err instanceof Error ? err.message : 'Network error');
  }
}

async function throwIfNotOk(response: Response): Promise<void> {
  if (response.ok) return;
  let message = `HTTP ${response.status}`;
  let code: string | undefined;
  try {
    const json = (await response.json()) as { error?: string; code?: string };
    if (json.error) message = json.error;
    code = json.code;
  } catch {
    // keep default
  }
  throw new AiChatApiError(mapHttpCode(response.status, code), message, response.status);
}

/**
 * Non-stream completion with tools — used for settings tool-calling loop.
 */
export async function completeAiChat(
  request: AiChatRequest,
  signal?: AbortSignal,
): Promise<AiCompletionMessage> {
  const response = await postChat(
    { ...request, stream: false, tools: true },
    'application/json',
    signal,
  );
  await throwIfNotOk(response);

  const json = (await response.json()) as {
    error?: string;
    code?: string;
    choices?: Array<{
      message?: {
        role?: string;
        content?: string | null;
        tool_calls?: AiWireToolCall[];
      };
    }>;
  };

  if (json.error) {
    throw new AiChatApiError(mapHttpCode(502, json.code), json.error, 502);
  }

  const message = json.choices?.[0]?.message;
  if (!message) {
    throw new AiChatApiError('UNKNOWN', 'Empty completion');
  }

  const content =
    typeof message.content === 'string'
      ? message.content
      : message.content == null
        ? ''
        : String(message.content);

  return {
    role: 'assistant',
    content,
    tool_calls: message.tool_calls,
  };
}

/**
 * POST chat messages to the local AI proxy and stream tokens (no tools).
 */
export async function streamAiChat(
  request: AiChatRequest,
  handlers: StreamAiChatHandlers,
): Promise<void> {
  const response = await postChat(
    { ...request, stream: true, tools: false },
    'text/event-stream',
    handlers.signal,
  );
  await throwIfNotOk(response);

  if (!response.body) {
    throw new AiChatApiError('STREAM', 'Empty response body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        consumeSseDataLine(line, handlers.onToken);
      }
    }
    if (buffer.trim()) consumeSseDataLine(buffer, handlers.onToken);
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    if (err instanceof AiChatApiError) throw err;
    throw new AiChatApiError('STREAM', err instanceof Error ? err.message : 'Stream failed');
  }
}
