import { test } from 'node:test';
import assert from 'node:assert/strict';
import { catalog, catalogPrompt } from './catalog.js';
import {
  buildGenerationPrompt, parseManifestResponse, generateSite,
  buildEditPrompt, parseOpsResponse, editSite, type ModelCall,
} from './generate.js';
import { renderSite } from './render.js';
import { DEFAULT_TOKENS } from './tokens.js';
import type { SiteManifest } from './types.js';

// ── catalog ────────────────────────────────────────────────────────────────────

test('catalog projects every brick to JSON Schema with required + enums', () => {
  const cat = catalog();
  const gallery = cat.find((c) => c.type === 'gallery')!;
  assert.equal(gallery.schema.type, 'object');
  assert.deepEqual(gallery.schema.properties!.layout!.enum, ['grid', 'masonry', 'carousel']);
  assert.deepEqual(gallery.schema.properties!.columns!.enum, [2, 3, 4]);
  const hero = cat.find((c) => c.type === 'hero')!;
  assert.ok(hero.schema.required!.includes('headline'));
});

test('catalogPrompt lists every registered type (the AI menu)', () => {
  const p = catalogPrompt();
  for (const t of ['hero', 'services-catalogue', 'gallery']) assert.ok(p.includes(t), `menu lists ${t}`);
});

// ── generation ──────────────────────────────────────────────────────────────────

test('buildGenerationPrompt embeds the catalog and forbids raw HTML', () => {
  const { system } = buildGenerationPrompt('a bakery');
  assert.ok(system.includes('gallery'));
  assert.ok(/do NOT write HTML/i.test(system));
});

test('parseManifestResponse extracts fenced JSON, coerces + validates', () => {
  const reply = '```json\n' + JSON.stringify({
    meta: { title: 'Bloom Bakery' },
    blocks: [
      { type: 'hero', config: { headline: 'Fresh every morning' } },
      { type: 'gallery', config: { columns: 2, items: [{ src: '/a.jpg', alt: 'loaf' }] } },
    ],
  }) + '\n```';
  const r = parseManifestResponse(reply);
  assert.equal(r.ok, true);
  assert.equal(r.manifest.meta.title, 'Bloom Bakery');
  assert.equal(r.manifest.blocks[0]!.id, 'hero-1', 'ids assigned when the model omits them');
  assert.ok(renderSite(r.manifest).includes('Fresh every morning'));
});

test('parseManifestResponse flags a manifest that uses an unknown type', () => {
  const r = parseManifestResponse(JSON.stringify({ blocks: [{ type: 'carousel3d', config: {} }] }));
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => /unknown block type/.test(e)));
});

test('parseManifestResponse handles junk without throwing', () => {
  const r = parseManifestResponse('sorry, I cannot help with that');
  assert.equal(r.ok, false);
  assert.match(r.errors[0]!, /no JSON/);
});

test('generateSite drives the injected model end-to-end', async () => {
  const fakeModel: ModelCall = async () => JSON.stringify({
    meta: { title: 'Studio' },
    design: { palette: { primary: '#334455' } },
    blocks: [{ type: 'hero', config: { headline: 'We build things' } }],
  });
  const r = await generateSite('a design studio', fakeModel);
  assert.equal(r.ok, true);
  const html = renderSite(r.manifest);
  assert.ok(html.includes('We build things'));
  assert.ok(html.includes('--primary:#334455'));
});

// ── editing ───────────────────────────────────────────────────────────────────

const site = (): SiteManifest => ({
  meta: { title: 'Studio', description: '', lang: 'en' },
  design: DEFAULT_TOKENS,
  blocks: [{ id: 'hero-1', type: 'hero', visible: true, config: { headline: 'Old' } }],
  version: 1,
});

test('buildEditPrompt lists the current blocks and the op vocabulary', () => {
  const { system } = buildEditPrompt(site(), 'make it dark');
  assert.ok(system.includes('hero-1 (hero)'));
  assert.ok(system.includes('setDesignTokens'));
});

test('parseOpsResponse keeps only well-formed ops', () => {
  const { ops } = parseOpsResponse('[{"op":"removeBlock","id":"x"}, 42, {"nope":true}]');
  assert.equal(ops.length, 1);
  assert.equal(ops[0]!.op, 'removeBlock');
});

test('editSite: NL request → ops → new valid manifest (via injected model)', async () => {
  const fakeModel: ModelCall = async () => JSON.stringify([
    { op: 'updateBlock', id: 'hero-1', config: { headline: 'New headline' } },
    { op: 'setDesignTokens', patch: { mode: 'dark' } },
    { op: 'addBlock', type: 'gallery', config: { items: [{ src: '/x.jpg', alt: 'x' }] } },
  ]);
  const r = await editSite(site(), 'rename the hero, go dark, add a gallery', fakeModel);
  assert.equal(r.applied, 3);
  assert.equal(r.manifest.blocks[0]!.config.headline, 'New headline');
  assert.equal(r.manifest.design.mode, 'dark');
  assert.ok(renderSite(r.manifest).includes('/x.jpg'));
});
