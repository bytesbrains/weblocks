import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyOp, applyOps, type EditOp } from './ops.js';
import { DEFAULT_TOKENS } from './tokens.js';
import { renderSite } from './render.js';
import type { SiteManifest } from './types.js';

const base = (): SiteManifest => ({
  meta: { title: 'Site', description: '', lang: 'en' },
  design: DEFAULT_TOKENS,
  blocks: [
    { id: 'hero-1', type: 'hero', visible: true, config: { headline: 'Hi' } },
    { id: 'gallery-1', type: 'gallery', visible: true, config: { columns: 3, items: [] } },
  ],
  version: 3,
});

test('applyOp is pure — never mutates the input; bumps version', () => {
  const m = base();
  const r = applyOp(m, { op: 'removeBlock', id: 'hero-1' });
  assert.equal(r.ok, true);
  assert.equal(m.blocks.length, 2, 'input untouched');
  assert.equal(r.manifest.blocks.length, 1);
  assert.equal(r.manifest.version, 4);
});

test('addBlock validates type + config, assigns a deterministic id, inserts at position', () => {
  const r = applyOp(base(), { op: 'addBlock', type: 'services-catalogue', config: { title: 'Services' }, at: 1 });
  assert.equal(r.ok, true);
  assert.equal(r.id, 'services-catalogue-1');
  assert.equal(r.manifest.blocks[1]!.type, 'services-catalogue');
});

test('addBlock rejects an unknown type (no-op)', () => {
  const m = base();
  const r = applyOp(m, { op: 'addBlock', type: 'threejs-scene' });
  assert.equal(r.ok, false);
  assert.match(r.errors[0]!, /unknown type/);
  assert.equal(r.manifest, m, 'manifest unchanged on failure');
});

test('addBlock with missing content succeeds (warning), rejects a bad enum (error)', () => {
  const ok = applyOp(base(), { op: 'addBlock', type: 'hero' }); // headline missing → warning
  assert.equal(ok.ok, true);
  assert.ok(ok.warnings.some((w) => /headline: missing/.test(w)));

  const bad = applyOp(base(), { op: 'addBlock', type: 'gallery', config: { layout: 'spiral' } }); // bad enum → error
  assert.equal(bad.ok, false);
  assert.match(bad.errors[0]!, /layout/);
});

test('updateBlock merges a patch and re-validates', () => {
  const r = applyOp(base(), { op: 'updateBlock', id: 'hero-1', config: { subhead: 'Welcome' } });
  assert.equal(r.ok, true);
  assert.equal(r.manifest.blocks[0]!.config.headline, 'Hi', 'existing config preserved');
  assert.equal(r.manifest.blocks[0]!.config.subhead, 'Welcome');
});

test('updateBlock rejects a type-invalid patch, and a missing id', () => {
  const badType = applyOp(base(), { op: 'updateBlock', id: 'gallery-1', config: { columns: 'three' as unknown as number } });
  assert.equal(badType.ok, false);
  const noId = applyOp(base(), { op: 'updateBlock', id: 'nope', config: {} });
  assert.equal(noId.ok, false);
});

test('updateBlock on an unknown/legacy block type fails cleanly (no throw)', () => {
  const m = base();
  m.blocks.push({ id: 'legacy-1', type: 'carousel-3d', visible: true, config: {} });
  const r = applyOp(m, { op: 'updateBlock', id: 'legacy-1', config: { foo: 'bar' } });
  assert.equal(r.ok, false);
  assert.match(r.errors[0]!, /unknown block type/);
  assert.equal(r.manifest, m, 'manifest unchanged');
});

test('moveBlock reorders; setDesignTokens patches tokens', () => {
  const moved = applyOp(base(), { op: 'moveBlock', id: 'gallery-1', to: 0 });
  assert.deepEqual(moved.manifest.blocks.map((b) => b.id), ['gallery-1', 'hero-1']);
  const dark = applyOp(base(), { op: 'setDesignTokens', patch: { mode: 'dark' } });
  assert.equal(dark.manifest.design.mode, 'dark');
});

test('applyOps runs a chat turn; a bad op is skipped, the rest apply', () => {
  const ops: EditOp[] = [
    { op: 'addBlock', type: 'services-catalogue', config: { title: 'Ours' } },
    { op: 'updateBlock', id: 'ghost', config: {} },       // fails — no such id
    { op: 'setMeta', patch: { title: 'Aster' } },
  ];
  const batch = applyOps(base(), ops);
  assert.equal(batch.applied, 2);
  assert.equal(batch.results[1]!.ok, false);
  assert.equal(batch.manifest.meta.title, 'Aster');
  // and the result still renders as a valid page
  assert.ok(renderSite(batch.manifest).includes('</html>'));
});
