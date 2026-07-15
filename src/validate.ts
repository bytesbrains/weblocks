/**
 * Strict validation — the gate an *edit operation* passes before it is applied.
 * `ok` keys off HARD errors only (wrong type / invalid enum / unknown type /
 * duplicate id): those mean the op is malformed and must be rejected. Missing
 * content (a headline not yet written) is a `warning` — the block renders with a
 * placeholder, so it never blocks the edit.
 */
import { parse } from './schema.js';
import { getSpec } from './registry.js';
import type { Block, SiteManifest } from './types.js';

export interface Validation {
  ok: boolean;
  errors: string[];   // hard — reject
  warnings: string[]; // soft — applied with defaults
}

/** Validate one block's config against its brick schema. */
export function validateBlock(type: string, config: unknown): Validation {
  const spec = getSpec(type);
  if (!spec) return { ok: false, errors: [`unknown block type: ${type}`], warnings: [] };
  const r = parse(spec.schema, config ?? {});
  return {
    ok: r.ok,
    errors: r.errors.map((e) => `${type}.${e}`),
    warnings: r.warnings.map((w) => `${type}.${w}`),
  };
}

/** Validate a whole manifest: shape + every block. */
export function validateManifest(manifest: SiteManifest): Validation {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!manifest || typeof manifest !== 'object') return { ok: false, errors: ['manifest: required'], warnings: [] };
  if (!Array.isArray(manifest.blocks)) {
    errors.push('blocks: must be an array');
  } else {
    const seen = new Set<string>();
    manifest.blocks.forEach((b: Block, i) => {
      if (!b || typeof b.id !== 'string' || !b.id) errors.push(`blocks[${i}].id: required`);
      else if (seen.has(b.id)) errors.push(`blocks[${i}].id: duplicate "${b.id}"`);
      else seen.add(b.id);
      const v = validateBlock(b?.type, b?.config);
      for (const e of v.errors) errors.push(`blocks[${i}].${e}`);
      for (const w of v.warnings) warnings.push(`blocks[${i}].${w}`);
    });
  }
  return { ok: errors.length === 0, errors, warnings };
}
