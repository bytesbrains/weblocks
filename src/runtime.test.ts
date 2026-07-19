/**
 * §6 runtime contract — how a powered brick meets the host: what it declares,
 * how it renders inert without a runtime, and how it survives a host that
 * misbehaves (the renderer stays total, #42).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyOp } from './ops.js';
import { renderSite } from './render.js';
import { DEFAULT_TOKENS } from './tokens.js';
import type { SiteManifest } from './types.js';
import { runtimeNeeds, pathRuntime, safeRuntime, NOOP_RUNTIME, type RuntimeAdapter, type RuntimeAction } from './runtime.js';

const empty = (): SiteManifest => ({ meta: { title: 't', description: '', lang: 'en' }, design: DEFAULT_TOKENS, blocks: [], version: 1 });

// ── §6 runtime contract ─────────────────────────────────────────────────────────

test('runtimeNeeds reports powered blocks and their capabilities', () => {
  let m = empty();
  m = applyOp(m, { op: 'addBlock', type: 'contact-form' }).manifest;
  m = applyOp(m, { op: 'addBlock', type: 'hero' }).manifest;
  const needs = runtimeNeeds(m);
  assert.equal(needs.length, 1);
  assert.equal(needs[0]!.type, 'contact-form');
  assert.deepEqual(needs[0]!.capabilities, ['contact-form.submit']);
});

test('powered block renders inert with the no-op runtime, wired with an adapter', () => {
  const r = applyOp(empty(), { op: 'addBlock', type: 'contact-form', id: 'cf-1' });
  const inert = renderSite(r.manifest); // default NOOP runtime
  assert.ok(inert.includes('data-wl-inert="true"'));
  assert.ok(inert.includes('data-wl-capability="contact-form.submit"'));
  assert.ok(inert.includes('disabled'));

  const wired = renderSite(r.manifest, { runtime: pathRuntime('/api') });
  assert.ok(wired.includes('action="/api/contact-form.submit/cf-1"'));
  assert.ok(!wired.includes('data-wl-inert'));
  assert.equal(NOOP_RUNTIME.resolve('x', 'y'), null);
});


// ── hardening: powered-block form safety ────────────────────────────────────────

test('a hostile runtime method is whitelisted to post; the attribute never breaks out', () => {
  const evil = { resolve: () => ({ url: '/x', method: 'get"><script>alert(1)</script>' as never }) };
  const r = applyOp(empty(), { op: 'addBlock', type: 'contact-form', id: 'cf-1' });
  const html = renderSite(r.manifest, { runtime: evil });
  assert.ok(html.includes('method="post"'), 'coerced to a safe method token');
  assert.ok(!html.includes('<script>alert(1)</script>'), 'no attribute breakout');
});

test('contact-form field ids are DOM-safe even when field names have spaces', () => {
  const r = applyOp(empty(), { op: 'addBlock', type: 'contact-form', id: 'cf-1', config: { fields: [{ name: 'full name', label: 'Full name', type: 'text' }] } });
  const html = renderSite(r.manifest);
  const id = /id="(f-cf-1-[^"]*)"/.exec(html)?.[1] ?? '';
  assert.ok(id && !/\s/.test(id), `id must be space-free, got "${id}"`);
  assert.ok(html.includes(`for="${id}"`), 'label stays associated with the input');
});


test('search renders both layouts, wires to a runtime, and stays inert without one', () => {
  const bar = applyOp(empty(), { op: 'addBlock', type: 'search', id: 'search-1', config: { layout: 'bar', label: 'Find posts' } });
  const inert = renderSite(bar.manifest);
  assert.ok(inert.includes('role="search"') && inert.includes('layout-bar'));
  assert.ok(inert.includes('data-wl-capability="search.query"') && inert.includes('data-wl-inert="true"'));
  assert.ok(inert.includes('aria-label="Find posts"'), 'label escaped into the landmark');

  const wired = renderSite(bar.manifest, { runtime: pathRuntime('/api') });
  assert.ok(wired.includes('action="/api/search.query/search-1"') && !wired.includes('data-wl-inert'));

  const icon = applyOp(empty(), { op: 'addBlock', type: 'search', config: { layout: 'icon' } });
  assert.ok(renderSite(icon.manifest).includes('layout-icon'), 'icon variant renders');
});


// ── totality: host runtime code cannot break the render (#42) ───────────────────

const POWERED = ['contact-form', 'newsletter', 'booking', 'auth', 'search'];

test('a throwing host adapter degrades to inert bricks, never a dead page', () => {
  // `resolve` is the one place arbitrary host code runs inside a render. A throw
  // used to escape renderSite, losing the whole document — including every static
  // brick that never needed a runtime.
  const boom: RuntimeAdapter = { resolve: () => { throw new Error('host blew up'); } };
  let m = empty();
  for (const type of [...POWERED, 'hero', 'features']) m = applyOp(m, { op: 'addBlock', type }).manifest;

  const html = renderSite(m, { runtime: boom });
  assert.ok(html.startsWith('<!doctype html>') && html.includes('</html>'), 'still one complete document');
  assert.equal((html.match(/data-wl-inert="true"/g) ?? []).length, POWERED.length, 'every powered brick fell back to inert');
  assert.ok(html.includes('class="blk-hero"') && html.includes('class="blk-features"'), 'static bricks are untouched');
  assert.ok(!/undefined|\[object Object\]/.test(html), 'no host garbage leaked into the markup');
});

test('a malformed action from a host is treated as unwired', () => {
  // A host implements the adapter at runtime; the return type is not a promise.
  const shapes: RuntimeAdapter[] = [
    { resolve: () => ({}) as unknown as RuntimeAction },                       // no url
    { resolve: () => ({ url: 42 }) as unknown as RuntimeAction },              // url is not a string
    { resolve: () => undefined as unknown as RuntimeAction },                  // nothing at all
  ];
  for (const runtime of shapes) {
    const m = applyOp(empty(), { op: 'addBlock', type: 'contact-form' }).manifest;
    const html = renderSite(m, { runtime });
    assert.ok(html.includes('data-wl-inert="true"'), 'inert fallback, not a broken form');
    assert.ok(html.includes('action="#"'), 'no half-built action attribute');
  }
});

test('safeRuntime is reusable on its own, and a good adapter passes straight through', () => {
  const boom: RuntimeAdapter = { resolve: () => { throw new Error('nope'); } };
  assert.equal(safeRuntime(boom).resolve('contact.submit', 'b1'), null, 'throw → null (capability not provided)');

  const good = pathRuntime('/api');
  const direct = good.resolve('contact.submit', 'b1');
  assert.deepEqual(safeRuntime(good).resolve('contact.submit', 'b1'), direct, 'a working adapter is unchanged');
});
