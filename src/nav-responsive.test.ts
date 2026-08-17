/**
 * `nav` collapsing on small screens (#79) — the toggle's markup, its identity,
 * and the CSS contract that keeps the wide header exactly what it was.
 *
 * The behaviour itself is CSS, which no unit test can execute; what is asserted
 * here is everything the CSS *depends* on — that the toggle is inert above the
 * breakpoint, that the panel is driven by `:checked`, and that the rules the
 * wide row is laid out by are untouched.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getSpec } from './registry.js';
import { parse } from './schema.js';
import { DEFAULT_TOKENS } from './tokens.js';
import { renderSite } from './render.js';
import type { SiteManifest } from './types.js';

const spec = getSpec('nav')!;
const css = spec.css!;

const nav = (config: Record<string, unknown> = {}, id?: string): string =>
  spec.render(parse(spec.schema, config).value, DEFAULT_TOKENS, id ? ({ id, runtime: { resolve: () => null } } as never) : undefined);

const LINKS = [{ label: 'Docs', href: '#d' }, { label: 'Pricing', href: '#p' }];

// ── the toggle is emitted only when it would do something ────────────────────

test('no links and no CTA — nothing to collapse, so no toggle', () => {
  const out = nav({ brand: 'Acme' });
  assert.ok(!out.includes('menu-toggle'), 'no checkbox');
  assert.ok(!out.includes('menu-btn'), 'no button');
});

test('links, or a CTA alone, bring the toggle', () => {
  assert.ok(nav({ links: LINKS }).includes('class="menu-toggle"'), 'links collapse');
  assert.ok(nav({ cta: { label: 'Start', href: '#s' } }).includes('class="menu-toggle"'), 'a lone CTA collapses too');
});

// ── identity: two navs on one page must not toggle each other ────────────────

test('the toggle id comes from the placed block id, and stays DOM-safe', () => {
  const out = nav({ links: LINKS }, 'Nav Block #1!');
  assert.ok(out.includes('id="wl-nav-nav-block-1"'), `slugified id, got: ${out}`);
  assert.ok(out.includes('for="wl-nav-nav-block-1"'), 'label points at it');
});

test('two navs on one page get distinct toggle ids', () => {
  const manifest: SiteManifest = {
    meta: { title: 't', description: '', lang: 'en' }, design: DEFAULT_TOKENS, version: 1,
    blocks: [
      { id: 'top', type: 'nav', visible: true, config: { brand: 'A', links: LINKS } },
      { id: 'bottom', type: 'nav', visible: true, config: { brand: 'A', links: LINKS } },
    ],
  };
  const html = renderSite(manifest);
  const ids = [...html.matchAll(/id="(wl-nav-[^"]*)"/g)].map((m) => m[1]);
  assert.equal(ids.length, 2, 'one toggle each');
  assert.notEqual(ids[0], ids[1], 'a shared id would make one nav operate the other');
});

test('an id that slugifies to nothing still yields a usable id', () => {
  assert.ok(nav({ links: LINKS }, '!!!').includes('id="wl-nav-menu"'), 'falls back rather than emitting id=""');
});

// ── accessibility ────────────────────────────────────────────────────────────

test('the toggle carries an accessible name, and the bars are not announced', () => {
  const out = nav({ links: LINKS });
  assert.ok(out.includes('<span class="menu-label">Menu</span>'), 'the label names the control');
  assert.ok(out.includes('<span class="bars" aria-hidden="true">'), 'decorative bars stay out of the a11y tree');
  assert.ok(css.includes('.blk-nav .menu-label{position:absolute'), 'the name is visually hidden, not display:none');
  assert.ok(css.includes('.blk-nav .menu-toggle:focus-visible+.menu-btn{outline:'), 'keyboard focus is visible on the label');
});

test('no aria-expanded — a state CSS cannot update must not be asserted', () => {
  // Without JS it could only ever be a hardcoded `false`, which is a lie the
  // moment the panel opens. No state beats stale state.
  assert.ok(!nav({ links: LINKS }).includes('aria-expanded'));
});

test('the collapsed nav ships no JavaScript', () => {
  assert.equal(spec.island, undefined, 'nav stays a static brick');
  const html = renderSite({
    meta: { title: 't', description: '', lang: 'en' }, design: DEFAULT_TOKENS, version: 1,
    blocks: [{ id: 'n', type: 'nav', visible: true, config: { brand: 'A', links: LINKS } }],
  });
  assert.ok(!html.includes('/_island/'), 'no island script for a nav');
});

// ── the CSS contract ─────────────────────────────────────────────────────────

test('above the breakpoint the toggle contributes no box at all', () => {
  // Both halves display:none outside the media query, so the wide header is
  // laid out by exactly the rules that laid it out before the toggle existed.
  assert.ok(css.includes('.blk-nav .menu-toggle,.blk-nav .menu-btn{display:none}'));
  const wide = css.slice(0, css.indexOf('@media'));
  assert.ok(wide.includes('.blk-nav .links{display:flex;gap:calc(var(--space)*1.1);margin-left:auto;flex-wrap:wrap}'),
    'the wide link row rule is untouched');
});

test('the panel is driven by :checked, and only under the breakpoint', () => {
  const mq = css.slice(css.indexOf('@media(max-width:900px){'));
  assert.ok(mq.includes('.blk-nav .links{display:none;'), 'collapsed by default on small screens');
  assert.ok(mq.includes('.blk-nav .menu-toggle:checked~.links{display:flex}'), 'checking the box opens it');
  assert.ok(mq.includes('.blk-nav .menu-btn{display:inline-flex'), 'and the button appears');
});

test('the open panel scrolls instead of wrapping into columns', () => {
  // `.links` carries flex-wrap:wrap for the wide row. Left on, a column-direction
  // flex box with a capped height wraps into a second COLUMN instead of
  // scrolling — the panel renders as two ragged columns of links.
  const mq = css.slice(css.indexOf('@media(max-width:900px){'));
  const panel = mq.slice(mq.indexOf('.blk-nav .links{display:none;'));
  assert.ok(panel.startsWith('.blk-nav .links{display:none;flex-direction:column;flex-wrap:nowrap;'), 'wrap is explicitly off');
  assert.ok(/max-height:[^;}]+;overflow-y:auto/.test(panel), 'a tall menu scrolls inside the panel, not off a sticky header');
});

test('the icon transition respects prefers-reduced-motion', () => {
  assert.ok(css.includes('@media(prefers-reduced-motion:reduce){.blk-nav .bars'), 'the bars→X animation is opt-out');
});
