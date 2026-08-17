/**
 * The `nav` / `footer` brand lockup — the three shapes (text / logo / both),
 * the opt-in placeholder, and the degradation paths that keep a broken or
 * hostile logo URL out of the document.
 *
 * The first suite is the important one: the lockup is additive, so a brick with
 * no logo must render byte-for-byte what it rendered before the feature
 * existed. Those expectations are not derived from this branch — they were
 * captured by running `main` and pasted in verbatim, so the test fails if the
 * output drifts rather than quietly re-baselining.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getSpec } from './registry.js';
import { parse } from './schema.js';
import { DEFAULT_TOKENS } from './tokens.js';

const navSpec = getSpec('nav')!;
const footerSpec = getSpec('footer')!;

/** Render through the schema, the way the engine does — defaults and all. */
function render(spec: typeof navSpec, config: Record<string, unknown>): string {
  return spec.render(parse(spec.schema, config).value, DEFAULT_TOKENS);
}
const nav = (c: Record<string, unknown> = {}) => render(navSpec, c);
const footer = (c: Record<string, unknown> = {}) => render(footerSpec, c);

// ── No regression: output captured from `main`, before the lockup existed ─────

test('nav with no logo is byte-identical to the pre-lockup render', () => {
  assert.equal(
    nav(),
    '<nav class="blk-nav" data-sticky="false" aria-label="Primary">\n  <div class="wrap">\n    <a class="brand" href="#">Brand</a>\n    <div class="links"></div>\n  </div>\n</nav>',
  );
  assert.equal(
    nav({ brand: 'Acme', links: [{ label: 'Docs', href: '#d' }, { label: 'Pricing', href: '#p' }], cta: { label: 'Start', href: '#s' }, sticky: true }),
    '<nav class="blk-nav" data-sticky="true" aria-label="Primary">\n  <div class="wrap">\n    <a class="brand" href="#">Acme</a>\n    <div class="links"><a href="#d">Docs</a><a href="#p">Pricing</a><a class="cta" href="#s">Start</a></div>\n  </div>\n</nav>',
  );
});

test('footer with no logo is byte-identical to the pre-lockup render', () => {
  assert.equal(
    footer(),
    '<footer class="blk-footer">\n  <div class="wrap">\n    <div></div>\n    \n    \n  </div>\n</footer>',
  );
  assert.equal(
    footer({ brand: 'Acme', tagline: 'Bread daily.', links: [{ label: 'Terms', href: '#t' }], copyright: '© 2026 Acme' }),
    '<footer class="blk-footer">\n  <div class="wrap">\n    <div><div class="brand">Acme</div><p class="tagline">Bread daily.</p></div>\n    <nav class="links" aria-label="Footer"><a href="#t">Terms</a></nav>\n    <div class="copy">© 2026 Acme</div>\n  </div>\n</footer>',
  );
});

test('the pre-lockup .brand CSS rule survives verbatim — sizing is additive only', () => {
  // A stylesheet overriding `.blk-nav .brand` must not find the box changed
  // under it, so the lockup confines itself to a `.has-logo` modifier.
  assert.ok(navSpec.css!.includes('.blk-nav .brand{font-weight:800;font-size:var(--fs-lg);color:var(--text);text-decoration:none}'));
  assert.ok(footerSpec.css!.includes('.blk-footer .brand{font-weight:800;font-size:var(--fs-lg);color:var(--surface)}'));
  for (const spec of [navSpec, footerSpec]) {
    assert.ok(spec.css!.includes('.brand.has-logo{display:inline-flex'), 'flex is scoped to the modifier');
  }
});

test('a text-only brand carries no lockup scaffolding', () => {
  const out = nav({ brand: 'Acme' });
  assert.ok(!out.includes('has-logo'), 'no modifier class without an image');
  assert.ok(!out.includes('<span class="name">'), 'no wrapper span without an image');
  assert.ok(!out.includes('data:image/svg+xml'), 'the placeholder must not leak in uninvited');
});

// ── nav: the three shapes ─────────────────────────────────────────────────────

test('nav logo + brand — mark beside the wordmark, image decorative', () => {
  const out = nav({ brand: 'Acme', logo: { src: 'https://cdn.test/logo.svg' } });
  assert.ok(out.includes('src="https://cdn.test/logo.svg"'), 'logo renders');
  assert.ok(out.includes('<span class="name">Acme</span>'), 'wordmark still renders');
  assert.ok(out.includes('class="brand has-logo"'), 'lockup layout is switched on');
  assert.ok(out.includes('alt=""') && out.includes('aria-hidden="true"'),
    'beside a visible wordmark the image must not be announced twice');
});

test('nav logo only — the mark carries the accessible name', () => {
  const out = nav({ brand: '', logo: { src: 'https://cdn.test/logo.svg', alt: 'Acme' } });
  assert.ok(!out.includes('<span class="name">'), 'no wordmark');
  assert.ok(out.includes('alt="Acme"'), 'alt names the site when the mark stands alone');
  assert.ok(!out.includes('aria-hidden'), 'the only brand element must stay in the a11y tree');
});

test('nav logo only with no alt still leaves the link a name', () => {
  // The header lockup is an anchor — an unnamed link is a real a11y failure.
  assert.ok(nav({ brand: '', logo: { src: 'https://cdn.test/l.svg' } }).includes('alt="Home"'));
});

test('nav brand and logo both empty — no anchor rather than an unnamed link', () => {
  const out = nav({ brand: '', logo: { src: '' } });
  assert.ok(!out.includes('class="brand"'), 'an empty link with no name is worse than none');
  assert.ok(out.includes('<nav class="blk-nav"'), 'the landmark survives');
});

test('the lockup does not disturb links or the cta', () => {
  const out = nav({
    brand: 'Acme',
    logo: { src: 'https://cdn.test/l.svg' },
    links: [{ label: 'Docs', href: '#docs' }],
    cta: { label: 'Start', href: '#start' },
  });
  assert.ok(out.includes('>Docs</a>'));
  assert.ok(out.includes('class="cta"') && out.includes('>Start</a>'));
});

// ── footer: the same lockup, with its own a11y rules ─────────────────────────

test('footer logo + brand, and logo standing alone', () => {
  const both = footer({ brand: 'Acme', logo: { src: 'https://cdn.test/l.svg' } });
  assert.ok(both.includes('class="brand has-logo"') && both.includes('<span class="name">Acme</span>'));
  assert.ok(both.includes('alt=""'), 'decorative beside the wordmark');

  const alone = footer({ brand: '', logo: { src: 'https://cdn.test/l.svg', alt: 'Acme' } });
  assert.ok(alone.includes('alt="Acme"') && !alone.includes('<span class="name">'));
});

test('a footer mark with no alt and no wordmark is decorative, not invented', () => {
  // Unlike nav this is not a link, so there is no name to fabricate.
  const out = footer({ brand: '', logo: { src: 'https://cdn.test/l.svg' } });
  assert.ok(out.includes('alt=""') && out.includes('aria-hidden="true"'));
  assert.ok(!out.includes('alt="Home"'), 'the header fallback must not leak into the footer');
});

test('footer tagline and copyright still render alongside a logo', () => {
  const out = footer({ brand: 'Acme', logo: { src: 'https://cdn.test/l.svg' }, tagline: 'Bread daily.', copyright: '© 2026' });
  assert.ok(out.includes('<p class="tagline">Bread daily.</p>'));
  assert.ok(out.includes('<div class="copy">© 2026</div>'));
});

// ── Shared: safety, sizing, placeholder ──────────────────────────────────────

for (const [name, block] of [['nav', nav], ['footer', footer]] as const) {
  test(`${name}: an unsafe logo src degrades to the wordmark, never a broken image`, () => {
    const out = block({ brand: 'Acme', logo: { src: 'javascript:alert(1)' } });
    assert.ok(!out.includes('<img'), 'the image is dropped');
    assert.ok(!out.includes('javascript:'), 'the scheme never reaches the document');
    assert.ok(out.includes('Acme'), 'the brand still shows');
  });

  test(`${name}: markup injected through logo fields is escaped`, () => {
    const out = block({ brand: '', logo: { src: 'https://cdn.test/l.svg', alt: '"><script>alert(1)</script>' } });
    assert.ok(!out.includes('<script>'), 'no raw script tag');
    assert.ok(out.includes('&lt;script&gt;'));
  });

  test(`${name}: placeholder is opt-in only, and yields to real artwork`, () => {
    assert.ok(!block({ brand: 'Acme', logo: { src: '' } }).includes('data:image/svg+xml'), 'absent by default');
    assert.ok(block({ brand: 'Acme', logo: { placeholder: true } }).includes('src="data:image/svg+xml,'), 'opted in');

    const real = block({ logo: { src: 'https://cdn.test/real.svg', placeholder: true } });
    assert.ok(real.includes('https://cdn.test/real.svg') && !real.includes('data:image/svg+xml'));
  });

  test(`${name}: placeholder covers an unusable src too`, () => {
    const out = block({ logo: { src: 'javascript:alert(1)', placeholder: true } });
    assert.ok(out.includes('src="data:image/svg+xml,'), 'falls back rather than dropping the mark');
    assert.ok(!out.includes('javascript:'));
  });

  test(`${name}: height is honoured, clamped, and cannot escape the style attribute`, () => {
    assert.ok(block({ logo: { src: 'https://cdn.test/l.svg', height: 40 } }).includes('style="height:40px"'));
    // Out of range is a hard schema error but still renders totally, clamped.
    assert.ok(block({ logo: { src: 'https://cdn.test/l.svg', height: 900 } }).includes('style="height:64px"'));

    // Belt-and-braces: render is only ever called with parsed config, but this
    // is the one value not passed through an escaper.
    const spec = name === 'nav' ? navSpec : footerSpec;
    const raw = spec.render(
      { brand: '', logo: { src: 'https://cdn.test/l.svg', alt: 'A', height: '1px"><script>alert(1)</script>' }, sticky: false, links: [], cta: { label: '', href: '#' } },
      DEFAULT_TOKENS,
    );
    assert.ok(!raw.includes('<script>'), 'no injected markup');
    assert.ok(/style="height:\d+px"/.test(raw), 'height falls back to a plain number');
  });
}

test('the placeholder data URI is attribute-safe', () => {
  const out = nav({ logo: { placeholder: true } });
  // percent-encoded, so no raw quotes/angle brackets can close the attribute
  assert.ok(!/src="data:image\/svg\+xml,[^"]*[<>]/.test(out), 'no raw markup chars in the attribute');
});

test('app-shell is deliberately excluded from the lockup', () => {
  // Its `brand` is display:none — it exists only to name the tab bar via
  // aria-label, so an image there would render nothing.
  const shell = getSpec('app-shell')!;
  assert.ok(!('logo' in shell.schema), 'app-shell must not grow a logo field');
  assert.ok(shell.css!.includes('.blk-app-shell .brand{display:none}'), 'the reason it is excluded');
});
