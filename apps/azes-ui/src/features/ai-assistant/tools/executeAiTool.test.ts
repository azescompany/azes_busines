/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/features/ai-assistant/tools/executeAiTool.test.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Unit tests for AI settings tool whitelist executor
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_AZES_SETTINGS } from '@azes/ui-web/settings';

import { executeAiTool } from './executeAiTool.js';

describe('executeAiTool', () => {
  it('sets color mode via setMode', () => {
    const setMode = vi.fn();
    const result = executeAiTool(
      {
        id: '1',
        function: { name: 'set_color_mode', arguments: '{"mode":"dark"}' },
      },
      {
        getMode: () => 'light',
        setMode,
        getSettings: () => DEFAULT_AZES_SETTINGS,
        setSettings: vi.fn(),
      },
    );
    expect(result.ok).toBe(true);
    expect(setMode).toHaveBeenCalledWith('dark');
  });

  it('rejects unknown tools', () => {
    const result = executeAiTool(
      { id: '1', function: { name: 'rm_rf', arguments: '{}' } },
      {
        getMode: () => 'light',
        setMode: vi.fn(),
        getSettings: () => DEFAULT_AZES_SETTINGS,
        setSettings: vi.fn(),
      },
    );
    expect(result.ok).toBe(false);
  });

  it('rejects invalid settings key', () => {
    const setSettings = vi.fn();
    const result = executeAiTool(
      {
        id: '1',
        function: {
          name: 'set_azes_setting',
          arguments: '{"key":"password","value":"x"}',
        },
      },
      {
        getMode: () => 'light',
        setMode: vi.fn(),
        getSettings: () => DEFAULT_AZES_SETTINGS,
        setSettings,
      },
    );
    expect(result.ok).toBe(false);
    expect(setSettings).not.toHaveBeenCalled();
  });

  it('sets density when value is allowed', () => {
    const setSettings = vi.fn();
    const result = executeAiTool(
      {
        id: '1',
        function: {
          name: 'set_azes_setting',
          arguments: '{"key":"density","value":"compact"}',
        },
      },
      {
        getMode: () => 'light',
        setMode: vi.fn(),
        getSettings: () => DEFAULT_AZES_SETTINGS,
        setSettings,
      },
    );
    expect(result.ok).toBe(true);
    expect(setSettings).toHaveBeenCalledWith({ density: 'compact' });
  });
});
