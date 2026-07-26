import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getSpec } from './registry.js';
import { renderSite } from './render.js';
import { validateManifest } from './validate.js';
import { DEFAULT_TOKENS } from './tokens.js';
import type { SiteManifest } from './types.js';

// `credit` is the brick whose whole job is an outbound link, so the guards here
// are the link ones: a new tab must be safe (`noopener`) and announced (an arrow
// glyph is invisible to a screen reader), and a hostile scheme must never make
// it into an href.

const page = (config: Record<string, unknown>): string => renderSite({
  meta: { title: 't', description: '', lang: 'en' },
  design: DEFAULT_TOKENS,
  blocks: [{ id: 'c', type: 'credit', visible: true, config }],
  version: 1,
} as SiteManifest);

test('credit is registered with a description and an object schema', () => {
  const spec = getSpec('credit')!;
  assert.ok(spec, 'registered');
  assert.ok(spec.description.length > 8);
  assert.equal(typeof spec.schema, 'object');
});

test('the credited name links out in a new tab, safely and audibly', () => {
  const html = page({ label: 'Created by', name: 'AiToolK.it', href: 'https://aitoolk.it' });
  assert.match(html, /href="https:\/\/aitoolk\.it"/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /rel="noopener noreferrer"/, 'a new tab must not get window.opener');
  assert.match(html, /opens in a new tab/, 'the ↗ glyph is aria-hidden — the warning must be real text');
  assert.match(html, /Created by/);
  assert.match(html, /AiToolK\.it/);
});

test('newTab:false keeps the visitor in the same tab — and drops the warning', () => {
  const html = page({ label: 'Managed by', name: 'BytesBrains', href: 'https://bytesbrains.com', newTab: false });
  assert.ok(!html.includes('target="_blank"'), 'same tab');
  assert.ok(!html.includes('opens in a new tab'), 'no warning when it does not');
  assert.match(html, /href="https:\/\/bytesbrains\.com"/);
});

test('a blank href renders an unlinked credit rather than a dead link', () => {
  const html = page({ label: 'Powered by', name: 'An in-house team' });
  assert.ok(!/<a class="who"/.test(html), 'no anchor without a destination');
  assert.match(html, /<span class="who">/);
  assert.match(html, /An in-house team/);
});

test('a hostile scheme never reaches the href', () => {
  const html = page({ name: 'Evil', href: 'javascript:alert(1)' });
  assert.ok(!html.includes('javascript:'), 'scheme is neutralized');
  assert.ok(!/<a class="who"/.test(html), 'and it degrades to plain text, not href="#"');
});

test('text is escaped — a name is content, never markup', () => {
  const html = page({ name: '<img src=x onerror=alert(1)>', note: '<b>note</b>' });
  assert.ok(!html.includes('<img src=x'), 'injection escaped');
  assert.ok(!html.includes('<b>note</b>'));
  assert.match(html, /&lt;img src=x/);
});

test('the logo takes an image URL or an emoji, and never a bare image alt', () => {
  const img = page({ name: 'AiToolK.it', logo: 'https://aitoolk.it/logo.svg' });
  assert.match(img, /<img class="logo" src="https:\/\/aitoolk\.it\/logo\.svg" alt=""/, 'decorative — the name is the label');
  const emoji = page({ name: 'AiToolK.it', logo: '🛠️' });
  assert.match(emoji, /<span class="logo emoji" aria-hidden="true">🛠️<\/span>/);
});

test('defaults render a valid, landmarked section with nothing to credit', () => {
  const html = page({});
  assert.match(html, /<section [^>]*class="blk-credit/);
  assert.ok(!html.includes('<a class="who"'), 'no name, no link');
  assert.ok(validateManifest({
    meta: { title: 't', description: '', lang: 'en' },
    design: DEFAULT_TOKENS,
    blocks: [{ id: 'c', type: 'credit', visible: true, config: {} }],
    version: 1,
  } as SiteManifest).ok);
});

test('variant and align are reflected as classes the CSS can hook', () => {
  assert.match(page({ name: 'X', variant: 'badge', align: 'end' }), /class="blk-credit variant-badge align-end"/);
  assert.match(page({ name: 'X' }), /class="blk-credit variant-bar align-center"/, 'defaults');
});
