/**
 * Island wiring at RENDER level — which blocks claim a `<script>`, and the
 * standing guarantee that every island the renderer names actually ships.
 * (Island *behaviour* is exercised through a real DOM in `test/islands.test.mjs`.)
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyOp } from './ops.js';
import { renderSite } from './render.js';
import { DEFAULT_TOKENS } from './tokens.js';
import type { SiteManifest } from './types.js';
import { REGISTRY } from './registry.js';
import { pathRuntime, type RuntimeAdapter } from './runtime.js';

const empty = (): SiteManifest => ({ meta: { title: 't', description: '', lang: 'en' }, design: DEFAULT_TOKENS, blocks: [], version: 1 });

// ── shipped islands (gallery lightbox / carousel) ───────────────────────────────

test('gallery flags lightbox for its island, and islandBase is configurable', () => {
  const on = applyOp(empty(), { op: 'addBlock', type: 'gallery', config: { lightbox: true, items: [{ src: '/a.jpg', alt: 'a' }] } });
  const off = applyOp(empty(), { op: 'addBlock', type: 'gallery', config: { lightbox: false, items: [{ src: '/a.jpg', alt: 'a' }] } });
  const html = renderSite(on.manifest);
  assert.ok(html.includes('data-wl-lightbox="true"'), 'flagged for the island');
  assert.ok(html.includes('src="/_island/lightbox.js"'), 'island script emitted');
  assert.ok(!renderSite(off.manifest).includes('data-wl-lightbox'), 'no flag when lightbox off');
  assert.ok(renderSite(on.manifest, { islandBase: '/assets/js' }).includes('src="/assets/js/lightbox.js"'), 'islandBase override');
});

test('shipped island modules import safely in a non-DOM environment', async () => {
  // Guarded by `typeof document`, so importing in Node is a clean no-op.
  await assert.doesNotReject(import('./islands/lightbox.js'));
  await assert.doesNotReject(import('./islands/carousel.js'));
  await assert.doesNotReject(import('./islands/announcement-bar.js'));
});

test('every static brick\'s declared island is a shipped module (no 404 island script)', async () => {
  // The renderer emits <script src="/_island/<name>.js"> for a used block's
  // declared island, so a static brick's `island` name MUST resolve to a real
  // shipped module — otherwise every page using it loads a 404.
  // Powered bricks are the exception: the host wires their runtime, so it also
  // serves their island (they render inert-but-valid without one).
  for (const spec of REGISTRY.values()) {
    if (!spec.island || spec.runtime) continue;
    await assert.doesNotReject(
      import(`./islands/${spec.island}.js`),
      `${spec.type} declares island "${spec.island}" but no such module ships`,
    );
  }
});

test('a powered brick emits its host island only once a runtime is wired', () => {
  // The engine ships no module for a powered brick's island — the host serves it
  // alongside the runtime. Unwired, the tag would be a guaranteed 404.
  const m = applyOp(empty(), { op: 'addBlock', type: 'contact-form' }).manifest;
  assert.ok(!renderSite(m).includes('/_island/contact-form.js'), 'no runtime → no island tag');
  assert.ok(renderSite(m).includes('data-wl-inert="true"'), 'and the brick still renders inert-but-valid');
  assert.ok(renderSite(m, { runtime: pathRuntime() }).includes('/_island/contact-form.js'), 'wired → host island tag');

  // A throwing adapter is unwired too (see the totality test below).
  const boom: RuntimeAdapter = { resolve: () => { throw new Error('host blew up'); } };
  assert.ok(!renderSite(m, { runtime: boom }).includes('/_island/contact-form.js'), 'a throwing adapter emits no island');

  // A host that provides other capabilities but not this one stays unwired.
  const otherCaps: RuntimeAdapter = { resolve: (cap) => (cap === 'search.query' ? { url: '/s', method: 'GET' } : null) };
  assert.ok(!renderSite(m, { runtime: otherCaps }).includes('/_island/contact-form.js'), 'unrelated capability → still no tag');

  // Static bricks are unaffected — their island ships with the engine.
  const bar = applyOp(empty(), { op: 'addBlock', type: 'announcement-bar' }).manifest;
  assert.ok(renderSite(bar).includes('/_island/announcement-bar.js'), 'a static brick needs no runtime');
});
