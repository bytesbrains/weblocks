/**
 * Strict validation — the gate an *edit operation* passes before it is applied.
 * `ok` keys off HARD errors only (wrong type / unknown type / duplicate id):
 * those mean the op is malformed and must be rejected. Anything the schema can
 * repair from its own declarations — a missing headline, a truncated string, a
 * string that missed its enum — is a `warning`: the block renders with the
 * declared substitute, so it never blocks the edit.
 *
 * Both entry points return the REPAIRED input alongside the verdict. `parse`
 * computes it either way, and a caller that only gets `ok: false` has to choose
 * between shipping the value it was just told is wrong and discarding work that
 * was otherwise fine. Returning `value` makes the repair usable: on `ok` it is
 * the manifest to keep (defaults filled in, near-miss enums substituted), and on
 * a hard failure it is still the closest renderable thing to what came in.
 */
import { parse } from './schema.js';
import { getSpec } from './registry.js';
import type { Block, SiteManifest } from './types.js';

export interface Validation<T = unknown> {
  ok: boolean;
  errors: string[];   // hard — reject
  warnings: string[]; // soft — applied with defaults
  /** The input with defaults applied and every repairable value substituted. */
  value: T;
}

/** Validate one block's config against its brick schema. */
export function validateBlock(type: string, config: unknown): Validation<Record<string, unknown>> {
  const spec = getSpec(type);
  // No schema, nothing to repair against — hand back what came in so the caller
  // keeps whatever it had rather than losing the config to an unknown type.
  if (!spec) return { ok: false, errors: [`unknown block type: ${type}`], warnings: [], value: asConfig(config) };
  const r = parse(spec.schema, config ?? {});
  return {
    ok: r.ok,
    errors: r.errors.map((e) => `${type}.${e}`),
    warnings: r.warnings.map((w) => `${type}.${w}`),
    value: r.value,
  };
}

/** Validate a whole manifest: shape + every block. */
export function validateManifest(manifest: SiteManifest): Validation<SiteManifest> {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!manifest || typeof manifest !== 'object') {
    return { ok: false, errors: ['manifest: required'], warnings: [], value: manifest };
  }
  if (!Array.isArray(manifest.blocks)) {
    return { ok: false, errors: ['blocks: must be an array'], warnings: [], value: manifest };
  }
  const seen = new Set<string>();
  // A new manifest, never a mutation of the caller's: validation is a pure
  // function, and a caller that ignores `value` must see its input untouched.
  const blocks = manifest.blocks.map((b: Block, i) => {
    if (!b || typeof b.id !== 'string' || !b.id) errors.push(`blocks[${i}].id: required`);
    else if (seen.has(b.id)) errors.push(`blocks[${i}].id: duplicate "${b.id}"`);
    else seen.add(b.id);
    const v = validateBlock(b?.type, b?.config);
    for (const e of v.errors) errors.push(`blocks[${i}].${e}`);
    for (const w of v.warnings) warnings.push(`blocks[${i}].${w}`);
    // A null entry has nothing to attach a config to; leave it exactly as it
    // came in rather than inventing a block out of the repair.
    return b ? { ...b, config: v.value } : b;
  });
  return { ok: errors.length === 0, errors, warnings, value: { ...manifest, blocks } };
}

function asConfig(config: unknown): Record<string, unknown> {
  return (config && typeof config === 'object' && !Array.isArray(config)) ? config as Record<string, unknown> : {};
}
