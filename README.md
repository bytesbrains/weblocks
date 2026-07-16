<div align="center">

# @bytesbrains/weblocks

**The block engine for AI-composable web apps.**

An AI composes a `SiteManifest` from a fixed catalog of typed blocks — its entire
API surface — and the engine validates it and renders one self-contained static
HTML document. Snap-together “Lego bricks” for web apps: safe by construction,
provider- and host-neutral, zero runtime dependencies.

[![npm](https://img.shields.io/npm/v/@bytesbrains/weblocks.svg)](https://www.npmjs.com/package/@bytesbrains/weblocks)
[![license: MIT](https://img.shields.io/npm/l/@bytesbrains/weblocks.svg)](./LICENSE)
[![node](https://img.shields.io/node/v/@bytesbrains/weblocks.svg)](https://nodejs.org)
[![types](https://img.shields.io/npm/types/@bytesbrains/weblocks.svg)](./lib/index.d.ts)
[![deps](https://img.shields.io/badge/runtime%20deps-0-brightgreen.svg)](./package.json)

</div>

```
brief ──generateSite(callModel)──▶ SiteManifest ──validate──▶ renderSite ──▶ one static HTML document
message ──editSite(callModel)────▶ EditOp[] ─────apply────▶ new SiteManifest (version++)
```

---

## Why

Letting a model emit raw HTML/CSS/JS for a whole site is powerful and unsafe:
malformed output, injection, incoherent styling, and no way to change one thing
later without regenerating everything. **weblocks gives the AI a closed vocabulary
and a typed configuration contract** — a catalog of blocks. The model’s job
shrinks from *“write a correct website”* to *“pick and fill known bricks,”* which
is exactly what LLMs are reliable at, and the engine guarantees the result is
valid and coherent.

- 🔒 **Closed vocabulary** — a block exists only if it’s in the catalog; the AI
  can never invent markup or emit raw HTML.
- 🧱 **Illegal states unrepresentable** — a bad edit is *rejected*, never applied.
- 🛡️ **Total renderer** — every field defaulted, all text escaped, all URLs
  sanitized; it cannot throw, so a broken page is structurally impossible.
- 🔀 **Validity ⟂ model quality** — page validity comes from the schema +
  renderer, not the model being right. Swap or downgrade models freely.
- 🎨 **Coherent theming** — one palette swap re-themes the whole app; automatic
  light/dark; contrast-safe fills.
- 🌐 **Provider- & host-neutral** — you inject the model call; the engine bundles
  no backend, provider, or host.

Zero runtime dependencies · pure TypeScript · ESM · Node ≥ 20.

## Table of contents

- [Install](#install) · [Quickstart](#quickstart) · [Core concepts](#core-concepts)
- [The AI contract](#the-ai-contract) · [Block catalog](#block-catalog)
- [Editing](#editing) · [Theming](#theming) · [Powered blocks & runtime](#powered-blocks--runtime) · [PWA](#pwa)
- [API reference](#api-reference) · [Adding a block](#adding-a-block) · [Local development](#local-development)

## Install

```bash
npm install @bytesbrains/weblocks
```

## Quickstart

You supply a `callModel` function (any provider — you own the key). The engine
turns a brief into a validated manifest and static HTML.

```ts
import { writeFileSync } from 'node:fs';
import { generateSite, renderSite } from '@bytesbrains/weblocks';

// Bring your own provider: (system, user) => model's text reply.
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
if (ok) writeFileSync('index.html', renderSite(manifest)); // self-contained HTML
```

`renderSite(manifest)` returns a complete `<!doctype html>…</html>` string with
the used blocks’ CSS inlined — no build step, no framework runtime.

> **Building an AI application?** Use the latest, most capable models — the
> catalog is designed to be fed as a function-calling / structured-output schema.
> See **[`AGENT.md`](./AGENT.md)** for a ready-to-use guide you can hand to a model.

## Core concepts

A **`SiteManifest`** is the single source of truth the AI composes and edits — it
is never raw HTML:

```ts
type SiteManifest = {
  meta:    { title: string; description: string; lang: string; favicon?: string };
  design:  DesignTokens;   // the shared baseplate (CSS custom properties)
  blocks:  Block[];        // ordered, typed page sections
  version: number;         // bumped per accepted edit → undo / history / diff
  pwa?:    PwaConfig;       // opt-in installable PWA
  seo?:    SeoConfig;       // opt-in <head> meta
};

type Block = { id: string; type: string; visible: boolean; config: object; overrides?: object };
```

- **`design`** — CSS custom properties every block styles from, so one edit
  restyles the whole app coherently.
- **`blocks`** — placed bricks; `type` comes from the closed catalog and `config`
  is validated against that block’s schema before it is ever applied.

Two walls make a broken page impossible: **schema validation** (the strict gate an
edit op passes) and the **total renderer** (defaults + escaping, never throws).

## The AI contract

The catalog is the *only* surface the model is told it may use. It ships with the
package in two forms, and is also generated at runtime:

| Form | What | Use |
|---|---|---|
| **`catalog.json`** | JSON Schema per block | Function-calling / structured output |
| **`CATALOG.md`** | Human-readable reference | Docs / review |
| `catalog()` | `BlockCatalogEntry[]` at runtime | Programmatic |
| `catalogPrompt()` | Compact string | Cheap system prompt |

```ts
import { catalog, catalogPrompt } from '@bytesbrains/weblocks';
import catalogJson from '@bytesbrains/weblocks/catalog.json' with { type: 'json' };
```

## Block catalog

**45 typed blocks.** Full field reference in [`CATALOG.md`](./CATALOG.md).

| Group | Blocks |
|---|---|
| Chrome / app-shell | `nav` · `app-shell` · `sidebar` · `announcement-bar` · `footer` |
| Heroes | `hero` · `hero-app` |
| Résumé / profile | `profile-header` · `experience` · `skills` (live CV — avatar, dated entries, skills, Download-PDF/Share) |
| Content | `features` · `about` · `rich-text` · `split` · `steps` · `stats` · `services-catalogue` · `pricing` · `logos` · `team` |
| Media | `gallery` · `carousel` · `video` · `video-gallery` · `map` |
| Location | `directions` (deep links to the visitor’s map app) |
| Structured | `timeline` · `tabs` · `accordion` · `testimonials` · `faq` |
| Collections | `blog-list` · `blog-post` · `feed` |
| Dynamic (powered) | `contact-form` · `newsletter` · `search` · `auth` |
| Conversion / rhythm | `cta` · `social-links` · `contact-details` · `divider` · `spacer` · `copyright` |
| Legal | `legal` (terms/privacy links → safe-Markdown dialogs) |

`rich-text` and `blog-post` carry **typed** content nodes (headings, paragraphs,
quotes, lists) — a safe freeform-content escape hatch that is never raw HTML.

## Editing

Editing is a set of validated verbs, not a regeneration. Drive them from natural
language (`editSite`) or emit them directly:

```ts
import { applyOp, editSite } from '@bytesbrains/weblocks';

// Natural language → validated ops → new versioned manifest:
const { manifest: edited, applied } = await editSite(manifest, 'go dark and add a gallery', callModel);

// Or emit ops directly (what a chat/inspector produces):
applyOp(manifest, { op: 'updateBlock', id: 'hero-1', config: { headline: 'New' } });

// Array-item ops edit ONE item without rewriting the block:
applyOp(manifest, { op: 'addItem',    id: 'features-1', field: 'items', item: { title: 'Fast' } });
applyOp(manifest, { op: 'updateItem', id: 'features-1', field: 'items', index: 0, patch: { text: 'Now faster' } });
```

Every op is validated before it applies; a bad op is a no-op (with errors), and
`version` bumps on each accepted edit — so undo / history / diff come for free.

**Ops:** `addBlock` · `updateBlock` · `removeBlock` · `moveBlock` · `setVisible` ·
`addItem` · `updateItem` · `removeItem` · `moveItem` · `setDesignTokens` ·
`applyPreset` · `setOverrides` · `setMeta`.

## Theming

```ts
import { presetNames } from '@bytesbrains/weblocks';

applyOp(manifest, { op: 'applyPreset', name: 'midnight' });                 // named token presets
applyOp(manifest, { op: 'setDesignTokens', patch: { radius: 'round' } });   // patch any tokens
applyOp(manifest, { op: 'setOverrides', id: 'cta-1', overrides: { primary: '#0af', radius: 'sharp' } }); // per-section
presetNames(); // ['sand', 'midnight', 'forest', 'mono', 'candy', 'ocean']
```

- **Automatic light/dark** — set `design.mode = 'auto'` to follow the viewer’s OS
  theme (supply an optional `design.darkPalette`), or `'light'` / `'dark'` for a
  fixed one.
- **Contrast-safe fills** — derived `--on-primary` / `--on-accent` tokens keep
  button text legible on *any* palette (no hardcoded colors).
- **Per-section overrides** — tint one block’s palette / radius / spacing without
  breaking overall coherence.

## Powered blocks & runtime

Blocks like `contact-form`, `newsletter`, and `auth` need a backend. The engine
bundles none: a powered block **declares** the capabilities it needs, and your
host wires them through a tiny adapter.

```ts
import { renderSite, pathRuntime, runtimeNeeds } from '@bytesbrains/weblocks';

runtimeNeeds(manifest); // e.g. [{ type: 'contact-form', capabilities: ['contact-form.submit'] }]

// Map every capability to POST /api/<capability>/<blockId> in one line:
const html = renderSite(manifest, { runtime: pathRuntime('/api') });
```

With no runtime, powered blocks render **inert-but-valid** (a disabled control + a
note), keeping `data-wl-*` hooks so a host can enhance them client-side. Captcha,
server-side validation, delivery, abuse limits, and identity are the host’s job.

## PWA

Add a `pwa` field and the engine derives an installable app shell:

```ts
import { renderSite, emitPwa } from '@bytesbrains/weblocks';

manifest.pwa = { name: 'My App', offline: true };
writeFileSync('index.html', renderSite(manifest));  // adds manifest + SW meta to <head>
for (const [file, body] of Object.entries(emitPwa(manifest) ?? {})) writeFileSync(file, body);
// → manifest.webmanifest + sw.js
```

## Interactivity (islands)

Pages are static-first: JavaScript ships only for the interactive blocks that need
it, and only when their behaviour is on. `renderSite` emits a marker for each —
`<script type="module" src="/_island/<name>.js">` — and the engine **ships the
island scripts** (zero-dependency, ~6 KB each) under a subpath:

| Block | Island | Behaviour |
|---|---|---|
| `gallery` (`lightbox: true`) | `lightbox.js` | click-to-zoom, prev/next, keyboard, swipe, Esc |
| `carousel` | `carousel.js` | arrows, dots, keyboard, optional autoplay |
| `video-gallery` | `video.js` | click-to-play cards (load the real player inline on press) |
| `profile-header` (Download/Share on) | `resume.js` | print-to-PDF (`window.print()`) + Web Share / copy-link |

Serve them at the island URL. Copy from the package's `./islands/*.js` export, e.g.:

```ts
import lightbox from '@bytesbrains/weblocks/islands/lightbox.js?url'; // bundler
// or, for a static host, copy node_modules/@bytesbrains/weblocks/lib/islands/*.js
// to /_island/  (change the base with renderSite(m, { islandBase: '/assets/js' }))
```

Blocks whose behaviour is off (e.g. `tabs`, `accordion` — CSS-only) ship no JS at
all.

## API reference

All exports are named; types are shipped (`lib/index.d.ts`).

| Area | Exports |
|---|---|
| **Compose / edit (AI)** | `generateSite` · `editSite` · `buildGenerationPrompt` · `buildEditPrompt` · `parseManifestResponse` · `parseOpsResponse` |
| **Render** | `renderSite` |
| **Edit ops** | `applyOp` · `applyOps` |
| **Validate** | `validateManifest` · `validateBlock` |
| **Catalog** | `catalog` · `catalogPrompt` |
| **Registry** | `REGISTRY` · `getSpec` · `blockTypes` · `needsIsland` |
| **Theming** | `DEFAULT_TOKENS` · `normalizeTokens` · `tokensToCss` · `sectionOverrideCss` · `readableOn` · `PRESETS` · `presetNames` · `getPreset` |
| **Runtime** | `NOOP_RUNTIME` · `pathRuntime` · `runtimeNeeds` |
| **PWA** | `buildWebManifest` · `buildWebManifestJson` · `buildServiceWorker` · `emitPwa` |
| **Schema utils** | `parse` · `escapeHtml` · `escapeAttr` · `sanitizeUrl` |

Core types: `SiteManifest` · `Block` · `DesignTokens` · `Palette` ·
`SectionOverrides` · `PwaConfig` · `SeoConfig` · `EditOp` · `BlockSpec` ·
`RuntimeAdapter` · `ModelCall`.

`ModelCall` is `(args: { system: string; user: string }) => Promise<string>` — the
one thing you inject, so the engine never depends on a provider.

## Adding a block

Register a `BlockSpec` (`type` + `schema` + `css` + `render`, optionally `island`
/ `runtime`) in `registry.ts`. It must clear the **block definition-of-done**: a
typed schema (no raw-HTML field), consumes shared tokens, renders totally
(defaults + escaping, never throws), valid regardless of neighbours. See
[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md#adding-a-block-concretely).

## Local development

```bash
npm install          # dev deps only (typescript, @types/node)
npm run build        # tsc → lib/
npm test             # block definition-of-done + engine invariants
npm run example      # render a sample → example-output.html
npm run emit:catalog # regenerate catalog.json + CATALOG.md from code
```

Drive it end-to-end with a real model (dev harness — provider is env, not code):

```bash
PROVIDER=openai OPENAI_API_KEY=sk-… npm run ai -- generate "a Lisbon bakery landing page"
PROVIDER=openai OPENAI_API_KEY=sk-… npm run ai -- edit "make it dark, add a gallery"
```

## Documentation

- **[`AGENT.md`](./AGENT.md)** — how to use this package from an AI / agent.
- **[`VISION.md`](./VISION.md)** — principles and direction.
- **[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)** — internals.
- **[`CATALOG.md`](./CATALOG.md)** — every block’s fields.
- **[`CHANGELOG.md`](./CHANGELOG.md)** · **[`CONTRIBUTING.md`](./CONTRIBUTING.md)** · **[`SECURITY.md`](./SECURITY.md)**

## License

[MIT](./LICENSE) © bytesbrains
