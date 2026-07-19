import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyOp, applyOps } from './ops.js';
import { renderSite } from './render.js';
import { pathRuntime } from './runtime.js';
import { getPreset, presetNames } from './presets.js';
import { validateManifest } from './validate.js';
import { DEFAULT_TOKENS, tokensToCss, readableOn, sectionOverrideCss } from './tokens.js';
import { renderMarkdown } from './markdown.js';
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

test('setOverrides also accepts radius + spacing enums (and drops bad ones)', () => {
  const { m, id } = withFeatures();
  const r = applyOp(m, { op: 'setOverrides', id, overrides: { radius: 'round', spacing: 'airy', primary: '#0af' } });
  assert.deepEqual(r.manifest.blocks[0]!.overrides, { primary: '#0af', radius: 'round', spacing: 'airy' });
  const css = sectionOverrideCss(r.manifest.blocks[0]!.overrides);
  assert.ok(css.includes('--radius:24px') && css.includes('--space:1.4rem'), 'radius/spacing scoped as CSS vars');
  // A bad enum is dropped; if nothing valid remains the override clears.
  const bad = applyOp(m, { op: 'setOverrides', id, overrides: { radius: 'huge' } as never });
  assert.equal(bad.manifest.blocks[0]!.overrides, undefined);
});

// ── theming: on-fill contrast tokens + mode-driven dark ─────────────────────────

test('readableOn picks legible text for any fill', () => {
  assert.equal(readableOn('#ffffff'), '#111111'); // dark text on white
  assert.equal(readableOn('#000000'), '#ffffff'); // white text on black
  assert.equal(readableOn('#3a5a40'), '#ffffff'); // white on the default primary
  assert.equal(readableOn('not-a-color'), '#ffffff'); // total: safe fallback
});

test('tokensToCss emits --on-primary/--on-accent, contrast-correct', () => {
  const css = tokensToCss({ ...DEFAULT_TOKENS, palette: { ...DEFAULT_TOKENS.palette, primary: '#ffffff', accent: '#111111' } });
  assert.ok(css.includes('--on-primary:#111111'), 'dark text on a white primary');
  assert.ok(css.includes('--on-accent:#ffffff'), 'white text on a dark accent');
});

test("mode:'auto' adds a prefers-color-scheme dark palette; light/dark do not", () => {
  const light = tokensToCss({ ...DEFAULT_TOKENS, mode: 'light' });
  assert.ok(!light.includes('prefers-color-scheme'), 'light stays single-palette');

  const auto = tokensToCss({ ...DEFAULT_TOKENS, mode: 'auto' });
  assert.ok(auto.includes('@media(prefers-color-scheme:dark)'), 'auto emits an OS-dark block');

  const withDark = tokensToCss({ ...DEFAULT_TOKENS, mode: 'auto', darkPalette: { ...DEFAULT_TOKENS.palette, bg: '#010203', surface: '#0a0a0a', text: '#eeeeee', muted: '#999999', primary: '#88aaff', accent: '#ffaa88' } });
  const darkBlock = withDark.split('@media')[1] ?? '';
  assert.ok(darkBlock.includes('--bg:#010203'), 'supplied darkPalette drives the dark block');
});

test('carousel takes a title so multiple carousels get unique landmark names', () => {
  const r = applyOp(empty(), { op: 'addBlock', type: 'carousel', config: { title: 'Client work' } });
  assert.ok(renderSite(r.manifest).includes('aria-label="Client work"'));
});

test('prose renderer (shared by rich-text & blog-post) groups lists and escapes', () => {
  const rt = applyOp(empty(), { op: 'addBlock', type: 'rich-text', config: { blocks: [
    { kind: 'heading', text: 'H' }, { kind: 'bullet', text: 'a' }, { kind: 'bullet', text: 'b' }, { kind: 'numbered', text: '1' },
  ] } });
  const html = renderSite(rt.manifest);
  assert.ok(html.includes('<ul><li>a</li><li>b</li></ul>'), 'adjacent bullets grouped');
  assert.ok(html.includes('<ol><li>1</li></ol>'), 'numbered list switches container');
});

test('directions builds map-app deep links from coords / address / pasted link', () => {
  const gps = applyOp(empty(), { op: 'addBlock', type: 'directions', config: { place: 'Studio', lat: '38.7223', lng: '-9.1393', appleMaps: true } });
  const html = renderSite(gps.manifest);
  // `&` is escaped to `&amp;` in the attribute (correct); assert on the stable parts.
  assert.ok(html.includes('www.google.com/maps/dir/?api=1') && html.includes('destination=38.7223%2C-9.1393'), 'precise GPS destination');
  assert.ok(html.includes('https://maps.apple.com/?daddr=38.7223%2C-9.1393'), 'apple maps link');
  assert.ok(html.includes('38.7223, -9.1393'), 'coords shown');

  const addr = applyOp(empty(), { op: 'addBlock', type: 'directions', config: { address: '14 Kiln Lane', appleMaps: false } });
  const h2 = renderSite(addr.manifest);
  assert.ok(h2.includes('destination=14%20Kiln%20Lane') && !h2.includes('maps.apple.com'), 'address destination, apple hidden');

  const bad = applyOp(empty(), { op: 'addBlock', type: 'directions', config: { lat: '999', lng: 'x', mapUrl: 'https://maps.example/here' } });
  const h3 = renderSite(bad.manifest);
  assert.ok(!h3.includes('999'), 'out-of-range coords dropped');
  assert.ok(h3.includes('href="https://maps.example/here"'), 'pasted map link used');
});

test('legal renders policy links + dismissible dialogs with SAFE markdown', () => {
  const md = '# Our Terms\n\nUse it **wisely**. Email [us](mailto:hi@x.com).\n\n- one\n- two\n\n<script>alert(1)</script>';
  const r = applyOp(empty(), { op: 'addBlock', type: 'legal', id: 'legal-1', config: { documents: [{ label: 'Terms', title: 'Terms of Service', content: md }] } });
  const html = renderSite(r.manifest);
  // Trigger link + dialog wiring (CSS :target).
  assert.ok(html.includes('href="#legal-1-0"') && html.includes('id="legal-1-0"') && html.includes('role="dialog"'));
  assert.ok(html.includes('href="#open-legal-1-0"'), 'close/backdrop return to the trigger');
  // Safe markdown → real formatting…
  assert.ok(html.includes('<strong>wisely</strong>') && html.includes('<li>one</li>') && html.includes('href="mailto:hi@x.com"'));
  // …but raw HTML is escaped, never executed.
  assert.ok(!html.includes('<script>alert(1)</script>') && html.includes('&lt;script&gt;'), 'HTML in content is neutralised');
});

test('renderMarkdown is safe: escapes HTML, sanitizes link schemes', () => {
  assert.ok(renderMarkdown('a <b>c</b>').includes('&lt;b&gt;'), 'tags escaped');
  assert.ok(renderMarkdown('[x](javascript:alert(1))').includes('href="#"'), 'dangerous scheme neutralised');
  assert.ok(renderMarkdown('## Hi').includes('<h3>Hi</h3>'), 'heading level offset');
});


test('social-links: platform → brand icon + label, variants, custom fallback, hidden-when-unset', () => {
  const labeled = applyOp(empty(), { op: 'addBlock', type: 'social-links', config: { links: [
    { platform: 'github', href: 'https://github.com/x' },
    { platform: 'twitter', href: 'https://x.com/x' },
    { platform: 'custom', href: 'https://ex.com', label: 'Blog', icon: '📝' },
    { platform: 'x', href: '' },
  ] } });
  const html = renderSite(labeled.manifest);
  assert.ok(html.includes('<svg class="ico"') && html.includes('<span class="lbl">GitHub</span>'), 'brand icon + default label');
  assert.ok(html.includes('<span class="lbl">X</span>'), 'twitter aliases to X label');
  assert.ok(html.includes('<span class="ico emoji" aria-hidden="true">📝</span>'), 'custom emoji fallback');
  assert.equal((html.match(/class="s-item/g) ?? []).length, 3, 'link with no href is dropped');

  const iconOnly = applyOp(empty(), { op: 'addBlock', type: 'social-links', config: { variant: 'icon', links: [{ platform: 'linkedin', href: 'https://linkedin.com/x' }] } });
  const h2 = renderSite(iconOnly.manifest);
  assert.ok(h2.includes('s-item icon-only') && h2.includes('aria-label="LinkedIn"') && !h2.includes('<span class="lbl">'), 'icon-only uses aria-label, no visible text');
});

test('copyright: composes the line, auto-fills the current year, escapes', () => {
  const explicit = applyOp(empty(), { op: 'addBlock', type: 'copyright', config: { holder: 'Acme <Inc>', year: '2026', text: 'All rights reserved.' } });
  assert.ok(renderSite(explicit.manifest).includes('© 2026 Acme &lt;Inc&gt;. All rights reserved.'), 'line composed + holder escaped');

  const auto = applyOp(empty(), { op: 'addBlock', type: 'copyright', config: { holder: 'Acme', text: '' } });
  assert.ok(/© \d{4} Acme/.test(renderSite(auto.manifest)), 'blank year auto-fills a 4-digit year');

  const noSym = applyOp(empty(), { op: 'addBlock', type: 'copyright', config: { holder: 'Acme', year: '2026', showSymbol: false } });
  assert.ok(!renderSite(noSym.manifest).includes('© '), 'symbol can be turned off');

  const dot = applyOp(empty(), { op: 'addBlock', type: 'copyright', config: { holder: 'Acme Inc.', year: '2026', text: 'All rights reserved.' } });
  assert.ok(renderSite(dot.manifest).includes('Acme Inc. All rights reserved.'), 'no double period after a holder ending in "."');
});

test('video-gallery: facade cards — auto YT thumb, autoplay embed, no-JS fallback, island', () => {
  const r = applyOp(empty(), { op: 'addBlock', type: 'video-gallery', config: { title: 'Watch', items: [
    { provider: 'youtube', src: 'https://youtu.be/dQw4w9WgXcQ', title: 'Clip' },
    { provider: 'file', src: 'https://cdn.example/v.mp4' },
    { provider: 'youtube', src: '' },
  ] } });
  const html = renderSite(r.manifest);
  assert.ok(html.includes('i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg'), 'auto youtube thumbnail');
  assert.ok(html.includes('data-wl-embed="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"'), 'autoplay embed for the island');
  assert.ok(html.includes('href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"'), 'no-JS fallback links to the platform');
  assert.ok(html.includes('data-wl-provider="file"') && html.includes('src="/_island/video.js"'), 'file card + island wired');
  assert.equal((html.match(/class="v-card"/g) ?? []).length, 2, 'card with no id is dropped');
});

test('hero: background image banner adds img + scrim + overlay; plain hero unchanged', () => {
  const banner = applyOp(empty(), { op: 'addBlock', type: 'hero', config: { headline: 'Hi', image: '/b.jpg', overlay: 'dark', minHeight: 'lg' } });
  const h = renderSite(banner.manifest);
  assert.ok(h.includes('class="blk-hero has-image overlay-dark mh-lg"'), 'banner classes');
  assert.ok(h.includes('<img class="bg" src="/b.jpg" alt="" aria-hidden="true">') && h.includes('<div class="scrim">'), 'image + scrim layers');
  assert.ok(renderSite(applyOp(empty(), { op: 'addBlock', type: 'hero', config: { headline: 'Hi' } }).manifest).includes('class="blk-hero"'), 'no image → plain text hero (class is exactly blk-hero, no banner modifiers)');
});

test('favicon: meta.favicon emits <link rel="icon"> (url or emoji), sanitized', () => {
  const withMeta = (favicon: string) => ({ meta: { title: 't', description: '', lang: 'en', favicon }, design: DEFAULT_TOKENS, blocks: [], version: 1 });
  assert.ok(renderSite(withMeta('/fav.svg')).includes('<link rel="icon" href="/fav.svg">'), 'url favicon');
  assert.ok(renderSite(withMeta('🍞')).includes('rel="icon" href="data:image/svg+xml,'), 'emoji → data-uri favicon');
  assert.ok(!renderSite(empty()).includes('rel="icon"'), 'no favicon → no link');
  assert.ok(!renderSite(withMeta('javascript:alert(1)')).includes('javascript'), 'dangerous scheme neutralised');
});

// ── résumé pack (profile-header / experience / skills + print) ──────────────────

test('experience: dated entries with org link + bullets; no-role dropped', () => {
  const r = applyOp(empty(), { op: 'addBlock', type: 'experience', config: { title: 'Education', items: [
    { role: 'B.Sc. Computer Science', org: 'State University', period: '2018 – 2022', location: 'Berlin', url: 'https://uni.example', bullets: ['GPA 3.9', 'Thesis on X'] },
    { role: '', org: 'nope' }, // no role → dropped
  ] } });
  const h = renderSite(r.manifest);
  assert.ok(h.includes('<h2>Education</h2>') && h.includes('B.Sc. Computer Science'));
  assert.ok(h.includes('<a href="https://uni.example"') && h.includes('<li>GPA 3.9</li>'), 'org link + bullets');
  assert.equal((h.match(/class="entry"/g) ?? []).length, 1, 'entry with no role dropped');
});

test('skills: tags (with dots) and bars layouts', () => {
  const tags = applyOp(empty(), { op: 'addBlock', type: 'skills', config: { groups: [{ name: 'Languages', items: [{ label: 'TypeScript', level: 5 }, { label: 'Go' }] }] } });
  const th = renderSite(tags.manifest);
  assert.ok(th.includes('<p class="gname">Languages</p>') && th.includes('<span class="tag">TypeScript'), 'tags with group');
  assert.ok(th.includes('<span class="dots"'), 'proficiency dots for a rated skill');
  const bars = applyOp(empty(), { op: 'addBlock', type: 'skills', config: { display: 'bars', groups: [{ items: [{ label: 'React', level: 4 }] }] } });
  assert.ok(renderSite(bars.manifest).includes('style="width:80%"'), 'bar width from level/5');
});

test('profile-header: avatar/initials, contacts, and action buttons + island gating', () => {
  const withBtns = applyOp(empty(), { op: 'addBlock', type: 'profile-header', config: {
    name: 'Ada Lovelace', headline: 'Engineer', showDownload: true, showShare: true,
    contacts: [{ type: 'email', value: 'ada@x.com' }, { type: 'github', value: 'https://github.com/ada' }, { type: 'location', value: 'London' }],
  } });
  const h = renderSite(withBtns.manifest);
  assert.ok(h.includes('<h1>Ada Lovelace</h1>') && h.includes('class="initials"'), 'name + initials fallback');
  assert.ok(h.includes('href="mailto:ada@x.com"') && h.includes('href="https://github.com/ada"'), 'email + brand contact links');
  assert.ok(h.includes('data-wl-print') && h.includes('data-wl-share') && h.includes('data-wl-noprint'), 'action buttons, hidden from print');
  assert.ok(h.includes('src="/_island/resume.js"'), 'resume island shipped when actions on');

  const noBtns = applyOp(empty(), { op: 'addBlock', type: 'profile-header', config: { name: 'Ada' } });
  assert.ok(!renderSite(noBtns.manifest).includes('/_island/resume.js'), 'no island when no action buttons (static-first)');
});

test('renderSite includes print styles for PDF export', () => {
  assert.ok(renderSite(empty()).includes('@media print') && renderSite(empty()).includes('[data-wl-noprint]{display:none'), 'print stylesheet present');
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
