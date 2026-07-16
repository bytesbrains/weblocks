/**
 * A tiny, dependency-free schema layer — the "studs" of a brick.
 *
 * It is the contract the AI must satisfy, and it separates two severities so
 * edit ops can be strict about garbage yet lenient about incompleteness:
 *   - errors (HARD): wrong type, invalid enum, out-of-range int, non-array →
 *     the op is malformed; reject it (illegal states unrepresentable).
 *   - warnings (SOFT): a required field is missing, or a value was truncated to
 *     its max → apply with the default/truncation (the total renderer copes),
 *     and tell the author.
 *
 * [parse] ALWAYS returns a fully-defaulted `value`, so the renderer never sees a
 * hole even when the input was partial. (In production these descriptors would
 * be generated from each component's Custom Elements Manifest.)
 */

export type Field =
  | { kind: 'string'; required?: boolean; default?: string; max?: number }
  | { kind: 'enum'; values: readonly string[]; required?: boolean; default?: string }
  | { kind: 'boolean'; default?: boolean }
  | { kind: 'int'; oneOf?: readonly number[]; default?: number; min?: number; max?: number }
  | { kind: 'object'; fields: Schema; required?: boolean }
  | { kind: 'array'; of: Field; required?: boolean; max?: number };

export type Schema = Record<string, Field>;

export interface ParseResult {
  ok: boolean; // no HARD errors
  value: Record<string, unknown>;
  errors: string[];
  warnings: string[];
}

interface Ctx { errors: string[]; warnings: string[]; }

/** Validate `input` against `schema`, applying defaults. Never throws. */
export function parse(schema: Schema, input: unknown): ParseResult {
  const ctx: Ctx = { errors: [], warnings: [] };
  const src = isObject(input) ? input : {};
  const value: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(schema)) {
    value[key] = parseField(field, src[key], key, ctx);
  }
  return { ok: ctx.errors.length === 0, value, errors: ctx.errors, warnings: ctx.warnings };
}

function parseField(field: Field, raw: unknown, path: string, ctx: Ctx): unknown {
  const present = raw !== undefined && raw !== null;
  switch (field.kind) {
    case 'string': {
      if (!present) return missing(field.required, path, ctx, field.default ?? '');
      if (typeof raw !== 'string') return hard(path, 'string', ctx, field.default ?? '');
      if (field.max !== undefined && raw.length > field.max) {
        ctx.warnings.push(`${path}: truncated to ${field.max} chars`);
        return raw.slice(0, field.max);
      }
      return raw;
    }
    case 'enum': {
      const fallback = field.default ?? field.values[0] ?? '';
      if (!present) return missing(field.required, path, ctx, fallback);
      if (typeof raw !== 'string' || !field.values.includes(raw)) {
        ctx.errors.push(`${path}: must be one of ${field.values.join(' | ')}`);
        return fallback;
      }
      return raw;
    }
    case 'boolean': {
      if (!present) return field.default ?? false;
      if (typeof raw !== 'boolean') return hard(path, 'boolean', ctx, field.default ?? false);
      return raw;
    }
    case 'int': {
      const def = field.default ?? field.oneOf?.[0] ?? 0;
      if (!present) return def;
      if (typeof raw !== 'number' || !Number.isInteger(raw)) return hard(path, 'integer', ctx, def);
      if (field.oneOf && !field.oneOf.includes(raw)) {
        ctx.errors.push(`${path}: must be one of ${field.oneOf.join(', ')}`);
        return def;
      }
      if (field.min !== undefined && raw < field.min) { ctx.errors.push(`${path}: below min ${field.min}`); return field.min; }
      if (field.max !== undefined && raw > field.max) { ctx.errors.push(`${path}: above max ${field.max}`); return field.max; }
      return raw;
    }
    case 'object': {
      if (!present) {
        if (field.required) ctx.warnings.push(`${path}: missing`);
        return parse(field.fields, {}).value;
      }
      const r = parse(field.fields, raw);
      for (const e of r.errors) ctx.errors.push(`${path}.${e}`);
      for (const w of r.warnings) ctx.warnings.push(`${path}.${w}`);
      return r.value;
    }
    case 'array': {
      if (!present) return missing(field.required, path, ctx, []);
      if (!Array.isArray(raw)) return hard(path, 'array', ctx, []);
      const items = field.max !== undefined ? raw.slice(0, field.max) : raw;
      if (field.max !== undefined && raw.length > field.max) ctx.warnings.push(`${path}: truncated to ${field.max} items`);
      return items.map((item, i) => parseField(field.of, item, `${path}[${i}]`, ctx));
    }
  }
}

/** Missing but not malformed → warning (soft); returns the default. */
function missing<T>(isRequired: boolean | undefined, path: string, ctx: Ctx, fallback: T): T {
  if (isRequired) ctx.warnings.push(`${path}: missing`);
  return fallback;
}

/** Wrong type/shape → error (hard); returns the default so render stays total. */
function hard<T>(path: string, expected: string, ctx: Ctx, fallback: T): T {
  ctx.errors.push(`${path}: expected ${expected}`);
  return fallback;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

// ── HTML-escaping (every brick renders text through these — no injection) ───────

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};

export function escapeHtml(s: unknown): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) => HTML_ESCAPES[c] ?? c);
}

/** Attribute-safe escape (same set; kept separate for intent + future divergence). */
export function escapeAttr(s: unknown): string {
  return escapeHtml(s);
}

// Link schemes allowed in an href. escapeAttr neutralizes the attribute
// *delimiters* but not a dangerous *scheme*, so a link target must also pass
// through here before it is escaped.
const SAFE_URL_SCHEME = /^(?:https?|mailto|tel):/i;

/**
 * Neutralize a link target so a config value can't inject a scheme-based XSS.
 * Relative/anchor URLs and the http(s)/mailto/tel schemes pass through; anything
 * with another scheme (javascript:, data:, vbscript:, …) collapses to '#'.
 *
 * C0 control chars are stripped first — browsers ignore tabs/newlines when
 * detecting a scheme, so `java\nscript:alert(1)` must be caught, not waved
 * through as "no scheme". Always feed the result through [escapeAttr] for the
 * attribute context.
 */
export function sanitizeUrl(url: unknown): string {
  // Strip C0 control chars + DEL (tab/newline/CR) before scheme detection.
  const s = String(url ?? '').replace(/[\x00-\x1F\x7F]/g, '').trim();
  if (!s) return '#';
  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(s);
  if (hasScheme && !SAFE_URL_SCHEME.test(s)) return '#';
  return s;
}

/**
 * A URL-fragment slug from arbitrary text: `'About Us!'` → `'about-us'`.
 * Diacritics are folded (`résumé` → `resume`). Used for section anchor ids and
 * nav in-page link resolution.
 */
export function slugify(s: unknown): string {
  return String(s ?? '')
    .normalize('NFKD').replace(/[̀-ͯ]/g, '') // fold accents
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, '')                      // drop other punctuation
    .trim()
    .replace(/[\s_]+/g, '-')                            // spaces/underscores → hyphen
    .replace(/-+/g, '-')                               // collapse
    .replace(/^-+|-+$/g, '');                          // trim hyphens
}
