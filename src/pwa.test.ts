/**
 * §7 PWA layer — the installable app shell (manifest + service worker + head
 * tags) and the `install-prompt` block that tells a visitor it exists.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyOp } from './ops.js';
import { renderSite } from './render.js';
import { DEFAULT_TOKENS } from './tokens.js';
import type { SiteManifest } from './types.js';
import { validateManifest } from './validate.js';
import { buildWebManifest, emitPwa, buildServiceWorker } from './pwa.js';

const empty = (): SiteManifest => ({ meta: { title: 't', description: '', lang: 'en' }, design: DEFAULT_TOKENS, blocks: [], version: 1 });

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


// ── install-prompt (add-to-home-screen toast) ───────────────────────────────────

test('install-prompt: toast + every platform guide, no-JS <details>, island wired', () => {
  const r = applyOp(empty(), { op: 'addBlock', type: 'install-prompt', config: {
    title: 'Install <Acme>', body: 'One tap away.', actionLabel: 'Show me how', position: 'top', delayMs: 3000,
  } });
  const html = renderSite(r.manifest);
  assert.ok(html.includes('class="blk-install-prompt pos-top tone-info"'), 'position + tone classes');
  assert.ok(html.includes('Install &lt;Acme&gt;'), 'title escaped');
  assert.ok(html.includes('data-delay="3000"') && html.includes('data-remember="1"'), 'island reads delay + sticky dismiss');
  assert.ok(html.includes('data-wl-noprint'), 'excluded from print/PDF export');
  // Static-first: the guide is a <details>, so with no JS every platform expands.
  assert.ok(html.includes('<details class="guide">') && html.includes('<summary data-wl-install-action>'), 'no-JS disclosure');
  for (const id of ['ios-safari', 'ios-other', 'android', 'desktop-chrome', 'macos-safari', 'firefox']) {
    assert.ok(html.includes(`data-platform="${id}"`), `guide for ${id}`);
  }
  assert.ok(html.includes('src="/_island/install-prompt.js"'), 'island script emitted');
  assert.ok(validateManifest(r.manifest).ok);
});

test('install-prompt: platforms narrows the guides; dismiss can be turned off', () => {
  const two = applyOp(empty(), { op: 'addBlock', type: 'install-prompt', config: { platforms: ['ios-safari', 'android'], dismissible: false, rememberDismiss: false } });
  const html = renderSite(two.manifest);
  assert.equal((html.match(/<div data-platform="/g) ?? []).length, 2, 'only the two picked guides render');
  assert.ok(!html.includes('data-wl-dismiss'), 'no close button when dismissible is off');
  assert.ok(html.includes('data-remember="0"'), 'sticky dismiss opt-out reaches the island');

  const none = applyOp(empty(), { op: 'addBlock', type: 'install-prompt', config: { platforms: [] } });
  assert.equal((renderSite(none.manifest).match(/<div data-platform="/g) ?? []).length, 6, 'empty selection falls back to all platforms');
});

test('install-prompt island imports safely in a non-DOM environment', async () => {
  await assert.doesNotReject(import('./islands/install-prompt.js'));
});

