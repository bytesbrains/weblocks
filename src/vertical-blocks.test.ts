import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getSpec } from './registry.js';
import { catalog } from './catalog.js';
import { validateBlock } from './validate.js';
import { runtimeNeeds, pathRuntime, NOOP_RUNTIME } from './runtime.js';
import { renderSite } from './render.js';
import { DEFAULT_TOKENS } from './tokens.js';
import type { SiteManifest } from './types.js';

// Targeted coverage for the vertical-coverage blocks (#32). The block
// definition-of-done (adds clean, renders a valid doc, in catalog) is asserted
// for EVERY brick in blocks.test.ts; these check each new block's specifics.

const NEW_BLOCKS = ['booking', 'hours', 'menu', 'product', 'reviews'];

function render1(type: string, config: Record<string, unknown>, runtime = NOOP_RUNTIME): string {
  const m: SiteManifest = {
    meta: { title: 't', description: '', lang: 'en' }, design: DEFAULT_TOKENS, version: 1,
    blocks: [{ id: `${type}-1`, type, visible: true, config }],
  };
  return renderSite(m, { runtime });
}

test('all five new blocks are registered with a schema + description', () => {
  const cat = catalog();
  for (const type of NEW_BLOCKS) {
    assert.ok(getSpec(type), `${type} is registered`);
    const e = cat.find((c) => c.type === type)!;
    assert.ok(e && e.description.length > 8, `${type} has a real catalog description`);
    assert.equal(e.schema.type, 'object');
  }
});

// ── booking (powered) ───────────────────────────────────────────────────────────

test('booking declares the booking.request capability', () => {
  assert.deepEqual(getSpec('booking')!.runtime?.capabilities, ['booking.request']);
  const cat = catalog().find((c) => c.type === 'booking')!;
  assert.deepEqual(cat.runtime?.capabilities, ['booking.request']);
});

test('booking renders inert without a runtime and wired with one', () => {
  const inert = render1('booking', { services: [{ name: 'Haircut', duration: '45 min', price: '£40' }] });
  assert.match(inert, /data-wl-capability="booking\.request"/);
  assert.match(inert, /data-wl-inert="true"/);
  assert.match(inert, /needs a runtime/i);
  assert.match(inert, /Haircut/);
  assert.match(inert, /<button type="submit" disabled>/, 'submit disabled when inert');

  const wired = render1('booking', { services: [{ name: 'Haircut' }] }, pathRuntime('/api'));
  assert.match(wired, /action="\/api\/booking\.request\/booking-1"/);
  assert.ok(!/data-wl-inert/.test(wired), 'no inert marker when wired');
  assert.match(wired, /<button type="submit">/, 'submit enabled (not disabled) when wired');
});

test('runtimeNeeds reports a booking block as needing booking.request', () => {
  const m: SiteManifest = {
    meta: { title: 't', description: '', lang: 'en' }, design: DEFAULT_TOKENS, version: 1,
    blocks: [{ id: 'book', type: 'booking', visible: true, config: {} }],
  };
  assert.deepEqual(runtimeNeeds(m), [{ blockId: 'book', type: 'booking', capabilities: ['booking.request'] }]);
});

// ── hours ────────────────────────────────────────────────────────────────────────

test('hours renders every weekday, marks closed days, and carries island data', () => {
  const html = render1('hours', { days: [
    { day: 'mon', open: '09:00', close: '17:00' },
    { day: 'mon', open: '18:00', close: '21:00' },
    { day: 'sun', closed: true },
  ] });
  for (const d of ['Monday', 'Tuesday', 'Sunday']) assert.ok(html.includes(d), `lists ${d}`);
  assert.match(html, /data-hours="09:00-17:00,18:00-21:00"/, 'split shifts encoded for the island');
  assert.match(html, /Closed/, 'a day with no hours shows Closed');
  assert.match(html, /data-hours-badge/, 'has the open-now badge hook');
  assert.match(html, /_island\/hours\.js/, 'emits its island script');
});

// ── menu ─────────────────────────────────────────────────────────────────────────

test('menu renders sections, prices, dietary tags, and spice', () => {
  const html = render1('menu', { title: 'Menu', sections: [
    { name: 'Mains', items: [{ name: 'Dal', price: '£9', tags: ['V', 'GF'], spice: 2 }] },
  ] });
  assert.match(html, /Mains/);
  assert.match(html, /Dal/);
  assert.match(html, /£9/);
  assert.match(html, /class="tag">V</);
  assert.match(html, /🌶️🌶️/, 'spice level 2 = two chillies');
});

// ── product ──────────────────────────────────────────────────────────────────────

test('product renders a card with price, was-price, badge, and a safe CTA link', () => {
  const html = render1('product', { items: [
    { name: 'Tee', price: '£25', was: '£30', badge: 'Sale', image: 'https://x/t.jpg', ctaLabel: 'Buy', ctaHref: 'javascript:alert(1)' },
  ] });
  assert.match(html, /Tee/);
  assert.match(html, /£25/);
  assert.match(html, /class="was">£30/);
  assert.match(html, /class="badge">Sale/);
  assert.ok(!html.includes('javascript:alert(1)'), 'dangerous scheme sanitized');
});

// ── reviews ──────────────────────────────────────────────────────────────────────

test('reviews renders stars, aggregate, and source', () => {
  const html = render1('reviews', { average: '4.8', count: '2,100', source: 'Google', items: [
    { rating: 5, quote: 'Superb', author: 'Ada', source: 'google' },
    { rating: 3, quote: 'Fine', author: 'Ben' },
  ] });
  assert.match(html, /4\.8/);
  assert.match(html, /2,100 reviews/);
  assert.match(html, /Superb/);
  assert.match(html, /via google/i);
  assert.match(html, /aria-label="5 out of 5 stars"/);
  assert.match(html, /aria-label="3 out of 5 stars"/);
});

// ── schema hardening (defaults) ───────────────────────────────────────────────────

test('every new block validates clean with empty config (total defaults)', () => {
  for (const type of NEW_BLOCKS) {
    const v = validateBlock(type, {});
    assert.ok(v.ok, `${type} must accept an empty config: ${JSON.stringify(v.errors)}`);
  }
});
