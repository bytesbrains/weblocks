#!/usr/bin/env node
/**
 * Template authoring check — the guard rail that `validateManifest` alone can't
 * give you.
 *
 * Unknown config keys are *silently dropped* by `parse` (schema-driven, so it
 * never even looks at a key it doesn't know). That means a template can invent
 * `hero.buttonText`, pass validation, and render with the content missing. This
 * script catches that, plus the other authoring slips that are invisible at
 * runtime: dangling `#anchor` links, duplicate placeholder image seeds, and
 * metadata that claims a preset or layout the template doesn't actually use.
 *
 * Usage:
 *   node scripts/check-templates.mjs            # every template
 *   node scripts/check-templates.mjs trades     # one vertical (authoring loop)
 *
 * Type-checks to a scratch dir with emit-on-error, so a sibling module that is
 * still being written doesn't block checking the one you care about.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const only = process.argv[2];
const root = resolve(import.meta.dirname, '..');
const out = mkdtempSync(join(tmpdir(), 'weblocks-check-'));

/** Compile src → scratch dir. Emits even with errors so we can filter by file. */
function compile() {
  try {
    execFileSync('npx', ['tsc', '-p', 'tsconfig.json', '--outDir', out, '--declaration', 'false', '--noEmitOnError', 'false'],
      { cwd: root, encoding: 'utf8', stdio: 'pipe' });
    return [];
  } catch (e) {
    return String(e.stdout ?? '').split('\n').filter((l) => /error TS/.test(l));
  }
}

const tsErrors = compile();
// A vertical run only cares about its own file (+ the shared helpers/registry).
const relevant = only
  ? tsErrors.filter((l) => new RegExp(`templates[\\\\/](${only}|_helpers)\\.ts`).test(l))
  : tsErrors;
if (relevant.length) {
  console.error(`✗ TypeScript errors:\n${relevant.join('\n')}`);
  rmSync(out, { recursive: true, force: true });
  process.exit(1);
}

const { TEMPLATES } = await import(pathToFileURL(join(out, 'templates.js')));
const { getSpec } = await import(pathToFileURL(join(out, 'registry.js')));
const { validateManifest } = await import(pathToFileURL(join(out, 'validate.js')));
const { renderSite } = await import(pathToFileURL(join(out, 'render.js')));
const { verticalNames } = await import(pathToFileURL(join(out, 'verticals.js')));
const { presetNames } = await import(pathToFileURL(join(out, 'presets.js')));

const LAYOUTS = new Set(['classic', 'editorial', 'minimal', 'bold', 'app', 'profile', 'catalogue', 'showcase', 'landing', 'conversational']);
const verticals = new Set(verticalNames());
const presets = new Set(presetNames());

/**
 * Walk a config against its schema and report keys the schema has no field for.
 * Recurses through `object` fields and `array` item shapes, which is where the
 * invented keys usually hide (`items[].buttonLabel`).
 */
function unknownKeys(config, schema, path = '') {
  const bad = [];
  if (!config || typeof config !== 'object' || Array.isArray(config)) return bad;
  for (const [key, value] of Object.entries(config)) {
    const field = schema?.[key];
    if (!field) { bad.push(`${path}${key}`); continue; }
    if (field.kind === 'object' && field.fields) bad.push(...unknownKeys(value, field.fields, `${path}${key}.`));
    if (field.kind === 'array' && field.of?.fields && Array.isArray(value)) {
      value.forEach((entry, i) => bad.push(...unknownKeys(entry, field.of.fields, `${path}${key}[${i}].`)));
    }
  }
  return bad;
}

/** Collect every `#anchor` a block points at, so we can prove it resolves. */
function anchors(value, found = []) {
  if (typeof value === 'string') { if (value.startsWith('#') && value.length > 1) found.push(value.slice(1)); return found; }
  if (Array.isArray(value)) { for (const v of value) anchors(v, found); return found; }
  if (value && typeof value === 'object') { for (const v of Object.values(value)) anchors(v, found); }
  return found;
}

const problems = [];
const seeds = new Map();
const list = Object.values(TEMPLATES).filter((t) => !only || t.vertical === only);

for (const t of list) {
  const fail = (msg) => problems.push(`${t.id}: ${msg}`);

  if (!verticals.has(t.vertical)) fail(`unknown vertical "${t.vertical}"`);
  if (!LAYOUTS.has(t.layout)) fail(`unknown layout "${t.layout}"`);
  if (!presets.has(t.preset)) fail(`unknown preset "${t.preset}"`);
  if (!t.description || t.description.length < 20) fail('description missing or too short');
  if (!Array.isArray(t.tags) || t.tags.length < 3) fail('needs at least 3 tags');
  for (const tag of t.tags ?? []) if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(tag)) fail(`tag "${tag}" is not lowercase-kebab`);

  const v = validateManifest(t.manifest);
  if (!v.ok) fail(`invalid manifest — ${v.errors.join('; ')}`);

  const ids = new Set(t.manifest.blocks.map((blk) => blk.id));
  for (const blk of t.manifest.blocks) {
    const spec = getSpec(blk.type);
    if (!spec) { fail(`unknown block type "${blk.type}"`); continue; }
    for (const key of unknownKeys(blk.config, spec.schema)) fail(`block "${blk.id}" (${blk.type}) has unknown config key "${key}" — it will be silently dropped`);
    for (const a of anchors(blk.config)) if (!ids.has(a)) fail(`block "${blk.id}" links to "#${a}", which is not a block id in this manifest`);
  }

  for (const url of JSON.stringify(t.manifest).match(/picsum\.photos\/seed\/[^/"]+/g) ?? []) {
    const seed = url.split('/').pop();
    const owner = seeds.get(seed);
    if (owner && owner !== t.id) fail(`reuses image seed "${seed}" (also in ${owner}) — the gallery will show a duplicate photo`);
    seeds.set(seed, t.id);
  }

  const html = renderSite(t.manifest);
  if (!html.startsWith('<!doctype html>') || !html.includes('</html>')) fail('does not render a complete document');
  if (html.length < 800) fail(`renders suspiciously small (${html.length} bytes)`);
}

rmSync(out, { recursive: true, force: true });

if (problems.length) {
  console.error(`✗ ${problems.length} problem(s) across ${list.length} template(s):\n` + problems.map((p) => `  - ${p}`).join('\n'));
  process.exit(1);
}
console.log(`✓ ${list.length} template(s) clean${only ? ` in "${only}"` : ''}.`);
