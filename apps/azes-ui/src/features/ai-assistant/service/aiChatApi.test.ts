/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/features/ai-assistant/service/aiChatApi.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Unit tests for SSE token parsing
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it, vi } from 'vitest';

import { consumeSseDataLine } from './aiChatApi.js';

describe('consumeSseDataLine', () => {
  it('extracts delta content from OpenAI-compatible SSE', () => {
    const onToken = vi.fn();
    consumeSseDataLine('data: {"choices":[{"delta":{"content":"Hello"}}]}', onToken);
    expect(onToken).toHaveBeenCalledWith('Hello');
  });

  it('ignores [DONE] and empty frames', () => {
    const onToken = vi.fn();
    consumeSseDataLine('data: [DONE]', onToken);
    consumeSseDataLine('data: ', onToken);
    expect(onToken).not.toHaveBeenCalled();
  });

  it('throws on SSE error payload', () => {
    expect(() =>
      consumeSseDataLine('data: {"error":"NVIDIA down","code":"UPSTREAM_FETCH"}', vi.fn()),
    ).toThrow(/NVIDIA down/);
  });
});
