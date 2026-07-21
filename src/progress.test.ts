import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getSpec, needsIsland } from './registry.js';
import { renderSite } from './render.js';
import { validateManifest } from './validate.js';
import { DEFAULT_TOKENS } from './tokens.js';
import type { SiteManifest } from './types.js';

// `progress` is the brick where accessibility IS the feature — a bar that only
// encodes its value as a CSS width is invisible to assistive tech. These guard
// that, plus the arithmetic, which has an obvious divide-by-zero if unguarded.

const page = (config: Record<string, unknown>): string => renderSite({
  meta: { title: 't', description: '', lang: 'en' },
  design: DEFAULT_TOKENS,
  blocks: [{ id: 'p', type: 'progress', visible: true, config }],
  version: 1,
} as SiteManifest);

const item = (over: Record<string, unknown> = {}): Record<string, unknown> =>
  ({ label: 'Appeal', value: 50, max: 100, ...over });

test('progress is registered with a description and an object schema', () => {
  const spec = getSpec('progress')!;
  assert.ok(spec, 'registered');
  assert.ok(spec.description.length > 8);
  assert.equal(typeof spec.schema, 'object');
});

test('every indicator is a real progressbar with a full ARIA value set', () => {
  const html = page({ items: [item({ label: 'Emergency appeal', value: 612000, max: 900000, prefix: '£' })] });
  assert.match(html, /role="progressbar"/);
  assert.match(html, /aria-valuenow="612000"/);
  assert.match(html, /aria-valuemin="0"/);
  assert.match(html, /aria-valuemax="900000"/);
  assert.match(html, /aria-label="Emergency appeal"/);
});

test('aria-valuetext spells out the units — a bare number reads as nothing', () => {
  const html = page({ items: [item({ value: 12400, max: 20000, prefix: '£' })] });
  assert.match(html, /aria-valuetext="£12400 of £20000"/);
  const pct = page({ items: [item({ value: 62, max: 100, suffix: '%' })] });
  assert.match(pct, /aria-valuetext="62 of 100%"/, 'a trailing unit lands once, not on both operands');
});

test('the value stays reachable as text even when showValue is off', () => {
  const html = page({ showValue: false, items: [item({ value: 8, max: 40, suffix: ' left' })] });
  assert.ok(!html.includes('<span class="ivalue">'), 'no visible readout');
  assert.match(html, /aria-valuetext="8 of 40 left"/, 'still announced');
});

test('values are clamped into 0..max rather than overflowing the track', () => {
  const over = page({ items: [item({ value: 500, max: 100 })] });
  assert.match(over, /width:100%/, 'over-max clamps to full');
  assert.match(over, /aria-valuenow="100"/, 'and the announced value clamps too');

  const under = page({ items: [item({ value: -20, max: 100 })] });
  assert.match(under, /width:0%/, 'negative clamps to empty');
  assert.match(under, /aria-valuenow="0"/);
});

test('a zero or missing max cannot divide by zero', () => {
  for (const max of [0, undefined, null]) {
    const html = page({ items: [{ label: 'x', value: 10, max }] });
    assert.ok(!/NaN|Infinity/.test(html), `max=${String(max)} produced NaN/Infinity`);
    assert.match(html, /role="progressbar"/);
  }
});

test('each display renders its own shape', () => {
  assert.match(page({ display: 'bars', items: [item()] }), /class="track"/);

  const segs = page({ display: 'segments', items: [item({ value: 3, max: 10 })] });
  assert.equal((segs.match(/class="seg[ "]/g) ?? []).length, 10, 'one cell per unit');
  assert.equal((segs.match(/class="seg on"/g) ?? []).length, 3, 'three filled');

  const rings = page({ display: 'rings', items: [item()] });
  assert.match(rings, /<svg /);
  assert.match(rings, /stroke-dasharray=/);

  const meters = page({ display: 'meters', items: [item({ threshold: 75 })] });
  assert.match(meters, /class="scale"/, 'meters carry a scale');
  assert.match(meters, /class="mark"/, 'and a target marker when threshold is set');
});

test('a large max falls back to a fixed 20-cell scale instead of 900 cells', () => {
  const html = page({ display: 'segments', items: [item({ value: 450, max: 900 })] });
  assert.equal((html.match(/class="seg[ "]/g) ?? []).length, 20);
});

test('rings coerce out of the stack layout — a full-width donut is not useful', () => {
  const html = page({ display: 'rings', layout: 'stack', items: [item()] });
  assert.match(html, /class="items grid"/);
});

test('the island is only worth a script tag when animate is on', () => {
  const spec = getSpec('progress')!;
  assert.equal(spec.island, 'progress');
  assert.equal(needsIsland(spec, { animate: true }), true);
  assert.equal(needsIsland(spec, { animate: false }), false);
  assert.equal(needsIsland(spec, {}), false, 'static by default');
});

test('the real width is inline, so the island is pure enhancement', () => {
  // If the fill started at 0 and JS filled it in, a JS-off reader would see an
  // empty bar — the animation must only ever replace a value with itself.
  const html = page({ animate: true, items: [item({ value: 25, max: 100 })] });
  assert.match(html, /width:25%/, 'correct width already rendered');
  assert.match(html, /data-wl-progress="25"/, 'island target present');
});

test('progress renders totally and escapes injected markup', () => {
  const html = page({
    title: '<script>alert(1)</script>',
    items: [item({ label: '<img src=x onerror=alert(1)>', caption: '<b>hi</b>' })],
  });
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.ok(!html.includes('<img src=x'));
  assert.ok(!html.includes('<b>hi</b>'));
  assert.match(html, /&lt;/);
});

test('progress validates clean with empty config and with no items', () => {
  for (const config of [{}, { items: [] }]) {
    const m = {
      meta: { title: 't', description: '', lang: 'en' }, design: DEFAULT_TOKENS,
      blocks: [{ id: 'p', type: 'progress', visible: true, config }], version: 1,
    } as SiteManifest;
    assert.equal(validateManifest(m).ok, true);
    assert.match(renderSite(m), /class="blk-progress/);
  }
});

// ── the skills a11y fix (weblocks#65) ───────────────────────────────────────────

const skillsPage = (config: Record<string, unknown>): string => renderSite({
  meta: { title: 't', description: '', lang: 'en' },
  design: DEFAULT_TOKENS,
  blocks: [{ id: 's', type: 'skills', visible: true, config }],
  version: 1,
} as SiteManifest);

test('skills bars expose their level to assistive tech, not only as a width', () => {
  const html = skillsPage({ display: 'bars', groups: [{ name: 'Languages', items: [{ label: 'Welsh', level: 3 }] }] });
  assert.match(html, /role="progressbar"/);
  assert.match(html, /aria-valuenow="3"/);
  assert.match(html, /aria-valuemax="5"/);
  assert.match(html, /aria-valuetext="3 out of 5"/);
  assert.match(html, /aria-label="Welsh"/);
});

test('an unrated skill bar is hidden rather than announced as zero', () => {
  const html = skillsPage({ display: 'bars', groups: [{ name: 'Tools', items: [{ label: 'Figma', level: 0 }] }] });
  assert.ok(!html.includes('role="progressbar"'), 'level 0 carries no rating');
  assert.match(html, /aria-hidden="true"/);
});

test('skills tag dots keep their rating available as text', () => {
  const html = skillsPage({ display: 'tags', groups: [{ name: 'Languages', items: [{ label: 'Welsh', level: 4 }] }] });
  assert.match(html, /class="dots" aria-hidden="true"/, 'dots stay decorative');
  assert.match(html, /class="vh">4 out of 5</, 'the rating is still announced');
});
