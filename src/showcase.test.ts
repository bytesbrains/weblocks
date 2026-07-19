import { test } from 'node:test';
import assert from 'node:assert/strict';
import { showcaseBlocks, showcaseManifest } from './showcase.js';
import { blockTypes, getSpec } from './registry.js';
import { validateManifest } from './validate.js';
import { renderSite } from './render.js';
import type { SiteManifest } from './types.js';

// The published block wall is generated from these, so the guard that matters
// is coverage: register a brick without giving it demo config and CI fails here
// rather than the site quietly shipping with a hole in it.

test('every registered block type has showcase config', () => {
  const covered = new Set(showcaseBlocks().map((e) => e.type));
  const missing = blockTypes().filter((t) => !covered.has(t));
  assert.deepEqual(
    missing, [],
    `missing showcase config — add to SUPPLEMENT in src/showcase.ts (or place it in a template): ${missing.join(', ')}`,
  );
});

test('every showcase entry is a valid one-block manifest', () => {
  for (const e of showcaseBlocks()) {
    const v = validateManifest(showcaseManifest(e) as unknown as SiteManifest);
    assert.ok(v.ok, `showcase "${e.type}" is invalid: ${JSON.stringify(v.errors)}`);
  }
});

test('every showcase entry renders a complete document with visible markup', () => {
  for (const e of showcaseBlocks()) {
    const html = renderSite(showcaseManifest(e) as unknown as SiteManifest);
    assert.ok(html.startsWith('<!doctype html>') && html.includes('</html>'), `${e.type} must render a full doc`);
    // Guard against demo config that parses but renders an empty shell — the
    // whole point of the wall is that a reader sees the brick.
    const body = html.slice(html.indexOf('<body'), html.indexOf('</body>'));
    assert.match(body, /class="blk-[a-z-]+/, `${e.type} rendered no brick markup — check its config`);
    // Content bricks that render an empty shell are the real risk — demo config
    // that parses but supplies no items. Purely decorative bricks (divider,
    // spacer) mark themselves `aria-hidden` and are minimal by design, so the
    // size floor only applies to bricks that claim to carry content.
    if (!body.includes('aria-hidden="true"')) {
      assert.ok(body.length > 150, `${e.type} rendered an empty-looking body (${body.length} bytes) — check its config`);
    }
  }
});

test('showcase metadata matches the registry', () => {
  for (const e of showcaseBlocks()) {
    const spec = getSpec(e.type)!;
    assert.equal(e.island, spec.island ?? null, `${e.type}: island label must match the registry`);
    assert.equal(e.description, spec.description ?? '', `${e.type}: description must come from the registry`);
  }
});
