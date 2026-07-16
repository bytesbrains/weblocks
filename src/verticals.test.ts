import { test } from 'node:test';
import assert from 'node:assert/strict';
import { VERTICALS, verticalNames, getVertical } from './verticals.js';
import { blockTypes } from './registry.js';
import { presetNames } from './presets.js';
import { buildGenerationPrompt } from './generate.js';

// The taxonomy is a public contract (hosts persist ids; generation seeds from
// it), so these guard that every vertical stays implementable + stable.

test('verticalNames() lists every vertical, keyed by its own id', () => {
  const names = verticalNames();
  assert.ok(names.length >= 16, `expected ≥16 verticals, got ${names.length}`);
  for (const id of names) {
    const v = getVertical(id)!;
    assert.ok(v, `getVertical(${id}) resolves`);
    assert.equal(v.id, id, `${id}: entry id matches its key`);
  }
});

test('every vertical is fully specified and stable (has "other" fallback)', () => {
  assert.ok(getVertical('other'), 'an "other" fallback vertical exists');
  for (const id of verticalNames()) {
    const v = getVertical(id)!;
    assert.ok(v.label.length > 0, `${id}: has a label`);
    assert.ok(v.icon.length > 0, `${id}: has an icon`);
    assert.ok(v.tone.length > 0, `${id}: has a tone`);
    assert.ok(v.blocks.length > 0, `${id}: recommends at least one block`);
  }
});

test('every recommended block is a real catalog type', () => {
  const known = new Set(blockTypes());
  for (const id of verticalNames()) {
    for (const type of getVertical(id)!.blocks) {
      assert.ok(known.has(type), `vertical "${id}" recommends unknown block "${type}"`);
    }
  }
});

test('every vertical preset is a real preset name', () => {
  const known = new Set(presetNames());
  for (const id of verticalNames()) {
    assert.ok(known.has(getVertical(id)!.preset), `vertical "${id}" uses unknown preset "${getVertical(id)!.preset}"`);
  }
});

test('getVertical() returns undefined for an unknown id', () => {
  assert.equal(getVertical('does-not-exist'), undefined);
});

// ── generation seeding ──────────────────────────────────────────────────────────

test('buildGenerationPrompt seeds recommended sections + preset for a vertical', () => {
  const v = getVertical('restaurant')!;
  const { system } = buildGenerationPrompt('a café in Bristol', { vertical: 'restaurant' });
  assert.ok(system.includes(v.label), 'names the vertical');
  assert.ok(system.includes(v.blocks.join(', ')), 'lists the recommended sections in order');
  assert.ok(system.includes(`"${v.preset}" preset`), 'seeds the fitting preset');
});

test('a booking vertical injects a booking-oriented CTA hint', () => {
  const { system } = buildGenerationPrompt('a hair salon', { vertical: 'salon' });
  assert.match(system, /booking-driven/i);
});

test('blank-slate prompt is unchanged when no vertical is given', () => {
  const plain = buildGenerationPrompt('a café').system;
  assert.ok(!/Business vertical:/.test(plain), 'no vertical guidance without a vertical');
});

test('an unknown vertical id is ignored (falls back to blank-slate)', () => {
  const plain = buildGenerationPrompt('x').system;
  const bogus = buildGenerationPrompt('x', { vertical: 'nope' }).system;
  assert.equal(bogus, plain, 'unknown vertical seeds nothing');
});

// Keep VERTICALS immutable-by-intent: exported record is the single source.
test('VERTICALS is the source of truth verticalNames() reflects', () => {
  assert.deepEqual(verticalNames().sort(), Object.keys(VERTICALS).sort());
});
