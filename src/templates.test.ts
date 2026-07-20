import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  TEMPLATES, templateNames, templatesForVertical, templatesForLayout,
  templatesByTag, templateTags, getTemplate,
} from './templates.js';
import { validateManifest } from './validate.js';
import { renderSite } from './render.js';
import { verticalNames } from './verticals.js';
import { presetNames, getPreset } from './presets.js';
import { getSpec } from './registry.js';
import type { Field, Schema } from './schema.js';
import { buildGenerationPrompt, generateSite, type ModelCall } from './generate.js';

// Templates are a public contract (a host renders them as starters; generation
// scaffolds from them), so these guard that every one stays valid + stable.

test('every template manifest passes validateManifest', () => {
  for (const t of Object.values(TEMPLATES)) {
    const v = validateManifest(t.manifest);
    assert.ok(v.ok, `template "${t.id}" is invalid: ${JSON.stringify(v.errors)}`);
  }
});

test('every template renders a complete, self-contained document', () => {
  for (const t of Object.values(TEMPLATES)) {
    const html = renderSite(t.manifest);
    assert.ok(html.startsWith('<!doctype html>') && html.includes('</html>'), `${t.id} must render a full doc`);
    assert.ok(html.length > 500, `${t.id} rendered suspiciously small`);
  }
});

test('template ids and accessors are consistent', () => {
  for (const id of templateNames()) {
    const t = getTemplate(id)!;
    assert.ok(t, `getTemplate(${id}) resolves`);
    assert.equal(t.id, id, `${id}: entry id matches its key`);
    assert.ok(t.label.length > 0, `${id}: has a label`);
  }
  assert.deepEqual(templateNames().sort(), Object.keys(TEMPLATES).sort());
});

test('every template belongs to a real vertical', () => {
  const verticals = new Set(verticalNames());
  for (const t of Object.values(TEMPLATES)) {
    assert.ok(verticals.has(t.vertical), `template "${t.id}" references unknown vertical "${t.vertical}"`);
  }
});

test('templatesForVertical groups correctly and covers every vertical (rollout step 1)', () => {
  for (const id of verticalNames()) {
    const list = templatesForVertical(id);
    for (const t of list) assert.equal(t.vertical, id);
    assert.ok(list.length >= 1, `vertical "${id}" has at least one starter template`);
  }
  assert.equal(templatesForVertical('does-not-exist').length, 0);
});

test('getTemplate returns undefined for an unknown id', () => {
  assert.equal(getTemplate('nope'), undefined);
});

// ── picker metadata ─────────────────────────────────────────────────────────────

const LAYOUTS = ['classic', 'editorial', 'minimal', 'bold', 'app', 'profile', 'catalogue', 'showcase', 'landing', 'conversational'];

test('every template carries complete, well-formed picker metadata', () => {
  const presets = new Set(presetNames());
  for (const t of Object.values(TEMPLATES)) {
    assert.ok(t.description.length >= 20, `${t.id}: needs a real description`);
    assert.ok(LAYOUTS.includes(t.layout), `${t.id}: unknown layout "${t.layout}"`);
    assert.ok(presets.has(t.preset), `${t.id}: unknown preset "${t.preset}"`);
    assert.ok(t.tags.length >= 3, `${t.id}: needs at least 3 tags`);
    for (const tag of t.tags) assert.match(tag, /^[a-z0-9]+(-[a-z0-9]+)*$/, `${t.id}: tag "${tag}" must be lowercase-kebab`);
  }
});

test('the declared preset is the one actually baked into the manifest', () => {
  // `preset` is metadata a host filters on; if it drifts from `manifest.design`
  // the filter lies about what the user is picking.
  for (const t of Object.values(TEMPLATES)) {
    assert.deepEqual(
      t.manifest.design,
      getPreset(t.preset),
      `${t.id}: declares preset "${t.preset}" but its design tokens are something else`,
    );
  }
});

test('layout and tag accessors group correctly', () => {
  for (const layout of LAYOUTS) {
    for (const t of templatesForLayout(layout)) assert.equal(t.layout, layout);
  }
  assert.equal(templatesForLayout('does-not-exist').length, 0);

  const tags = templateTags();
  assert.deepEqual(tags, [...tags].sort(), 'tags come back sorted');
  assert.equal(new Set(tags).size, tags.length, 'tags are de-duplicated');
  for (const tag of tags) {
    const hits = templatesByTag(tag);
    assert.ok(hits.length >= 1, `tag "${tag}" is reachable`);
    for (const t of hits) assert.ok(t.tags.includes(tag));
  }
  assert.equal(templatesByTag('no-such-tag').length, 0);
});

test('the library spans many layouts, not one skeleton restyled', () => {
  const used = new Set(Object.values(TEMPLATES).map((t) => t.layout));
  assert.ok(used.size >= 6, `expected a spread of page shapes, saw ${[...used].join(', ')}`);
});

// ── authoring invariants ────────────────────────────────────────────────────────

/**
 * `parse` is schema-driven, so a config key the schema doesn't declare is not an
 * error — it is silently dropped. A template can therefore invent
 * `hero.buttonText`, pass `validateManifest`, and render with that content
 * missing. Nothing else in the suite would notice, so this walks the configs
 * (including array-item shapes, where invented keys usually hide) and proves
 * every authored key actually reaches the renderer.
 */
function unknownKeys(config: unknown, schema: Schema, path = ''): string[] {
  const bad: string[] = [];
  if (!config || typeof config !== 'object' || Array.isArray(config)) return bad;
  for (const [key, value] of Object.entries(config)) {
    const field: Field | undefined = schema[key];
    if (!field) { bad.push(`${path}${key}`); continue; }
    if (field.kind === 'object') bad.push(...unknownKeys(value, field.fields, `${path}${key}.`));
    if (field.kind === 'array' && field.of.kind === 'object' && Array.isArray(value)) {
      const itemFields = field.of.fields;
      value.forEach((entry, i) => bad.push(...unknownKeys(entry, itemFields, `${path}${key}[${i}].`)));
    }
  }
  return bad;
}

test('no template config carries a key its block schema would silently drop', () => {
  for (const t of Object.values(TEMPLATES)) {
    for (const block of t.manifest.blocks) {
      const spec = getSpec(block.type)!;
      const bad = unknownKeys(block.config, spec.schema);
      assert.deepEqual(bad, [], `${t.id} block "${block.id}" (${block.type}): unknown config key(s) ${bad.join(', ')}`);
    }
  }
});

test('every in-page anchor resolves to a block in the same manifest', () => {
  const anchors = (value: unknown, found: string[] = []): string[] => {
    if (typeof value === 'string') { if (value.startsWith('#') && value.length > 1) found.push(value.slice(1)); return found; }
    if (Array.isArray(value)) { for (const v of value) anchors(v, found); return found; }
    if (value && typeof value === 'object') for (const v of Object.values(value)) anchors(v, found);
    return found;
  };
  for (const t of Object.values(TEMPLATES)) {
    const ids = new Set(t.manifest.blocks.map((b) => b.id));
    for (const block of t.manifest.blocks) {
      for (const a of anchors(block.config)) {
        assert.ok(ids.has(a), `${t.id} block "${block.id}" links to "#${a}", which is not a block id here`);
      }
    }
  }
});

test('template ids are unique and conventionally prefixed by their vertical', () => {
  const ids = templateNames();
  assert.equal(new Set(ids).size, ids.length, 'no duplicate ids');
  for (const t of Object.values(TEMPLATES)) {
    assert.ok(t.id.startsWith(`${t.vertical}-`), `${t.id}: id should start with "${t.vertical}-"`);
  }
});

test('templates carry no leftover placeholder copy', () => {
  const junk = /lorem ipsum|your headline here|your tagline here|\bTODO\b|Service [123]\b/i;
  for (const t of Object.values(TEMPLATES)) {
    if (t.id === 'other-basic') continue; // the deliberate fill-in-the-blanks starter
    const blob = JSON.stringify(t.manifest);
    assert.ok(!junk.test(blob), `${t.id}: contains placeholder copy`);
  }
});

// ── template-aware generation ───────────────────────────────────────────────────

test('buildGenerationPrompt seeds a template scaffold by id', () => {
  const { system } = buildGenerationPrompt('a taco truck', { template: 'restaurant-modern' });
  assert.match(system, /Starter scaffold/i, 'includes the scaffold header');
  assert.match(system, /REWRITE every headline/i, 'instructs a copy rewrite');
  assert.ok(system.includes('"services-catalogue"'), 'embeds the template block structure');
});

test('buildGenerationPrompt accepts a raw SiteManifest as the scaffold', () => {
  const { system } = buildGenerationPrompt('a studio', { template: getTemplate('tech-saas')!.manifest });
  assert.match(system, /Starter scaffold/i);
  assert.ok(system.includes('"hero-app"'), 'embeds the passed manifest structure');
});

test('an unknown template id falls back to blank-slate', () => {
  const plain = buildGenerationPrompt('x').system;
  const bogus = buildGenerationPrompt('x', { template: 'no-such-template' }).system;
  assert.equal(bogus, plain, 'unknown template seeds nothing');
});

test('blank-slate compose is unchanged when no template is given', () => {
  assert.ok(!/Starter scaffold/i.test(buildGenerationPrompt('a café').system));
});

test('generateSite drives a template scaffold end-to-end (mocked model)', async () => {
  let seen = '';
  const fakeModel: ModelCall = async ({ system }) => {
    seen = system;
    return JSON.stringify({ meta: { title: 'El Camino Tacos' }, blocks: [{ type: 'hero', config: { headline: 'Tacos, done right' } }] });
  };
  const r = await generateSite('a taco truck in Austin', fakeModel, { template: 'restaurant-modern' });
  assert.equal(r.ok, true);
  assert.match(seen, /Starter scaffold/i, 'the scaffold reached the model');
  assert.ok(renderSite(r.manifest).includes('El Camino Tacos'));
});
