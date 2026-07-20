import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse, escapeHtml, sanitizeUrl, type Schema } from './schema.js';

const S: Schema = {
  name: { kind: 'string', required: true, default: 'x', max: 5 },
  size: { kind: 'enum', values: ['s', 'm', 'l'], default: 'm' },
  on: { kind: 'boolean', default: true },
  cols: { kind: 'int', oneOf: [2, 3, 4], default: 3 },
  items: { kind: 'array', max: 2, of: { kind: 'object', fields: { v: { kind: 'string', required: true, default: '' } } } },
};

test('parse applies defaults for every field (total)', () => {
  const r = parse(S, {});
  assert.equal(r.value.name, 'x');
  assert.equal(r.value.size, 'm');
  assert.equal(r.value.on, true);
  assert.equal(r.value.cols, 3);
  assert.deepEqual(r.value.items, []);
});

test('missing required is a WARNING, not a hard error (renders with default)', () => {
  const r = parse({ name: { kind: 'string', required: true, default: 'fallback' } }, {});
  assert.equal(r.ok, true); // soft — the op is still applicable
  assert.match(r.warnings[0]!, /name: missing/);
  assert.equal(r.value.name, 'fallback'); // renderer can still consume it
});

test('invalid enum / int are HARD-rejected and coerced to the default', () => {
  const r = parse(S, { size: 'xl', cols: 7 });
  assert.equal(r.ok, false);
  assert.equal(r.value.size, 'm');
  assert.equal(r.value.cols, 3);
});

test('string max truncates and warns (soft)', () => {
  const r = parse(S, { name: 'toolongname' });
  assert.equal(r.ok, true);
  assert.match(r.warnings[0]!, /truncated/);
  assert.equal(r.value.name, 'toolo');
});

test('array respects max and validates nested objects', () => {
  const r = parse(S, { items: [{ v: 'a' }, {}, { v: 'c' }] });
  assert.equal((r.value.items as unknown[]).length, 2); // truncated to max 2
  assert.equal(r.ok, true); // item[1].v missing is a warning, truncation is a warning
  assert.ok(r.warnings.some((w) => /items\[1\]\.v: missing/.test(w)));
});

test('wrong root type falls back to an empty object, not a throw', () => {
  const r = parse(S, 'not-an-object');
  assert.equal(r.value.name, 'x');
});

test('escapeHtml neutralizes injection', () => {
  assert.equal(escapeHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
  assert.equal(escapeHtml(null), '');
});

test('sanitizeUrl passes safe schemes + relative URLs through', () => {
  for (const u of ['https://x.com/y', 'http://x.com', 'mailto:a@b.com', 'tel:+15550142', '/shop', '#section', 'products/1', '']) {
    const out = sanitizeUrl(u);
    assert.ok(out === (u || '#'), `${u} → ${out}`);
  }
});

test('sanitizeUrl collapses dangerous schemes to #', () => {
  assert.equal(sanitizeUrl('javascript:alert(1)'), '#');
  assert.equal(sanitizeUrl('  JavaScript:alert(1)'), '#'); // trimmed + case-insensitive
  assert.equal(sanitizeUrl('data:text/html,<script>1</script>'), '#');
  assert.equal(sanitizeUrl('vbscript:msgbox(1)'), '#');
  // whitespace-obfuscated scheme (browsers ignore the newline) must still be caught
  assert.equal(sanitizeUrl('java\nscript:alert(1)'), '#');
  assert.equal(sanitizeUrl(null), '#');
});

test('string min is a hard error — a too-short value cannot be repaired', () => {
  // Unlike max (truncate + warn), there is no sensible fallback for a value
  // that is too short, so it must surface rather than degrade silently.
  const r = parse({ id: { kind: 'string', required: true, default: '', min: 1, max: 10 } }, { id: '' });
  assert.ok(r.errors.some((e) => /id: must be at least 1 character/.test(e)));
  assert.equal((r.value as { id: string }).id, '', 'the raw value is preserved for the caller to handle');
});

test('string min leaves acceptable values untouched', () => {
  const r = parse({ id: { kind: 'string', min: 2, max: 10 } }, { id: 'ok' });
  assert.deepEqual(r.errors, []);
  assert.equal((r.value as { id: string }).id, 'ok');
});
