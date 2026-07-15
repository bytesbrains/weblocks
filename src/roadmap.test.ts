import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyOp, applyOps } from './ops.js';
import { renderSite } from './render.js';
import { runtimeNeeds, pathRuntime, NOOP_RUNTIME } from './runtime.js';
import { buildWebManifest, emitPwa, buildServiceWorker } from './pwa.js';
import { getPreset, presetNames } from './presets.js';
import { validateManifest } from './validate.js';
import { DEFAULT_TOKENS } from './tokens.js';
import type { SiteManifest } from './types.js';

const empty = (): SiteManifest => ({ meta: { title: 't', description: '', lang: 'en' }, design: DEFAULT_TOKENS, blocks: [], version: 1 });

function withFeatures(): { m: SiteManifest; id: string } {
  const r = applyOp(empty(), { op: 'addBlock', type: 'features', config: { items: [{ title: 'A' }, { title: 'B' }] } });
  return { m: r.manifest, id: r.id! };
}

// ── §8 array-item ops ───────────────────────────────────────────────────────────

test('addItem appends a new array item and re-validates', () => {
  const { m, id } = withFeatures();
  const r = applyOp(m, { op: 'addItem', id, field: 'items', item: { title: 'C' } });
  assert.equal(r.ok, true);
  const items = r.manifest.blocks[0]!.config.items as unknown[];
  assert.equal(items.length, 3);
  assert.equal((items[2] as { title: string }).title, 'C');
  assert.equal(r.manifest.version, m.version + 1);
});

test('addItem at an index inserts in place', () => {
  const { m, id } = withFeatures();
  const r = applyOp(m, { op: 'addItem', id, field: 'items', item: { title: 'X' }, at: 0 });
  assert.equal((r.manifest.blocks[0]!.config.items as { title: string }[])[0]!.title, 'X');
});

test('updateItem patches a single item, leaving siblings untouched', () => {
  const { m, id } = withFeatures();
  const r = applyOp(m, { op: 'updateItem', id, field: 'items', index: 1, patch: { title: 'B2' } });
  assert.equal(r.ok, true);
  const items = r.manifest.blocks[0]!.config.items as { title: string }[];
  assert.equal(items[0]!.title, 'A');
  assert.equal(items[1]!.title, 'B2');
});

test('removeItem drops one item', () => {
  const { m, id } = withFeatures();
  const r = applyOp(m, { op: 'removeItem', id, field: 'items', index: 0 });
  const items = r.manifest.blocks[0]!.config.items as { title: string }[];
  assert.equal(items.length, 1);
  assert.equal(items[0]!.title, 'B');
});

test('moveItem reorders within the array', () => {
  const { m, id } = withFeatures();
  const r = applyOp(m, { op: 'moveItem', id, field: 'items', from: 0, to: 1 });
  const items = r.manifest.blocks[0]!.config.items as { title: string }[];
  assert.deepEqual(items.map((i) => i.title), ['B', 'A']);
});

test('item ops are no-ops on a non-array field, bad index, or missing block', () => {
  const { m, id } = withFeatures();
  for (const op of [
    { op: 'addItem', id, field: 'title', item: {} },          // not an array field
    { op: 'updateItem', id, field: 'items', index: 9, patch: {} }, // out of range
    { op: 'removeItem', id, field: 'items', index: -1 },       // out of range
    { op: 'moveItem', id: 'nope', field: 'items', from: 0, to: 0 }, // no block
  ] as const) {
    const r = applyOp(m, op);
    assert.equal(r.ok, false, `${op.op} should fail`);
    assert.deepEqual(r.manifest, m, 'manifest unchanged on a bad op');
  }
});

// ── §9 presets + per-section overrides ──────────────────────────────────────────

test('applyPreset swaps to a named token set; unknown name is a no-op', () => {
  const ok = applyOp(empty(), { op: 'applyPreset', name: 'midnight' });
  assert.equal(ok.ok, true);
  assert.equal(ok.manifest.design.mode, 'dark');
  assert.equal(ok.manifest.design.palette.bg, getPreset('midnight')!.palette.bg);
  const bad = applyOp(empty(), { op: 'applyPreset', name: 'nope' });
  assert.equal(bad.ok, false);
  assert.ok(presetNames().length >= 3);
});

test('setOverrides tints one section; render scopes it as CSS vars; null clears', () => {
  const { m, id } = withFeatures();
  const set = applyOp(m, { op: 'setOverrides', id, overrides: { primary: '#ff0000', junk: 'x' } as never });
  assert.equal(set.ok, true);
  assert.deepEqual(set.manifest.blocks[0]!.overrides, { primary: '#ff0000' }); // junk key dropped
  const html = renderSite(set.manifest);
  assert.ok(html.includes('--primary:#ff0000'), 'override emitted as a scoped CSS var');
  const clear = applyOp(set.manifest, { op: 'setOverrides', id, overrides: null });
  assert.equal(clear.manifest.blocks[0]!.overrides, undefined);
});

// ── §6 runtime contract ─────────────────────────────────────────────────────────

test('runtimeNeeds reports powered blocks and their capabilities', () => {
  let m = empty();
  m = applyOp(m, { op: 'addBlock', type: 'contact-form' }).manifest;
  m = applyOp(m, { op: 'addBlock', type: 'hero' }).manifest;
  const needs = runtimeNeeds(m);
  assert.equal(needs.length, 1);
  assert.equal(needs[0]!.type, 'contact-form');
  assert.deepEqual(needs[0]!.capabilities, ['contact-form.submit']);
});

test('powered block renders inert with the no-op runtime, wired with an adapter', () => {
  const r = applyOp(empty(), { op: 'addBlock', type: 'contact-form', id: 'cf-1' });
  const inert = renderSite(r.manifest); // default NOOP runtime
  assert.ok(inert.includes('data-wl-inert="true"'));
  assert.ok(inert.includes('data-wl-capability="contact-form.submit"'));
  assert.ok(inert.includes('disabled'));

  const wired = renderSite(r.manifest, { runtime: pathRuntime('/api') });
  assert.ok(wired.includes('action="/api/contact-form.submit/cf-1"'));
  assert.ok(!wired.includes('data-wl-inert'));
  assert.equal(NOOP_RUNTIME.resolve('x', 'y'), null);
});

// ── §7 PWA layer ────────────────────────────────────────────────────────────────

test('buildWebManifest defaults name/colors from meta + tokens', () => {
  const m = empty();
  m.meta.title = 'Studio';
  m.pwa = {};
  const wm = buildWebManifest(m);
  assert.equal(wm.name, 'Studio');
  assert.equal(wm.display, 'standalone');
  assert.equal(wm.theme_color, DEFAULT_TOKENS.palette.primary);
  assert.ok(wm.icons.length >= 1);
});

test('emitPwa is null without opt-in, and emits manifest + sw when enabled', () => {
  assert.equal(emitPwa(empty()), null);
  const m = empty();
  m.pwa = { name: 'App', offline: true };
  const files = emitPwa(m)!;
  assert.ok(files['manifest.webmanifest']);
  assert.ok(files['sw.js']);
  assert.ok(buildServiceWorker(m).includes('weblocks-v'));
});

test('renderSite emits PWA/SEO head only when opted in', () => {
  const plain = renderSite(empty());
  assert.ok(!plain.includes('rel="manifest"'));
  const m = empty();
  m.pwa = { themeColor: '#123456' };
  m.seo = { canonical: 'https://ex.com', ogImage: 'https://ex.com/o.png' };
  const html = renderSite(m);
  assert.ok(html.includes('<link rel="manifest" href="/manifest.webmanifest">'));
  assert.ok(html.includes('content="#123456"'));
  assert.ok(html.includes('rel="canonical"'));
  assert.ok(html.includes('og:image'));
  assert.ok(validateManifest(m).ok);
});

// ── a full app-shaped manifest still renders valid ──────────────────────────────

test('a rich app manifest (dynamic + pwa + overrides) renders one valid document', () => {
  let m = empty();
  for (const type of ['app-shell', 'hero-app', 'pricing', 'contact-form', 'newsletter', 'auth', 'blog-list', 'tabs', 'accordion']) {
    m = applyOp(m, { op: 'addBlock', type }).manifest;
  }
  m.pwa = { name: 'Demo' };
  const batch = applyOps(m, [{ op: 'setOverrides', id: m.blocks[2]!.id, overrides: { primary: '#0af' } }]);
  const html = renderSite(batch.manifest, { runtime: pathRuntime() });
  assert.ok(html.startsWith('<!doctype html>') && html.includes('</html>'));
  assert.ok(validateManifest(batch.manifest).ok);
});
