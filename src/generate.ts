/**
 * AI compose + edit orchestration.
 *
 * The deterministic parts live here — building the prompt from the catalog,
 * extracting/validating the model's JSON, and turning an edit reply into
 * validated ops. The actual model call is INJECTED (`ModelCall`), so this stays
 * provider-agnostic and unit-testable with a fake, and the real wiring (via
 * functions/ `callProvider`) happens at the edge. Validity comes from the schema
 * + ops, never from the model being right (invariant: validity ⟂ AI quality).
 */
import { catalogPrompt } from './catalog.js';
import { blockTypes } from './registry.js';
import { normalizeTokens, DEFAULT_TOKENS } from './tokens.js';
import { validateManifest } from './validate.js';
import { applyOps, type BatchResult, type EditOp } from './ops.js';
import type { Block, SiteManifest } from './types.js';

export type ModelCall = (args: { system: string; user: string }) => Promise<string>;

// ── Compose: brief → manifest ──────────────────────────────────────────────────

export function buildGenerationPrompt(brief: string): { system: string; user: string } {
  const system = [
    'You are a web designer that composes a single-page site by ARRANGING pre-built blocks.',
    'You do NOT write HTML, CSS, or JavaScript. You output ONLY a JSON site manifest.',
    '',
    'Available blocks (config keys; `*` = should be provided):',
    catalogPrompt(),
    '',
    'Also set `design` tokens: { mode: light|dark|auto, palette:{bg,surface,text,muted,primary,accent (hex)},',
    '  typography:{fontStack,scale: compact|default|expressive}, radius: sharp|soft|round,',
    '  spacing: tight|default|airy, motion: none|subtle|lively }.',
    '',
    'Rules:',
    '- Use ONLY the block types listed above; never invent a type or a config key.',
    '- Write real, specific copy for the described business — no lorem ipsum, no placeholders.',
    '- Order blocks top-to-bottom as a visitor would read them.',
    'Respond with ONLY the JSON object, no prose, no code fences:',
    '{ "meta": { "title", "description", "lang" }, "design": {...}, "blocks": [ { "type", "config": {...} } ] }',
  ].join('\n');
  return { system, user: `Brief:\n${brief}` };
}

export interface ComposeResult {
  ok: boolean;
  manifest: SiteManifest;
  errors: string[];
  warnings: string[];
}

/** Compose a manifest from a brief using the injected model. */
export async function generateSite(brief: string, callModel: ModelCall): Promise<ComposeResult> {
  const { system, user } = buildGenerationPrompt(brief);
  const raw = await callModel({ system, user });
  return parseManifestResponse(raw);
}

/** Extract + coerce + validate a manifest from a model reply. Never throws. */
export function parseManifestResponse(text: string): ComposeResult {
  const json = extractJson(text);
  if (json === undefined) return { ok: false, manifest: emptyManifest(), errors: ['no JSON object in model reply'], warnings: [] };
  const manifest = coerceManifest(json);
  const v = validateManifest(manifest);
  return { ok: v.ok, manifest, errors: v.errors, warnings: v.warnings };
}

// ── Edit: message + manifest → ops → new manifest ──────────────────────────────

export function buildEditPrompt(manifest: SiteManifest, message: string): { system: string; user: string } {
  const outline = manifest.blocks.map((b, i) => `  ${i}. ${b.id} (${b.type})`).join('\n') || '  (empty)';
  const system = [
    'You edit a single-page site by emitting JSON EDIT OPERATIONS over its blocks. You never write HTML/CSS/JS.',
    '',
    'Ops (emit a JSON array):',
    '- { "op":"addBlock", "type":..., "config":{...}, "at":<index?> }',
    '- { "op":"updateBlock", "id":..., "config":{ ...only changed keys... } }',
    '- { "op":"removeBlock", "id":... }',
    '- { "op":"moveBlock", "id":..., "to":<index> }',
    '- { "op":"setVisible", "id":..., "visible":true|false }',
    '- { "op":"setDesignTokens", "patch":{ ...design keys... } }',
    '- { "op":"setMeta", "patch":{ title?, description?, lang? } }',
    '',
    `Block types available: ${blockTypes().join(', ')}.`,
    'Block configs (for add/update):',
    catalogPrompt(),
    '',
    'Current page blocks (top→bottom):',
    outline,
    '',
    'Emit ONLY the JSON array of ops needed for the request. Empty array [] if nothing to do.',
  ].join('\n');
  return { system, user: message };
}

export interface EditResult extends BatchResult {
  parsedOps: EditOp[];
  parseError?: string;
}

/** Interpret a natural-language edit against the manifest via the injected model. */
export async function editSite(manifest: SiteManifest, message: string, callModel: ModelCall): Promise<EditResult> {
  const { system, user } = buildEditPrompt(manifest, message);
  const raw = await callModel({ system, user });
  const { ops, error } = parseOpsResponse(raw);
  const batch = applyOps(manifest, ops);
  return { ...batch, parsedOps: ops, parseError: error };
}

/** Extract a JSON array of ops from a model reply. */
export function parseOpsResponse(text: string): { ops: EditOp[]; error?: string } {
  const json = extractJson(text, 'array');
  if (json === undefined) return { ops: [], error: 'no JSON array in model reply' };
  if (!Array.isArray(json)) return { ops: [], error: 'expected a JSON array of ops' };
  const ops = json.filter((o): o is EditOp => !!o && typeof o === 'object' && typeof (o as { op?: unknown }).op === 'string');
  return { ops };
}

// ── helpers ────────────────────────────────────────────────────────────────────

function extractJson(text: string, want: 'object' | 'array' = 'object'): unknown {
  const t = (text ?? '').trim().replace(/^```[a-zA-Z]*\r?\n?/, '').replace(/\r?\n?```$/, '').trim();
  const open = want === 'array' ? '[' : '{';
  const close = want === 'array' ? ']' : '}';
  const start = t.indexOf(open);
  const end = t.lastIndexOf(close);
  if (start < 0 || end <= start) return undefined;
  try {
    return JSON.parse(t.slice(start, end + 1));
  } catch {
    return undefined;
  }
}

function coerceManifest(raw: unknown): SiteManifest {
  const r = (raw && typeof raw === 'object') ? raw as Record<string, unknown> : {};
  const meta = (r.meta && typeof r.meta === 'object') ? r.meta as Record<string, unknown> : {};
  const rawBlocks = Array.isArray(r.blocks) ? r.blocks : [];
  const used = new Set<string>();
  const blocks: Block[] = rawBlocks.map((b) => {
    const bb = (b && typeof b === 'object') ? b as Record<string, unknown> : {};
    const type = typeof bb.type === 'string' ? bb.type : '';
    let id = typeof bb.id === 'string' && bb.id ? bb.id : '';
    if (!id || used.has(id)) { let n = 1; while (used.has(`${type || 'block'}-${n}`)) n++; id = `${type || 'block'}-${n}`; }
    used.add(id);
    return {
      id, type,
      visible: bb.visible !== false,
      config: (bb.config && typeof bb.config === 'object') ? bb.config as Record<string, unknown> : {},
    };
  });
  return {
    meta: {
      title: typeof meta.title === 'string' ? meta.title : 'Untitled site',
      description: typeof meta.description === 'string' ? meta.description : '',
      lang: typeof meta.lang === 'string' ? meta.lang : 'en',
    },
    design: normalizeTokens((r.design ?? DEFAULT_TOKENS) as never),
    blocks,
    version: typeof r.version === 'number' ? r.version : 1,
  };
}

function emptyManifest(): SiteManifest {
  return { meta: { title: 'Untitled site', description: '', lang: 'en' }, design: DEFAULT_TOKENS, blocks: [], version: 1 };
}
