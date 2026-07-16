# Architecture — `@bytesbrains/weblocks`

How the engine turns an AI-composed `SiteManifest` into a validated, self-contained
static document — and how to extend it. For the *why*, see [`../VISION.md`](../VISION.md).

This document covers **only the engine**. It bundles no backend, no provider, and
no host: the model call is injected, and powered bricks declare their runtime
needs for a host to wire (below).

---

## The pipeline

```
brief ──generateSite(callModel)──► SiteManifest ──validateManifest──► (strict gate for edits)
                                        │
message ──editSite(callModel)──► EditOp[] ──applyOps──► new SiteManifest (version++)
                                        │
                                   renderSite ──► one self-contained static HTML document
                                        │            (+ optional manifest.webmanifest + sw.js)
                                        ▼
                        island <script> markers only where a brick is interactive
```

Two walls make a broken page structurally impossible:

1. **Schema validation** (`parse` / `validateManifest`) — the strict gate an edit
   op passes before it is applied. Wrong type / bad enum / unknown type → the op
   is *rejected*, the manifest is untouched.
2. **Total renderer** (`renderSite`) — defined for every manifest: a default for
   every optional field, all text escaped, unknown block types skipped, and it
   **cannot throw**.

## The `SiteManifest`

```ts
type SiteManifest = {
  meta:    { title: string; description: string; lang: string };
  design:  DesignTokens;              // the shared baseplate (CSS custom props)
  blocks:  Block[];                   // ordered, typed page sections
  version: number;                    // bumped per accepted edit → undo/history
  pwa?:    PwaConfig;                 // opt-in installable PWA (webmanifest + sw)
  seo?:    SeoConfig;                 // opt-in <head> meta
};

type Block = {
  id: string; type: string; visible: boolean;
  config: Record<string, unknown>;    // validated against the brick's schema
  overrides?: Partial<Palette>;       // opt-in per-section palette tint
};

type DesignTokens = {
  mode: 'light' | 'dark' | 'auto';
  palette: { bg; surface; text; muted; primary; accent };   // hex
  typography: { fontStack: string; scale: 'compact'|'default'|'expressive' };
  radius: 'sharp'|'soft'|'round';
  spacing: 'tight'|'default'|'airy';
  motion: 'none'|'subtle'|'lively';
};
```

The manifest is never raw HTML. `pwa`, `seo`, and `overrides` are additive and
optional — a manifest without them renders exactly as before.

## The schema layer (`schema.ts`)

A tiny, dependency-free descriptor language — the "studs" of a brick. `parse`
always returns a fully-defaulted value, and it separates two severities so edit
ops can be strict about garbage yet lenient about incompleteness:

- **errors (HARD)** — wrong type, invalid enum, out-of-range int, non-array. The
  op is malformed → reject it.
- **warnings (SOFT)** — a required field is missing, or a value was truncated to
  its max. Apply with the default/truncation (the total renderer copes) and tell
  the author.

Field kinds: `string`, `enum`, `boolean`, `int`, `object`, `array`. All text is
run through `escapeHtml` / `escapeAttr` on render, and every URL through
`sanitizeUrl` (which collapses `javascript:` and other dangerous schemes to `#`).

## The registry (`registry.ts`) — the closed vocabulary

A block type exists iff it is registered. Each brick is a `BlockSpec`:

```ts
interface BlockSpec {
  type: string;                       // the catalog id (kebab-case)
  description: string;                // one line the AI sees in its menu
  schema: Schema;                     // typed contract for `config`
  css?: string;                       // emitted once per document if the brick is used
  render(config, tokens, ctx?): string;  // markup only; never throws
  island?: string;                    // client behaviour to hydrate (interactive bricks)
  runtime?: { capabilities: string[] };  // powered brick: host runtime needs
}
```

Registration order is the order block CSS is emitted (stable output) and the
order bricks appear in the AI's menu.

## The renderer (`render.ts`)

`renderSite(manifest, options?)` → one HTML document. It:

- includes only the CSS of bricks actually **used**, in registration order;
- normalizes each block's config through its schema (defaults fill every hole);
- wraps a block in a scoped `<div>` carrying its opt-in `overrides` as inherited
  CSS variables — so one section can be tinted without touching the rest;
- emits island `<script>` markers only for interactive bricks whose behaviour is
  on (`needsIsland`), at `options.islandBase` (default `/_island`);
- emits PWA/SEO `<head>` tags only when the manifest opts in.

`options.runtime` supplies a `RuntimeAdapter` for powered bricks; it defaults to
the inert no-op adapter, so `renderSite(manifest)` needs no host wiring.

### Islands (`src/islands/`)

Static-first: JS ships only for interactive bricks, only when their behaviour is
on. The engine **ships the island scripts** — hand-written, zero-dependency
browser modules — built by a separate `tsconfig.islands.json` (DOM lib) into
`lib/islands/` and exposed via the `./islands/*.js` subpath export. Each is
self-executing, idempotent, guarded by `typeof document` (safe to import in
Node/SSR), and injects its own scoped CSS (themed from the design tokens). Today:
`lightbox.js` (gallery zoom) and `carousel.js` (arrows/dots/keyboard/autoplay).
The host serves them at the island URL; the block markup carries the hooks the
island reads (e.g. `gallery` sets `data-wl-lightbox`, `carousel` sets
`data-wl-autoplay`). Node engine code stays DOM-free (`tsconfig.json` excludes
`src/islands`).

## Edit ops (`ops.ts`) — the verbs

Each op is validated **before** it is applied; a malformed op is a no-op with
errors, never a corrupted manifest. Applying returns a **new** manifest with
`version` bumped.

| op | effect |
|---|---|
| `addBlock` / `updateBlock` / `removeBlock` / `moveBlock` | block-level edits |
| `setVisible` | show/hide a block |
| `setDesignTokens` / `applyPreset` | site-wide theming (patch or named preset) |
| `setMeta` | title / description / lang |
| `setOverrides` | opt-in per-section palette tint (or clear with `null`) |
| `addItem` / `updateItem` / `removeItem` / `moveItem` | **surgical array-item edits** |

The array-item ops let the AI change *one* item of a block's array field
(features, gallery images, pricing tiers, nav links) without resending the whole
block: they locate the array field in the brick's schema, mutate a copy, then
re-validate the whole config — a bad op is a no-op.

## The catalog (`catalog.ts`) — the AI's menu

Projects the registered bricks into the two forms a model consumes:

- `catalog()` → structured **JSON Schema** per brick (for tool/function-calling),
  including a `runtime` declaration for powered bricks;
- `catalogPrompt()` → a compact, token-cheap string for a system prompt.

`npm run emit:catalog` writes `catalog.json` (the machine contract) and
`CATALOG.md` (human reference) from the code — they are generated, never
hand-edited, and are the shareable API contract.

## Design tokens (`tokens.ts`) & presets (`presets.ts`)

`tokensToCss` emits the `:root` custom-property block every brick styles from, so
coherence survives edits. `normalizeTokens` is total: any missing field or
out-of-range enum falls back to a default, so a bad token value can never reach
the CSS. `presets.ts` ships named `DesignTokens` sets (`sand`, `midnight`, …) the
AI or a picker selects by name via `applyPreset`.

## Powered bricks & the runtime contract (`runtime.ts`)

A powered brick declares `runtime: { capabilities: [...] }`. On render it emits
standard markup plus a documented client contract: the interactive element
carries `data-wl-capability="<cap>"` and `data-wl-block="<id>"`, and its
form `action`/`method` are resolved by the host's `RuntimeAdapter`.

```ts
interface RuntimeAdapter { resolve(capability, blockId): { url; method } | null; }
```

- With the default `NOOP_RUNTIME`, powered bricks render **inert-but-valid** (a
  disabled control + a visible note), with the `data-wl-*` hooks intact so a host
  can still enhance them client-side.
- `pathRuntime('/api')` is a reference adapter: every capability maps to
  `POST /api/<capability>/<blockId>`, so a host wires the whole catalog in one
  line and implements one route per capability — never one per block type.
- `runtimeNeeds(manifest)` reports what a host must implement. Empty ⇒ a purely
  static site that needs no backend at all.

The engine ships no backend. Captcha, server-side validation, delivery, abuse
caps, and identity are the host runtime's job.

## PWA layer (`pwa.ts`)

When `manifest.pwa` is present the engine derives an installable app shell:

- `buildWebManifest` / `buildWebManifestJson` → the Web App Manifest (name,
  icons, `theme_color`/`background_color` from design tokens, `display`,
  `start_url`), defaulted so a bare `pwa: {}` is already valid.
- `buildServiceWorker` → a dependency-free precache + offline-fallback worker
  whose cache name is derived from `manifest.version` (reproducible; no
  timestamps).
- `emitPwa(manifest)` → `{ 'manifest.webmanifest', 'sw.js' }` to serve alongside
  the HTML, or `null` when not opted in.

`renderSite` adds the `<link rel="manifest">`, `theme-color`, and SW-registration
tags to `<head>` only when `pwa` is set.

---

## Brick definition-of-done — admitting a new block

A block joins the catalog only when it:

- [ ] declares a **typed schema** — every optional field defaulted; **no
      raw-HTML / free-markup field**;
- [ ] consumes the **shared design tokens** — no ad-hoc styling; CSS scoped under
      `.blk-<type>`;
- [ ] **renders totally**: a sensible default for every field, all text escaped,
      all URLs sanitized, drops incomplete array items, and **cannot throw**;
- [ ] is **valid regardless of neighbours** (no coupling beyond placement intent,
      e.g. `nav` top / `footer` bottom);
- [ ] if **powered**, declares `runtime.capabilities` and speaks the client
      contract — no host-specific code in the brick;
- [ ] ships **tests** (the shared suite in `blocks.test.ts` exercises the DoD for
      every registered brick) and regenerates `catalog.json` / `CATALOG.md`;
- [ ] is **additive & non-breaking** — every existing manifest still validates and
      renders identically.

### Adding a block, concretely

1. Create `src/blocks/<name>.ts` exporting a `BlockSpec` (see any existing brick,
   e.g. `features.ts` for a static grid, `contactForm.ts` for a powered brick).
2. Register it in `src/registry.ts` (import + add to `SPECS` at the right
   position).
3. `npm run build && npm test` — the shared DoD suite covers the new brick.
4. `npm run emit:catalog` to regenerate the contract.
5. Update the closed-vocabulary list in `blocks.test.ts` and the docs.
