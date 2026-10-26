/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/src/features/ai-assistant/tools/toolDefs.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: OpenAI-compatible tool schemas for azes-ui AI settings actions
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

/** Whitelisted tool names the client will execute. */
export const AI_TOOL_NAMES = ['set_color_mode', 'set_azes_setting', 'get_ui_state'] as const;

export type AiToolName = (typeof AI_TOOL_NAMES)[number];

export type AiToolDefinition = {
  type: 'function';
  function: {
    name: AiToolName;
    description: string;
    parameters: Record<string, unknown>;
  };
};

/** Sent to NVIDIA on every tools-enabled completion request. */
export const AI_TOOL_DEFINITIONS: readonly AiToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'set_color_mode',
      description:
        'Change the showcase color scheme (light / dark / system). Use when the user asks to switch theme mode.',
      parameters: {
        type: 'object',
        properties: {
          mode: {
            type: 'string',
            enum: ['light', 'dark', 'system'],
            description: 'Target color scheme mode',
          },
        },
        required: ['mode'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'set_azes_setting',
      description:
        'Update one AZES UI setting (same store as the settings drawer): primary, navLayout, navColor, density, direction, fontFamily, container, headerMode.',
      parameters: {
        type: 'object',
        properties: {
          key: {
            type: 'string',
            enum: [
              'primary',
              'navLayout',
              'navColor',
              'density',
              'direction',
              'fontFamily',
              'container',
              'headerMode',
            ],
          },
          value: {
            type: 'string',
            description:
              'For primary: a brand seed name (e.g. red, blue, teal) or #RRGGBB. For others: an allowed enum value.',
          },
        },
        required: ['key', 'value'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_ui_state',
      description: 'Read the current color mode and AZES settings snapshot before changing UI.',
      parameters: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
    },
  },
];
