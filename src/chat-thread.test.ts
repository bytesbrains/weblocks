import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getSpec } from './registry.js';
import { parse } from './schema.js';
import { DEFAULT_TOKENS } from './tokens.js';
import { NOOP_RUNTIME } from './runtime.js';
import { buildAnchors } from './anchors.js';
import { validateManifest } from './validate.js';
import { renderSite } from './render.js';
import type { SiteManifest } from './types.js';

// The decisions recorded on weblocks#58 are load-bearing, not cosmetic: each one
// is a promise about what the markup does. These pin them so a later tweak has
// to be deliberate.

const spec = getSpec('chat-thread')!;

function render(config: Record<string, unknown>): string {
  const { value } = parse(spec.schema, config);
  return spec.render(value, DEFAULT_TOKENS, { id: 'chat', runtime: NOOP_RUNTIME });
}

const people = [
  { id: 'u', name: 'Priya Raman', role: 'user' },
  { id: 'b', name: 'Assistant', role: 'bot' },
];

test('a quick reply without an href renders inert, with an href renders a link', () => {
  const html = render({
    participants: people,
    messages: [{ from: 'b', body: [{ kind: 'buttons', items: [{ label: 'No link' }, { label: 'Real', href: '#x' }] }] }],
  });
  assert.match(html, /<span class="reply">No link<\/span>/, 'a chip that goes nowhere must not look clickable');
  assert.match(html, /<a class="reply" href="#x">Real<\/a>/);
});

test('only the user side flips — bot and agent stay on the same side', () => {
  const html = render({
    participants: [...people, { id: 'a', name: 'Sam Ito', role: 'agent' }],
    messages: [
      { from: 'u', body: [{ kind: 'text', text: 'hi' }] },
      { from: 'b', body: [{ kind: 'text', text: 'hello' }] },
      { from: 'a', body: [{ kind: 'text', text: 'taking over' }] },
    ],
  });
  assert.equal((html.match(/<li class="self">/g) ?? []).length, 1, 'only the visitor sits right');
  assert.equal((html.match(/<li class="other">/g) ?? []).length, 2, 'bot and agent share a side');
});

test('speaker identity never rests on colour alone — every turn names its speaker', () => {
  const html = render({ participants: people, messages: [{ from: 'b', body: [{ kind: 'text', text: 'hi' }] }] });
  assert.match(html, /<span class="name">Assistant<\/span>/);
});

test('avatar defaults to initials, and a supplied url wins', () => {
  const initials = render({ participants: people, messages: [{ from: 'u', body: [{ kind: 'text', text: 'x' }] }] });
  assert.match(initials, /<span class="who" aria-hidden="true">PR<\/span>/, 'zero-network default');

  const withUrl = render({
    participants: [{ id: 'u', name: 'Priya Raman', role: 'user', avatar: 'https://example.com/a.png' }],
    messages: [{ from: 'u', body: [{ kind: 'text', text: 'x' }] }],
  });
  assert.match(withUrl, /<img src="https:\/\/example\.com\/a\.png" alt="" loading="lazy">/);
});

test('times are plain labels, never a <time> element with an unvalidatable value', () => {
  const html = render({
    participants: people,
    messages: [{ from: 'b', time: 'Tuesday 9am', body: [{ kind: 'text', text: 'x' }] }],
  });
  assert.match(html, /<span class="time">Tuesday 9am<\/span>/);
  assert.doesNotMatch(html, /<time/, 'a wrong datetime is worse than no datetime');
});

test('a message from an unknown participant is skipped, not guessed', () => {
  const html = render({
    participants: people,
    messages: [
      { from: 'ghost', body: [{ kind: 'text', text: 'should vanish' }] },
      { from: 'b', body: [{ kind: 'text', text: 'kept' }] },
    ],
  });
  assert.doesNotMatch(html, /should vanish/);
  assert.match(html, /kept/);
});

test('an empty bubble is dropped rather than rendered as a hollow shell', () => {
  const html = render({
    participants: people,
    messages: [{ from: 'b', body: [{ kind: 'text', text: '' }] }, { from: 'u', body: [{ kind: 'text', text: 'real' }] }],
  });
  assert.equal((html.match(/<li class=/g) ?? []).length, 1);
});

test('every node kind escapes its content', () => {
  const evil = '<img src=x onerror=alert(1)>';
  const html = render({
    participants: people,
    messages: [{
      from: 'b',
      body: [
        { kind: 'text', text: evil },
        { kind: 'code', text: evil, lang: '"onload="' },
        { kind: 'image', src: 'https://e.com/"onerror="x', alt: evil, text: evil },
        { kind: 'list', items: [{ label: evil }] },
        { kind: 'buttons', items: [{ label: evil, href: 'javascript:alert(1)"' }] },
      ],
    }],
  });
  // The payload must survive only as inert text: escaped angle brackets and
  // quotes, never as markup or an attribute delimiter.
  assert.doesNotMatch(html, /<img src=x/, 'no node kind emits attacker markup');
  assert.doesNotMatch(html, /class="lang-"onload="/, 'no attribute breakout');
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/, 'the payload survives as escaped text');
});

test('dangerous URL schemes are neutralised, not merely escaped', () => {
  const html = render({
    participants: [{ id: 'b', name: 'A', role: 'bot', avatar: 'javascript:alert(1)' }],
    messages: [{ from: 'b', body: [
      { kind: 'image', src: 'javascript:alert(1)' },
      { kind: 'buttons', items: [{ label: 'Tap', href: 'javascript:alert(1)' }] },
    ] }],
  });
  // escapeAttr neutralises the delimiters; only sanitizeUrl neutralises the scheme.
  assert.doesNotMatch(html, /javascript:/, 'a javascript: target must collapse to #');
  assert.match(html, /<a class="reply" href="#">Tap<\/a>/);
});

test('safe URL schemes still pass through untouched', () => {
  const html = render({
    participants: [{ id: 'b', name: 'A', role: 'bot' }],
    messages: [{ from: 'b', body: [{ kind: 'buttons', items: [
      { label: 'Mail', href: 'mailto:a@b.com' },
      { label: 'Anchor', href: '#book' },
    ] }] }],
  });
  assert.match(html, /href="mailto:a@b\.com"/);
  assert.match(html, /href="#book"/);
});

test('body nodes compose in order inside one bubble', () => {
  const html = render({
    participants: people,
    messages: [{ from: 'b', body: [
      { kind: 'text', text: 'Here:' },
      { kind: 'code', text: 'npm i' },
      { kind: 'buttons', items: [{ label: 'Docs', href: '#d' }] },
    ] }],
  });
  const bubble = html.slice(html.indexOf('<div class="bubble">'), html.indexOf('</li>'));
  assert.ok(
    bubble.indexOf('Here:') < bubble.indexOf('npm i') && bubble.indexOf('npm i') < bubble.indexOf('Docs'),
    'a bubble keeps authored node order',
  );
});

test('the thread is a real ordered list of turns', () => {
  const html = render({ participants: people, messages: [{ from: 'b', body: [{ kind: 'text', text: 'x' }] }] });
  assert.match(html, /<ol>[\s\S]*<li class=/, 'turns are list items, not styled divs');
});

test('chat-thread gets a clean anchor slug so nav links read as #chat', () => {
  const anchors = buildAnchors([
    { id: 'hero', type: 'hero', visible: true, config: {} },
    { id: 'talk', type: 'chat-thread', visible: true, config: {} },
  ]);
  assert.equal(anchors.idFor.get('talk'), 'chat', 'not the raw type name');
  assert.equal(anchors.resolve('#conversation'), '#chat', 'a nav label alias resolves too');
});

test('an empty participant id is a validation error, not silent data loss', () => {
  // Reported on PR #59: `required` only means "present", so `id: ''` passed
  // validation, the participant was skipped, and every message referencing it
  // vanished from a manifest reporting ok:true with no warnings.
  const manifest = {
    meta: { title: 't', description: '', lang: 'en' },
    blocks: [{ id: 'c', type: 'chat-thread', visible: true, config: {
      participants: [{ id: '', name: 'Ghost', role: 'bot' }],
      messages: [{ from: '', body: [{ kind: 'text', text: 'must not vanish silently' }] }],
    } }],
    version: 1,
  } as unknown as SiteManifest;

  const v = validateManifest(manifest);
  assert.equal(v.ok, false, 'the manifest must not report clean');
  assert.ok(v.errors.some((e) => /participants\[0\]\.id: must be at least 1 character/.test(e)));
  assert.ok(v.errors.some((e) => /messages\[0\]\.from: must be at least 1 character/.test(e)));

  // …and the renderer still stays total: an invalid manifest degrades, never throws.
  assert.doesNotThrow(() => renderSite(manifest));
});
