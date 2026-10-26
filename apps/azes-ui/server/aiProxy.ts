/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║ AZES COMPANY
 * ║ File: apps/azes-ui/server/aiProxy.ts
 * ║ Author: AZES_COMPANY
 * ║ Created: 2026-10-19
 * ║ Updated: 2026-10-19
 * ║ Purpose: Vite middleware — grounded NVIDIA chat proxy (+ tools)
 * ║ Layer: app
 * ╚══════════════════════════════════════════════════════════════╝
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import https from 'node:https';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Connect, Plugin } from 'vite';

import { AI_TOOL_DEFINITIONS } from '../src/features/ai-assistant/tools/toolDefs.js';
import { formatContext, retrieveChunks, type KnowledgeChunk } from './knowledge/retrieve.js';
import { buildSystemPrompt } from './knowledge/systemPrompt.js';

const MAX_MESSAGES = 24;
const MAX_CONTENT_LEN = 8000;
const MAX_TOKENS = 2048;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 30;
const BODY_TIMEOUT_MS = 15_000;
const UPSTREAM_TIMEOUT_MS = 75_000;

export type AzesAiProxyOptions = {
  rootDir: string;
  getEnv: () => {
    apiKey: string;
    apiUrl: string;
    model: string;
    tlsInsecure: boolean;
  };
};

type ChatMessage = {
  role: string;
  content: string | null;
  tool_call_id?: string;
  tool_calls?: unknown;
};

const hitsByIp = new Map<string, number[]>();

function clientIp(req: IncomingMessage): string {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.length > 0) return xf.split(',')[0]!.trim();
  return req.socket.remoteAddress ?? 'unknown';
}

function rateLimitOk(ip: string): boolean {
  const now = Date.now();
  const prev = hitsByIp.get(ip) ?? [];
  const recent = prev.filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    hitsByIp.set(ip, recent);
    return false;
  }
  recent.push(now);
  hitsByIp.set(ip, recent);
  return true;
}

function loadChunks(rootDir: string): KnowledgeChunk[] {
  const file = path.join(rootDir, 'server/knowledge/chunks.json');
  const raw = readFileSync(file, 'utf8');
  const parsed = JSON.parse(raw) as KnowledgeChunk[];
  if (!Array.isArray(parsed)) throw new Error('chunks.json must be an array');
  return parsed;
}

function readBody(req: IncomingMessage, timeoutMs = BODY_TIMEOUT_MS): Promise<string> {
  return new Promise((resolve, reject) => {
    const parts: Buffer[] = [];
    let settled = false;

    const done = (err?: Error, value?: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      req.off('data', onData);
      req.off('end', onEnd);
      req.off('error', onError);
      if (err) reject(err);
      else resolve(value ?? '');
    };

    const timer = setTimeout(() => done(new Error('Request body timeout')), timeoutMs);
    const onData = (chunk: Buffer | string) => {
      parts.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    };
    const onEnd = () => done(undefined, Buffer.concat(parts).toString('utf8'));
    const onError = (err: Error) => done(err);

    req.on('data', onData);
    req.on('end', onEnd);
    req.on('error', onError);

    if (req.readableEnded) {
      done(undefined, Buffer.concat(parts).toString('utf8'));
    }
  });
}

function parseMessages(body: unknown): ChatMessage[] | null {
  if (!body || typeof body !== 'object') return null;
  const messages = (body as { messages?: unknown }).messages;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
    return null;
  }
  const out: ChatMessage[] = [];
  for (const item of messages) {
    if (!item || typeof item !== 'object') return null;
    const role = (item as { role?: unknown }).role;
    if (role !== 'user' && role !== 'assistant' && role !== 'tool') return null;

    if (role === 'tool') {
      const content = (item as { content?: unknown }).content;
      const toolCallId = (item as { tool_call_id?: unknown }).tool_call_id;
      if (typeof content !== 'string' || typeof toolCallId !== 'string') return null;
      if (content.length > MAX_CONTENT_LEN || !toolCallId.trim()) return null;
      out.push({ role, content, tool_call_id: toolCallId });
      continue;
    }

    if (role === 'assistant') {
      const content = (item as { content?: unknown }).content;
      const toolCalls = (item as { tool_calls?: unknown }).tool_calls;
      const text = typeof content === 'string' ? content : content == null ? '' : null;
      if (text === null || text.length > MAX_CONTENT_LEN) return null;
      const msg: ChatMessage = { role, content: text };
      if (Array.isArray(toolCalls) && toolCalls.length > 0) {
        msg.tool_calls = toolCalls;
      }
      out.push(msg);
      continue;
    }

    const content = (item as { content?: unknown }).content;
    if (typeof content !== 'string') return null;
    const trimmed = content.trim();
    if (!trimmed || trimmed.length > MAX_CONTENT_LEN) return null;
    out.push({ role, content: trimmed });
  }
  return out;
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  if (res.headersSent) return;
  const body = JSON.stringify(payload);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(body);
}

function openSse(res: ServerResponse, sources: string[]): void {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
    'X-Azes-Ai-Sources': sources.join(','),
  });
  res.write(': connected\n\n');
}

function writeSseError(res: ServerResponse, error: string, code: string): void {
  res.write(`data: ${JSON.stringify({ error, code })}\n\n`);
  res.write('data: [DONE]\n\n');
  res.end();
}

type UpstreamResult = {
  statusCode: number;
  response: IncomingMessage;
};

function postNvidia(options: {
  apiUrl: string;
  apiKey: string;
  body: string;
  tlsInsecure: boolean;
  accept: string;
}): Promise<UpstreamResult> {
  const url = new URL(options.apiUrl);
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || 443,
        path: `${url.pathname}${url.search}`,
        method: 'POST',
        rejectUnauthorized: !options.tlsInsecure,
        timeout: UPSTREAM_TIMEOUT_MS,
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
          Accept: options.accept,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(options.body),
        },
      },
      (response) => {
        resolve({ statusCode: response.statusCode ?? 0, response });
      },
    );
    req.on('timeout', () => {
      req.destroy(new Error('NVIDIA request timeout'));
    });
    req.on('error', reject);
    req.write(options.body);
    req.end();
  });
}

async function readUpstreamText(response: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of response) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}

function lastUserText(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i]!;
    if (m.role === 'user' && typeof m.content === 'string') return m.content;
  }
  return messages.map((m) => (typeof m.content === 'string' ? m.content : '')).join(' ');
}

function createHandler(options: AzesAiProxyOptions): Connect.NextHandleFunction {
  let chunksCache: KnowledgeChunk[] | null = null;

  const run = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed', code: 'METHOD' });
      return;
    }

    if (!rateLimitOk(clientIp(req))) {
      sendJson(res, 429, { error: 'Too many requests', code: 'RATE_LIMIT' });
      return;
    }

    const { apiKey, apiUrl, model, tlsInsecure } = options.getEnv();
    if (!apiKey) {
      sendJson(res, 503, {
        error: 'NVIDIA_API_KEY is not configured on the server',
        code: 'NO_API_KEY',
      });
      return;
    }

    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(await readBody(req));
    } catch (err) {
      sendJson(res, 400, {
        error: err instanceof Error ? err.message : 'Invalid JSON body',
        code: 'BAD_JSON',
      });
      return;
    }

    const messages = parseMessages(parsedBody);
    if (!messages) {
      sendJson(res, 400, {
        error: 'Invalid messages',
        code: 'BAD_MESSAGES',
      });
      return;
    }

    const bodyObj = parsedBody as { stream?: unknown; tools?: unknown };
    const wantStream = bodyObj.stream !== false;
    const wantTools = bodyObj.tools === true || bodyObj.stream === false;

    try {
      if (!chunksCache) chunksCache = loadChunks(options.rootDir);
    } catch (err) {
      sendJson(res, 500, {
        error: err instanceof Error ? err.message : 'Failed to load knowledge',
        code: 'KNOWLEDGE',
      });
      return;
    }

    const retrieved = retrieveChunks(lastUserText(messages), chunksCache, 4);
    const system = buildSystemPrompt(formatContext(retrieved));
    const sourceIds = retrieved.map((c) => c.id);

    const upstreamPayloadObj: Record<string, unknown> = {
      model,
      messages: [{ role: 'system', content: system }, ...messages],
      temperature: 0.3,
      top_p: 0.9,
      max_tokens: MAX_TOKENS,
      stream: wantStream && !wantTools ? true : false,
      chat_template_kwargs: { enable_thinking: false },
    };

    if (wantTools) {
      upstreamPayloadObj.tools = AI_TOOL_DEFINITIONS;
      upstreamPayloadObj.tool_choice = 'auto';
    }

    const useStream = upstreamPayloadObj.stream === true;
    const upstreamBody = JSON.stringify(upstreamPayloadObj);

    let upstream: UpstreamResult;
    try {
      upstream = await postNvidia({
        apiUrl,
        apiKey,
        body: upstreamBody,
        tlsInsecure,
        accept: useStream ? 'text/event-stream' : 'application/json',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upstream fetch failed';
      const code =
        typeof err === 'object' &&
        err &&
        'code' in err &&
        (err as { code?: string }).code === 'SELF_SIGNED_CERT_IN_CHAIN'
          ? 'TLS_CERT'
          : 'UPSTREAM_FETCH';
      if (useStream) {
        openSse(res, sourceIds);
        writeSseError(res, message, code);
      } else {
        sendJson(res, 502, { error: message, code });
      }
      return;
    }

    if (upstream.statusCode < 200 || upstream.statusCode >= 300) {
      const detail = (await readUpstreamText(upstream.response)).slice(0, 500);
      if (useStream) {
        openSse(res, sourceIds);
        writeSseError(res, `NVIDIA error ${upstream.statusCode}: ${detail}`, 'UPSTREAM_STATUS');
      } else {
        sendJson(res, 502, {
          error: `NVIDIA error ${upstream.statusCode}`,
          code: 'UPSTREAM_STATUS',
          detail,
        });
      }
      return;
    }

    if (!useStream) {
      const text = await readUpstreamText(upstream.response);
      try {
        const json = JSON.parse(text) as unknown;
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('X-Azes-Ai-Sources', sourceIds.join(','));
        res.end(JSON.stringify(json));
      } catch {
        sendJson(res, 502, {
          error: 'Invalid JSON from NVIDIA',
          code: 'UPSTREAM_STATUS',
          detail: text.slice(0, 300),
        });
      }
      return;
    }

    openSse(res, sourceIds);
    await new Promise<void>((resolve) => {
      upstream.response.on('data', (chunk: Buffer | string) => {
        res.write(chunk);
      });
      upstream.response.on('end', () => {
        res.end();
        resolve();
      });
      upstream.response.on('error', () => {
        if (!res.writableEnded) res.end();
        resolve();
      });
      res.on('close', () => {
        upstream.response.destroy();
        resolve();
      });
    });
  };

  return (req, res, next) => {
    void run(req, res).catch((err) => {
      if (!res.headersSent) {
        sendJson(res, 500, {
          error: err instanceof Error ? err.message : 'Internal error',
          code: 'INTERNAL',
        });
      } else if (!res.writableEnded) {
        writeSseError(res, err instanceof Error ? err.message : 'Internal error', 'INTERNAL');
      }
      void next;
    });
  };
}

export function azesAiProxyPlugin(options: AzesAiProxyOptions): Plugin {
  const handler = createHandler(options);
  return {
    name: 'azes-ai-proxy',
    configureServer(server) {
      server.middlewares.use('/api/ai/chat', handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/ai/chat', handler);
    },
  };
}
