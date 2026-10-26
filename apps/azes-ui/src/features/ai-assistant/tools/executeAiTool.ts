/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/features/ai-assistant/tools/executeAiTool.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Whitelist executor for AI UI tools (settings + color mode)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import {
  AZES_SETTINGS_KEYS,
  AZES_SETTINGS_OPTIONS,
  type AzesSettings,
  type AzesSettingsKey,
  type AzesSettingsPatch,
} from '@azes/ui-web/settings';
import { brandSeedOrder, brandSeeds } from '@azes/ui-web';

import { AI_TOOL_NAMES, type AiToolName } from './toolDefs.js';

export type AiToolCall = {
  id: string;
  type?: string;
  function: {
    name: string;
    arguments: string;
  };
};

export type AiToolExecutorDeps = {
  getMode: () => string | undefined;
  setMode: (mode: 'light' | 'dark' | 'system') => void;
  getSettings: () => AzesSettings;
  setSettings: (patch: AzesSettingsPatch) => void;
};

export type AiToolResult = {
  ok: boolean;
  name: string;
  summary: string;
  data?: unknown;
};

const SETTINGS_KEY_SET = new Set<string>(AZES_SETTINGS_KEYS);
const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

function isAiToolName(name: string): name is AiToolName {
  return (AI_TOOL_NAMES as readonly string[]).includes(name);
}

function parseArgs(raw: string): unknown {
  try {
    return JSON.parse(raw || '{}') as unknown;
  } catch {
    return null;
  }
}

function normalizePrimary(value: string): string | null {
  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();
  if ((brandSeedOrder as readonly string[]).includes(lower)) {
    return brandSeeds[lower as keyof typeof brandSeeds];
  }
  if (HEX_RE.test(trimmed)) return trimmed.toUpperCase();
  return null;
}

function validateSettingValue(key: AzesSettingsKey, value: string): string | null {
  if (key === 'primary') return normalizePrimary(value);

  const options = AZES_SETTINGS_OPTIONS[key as Exclude<AzesSettingsKey, 'primary'>];
  if (!options) return null;
  const allowed = options as readonly string[];
  return allowed.includes(value) ? value : null;
}

/** Execute one model tool_call against the real AZES settings APIs. */
export function executeAiTool(call: AiToolCall, deps: AiToolExecutorDeps): AiToolResult {
  const name = call.function?.name ?? '';
  if (!isAiToolName(name)) {
    return {
      ok: false,
      name,
      summary: `Unknown tool "${name}" — whitelist only`,
    };
  }

  const args = parseArgs(call.function.arguments ?? '');
  if (args === null || typeof args !== 'object') {
    return { ok: false, name, summary: 'Invalid tool arguments JSON' };
  }

  if (name === 'get_ui_state') {
    const data = {
      mode: deps.getMode() ?? 'system',
      settings: deps.getSettings(),
    };
    return {
      ok: true,
      name,
      summary: 'Current UI state read',
      data,
    };
  }

  if (name === 'set_color_mode') {
    const mode = (args as { mode?: unknown }).mode;
    if (mode !== 'light' && mode !== 'dark' && mode !== 'system') {
      return {
        ok: false,
        name,
        summary: 'mode must be light | dark | system',
      };
    }
    deps.setMode(mode);
    return {
      ok: true,
      name,
      summary: `Color mode set to ${mode}`,
      data: { mode },
    };
  }

  if (name === 'set_azes_setting') {
    const key = (args as { key?: unknown }).key;
    const value = (args as { value?: unknown }).value;
    if (typeof key !== 'string' || !SETTINGS_KEY_SET.has(key)) {
      return {
        ok: false,
        name,
        summary: `Invalid settings key "${String(key)}"`,
      };
    }
    if (typeof value !== 'string' || !value.trim()) {
      return { ok: false, name, summary: 'value must be a non-empty string' };
    }
    const settingKey = key as AzesSettingsKey;
    const normalized = validateSettingValue(settingKey, value.trim());
    if (!normalized) {
      return {
        ok: false,
        name,
        summary: `Invalid value "${value}" for ${settingKey}`,
      };
    }
    deps.setSettings({ [settingKey]: normalized } as AzesSettingsPatch);
    return {
      ok: true,
      name,
      summary: `Setting ${settingKey} set to ${normalized}`,
      data: { key: settingKey, value: normalized },
    };
  }

  return { ok: false, name, summary: 'Unhandled tool' };
}
