/**
 * Edit operations — the verbs of the vocabulary, and the tools a chat-edit agent
 * calls. Each op is validated BEFORE it is applied (illegal states
 * unrepresentable): a malformed op is a no-op with errors, never a corrupted
 * manifest. Applying returns a NEW manifest with `version` bumped, so
 * undo/history/diff come for free.
 */
import { getSpec, blockTypes } from './registry.js';
import { normalizeTokens } from './tokens.js';
import { parse } from './schema.js';
import type { Block, DesignTokens, SiteManifest, SiteMeta } from './types.js';

export type EditOp =
  | { op: 'addBlock'; type: string; config?: Record<string, unknown>; at?: number; id?: string }
  | { op: 'updateBlock'; id: string; config: Record<string, unknown> }
  | { op: 'removeBlock'; id: string }
  | { op: 'moveBlock'; id: string; to: number }
  | { op: 'setVisible'; id: string; visible: boolean }
  | { op: 'setDesignTokens'; patch: Partial<DesignTokens> }
  | { op: 'setMeta'; patch: Partial<SiteMeta> };

export interface OpResult {
  ok: boolean;
  manifest: SiteManifest;   // unchanged when !ok
  errors: string[];
  warnings: string[];
  /** For addBlock: the id of the created block. */
  id?: string;
}

const clone = <T>(v: T): T => structuredClone(v);
const find = (m: SiteManifest, id: string) => m.blocks.findIndex((b) => b.id === id);

/** A deterministic, unique id: `<type>-N` with the smallest free N. */
function freshId(m: SiteManifest, type: string): string {
  const used = new Set(m.blocks.map((b) => b.id));
  for (let n = 1; ; n++) {
    const id = `${type}-${n}`;
    if (!used.has(id)) return id;
  }
}

function fail(m: SiteManifest, ...errors: string[]): OpResult {
  return { ok: false, manifest: m, errors, warnings: [] };
}

/** Apply one op. Pure: never mutates `manifest`. */
export function applyOp(manifest: SiteManifest, op: EditOp): OpResult {
  const next = clone(manifest);
  next.version = (manifest.version ?? 0) + 1;

  switch (op.op) {
    case 'addBlock': {
      const spec = getSpec(op.type);
      if (!spec) return fail(manifest, `addBlock: unknown type "${op.type}" (choose from: ${blockTypes().join(', ')})`);
      const parsed = parse(spec.schema, op.config ?? {});
      if (!parsed.ok) return fail(manifest, ...parsed.errors.map((e) => `addBlock(${op.type}): ${e}`));
      const id = op.id && !next.blocks.some((b) => b.id === op.id) ? op.id : freshId(next, op.type);
      const block: Block = { id, type: op.type, visible: true, config: parsed.value };
      const at = clamp(op.at ?? next.blocks.length, 0, next.blocks.length);
      next.blocks.splice(at, 0, block);
      return { ok: true, manifest: next, errors: [], warnings: parsed.warnings, id };
    }
    case 'updateBlock': {
      const i = find(next, op.id);
      if (i < 0) return fail(manifest, `updateBlock: no block "${op.id}"`);
      const cur = next.blocks[i]!;
      const spec = getSpec(cur.type);
      // The block may carry an unknown/deprecated type (e.g. a hand-edited or
      // legacy manifest); reject rather than dereferencing undefined.
      if (!spec) return fail(manifest, `updateBlock: unknown block type "${cur.type}" for "${op.id}"`);
      // Merge patch onto current config, then re-validate the whole config.
      const merged = { ...cur.config, ...(op.config ?? {}) };
      const parsed = parse(spec.schema, merged);
      if (!parsed.ok) return fail(manifest, ...parsed.errors.map((e) => `updateBlock(${op.id}): ${e}`));
      next.blocks[i] = { ...cur, config: parsed.value };
      return { ok: true, manifest: next, errors: [], warnings: parsed.warnings };
    }
    case 'removeBlock': {
      const i = find(next, op.id);
      if (i < 0) return fail(manifest, `removeBlock: no block "${op.id}"`);
      next.blocks.splice(i, 1);
      return { ok: true, manifest: next, errors: [], warnings: [] };
    }
    case 'moveBlock': {
      const i = find(next, op.id);
      if (i < 0) return fail(manifest, `moveBlock: no block "${op.id}"`);
      const [b] = next.blocks.splice(i, 1);
      const to = clamp(op.to, 0, next.blocks.length);
      next.blocks.splice(to, 0, b!);
      return { ok: true, manifest: next, errors: [], warnings: [] };
    }
    case 'setVisible': {
      const i = find(next, op.id);
      if (i < 0) return fail(manifest, `setVisible: no block "${op.id}"`);
      next.blocks[i] = { ...next.blocks[i]!, visible: op.visible };
      return { ok: true, manifest: next, errors: [], warnings: [] };
    }
    case 'setDesignTokens': {
      next.design = normalizeTokens({ ...next.design, ...(op.patch ?? {}) });
      return { ok: true, manifest: next, errors: [], warnings: [] };
    }
    case 'setMeta': {
      next.meta = { ...next.meta, ...(op.patch ?? {}) };
      return { ok: true, manifest: next, errors: [], warnings: [] };
    }
    default:
      return fail(manifest, `unknown op: ${(op as { op: string }).op}`);
  }
}

export interface BatchResult {
  manifest: SiteManifest;
  results: Array<{ op: EditOp; ok: boolean; errors: string[]; warnings: string[] }>;
  applied: number;
}

/**
 * Apply a sequence of ops (a chat turn). Each is validated independently against
 * the running manifest; a failing op is skipped (recorded), the rest proceed —
 * so one bad tool-call doesn't discard the whole turn.
 */
export function applyOps(manifest: SiteManifest, ops: EditOp[]): BatchResult {
  let m = manifest;
  let applied = 0;
  const results = ops.map((op) => {
    const r = applyOp(m, op);
    if (r.ok) { m = r.manifest; applied++; }
    return { op, ok: r.ok, errors: r.errors, warnings: r.warnings };
  });
  return { manifest: m, results, applied };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, Math.trunc(Number.isFinite(n) ? n : hi)));
}
