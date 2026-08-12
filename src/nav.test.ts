/**
 * `nav` brand lockup — the three shapes (text / logo / both), the opt-in
 * placeholder, and the degradation paths that keep a broken or hostile logo
 * URL from reaching the document.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getSpec } from './registry.js';
import { parse } from './schema.js';
import { DEFAULT_TOKENS } from './tokens.js';

const spec = getSpec('nav')!;

/** Render through the schema, the way the engine does — defaults and all. */
function html(config: Record<string, unknown>): string {
  const { value } = parse(spec.schema, config);
  return spec.render(value, DEFAULT_TOKENS);
}

test('brand only — the historic shape, unchanged', () => {
  const out = html({ brand: 'Acme' });
  assert.ok(out.includes('<span class="name">Acme</span>'), 'wordmark renders');
  assert.ok(!out.includes('<img'), 'no image without a logo');
});

test('a nav with no logo key renders byte-identically to before', () => {
  // The whole no-regression promise: an existing manifest must not gain a mark.
  const before = html({ brand: 'Acme', links: [{ label: 'Docs', href: '#docs' }] });
  assert.ok(!before.includes('<img'), 'no logo may appear uninvited');
  assert.ok(!before.includes('data:image/svg+xml'), 'placeholder must not leak in');
});

test('logo + brand — mark beside the wordmark, image decorative', () => {
  const out = html({ brand: 'Acme', logo: { src: 'https://cdn.test/logo.svg' } });
  assert.ok(out.includes('src="https://cdn.test/logo.svg"'), 'logo renders');
  assert.ok(out.includes('<span class="name">Acme</span>'), 'wordmark still renders');
  assert.ok(out.includes('alt=""') && out.includes('aria-hidden="true"'),
    'beside a visible wordmark the image must not be announced twice');
});

test('logo only — mark carries the accessible name', () => {
  const out = html({ brand: '', logo: { src: 'https://cdn.test/logo.svg', alt: 'Acme' } });
  assert.ok(!out.includes('<span class="name">'), 'no wordmark');
  assert.ok(out.includes('alt="Acme"'), 'alt names the site when the mark stands alone');
  assert.ok(!out.includes('aria-hidden'), 'the only brand element must stay in the a11y tree');
});

test('logo only with no alt still leaves the link a name', () => {
  const out = html({ brand: '', logo: { src: 'https://cdn.test/logo.svg' } });
  assert.ok(out.includes('alt="Home"'), 'falls back rather than shipping an unnamed link');
});

test('height is honoured and clamped to the schema range', () => {
  assert.ok(html({ logo: { src: 'https://cdn.test/l.svg', height: 40 } }).includes('style="height:40px"'));
  // Out of range is a hard error but still renders totally, at the clamped value.
  assert.ok(html({ logo: { src: 'https://cdn.test/l.svg', height: 900 } }).includes('style="height:64px"'));
});

test('a non-numeric height cannot break out of the style attribute', () => {
  // Belt-and-braces: render is only ever called with parsed config, but this is
  // the one value not passed through an escaper.
  const spec2 = getSpec('nav')!;
  const out = spec2.render(
    { brand: '', logo: { src: 'https://cdn.test/l.svg', alt: 'A', height: '1px"><script>alert(1)</script>' }, sticky: false, links: [], cta: { label: '', href: '#' } },
    DEFAULT_TOKENS,
  );
  assert.ok(!out.includes('<script>'), 'no injected markup');
  assert.ok(/style="height:\d+px"/.test(out), 'height falls back to a plain number');
});

test('an unsafe logo src degrades to the wordmark, never a broken image', () => {
  const out = html({ brand: 'Acme', logo: { src: 'javascript:alert(1)' } });
  assert.ok(!out.includes('<img'), 'the image is dropped');
  assert.ok(!out.includes('javascript:'), 'the scheme never reaches the document');
  assert.ok(out.includes('<span class="name">Acme</span>'), 'the header still has a brand');
});

test('markup injected through logo fields is escaped', () => {
  const out = html({ brand: '', logo: { src: 'https://cdn.test/l.svg', alt: '"><script>alert(1)</script>' } });
  assert.ok(!out.includes('<script>'), 'no raw script tag');
  assert.ok(out.includes('&lt;script&gt;'));
});

test('placeholder is opt-in only', () => {
  const off = html({ brand: 'Acme', logo: { src: '' } });
  assert.ok(!off.includes('data:image/svg+xml'), 'absent by default');

  const on = html({ brand: 'Acme', logo: { placeholder: true } });
  assert.ok(on.includes('src="data:image/svg+xml,'), 'opted in, the weblocks mark stands in');
});

test('a real src always wins over the placeholder', () => {
  const out = html({ logo: { src: 'https://cdn.test/real.svg', placeholder: true } });
  assert.ok(out.includes('https://cdn.test/real.svg'));
  assert.ok(!out.includes('data:image/svg+xml'), 'placeholder yields to real artwork');
});

test('placeholder covers an unusable src too', () => {
  const out = html({ logo: { src: 'javascript:alert(1)', placeholder: true } });
  assert.ok(out.includes('src="data:image/svg+xml,'), 'falls back rather than dropping the mark');
  assert.ok(!out.includes('javascript:'));
});

test('the placeholder data URI is attribute-safe', () => {
  const out = html({ logo: { placeholder: true } });
  // percent-encoded, so no raw quotes/angle brackets can close the attribute
  assert.ok(!/src="data:image\/svg\+xml,[^"]*[<>]/.test(out), 'no raw markup chars in the attribute');
});

test('brand and logo both empty — no anchor rather than an unnamed link', () => {
  const out = html({ brand: '', logo: { src: '' } });
  assert.ok(!out.includes('class="brand"'), 'an empty link with no name is worse than none');
  assert.ok(out.includes('<nav class="blk-nav"'), 'the landmark survives');
});

test('the lockup does not disturb links or the cta', () => {
  const out = html({
    brand: 'Acme',
    logo: { src: 'https://cdn.test/l.svg' },
    links: [{ label: 'Docs', href: '#docs' }],
    cta: { label: 'Start', href: '#start' },
  });
  assert.ok(out.includes('>Docs</a>'));
  assert.ok(out.includes('class="cta"') && out.includes('>Start</a>'));
});
