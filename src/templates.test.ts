import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TEMPLATES, templateNames, templatesForVertical, getTemplate } from './templates.js';
import { validateManifest } from './validate.js';
import { renderSite } from './render.js';
import { verticalNames } from './verticals.js';
import { buildGenerationPrompt, generateSite, type ModelCall } from './generate.js';

// Templates are a public contract (a host renders them as starters; generation
// scaffolds from them), so these guard that every one stays valid + stable.

test('every template manifest passes validateManifest', () => {
  for (const t of Object.values(TEMPLATES)) {
    const v = validateManifest(t.manifest);
    assert.ok(v.ok, `template "${t.id}" is invalid: ${JSON.stringify(v.errors)}`);
  }
});

test('every template renders a complete, self-contained document', () => {
  for (const t of Object.values(TEMPLATES)) {
    const html = renderSite(t.manifest);
    assert.ok(html.startsWith('<!doctype html>') && html.includes('</html>'), `${t.id} must render a full doc`);
    assert.ok(html.length > 500, `${t.id} rendered suspiciously small`);
  }
});

test('template ids and accessors are consistent', () => {
  for (const id of templateNames()) {
    const t = getTemplate(id)!;
    assert.ok(t, `getTemplate(${id}) resolves`);
    assert.equal(t.id, id, `${id}: entry id matches its key`);
    assert.ok(t.label.length > 0, `${id}: has a label`);
  }
  assert.deepEqual(templateNames().sort(), Object.keys(TEMPLATES).sort());
});

test('every template belongs to a real vertical', () => {
  const verticals = new Set(verticalNames());
  for (const t of Object.values(TEMPLATES)) {
    assert.ok(verticals.has(t.vertical), `template "${t.id}" references unknown vertical "${t.vertical}"`);
  }
});

test('templatesForVertical groups correctly and covers every vertical (rollout step 1)', () => {
  for (const id of verticalNames()) {
    const list = templatesForVertical(id);
    for (const t of list) assert.equal(t.vertical, id);
    assert.ok(list.length >= 1, `vertical "${id}" has at least one starter template`);
  }
  assert.equal(templatesForVertical('does-not-exist').length, 0);
});

test('getTemplate returns undefined for an unknown id', () => {
  assert.equal(getTemplate('nope'), undefined);
});

// ── template-aware generation ───────────────────────────────────────────────────

test('buildGenerationPrompt seeds a template scaffold by id', () => {
  const { system } = buildGenerationPrompt('a taco truck', { template: 'restaurant-modern' });
  assert.match(system, /Starter scaffold/i, 'includes the scaffold header');
  assert.match(system, /REWRITE every headline/i, 'instructs a copy rewrite');
  assert.ok(system.includes('"services-catalogue"'), 'embeds the template block structure');
});

test('buildGenerationPrompt accepts a raw SiteManifest as the scaffold', () => {
  const { system } = buildGenerationPrompt('a studio', { template: getTemplate('tech-saas')!.manifest });
  assert.match(system, /Starter scaffold/i);
  assert.ok(system.includes('"hero-app"'), 'embeds the passed manifest structure');
});

test('an unknown template id falls back to blank-slate', () => {
  const plain = buildGenerationPrompt('x').system;
  const bogus = buildGenerationPrompt('x', { template: 'no-such-template' }).system;
  assert.equal(bogus, plain, 'unknown template seeds nothing');
});

test('blank-slate compose is unchanged when no template is given', () => {
  assert.ok(!/Starter scaffold/i.test(buildGenerationPrompt('a café').system));
});

test('generateSite drives a template scaffold end-to-end (mocked model)', async () => {
  let seen = '';
  const fakeModel: ModelCall = async ({ system }) => {
    seen = system;
    return JSON.stringify({ meta: { title: 'El Camino Tacos' }, blocks: [{ type: 'hero', config: { headline: 'Tacos, done right' } }] });
  };
  const r = await generateSite('a taco truck in Austin', fakeModel, { template: 'restaurant-modern' });
  assert.equal(r.ok, true);
  assert.match(seen, /Starter scaffold/i, 'the scaffold reached the model');
  assert.ok(renderSite(r.manifest).includes('El Camino Tacos'));
});
