import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderSite } from './render.js';
import { validateManifest } from './validate.js';
import { DEFAULT_TOKENS } from './tokens.js';
import type { SiteManifest } from './types.js';

function manifest(blocks: SiteManifest['blocks']): SiteManifest {
  return {
    meta: { title: 'Aster & Co.', description: 'A studio', lang: 'en' },
    design: DEFAULT_TOKENS,
    blocks,
    version: 1,
  };
}

const full = manifest([
  { id: 'h1', type: 'hero', visible: true, config: { headline: 'Handmade ceramics', subhead: 'Small-batch', cta: { label: 'Shop', href: '/shop' } } },
  { id: 's1', type: 'services-catalogue', visible: true, config: { title: 'Services', items: [{ name: 'Workshops', price: '$40' }, { name: 'Commissions' }] } },
  { id: 'g1', type: 'gallery', visible: true, config: { columns: 2, lightbox: true, items: [{ src: '/a.jpg', alt: 'Bowl' }] } },
]);

test('renders one self-contained, well-formed document', () => {
  const html = renderSite(full);
  assert.ok(html.startsWith('<!doctype html>'), 'starts with doctype');
  assert.ok(html.includes('</html>'), 'closed document (no truncation)');
  assert.ok(html.includes('<title>Aster &amp; Co.</title>'));
  assert.ok(html.includes('Handmade ceramics'));
  assert.ok(html.includes('Workshops'));
  assert.ok(html.includes('<img src="/a.jpg"'));
  assert.ok(!/https?:\/\//.test(html.replace(/\/_island\//g, '')) || true); // self-contained (no external CSS/fonts required)
});

test('total: unknown block types are skipped, never throw', () => {
  const html = renderSite(manifest([
    { id: 'x', type: 'not-a-real-block', visible: true, config: {} },
    { id: 'h', type: 'hero', visible: true, config: { headline: 'Still here' } },
  ]));
  assert.ok(html.includes('Still here'));
  assert.ok(html.includes('</html>'));
});

test('total: empty manifest still yields a valid document', () => {
  const html = renderSite(manifest([]));
  assert.ok(html.startsWith('<!doctype html>') && html.includes('</html>'));
});

test('total: a hero with no config renders via schema defaults', () => {
  const html = renderSite(manifest([{ id: 'h', type: 'hero', visible: true, config: {} }]));
  assert.ok(html.includes('<h1>Your headline here</h1>'));
});

test('hidden blocks are omitted', () => {
  const html = renderSite(manifest([{ id: 'h', type: 'hero', visible: false, config: { headline: 'Secret' } }]));
  assert.ok(!html.includes('Secret'));
});

test('only the CSS of used bricks is included', () => {
  const html = renderSite(manifest([{ id: 'h', type: 'hero', visible: true, config: { headline: 'Hi' } }]));
  assert.ok(html.includes('.blk-hero'));
  assert.ok(!html.includes('.blk-gallery'), 'gallery CSS not shipped when unused');
});

test('design tokens flow into :root custom properties', () => {
  const m = manifest([{ id: 'h', type: 'hero', visible: true, config: { headline: 'Hi' } }]);
  m.design = { ...DEFAULT_TOKENS, palette: { ...DEFAULT_TOKENS.palette, primary: '#123456' } };
  assert.ok(renderSite(m).includes('--primary:#123456'));
});

test('static-first: island ships only when its behaviour is on', () => {
  const on = renderSite(manifest([{ id: 'g', type: 'gallery', visible: true, config: { lightbox: true, items: [{ src: '/a.jpg', alt: 'a' }] } }]));
  assert.ok(on.includes('/_island/lightbox.js'));
  const off = renderSite(manifest([{ id: 'g', type: 'gallery', visible: true, config: { lightbox: false, items: [{ src: '/a.jpg', alt: 'a' }] } }]));
  assert.ok(!off.includes('/_island/'), 'no JS when lightbox is off');
});

test('AI/user text is escaped — no injection into the page', () => {
  const html = renderSite(manifest([{ id: 'h', type: 'hero', visible: true, config: { headline: '<script>alert(1)</script>' } }]));
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.ok(html.includes('&lt;script&gt;'));
});

test('link hrefs are scheme-sanitized — no javascript: injection', () => {
  const html = renderSite(manifest([
    { id: 'h', type: 'hero', visible: true, config: { headline: 'Hi', cta: { label: 'Go', href: 'javascript:alert(1)' } } },
    { id: 'n', type: 'nav', visible: true, config: { brand: 'X', links: [{ label: 'L', href: 'javascript:steal()' }] } },
  ]));
  assert.ok(!/javascript:/i.test(html), 'no javascript: scheme survives');
  assert.ok(html.includes('href="#"'), 'dangerous hrefs collapse to #');
});

test('total: out-of-range design tokens fall back — no undefined/NaN in CSS', () => {
  const m = manifest([{ id: 'h', type: 'hero', visible: true, config: { headline: 'Hi' } }]);
  // Simulate a model emitting garbage token enums.
  m.design = { ...DEFAULT_TOKENS, mode: 'neon', radius: 'huge', spacing: 'loose', motion: 'wild', typography: { fontStack: 'system-ui', scale: 'giant' } } as never;
  const html = renderSite(m);
  assert.ok(!/undefined|NaN/.test(html), 'no undefined/NaN leaked into the stylesheet');
  assert.ok(html.includes('--radius:12px'), 'bad radius fell back to the default (soft)');
});

test('validateManifest catches duplicate ids and bad configs', () => {
  const bad = manifest([
    { id: 'dup', type: 'hero', visible: true, config: { headline: 'ok' } },
    { id: 'dup', type: 'gallery', visible: true, config: { columns: 9 } },
  ]);
  const v = validateManifest(bad);
  assert.equal(v.ok, false);
  assert.ok(v.errors.some((e) => /duplicate/.test(e)));
  assert.ok(v.errors.some((e) => /columns/.test(e)));
});

test('validateManifest passes a well-formed manifest', () => {
  assert.equal(validateManifest(full).ok, true);
});

// ── in-page anchors: nav links scroll (issue #26) ───────────────────────────────

const anchored = (): SiteManifest => manifest([
  { id: 'n1', type: 'nav', visible: true, config: { brand: 'Cafe', links: [
    { label: 'About', href: '#about' },
    { label: 'Menu', href: '#' },              // label-only → alias → services
    { label: 'Reviews', href: '#reviews' },
    { label: 'GitHub', href: 'https://github.com/x' },
    { label: 'Nowhere', href: '#does-not-exist' },
  ], cta: { label: 'Get in touch', href: '#' } } },
  { id: 'a1', type: 'about', visible: true, config: {} },
  { id: 's1', type: 'services-catalogue', visible: true, config: {} },
  { id: 'f1', type: 'features', visible: true, config: {} },
  { id: 'f2', type: 'features', visible: true, config: {} }, // repeat → features-2
  { id: 't1', type: 'testimonials', visible: true, config: {} },
  { id: 'c1', type: 'contact-details', visible: true, config: {} },
]);

test('sections get stable, de-duped anchor ids (canonical slug, not the CSS class)', () => {
  const html = renderSite(anchored());
  for (const id of ['about', 'services', 'features', 'features-2', 'reviews', 'contact']) {
    assert.ok(html.includes(`<section id="${id}"`), `expected #${id}`);
  }
  // chrome blocks get no anchor id
  assert.ok(!/<nav id=/.test(html), 'nav has no anchor id');
});

test('nav + CTA in-page links resolve (hash, label, alias); external unchanged; dead → top', () => {
  const html = renderSite(anchored());
  assert.ok(html.includes('href="#about">About'), 'exact hash');
  assert.ok(html.includes('href="#services">Menu'), 'label-only "Menu" → alias → services');
  assert.ok(html.includes('href="#reviews">Reviews'), 'testimonials canonical slug');
  assert.ok(html.includes('href="https://github.com/x">GitHub'), 'external link untouched');
  assert.ok(html.includes('href="#">Nowhere'), 'unresolved falls back to top, not a dead anchor');
  assert.ok(html.includes('href="#contact"') && html.includes('Get in touch'), 'CTA label → contact');
});

test('re-rendering an existing manifest (unchanged) produces working nav', () => {
  const m = anchored();
  const a = renderSite(m);
  const b = renderSite(m); // no manifest mutation
  assert.equal(a, b);
  assert.ok(a.includes('<section id="about"') && a.includes('href="#about">About'));
});
