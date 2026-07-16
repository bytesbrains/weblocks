import { test } from 'node:test';
import assert from 'node:assert/strict';
import { blockTypes } from './registry.js';
import { catalog } from './catalog.js';
import { applyOp } from './ops.js';
import { renderSite } from './render.js';
import { validateManifest } from './validate.js';
import { DEFAULT_TOKENS } from './tokens.js';
import type { SiteManifest } from './types.js';

// These guard the "brick definition-of-done" for EVERY registered brick — so a
// new block can't join the catalog without clearing the same bar.

const empty = (): SiteManifest => ({ meta: { title: 't', description: '', lang: 'en' }, design: DEFAULT_TOKENS, blocks: [], version: 1 });

test('every brick appears in the catalog with a description + object schema', () => {
  const cat = catalog();
  for (const type of blockTypes()) {
    const e = cat.find((c) => c.type === type);
    assert.ok(e, `catalog is missing ${type}`);
    assert.ok(e!.description.length > 8, `${type} needs a real description`);
    assert.equal(e!.schema.type, 'object');
  }
});

test('every brick adds with defaults (no hard errors) and renders a valid document', () => {
  for (const type of blockTypes()) {
    const r = applyOp(empty(), { op: 'addBlock', type });
    assert.equal(r.ok, true, `${type} should add cleanly with defaults`);
    const html = renderSite(r.manifest);
    assert.ok(html.startsWith('<!doctype html>') && html.includes('</html>'), `${type} must render a complete doc`);
    assert.ok(validateManifest(r.manifest).ok, `${type} default manifest must validate`);
  }
});

test('a full page using every brick renders valid and escapes injected markup', () => {
  let m = empty();
  for (const type of blockTypes()) m = applyOp(m, { op: 'addBlock', type }).manifest;
  assert.equal(m.blocks.length, blockTypes().length);

  const hero = m.blocks.find((b) => b.type === 'hero')!;
  m = applyOp(m, { op: 'updateBlock', id: hero.id, config: { headline: '<script>alert(1)</script>' } }).manifest;

  const html = renderSite(m);
  assert.ok(html.includes('</html>'));
  assert.ok(!html.includes('<script>alert(1)</script>'), 'injection must be escaped');
  assert.ok(html.includes('&lt;script&gt;'));
  // Every brick contributed a landmark section/nav/footer.
  const landmarks = (html.match(/<(section|nav|footer)\b/g) ?? []).length;
  assert.ok(landmarks >= blockTypes().length, `expected ≥${blockTypes().length} landmarks, got ${landmarks}`);
});

test('catalog is the closed vocabulary — the full named brick set', () => {
  assert.deepEqual(
    blockTypes().sort(),
    [
      'about', 'accordion', 'announcement-bar', 'app-shell', 'auth', 'blog-list',
      'blog-post', 'booking', 'carousel', 'contact-details', 'contact-form', 'copyright',
      'cta', 'directions', 'divider', 'experience',
      'faq', 'features', 'feed', 'footer', 'gallery', 'hero', 'hero-app', 'hours', 'legal',
      'logos', 'map', 'menu', 'nav', 'newsletter', 'pricing', 'product', 'profile-header',
      'reviews', 'rich-text', 'search', 'services-catalogue', 'sidebar', 'skills', 'social-links', 'spacer',
      'split', 'stats', 'steps', 'tabs', 'team', 'testimonials', 'timeline', 'video',
      'video-gallery',
    ],
  );
});
