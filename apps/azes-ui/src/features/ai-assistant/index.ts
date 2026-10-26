/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/features/ai-assistant/index.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Public API for azes-ui AI assistant feature
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

export { AiChatMessages } from './components/AiChatMessages/index.js';
export { AiChatComposer } from './components/AiChatComposer/index.js';
export { useAiChat } from './hooks/useAiChat.js';
export type { AiChatMessage, AiChatErrorCode } from './models/types.js';
export type { UseAiChatResult } from './hooks/useAiChat.js';
export { AI_TOOL_DEFINITIONS, AI_TOOL_NAMES } from './tools/toolDefs.js';
