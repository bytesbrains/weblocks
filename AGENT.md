# AGENT.md — using `@bytesbrains/weblocks` from an AI

This guide is written for a **model or agent** that will build and edit web apps
with this package. Hand it to an LLM (as context or a system prompt), or read it
as the coding agent integrating the package. For the *why*, see
[`VISION.md`](./VISION.md); for internals, [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

---

## What you are doing

You do **not** write HTML, CSS, or JavaScript. You produce a **`SiteManifest`** — a
JSON document of design tokens plus an ordered list of typed **blocks** chosen
from a fixed **catalog**. The engine validates your manifest and renders it to one
self-contained static HTML document. It cannot render a broken page, so your job
is to compose *good, specific* content — validity is guaranteed for you.

Two things you produce:

1. **Compose** — a full `SiteManifest` from a brief (one shot).
2. **Edit** — a JSON array of **edit ops** that change an existing manifest.

## Prime directives

1. **Use only catalog block types and config keys.** Never invent a `type` or a
   field. The catalog (`catalog.json` / `catalogPrompt()`) is your complete,
   closed API. If a request doesn’t fit, get as close as you can with existing
   blocks — do not fabricate markup.
2. **Never output raw HTML/CSS/JS.** There is no “custom HTML” block by design.
   For freeform prose use the `rich-text` block’s *typed* nodes.
3. **Write real, specific copy** for the described subject — no lorem ipsum, no
   `[placeholder]`.
4. **Order blocks top-to-bottom** as a visitor reads the page (`nav` first,
   `footer` last).
5. **Theme with tokens, not per-block colors.** Set `design` once; the whole app
   inherits it. Never hand-set text colors on buttons — contrast is automatic.
6. **Output only the JSON** asked for (a manifest object, or an ops array). No
   prose, no code fences.

## The catalog is your contract

Always work from the shipped catalog — it lists every block, its description, and
its exact config schema:

- `catalog.json` — JSON Schema per block (ideal as a function-calling schema).
- `catalogPrompt()` — a compact text menu for a system prompt.
- `CATALOG.md` — the same, human-readable.

The 53 block types, by group:

- **Chrome/app-shell:** `nav`, `app-shell`, `sidebar`, `announcement-bar`, `install-prompt` (add-to-home-screen toast with per-platform steps — use it on PWA-enabled sites), `footer`
- **Heroes:** `hero`, `hero-app`
- **Résumé / profile:** `profile-header` (avatar, name, contacts, Download-PDF/Share buttons), `experience` (dated entries — reuse for Education/Certifications by changing its title), `skills` (tags or level bars)
- **Content:** `features`, `about`, `rich-text`, `split`, `steps`, `stats`,
  `services-catalogue`, `menu` (food/drink menu — sections, dietary tags, spice), `product` (shoppable grid — price, badge, buy/enquire), `pricing`, `logos`, `team`,
  `progress` (value toward a target — fundraising totals, completion, capacity/scarcity — as bars, segments, rings or meters. Every item needs a real `value` and `max` with units; for a 0–5 proficiency rating use `skills` instead)
- **Media:** `gallery`, `carousel`, `video`, `video-gallery`, `map`
- **Location:** `directions` (deep links to open the visitor’s map app)
- **Structured:** `timeline`, `tabs`, `accordion`, `testimonials`, `reviews` (star ratings + source), `faq`, `chat-thread` (an authored conversation as rich bubbles — participants plus messages whose bodies are typed nodes: text, code, image, list, buttons. Static: use it to *show* how an assistant or support team answers, never as a live chatbot)
- **Collections:** `blog-list`, `blog-post`, `feed`
- **Dynamic (powered):** `booking` (appointment/reservation request — service, date, time), `contact-form`, `newsletter`, `search`, `auth`
- **Conversion/rhythm:** `cta`, `social-links`, `contact-details`, `hours` (structured weekly opening hours with a live open-now badge), `divider`, `spacer`, `copyright`
- **Legal:** `legal` (terms/privacy links that open safe-Markdown dialogs; content is Markdown, never raw HTML)

Interactivity is safe to enable: `gallery` with `lightbox: true`, `carousel` with
`autoplay: true`, `tabs`/`accordion`, etc. work out of the box — CSS-only where
possible, and the host serves small shipped islands (`gallery` lightbox,
`carousel` controls) for the rest. You just set the typed config; you never write
the JavaScript.

## Composing a manifest

Emit exactly this shape (a block’s `id` is optional — the engine assigns one):

```json
{
  "meta": { "title": "…", "description": "…", "lang": "en" },
  "design": {
    "mode": "light",
    "palette": { "bg": "#…", "surface": "#…", "text": "#…", "muted": "#…", "primary": "#…", "accent": "#…" },
    "typography": { "fontStack": "system-ui, sans-serif", "scale": "default" },
    "radius": "soft", "spacing": "default", "motion": "subtle"
  },
  "blocks": [
    { "type": "nav", "config": { "brand": "…", "links": [ { "label": "…", "href": "#…" } ] } },
    { "type": "hero", "config": { "headline": "…", "subhead": "…", "cta": { "label": "…", "href": "#…" } } }
  ]
}
```

Worked example — a bakery landing page:

```json
{
  "meta": { "title": "Loam & Ember — wood-fired bakery", "description": "Naturally-leavened bread from a neighbourhood oven.", "lang": "en" },
  "design": {
    "mode": "auto",
    "palette": { "bg": "#fbf5ec", "surface": "#ffffff", "text": "#2a201a", "muted": "#7c6a58", "primary": "#b04d2b", "accent": "#c8892f" },
    "typography": { "fontStack": "system-ui, sans-serif", "scale": "expressive" },
    "radius": "round", "spacing": "airy", "motion": "subtle"
  },
  "blocks": [
    { "type": "nav", "config": { "brand": "Loam & Ember", "links": [ { "label": "Bread", "href": "#bread" }, { "label": "Classes", "href": "#classes" } ], "cta": { "label": "Order", "href": "#order" } } },
    { "type": "hero", "config": { "eyebrow": "Neighbourhood bakery", "headline": "Bread with a long, slow memory", "subhead": "Naturally leavened, wood-fired at dawn.", "align": "center", "cta": { "label": "See this week’s bakes", "href": "#bread" } } },
    { "type": "stats", "config": { "title": "From the oven", "columns": 3, "items": [ { "value": "36", "suffix": "h", "label": "Fermentation" }, { "value": "480", "suffix": "°C", "label": "Hearth" }, { "value": "3", "label": "Ingredients" } ] } },
    { "type": "pricing", "config": { "title": "This week’s bakes", "plans": [ { "name": "Country sourdough", "price": "$9", "period": "/ loaf", "features": ["1kg boule", "Blistered crust"], "ctaLabel": "Add to order", "ctaHref": "#order" } ] } },
    { "type": "contact-details", "config": { "title": "Visit", "address": "42 Kiln Row", "hours": "Wed–Sun · 8am–2pm" } },
    { "type": "footer", "config": { "brand": "Loam & Ember", "copyright": "© 2026 Loam & Ember" } }
  ]
}
```

## Starting from a starter template

You rarely need to compose from nothing. The package ships a large library of
**starter templates** — complete, validated manifests with real copy, one file per
vertical under `src/templates/`. Reach for one when the brief matches something
that already exists (a café, a carpenter, a dog walker, a podcaster, a dental
practice, a personal blog), and rewrite it rather than reinventing the structure.

```ts
import { templatesForVertical, templatesByTag, templatesForLayout, getTemplate } from '@bytesbrains/weblocks';

templatesForVertical('trades');    // by KIND of business
templatesForLayout('editorial');   // by SHAPE of page — same business, different look
templatesByTag('booking');         // by facet
getTemplate('care-dog-walker');    // → { id, vertical, label, description, tags, layout, preset, manifest }
```

Two ways to use one:

- **As output.** Render `template.manifest` directly for an instant, zero-LLM
  starter. Nothing to generate.
- **As a scaffold.** Pass `{ template: 'restaurant-modern' }` to `generateSite`
  and the template's block structure is seeded into your prompt. Then **keep the
  structure, rewrite every string** for the actual subject. A scaffolded manifest
  that still says "Brew & Bloom" is a failure.

When a brief doesn't match any template, compose from the catalog as usual.

## Design tokens & theming

Set `design` once; every block styles from it.

- `mode`: `light` | `dark` | `auto`. Use **`auto`** to follow the viewer’s OS
  theme; optionally add a `darkPalette` (same keys as `palette`) for the dark side.
- `palette`: 6 hex roles — `bg`, `surface`, `text`, `muted`, `primary`, `accent`.
- `typography.scale`: `compact` | `default` | `expressive`; `fontStack`: any CSS
  font stack (no web font is loaded for you).
- `radius`: `sharp` | `soft` | `round`; `spacing`: `tight` | `default` | `airy`;
  `motion`: `none` | `subtle` | `lively`.
- **Presets:** instead of hand-mixing hex, base the palette on a named preset —
  `sand`, `midnight`, `forest`, `mono`, `candy`, `ocean` — or apply one via the
  `applyPreset` op when editing.
- **Do not set text colors on buttons.** `--on-primary` / `--on-accent` are
  derived automatically and stay legible on any palette.

## Editing with ops

To change an existing manifest, emit a **JSON array of ops**. Each is validated
before it applies; a bad op is skipped (not a corruption), and the manifest
`version` bumps per accepted edit.

```json
[
  { "op": "updateBlock", "id": "hero-1", "config": { "headline": "New headline" } },
  { "op": "applyPreset", "name": "midnight" },
  { "op": "addBlock", "type": "faq", "at": 4, "config": { "items": [ { "question": "…", "answer": "…" } ] } }
]
```

Op vocabulary:

| Op | Purpose |
|---|---|
| `addBlock` `{ type, config?, at?, id? }` | insert a block |
| `updateBlock` `{ id, config }` | patch a block’s config (only changed keys) |
| `removeBlock` `{ id }` / `moveBlock` `{ id, to }` / `setVisible` `{ id, visible }` | block-level edits |
| `addItem` / `updateItem` / `removeItem` / `moveItem` `{ id, field, … }` | edit **one item** of an array field (e.g. one `features` item) without rewriting the block |
| `setDesignTokens` `{ patch }` / `applyPreset` `{ name }` | site-wide theming |
| `setOverrides` `{ id, overrides }` | per-section palette / `radius` / `spacing` (or `null` to clear) |
| `setMeta` `{ patch }` | title / description / lang |

Prefer **array-item ops** for “change one thing” requests — they’re surgical and
cheap:

```json
[ { "op": "updateItem", "id": "features-1", "field": "items", "index": 0, "patch": { "text": "Now twice as fast" } } ]
```

## Powered (dynamic) blocks

`contact-form`, `newsletter`, `search`, and `auth` need a backend. You still only
fill their typed config (fields, labels, providers, placeholder). The block declares the runtime
capability it needs; the **host** wires the endpoint. If no runtime is wired, the
block renders inert-but-valid — that is expected, not an error. Never put secrets,
endpoints, captcha keys, or backend logic in the config.

## Favicon & hero banner

- **Favicon:** set `meta.favicon` to an icon **URL** or a single **emoji** (e.g.
  `"🍞"`) — the engine emits the browser-tab `<link rel="icon">`.
- **Hero image banner:** give the `hero` block an `image` for a full-bleed
  background banner; add `overlay` (`scrim`/`dark`/`light`/`none`) for text
  legibility and `minHeight` (`sm`/`md`/`lg`/`full`). Text colour auto-flips over
  dark overlays.

## PWA & SEO (optional, additive)

Add top-level fields to make the app installable / discoverable:

```json
{ "pwa": { "name": "My App", "shortName": "App", "offline": true },
  "seo": { "ogImage": "https://…/card.png", "twitterCard": "summary_large_image" } }
```

## Programmatic integration (for the app developer)

The engine is provider-agnostic — you inject the model call:

```ts
import { generateSite, editSite, renderSite } from '@bytesbrains/weblocks';

const callModel = async ({ system, user }) => /* call any LLM */ '…';

const { ok, manifest } = await generateSite(brief, callModel);   // brief → manifest
const html = renderSite(manifest);                                // manifest → static HTML
const { manifest: next } = await editSite(manifest, 'go dark', callModel); // NL → validated ops
```

`buildGenerationPrompt(brief)` and `buildEditPrompt(manifest, message)` return the
exact `{ system, user }` prompts (with the catalog embedded) if you want to call
the model yourself; `parseManifestResponse` / `parseOpsResponse` turn a raw reply
into a validated result.

## Guarantees you can rely on

- **Validity ⟂ your quality.** Whatever you emit is schema-validated and totally
  rendered. A malformed or partial reply degrades gracefully — worst case is a
  rejected op or a defaulted field, never a broken page or an injection.
- **Non-breaking.** The catalog and manifest shape are versioned; existing
  manifests keep rendering. Grow by adding typed blocks/fields, never escape
  hatches.

---

## For agents extending the package

If you are modifying this repo (not just using it):

- A block is a `BlockSpec` (`type`, `description`, `schema`, `css`, `render`,
  optional `island` / `runtime`) in `src/blocks/`, registered in
  `src/registry.ts`.
- **Definition of done:** typed schema (no raw-HTML field), consumes shared design
  tokens, total render (default every field, escape all text via
  `escapeHtml`/`escapeAttr`, sanitize URLs via `sanitizeUrl`, never throw), a
  single top-level landmark, additive & non-breaking.
- After changes: `npm run build && npm test && npm run emit:catalog` (the shared
  suite in `src/blocks.test.ts` enforces the DoD for every block), and update the
  closed-vocabulary list in `blocks.test.ts`.
- To add a **starter template**, append a `tpl({...})` entry to its vertical's
  array in `src/templates/<vertical>.ts` — that is the only file to touch. Check
  it with `npm run check:templates <vertical>`, which catches config keys the
  block schema would silently drop.
- **Branch off `dev` and open PRs against `dev`**, which is squash-merged — all
  continuous work lands there. `main` receives *only* tagged release PRs from
  `dev`. Never target `main` directly. See
  [`CONTRIBUTING.md`](./CONTRIBUTING.md#branches--releases).
- Keep everything **consumer-neutral** — no host, backend, or downstream names.
