/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/features/ai-assistant/models/schema.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Zod schemas for AI chat request payloads
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { z } from '@azes/validation';

const toolCallSchema = z.object({
  id: z.string().min(1),
  type: z.string().optional(),
  function: z.object({
    name: z.string().min(1),
    arguments: z.string(),
  }),
});

export const aiWireMessageSchema = z.discriminatedUnion('role', [
  z.object({
    role: z.literal('user'),
    content: z.string().trim().min(1).max(4000),
  }),
  z.object({
    role: z.literal('assistant'),
    content: z.string().max(8000),
    tool_calls: z.array(toolCallSchema).optional(),
  }),
  z.object({
    role: z.literal('tool'),
    content: z.string().max(8000),
    tool_call_id: z.string().min(1),
  }),
]);

export const aiChatRequestSchema = z.object({
  messages: z.array(aiWireMessageSchema).min(1).max(24),
  /** When false (default for tools), proxy returns a JSON completion. */
  stream: z.boolean().optional(),
  tools: z.boolean().optional(),
});

export type AiChatRequest = z.infer<typeof aiChatRequestSchema>;
