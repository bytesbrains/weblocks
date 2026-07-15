# @bytesbrains/weblocks

[![npm](https://img.shields.io/npm/v/@bytesbrains/weblocks.svg)](https://www.npmjs.com/package/@bytesbrains/weblocks)
[![license](https://img.shields.io/npm/l/@bytesbrains/weblocks.svg)](./LICENSE)
[![node](https://img.shields.io/node/v/@bytesbrains/weblocks.svg)](https://nodejs.org)

**A block engine for AI-composable web apps.** An AI composes a `SiteManifest`
from a **fixed catalog of typed blocks** — its API contract — and the engine
**validates** it and **renders** it to one self-contained static HTML document.
Snap-together "Lego bricks" for web apps: shareable across repos, safe by
construction.

- **Closed vocabulary** — a block exists only if it's in the catalog; the AI can
  never invent markup or emit raw HTML.
- **Illegal states unrepresentable** — a bad edit is *rejected*, never applied.
- **Total renderer** — every field defaulted, all text escaped; it cannot throw,
  so a broken page is structurally impossible.
- **Provider- and host-neutral** — you inject the model call; the engine bundles
  no backend, no provider, no host.

Zero runtime dependencies, pure TypeScript, ESM. See
[`VISION.md`](./VISION.md) for the principles and
[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the internals.

```
SiteManifest (design tokens + ordered typed blocks)
     │   validateManifest()   ← strict gate for edit ops (reject invalid)
     ▼
  renderSite()                ← TOTAL: never throws → one self-contained HTML doc
     ▼
  static HTML  (+ island <script> only where a brick is interactive,
                + manifest.webmanifest / sw.js when the manifest opts into PWA)
```

## Install

```bash
npm install @bytesbrains/weblocks   # Node ≥ 20, ESM
```

## Quickstart

You bring a `callModel` function (any provider — you own the key). The engine
does the rest: brief → validated manifest → static HTML.

```ts
import { writeFileSync } from 'node:fs';
import { generateSite, renderSite } from '@bytesbrains/weblocks';

// Bring your own provider. `callModel` takes { system, user } and returns the
// model's text reply — wire it to any API you like.
const callModel = async ({ system, user }) => {
  const res = await fetch('https://api.your-provider.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.API_KEY}` },
    body: JSON.stringify({
      model: 'your-model',
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    }),
  });
  return (await res.json()).choices[0].message.content;
};

const { ok, manifest, warnings } = await generateSite('a Lisbon bakery landing page', callModel);
if (ok) writeFileSync('index.html', renderSite(manifest));   // done — self-contained HTML
```

`renderSite(manifest)` returns a complete `<!doctype html>…</html>` string with
the used bricks' CSS inlined. No build step, no framework runtime.

## The AI contract

The catalog is the *only* surface the model is told it may use. It ships with the
package in two forms:

- **`catalog.json`** — machine-readable JSON Schema per block (feed it to a model
  as its function-calling / structured-output reference).
- **`CATALOG.md`** — the same, human-readable. See [`CATALOG.md`](./CATALOG.md).

Or generate them at runtime:

```ts
import { catalog, catalogPrompt } from '@bytesbrains/weblocks';
import catalogJson from '@bytesbrains/weblocks/catalog.json' with { type: 'json' };

catalog();         // BlockCatalogEntry[] — { type, description, schema, runtime? }
catalogPrompt();   // a compact string for a system prompt
```

Validity never depends on the model being right: whatever it emits is
schema-validated and totally rendered. Swap or downgrade the model freely — the
worst case is a rejected edit, never a broken page.

## The block catalog

37 typed blocks across chrome, content, media, collections, and dynamic
capabilities. A sampling:

| group | blocks |
|---|---|
| chrome / app-shell | `nav` · `app-shell` · `sidebar` · `announcement-bar` · `footer` |
| heroes | `hero` · `hero-app` |
| content | `features` · `about` · `rich-text` · `split` · `steps` · `stats` · `services-catalogue` · `pricing` · `logos` · `team` |
| media | `gallery` · `carousel` · `video` · `map` |
| structured | `timeline` · `tabs` · `accordion` · `testimonials` · `faq` |
| collections | `blog-list` · `blog-post` · `feed` |
| dynamic (powered) | `contact-form` · `newsletter` · `auth` |
| conversion / rhythm | `cta` · `social-links` · `contact-details` · `divider` · `spacer` |

`rich-text` and `blog-post` carry **typed** content nodes (headings, paragraphs,
quotes, lists) — a safe freeform-content escape hatch that is never raw HTML. See
[`CATALOG.md`](./CATALOG.md) for every block's fields.

## Editing — surgical, validated ops

Editing is a set of validated verbs, not a regeneration. Drive them from natural
language (`editSite`) or directly:

```ts
import { applyOp, applyOps, editSite } from '@bytesbrains/weblocks';

// Natural language → validated ops → new versioned manifest:
const { manifest: edited, applied } = await editSite(manifest, 'go dark and add a gallery', callModel);

// Or emit ops directly (what a chat/inspector produces):
applyOp(manifest, { op: 'updateBlock', id: 'hero-1', config: { headline: 'New' } });

// Array-item ops edit ONE item without rewriting the block:
applyOp(manifest, { op: 'addItem',    id: 'features-1', field: 'items', item: { title: 'Fast' } });
applyOp(manifest, { op: 'updateItem', id: 'features-1', field: 'items', index: 0, patch: { text: 'Now faster' } });
```

Every op is validated before it applies; a bad op is a no-op (with errors), and
`version` bumps on each accepted edit — so undo/history/diff come for free.

## Theming

```ts
import { presetNames } from '@bytesbrains/weblocks';

applyOp(manifest, { op: 'applyPreset', name: 'midnight' });          // named token presets
applyOp(manifest, { op: 'setDesignTokens', patch: { radius: 'round' } });
applyOp(manifest, { op: 'setOverrides', id: 'cta-1', overrides: { primary: '#0af' } }); // per-section tint
presetNames();  // sand · midnight · forest · mono · candy · ocean
```

Every brick styles itself from the shared design tokens, so a single token edit
restyles the whole app coherently.

## Powered blocks & the runtime (host-neutral)

Blocks like `contact-form`, `newsletter`, and `auth` are *powered* — they need a
backend. The engine bundles none: a powered brick **declares** the capabilities
it needs, and your host wires them through a tiny adapter.

```ts
import { renderSite, pathRuntime, runtimeNeeds } from '@bytesbrains/weblocks';

runtimeNeeds(manifest);   // what a host must implement, e.g. [{ type:'contact-form', capabilities:['contact-form.submit'] }]

// Wire every capability to POST /api/<capability>/<blockId> in one line:
const html = renderSite(manifest, { runtime: pathRuntime('/api') });
```

With no runtime, powered bricks render inert-but-valid (a disabled control + a
note), keeping `data-wl-*` hooks so a host can enhance them client-side. Captcha,
server-side validation, delivery, abuse caps, and identity are the host's job.

## PWA

Add a `pwa` field and the engine derives an installable app shell:

```ts
import { renderSite, emitPwa } from '@bytesbrains/weblocks';

manifest.pwa = { name: 'My App', offline: true };
writeFileSync('index.html', renderSite(manifest));           // adds manifest + SW meta to <head>
const files = emitPwa(manifest);                             // { 'manifest.webmanifest', 'sw.js' }
for (const [name, body] of Object.entries(files ?? {})) writeFileSync(name, body);
```

## Local development

```bash
npm install          # dev deps only (typescript, @types/node)
npm run build        # tsc → lib/
npm test             # tsc + node --test (block DoD + engine invariants)
npm run example      # renders a sample → example-output.html (open in a browser)
npm run emit:catalog # regenerate catalog.json + CATALOG.md from code
```

Drive it end-to-end with a real model (dev harness — provider is env, not code;
bring your own key):

```bash
PROVIDER=openai    OPENAI_API_KEY=sk-…    npm run ai -- generate "a Lisbon bakery landing page"
PROVIDER=anthropic ANTHROPIC_API_KEY=sk-… npm run ai -- generate "…"
#  → ai-manifest.json + ai-output.html
PROVIDER=openai    OPENAI_API_KEY=sk-…    npm run ai -- edit "make it dark, add a gallery"
```

Providers are wire-format adapters (openai-compatible · anthropic · gemini);
switching provider/model is configuration. The published engine has **no**
provider dependency — it takes an injected `callModel`.

## Adding a block

Register a `BlockSpec` (`type` + `schema` + `css` + `render`) in `registry.ts`.
It must clear the **brick definition-of-done**: a typed schema (no raw-HTML
field), consumes shared tokens, renders totally (defaults + escaping, never
throws), valid regardless of neighbours. See
[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md#adding-a-block-concretely).

## License

MIT © bytesbrains
