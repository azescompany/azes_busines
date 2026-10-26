/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/features/ai-assistant/models/types.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Client chat message types for azes-ui AI assistant
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type AiChatRole = 'user' | 'assistant';

export type AiChatMessage = {
  id: string;
  role: AiChatRole;
  content: string;
};

export type AiChatErrorCode =
  | 'NO_API_KEY'
  | 'RATE_LIMIT'
  | 'BAD_MESSAGES'
  | 'UPSTREAM_STATUS'
  | 'UPSTREAM_FETCH'
  | 'STREAM'
  | 'NETWORK'
  | 'HTTP'
  | 'UNKNOWN';

export type AiWireToolCall = {
  id: string;
  type?: string;
  function: {
    name: string;
    arguments: string;
  };
};

/** Messages sent to the proxy (includes tool turns). */
export type AiWireMessage =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string; tool_calls?: AiWireToolCall[] }
  | { role: 'tool'; content: string; tool_call_id: string };

export type AiCompletionMessage = {
  role: 'assistant';
  content: string;
  tool_calls?: AiWireToolCall[];
};
