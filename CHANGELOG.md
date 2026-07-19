# Changelog

All notable changes to `@bytesbrains/weblocks` are documented here. The package
follows [semantic versioning](https://semver.org): the **block catalog** and the
**`SiteManifest` shape** are the public contract — additive block/field changes
are minor, breaking changes to either are major.

## Unreleased

### Added
- **`chat-thread` block (#58).** Catalog 51 → 52. An authored conversation
  rendered as a thread of rich message bubbles: named participants with avatars
  or generated initials, optional per-message times, and **typed message
  bodies** — `text`, `code`, `image`, `list`, `buttons` — that compose in one
  bubble. Static and JS-free: the transcript is content, for showing how an
  assistant or a support team answers. A live chatbot is a separate powered
  brick, deliberately not this one.

  Design decisions are recorded on #58: only `user` sits on the right (`bot` and
  `agent` are told apart by name and avatar, never by colour alone); quick
  replies render inert unless they carry an `href`, since a chip that looks
  clickable but isn't misleads the reader; times are freeform labels rather than
  `<time>`, which would demand a machine-readable value the brick cannot
  validate without a parser. The node set is intentionally small — new kinds are
  additive, removing one is breaking.

  Placed in the `service-local` starter so the schema is exercised by a real
  composition, not only by the showcase.

## 0.8.1 — 2026-07-19

Documentation and distribution only — **no change to the engine, the block
catalog, or the `SiteManifest` shape**. Every `0.8.0` manifest validates and
renders byte-identically. What reaches an installed copy is a rewritten README
and one file that should never have shipped.

### Added
- **Fetchable agent surface.** The contract is now reachable without installing
  anything: [`/llms.txt`](https://bytesbrains.github.io/weblocks/llms.txt),
  [`/AGENT.md`](https://bytesbrains.github.io/weblocks/AGENT.md),
  [`/catalog.json`](https://bytesbrains.github.io/weblocks/catalog.json),
  [`/catalog.txt`](https://bytesbrains.github.io/weblocks/catalog.txt) (the
  compact vocabulary, for a system prompt) and
  [`/tools.json`](https://bytesbrains.github.io/weblocks/tools.json) (a
  ready-to-use `compose_site` function-calling definition, with all 51 block
  types as an enum plus per-type config schemas).
- **Logo** (`assets/`) — shown on the site, the README and as the favicon.
- **Live gallery on GitHub Pages** —
  [bytesbrains.github.io/weblocks](https://bytesbrains.github.io/weblocks/). A
  landing page, the block wall (all 51 bricks rendered live, each labelled with
  the island it hydrates), and the starter gallery (17 preview cards showing the
  blocks each one is composed from). Built from source by `npm run site` and
  deployed on every push to `main`; nothing generated is committed.
- **`src/showcase.ts`** — demo config for every registered block, harvested from
  the starter templates where one places it and hand-written for the rest.
  `showcase.test.ts` asserts it covers the whole registry, so registering a block
  without demo config now fails CI (see `CONTRIBUTING.md`).

### Fixed
- **Island scripts resolve under a project path.** `renderSite` defaults
  `islandBase` to the absolute `/_island`; the site build passes a relative base
  and ships the modules alongside, so carousel/lightbox/hours/stats hydrate on a
  static host and from disk.
- **`lib/showcase.*` no longer ships to npm.** It is demo-site tooling, is not
  exported from `index.ts`, and was being published as dead weight.

### Changed
- GitHub Actions moved off the deprecated Node 20 runtime: `checkout` v4→v7,
  `setup-node` v4→v7, `upload-pages-artifact` v3→v5, `deploy-pages` v4→v5.

## 0.8.0 — 2026-07-19

Installability, end to end: a block that tells visitors they can install the
site, the island modules that were declared but never shipped, and a renderer
that survives a misbehaving host adapter. Additive and **non-breaking** — every
`0.7.x` manifest still validates and renders identically. Catalog 50 → 51.

### Added
- **`install-prompt` block (#39).** Catalog 50 → 51. A dismissible toast that
  invites visitors to install the site as an app and expands into "Add to Home
  Screen" steps matched to their platform (iOS Safari, iOS third-party browsers,
  Android Chrome, desktop Chrome/Edge, macOS Safari 17+, Firefox). Static-first:
  the guide is a `<details>`, so with no JS every platform's steps still expand.
  The shipped `install-prompt` island fires the browser's native install prompt
  where one is offered (`beforeinstallprompt`), narrows the steps to the detected
  platform otherwise, remembers a dismiss in `localStorage`, and hides the toast
  once the app is installed. Closes the gap left by the `pwa` layer, which made
  sites installable but never told anyone.

  Additive + non-breaking: every `0.7.x` manifest still validates and renders
  identically.

### Fixed
- **Shipped the two missing island modules.** `announcement-bar` and `stats` both
  declared an island, so `renderSite` emitted
  `<script src="/_island/announcement-bar.js">` / `.../stats.js` on every page
  that used them — but neither module existed, so the script 404'd and the
  announcement strip's close button did nothing. Both now ship:
  `announcement-bar.js` dismisses the strip (scoped to its own block), and
  `stats.js` counts plainly numeric figures up when they scroll into view
  (skipped under `prefers-reduced-motion`, and non-numeric values like `24/7` are
  left untouched). Pure progressive enhancement — no markup or schema change.
- **A powered brick no longer emits an island `<script>` the host can't serve.**
  `contact-form`, `newsletter`, `booking` and `auth` declare an island the host
  serves alongside the runtime it wires — so with no runtime configured, that tag
  was a guaranteed 404 on a page whose bricks are inert anyway. `renderSite` now
  emits it only once the adapter actually resolves one of the brick's
  capabilities. Unwired pages ship strictly less JS; wired pages are unchanged.
  `needsIsland` takes the adapter (and block id) as optional trailing arguments —
  additive, and the default is the previous "unwired" answer.
- **`renderSite` is total again: a throwing host runtime can no longer kill the
  page (#42).** `RuntimeAdapter.resolve` is the one place arbitrary host code runs
  inside a render, and the powered bricks call it directly — so a throw (a bad URL
  parse, an undefined lookup, a typo on one capability) escaped `renderSite` and
  lost the whole document, including every static brick that never needed a
  runtime. The adapter is now wrapped once per render by the new exported
  `safeRuntime`: a throw — or an action with no usable `url` — reads exactly like
  "the host does not provide that capability", so the brick renders its documented
  inert-but-valid fallback. One bad capability costs one form, never the page. No
  API change; a working adapter passes straight through.
- **A regression guard for the whole class:** a test now asserts that every
  *static* brick's declared island resolves to a real shipped module. Powered
  bricks are the documented exception, now enforced by the rule above.

## 0.7.0 — 2026-07-17

Business verticals land: a vertical taxonomy, named starter templates, and five
new blocks that cover the booking-driven and shop verticals. Additive and
**non-breaking** — every `0.6.x` manifest still validates and renders
identically. Catalog 45 → 50.

### Added
- **Five new blocks for vertical coverage (#32).** Catalog 45 → 50.
  - **`booking`** — an appointment/reservation request form (service, date, time,
    contact) for the booking-driven verticals (salon, clinic, gym, hotel,
    events). Powered brick: posts to the host `booking.request` capability, inert
    fallback with no runtime, native form post + optional host island.
  - **`hours`** — structured weekly opening hours (24h, split shifts) as an
    accessible table with a live "open now / closed" badge via a shipped `hours`
    island (static-first: the full week always renders without JS).
  - **`menu`** — a food/drink menu: sections → items with price, dietary/allergen
    tags, and a 0–3 spice level.
  - **`product`** — a shoppable product grid: image, price (+ optional "was" and
    badge), and a buy/enquire link per item.
  - **`reviews`** — star-rated (1–5) customer reviews with author, date, and
    source (Google/Yelp/…), plus an optional aggregate score.

  Additive + non-breaking: every `0.6.x` manifest still validates and renders
  identically. The booking-driven verticals (#30) now have a home block.
- **Named starter templates (`templates.ts`, #31).** One complete, realistic,
  `validateManifest`-clean `SiteManifest` per vertical (17 in all), each with a
  fitting preset baked in. Exposed as `TEMPLATES` / `templateNames()` /
  `templatesForVertical()` / `getTemplate()` so a host can render an instant,
  zero-LLM starter and the AI can scaffold from the same source of truth. A
  runnable example (`npm run example:templates`) renders them all to
  `templates-output/`.
- **Template-aware generation.** `generateSite` / `buildGenerationPrompt` accept
  `{ template }` (a template id or a raw `SiteManifest`); when present the
  structure + design are seeded into the prompt ("start from this, keep the
  section set unless the brief conflicts, rewrite the copy for THIS business").
  Blank-slate compose is unchanged when omitted.
- **Business-vertical taxonomy (`verticals.ts`, #30).** A small, stable list that
  maps each vertical (`restaurant`, `salon`, `healthcare`, … `other`) to its
  recommended sections (in order), a fitting `preset`, a copy `tone`, and a
  `booking` flag. Exposed as `VERTICALS` / `verticalNames()` / `getVertical()` so
  a host renders one source of truth instead of hardcoding a category list. Every
  recommended block is a real catalog type (unit-tested).
- **Vertical-aware generation.** `generateSite` / `buildGenerationPrompt` accept
  an optional `{ vertical }`; when present, the vertical's recommended sections +
  preset are injected as advisory defaults ("prefer these unless the brief says
  otherwise"). Blank-slate compose is unchanged when omitted. `GenerateOptions`
  is exported.

## 0.6.2 — 2026-07-17

Bug fix: in-page nav links now scroll.

### Fixed
- **In-page nav links now scroll (#26).** `renderSite` previously emitted sections
  without ids, so `#about` / `#menu` / `#contact` resolved to nothing on every
  generated site. It now emits a stable, de-duped anchor `id` on each content
  section (a canonical slug — e.g. `contact-details` → `#contact`,
  `services-catalogue` → `#services`, `testimonials` → `#reviews`), and `nav`
  (plus its CTA) resolves links by `#hash`, label, or a common alias
  (`Menu` → services, `Get in touch` → contact, …). External/relative links pass
  through; unresolved links fall back to `#` (top), never a dead anchor. Chrome
  and rhythm blocks get no anchor. **Render-side, so re-rendering an existing
  manifest just works** — no manifest change needed.

### Added
- `slugify` exported (`'About Us!'` → `'about-us'`, folds diacritics).

## 0.6.1 — 2026-07-16

Docs only — no engine changes.

### Added
- A runnable **résumé example** (`npm run example:resume` → `resume-output.html`)
  demonstrating the résumé pack + print-to-PDF end to end, and a README pointer
  to it.

## 0.6.0 — 2026-07-16

A résumé/CV builder, hero image banners, and favicons. Additive and
**non-breaking** — every `0.5.0` manifest still validates and renders identically.
Catalog 42 → 45.

### Added
- **Résumé / CV pack** — turn the engine into a live-resume builder:
  - **`profile-header`** — avatar (or initials), name, role, location, a contact +
    social row (brand icons), and optional **Download-PDF** and **Share** buttons.
  - **`experience`** — dated, structured entries (role, org, period, location,
    summary, achievement bullets). Reuse for Experience / Education /
    Certifications by changing its title.
  - **`skills`** — grouped skills as tags (with proficiency dots) or level bars.
  - **Print styles** — `renderSite` now emits an `@media print` stylesheet so any
    page (especially a résumé) exports cleanly to PDF; the **`resume.js` island**
    wires the header's Download (`window.print()`) and Share (Web Share API +
    copy-link) buttons. `data-wl-noprint` elements are hidden from the printout.
- **`hero` image banner** — the `hero` block gains optional `image`, `overlay`
  (scrim / dark / light / none), and `minHeight` (sm / md / lg / full). With an
  image, the photo sits behind the content (an `<img>` + scrim) with a legibility
  overlay and the text flips to a readable colour; with no image it renders
  exactly as before.
- **`meta.favicon`** — a browser-tab favicon: a URL (svg/png/ico) **or a single
  emoji** (rendered as an inline SVG data URI). `renderSite` emits a scheme-
  sanitized `<link rel="icon">` in `<head>` when set.

## 0.5.0 — 2026-07-16

More media & footer blocks, brand icons, and shipped interactivity. Additive and
**non-breaking** — every `0.4.0` manifest still validates and renders identically.
Catalog 40 → 42.

### Added
- **`video-gallery` block** — a grid or carousel of **click-to-play video cards**
  (YouTube / Vimeo / self-hosted). Each card is a lightweight *facade* (thumbnail
  + play button); the new **`video.js` island** loads the real player inline on
  click, so no heavy iframes load up front. YouTube thumbnails auto-derive from
  the id; no-JS clicks open the platform.
- **`copyright` block** — a small "© year holder · rights" bar for the bottom of
  a page (a standalone alternative to the `footer` copyright line). The year
  auto-fills to the current year when blank; configurable holder, note, symbol,
  and alignment.
- **`social-links` — built-in brand icons & layouts.** Each link takes a typed
  `platform` (x/twitter, instagram, facebook, linkedin, youtube, github, tiktok,
  whatsapp, telegram, discord, mastodon, rss, email, website, phone) that supplies
  a monochrome brand icon (simple-icons, CC0; themed via `currentColor`) and a
  default label — `custom` still takes your own emoji/glyph. New `layout`
  (row/grid), `variant` (labeled/icon-only), and `align` options. Non-breaking.
- **Shipped interactive islands** — the engine now ships the client scripts for
  its interactive blocks (previously host-provided), as zero-dependency browser
  modules under the `./islands/*.js` subpath export:
  - `lightbox.js` — `gallery` click-to-zoom: prev/next, keyboard, swipe, Esc,
    caption, scroll-lock, focus restore.
  - `carousel.js` — `carousel` arrows, dot indicators, keyboard nav, and optional
    autoplay (honours `prefers-reduced-motion`, pauses on hover/focus).
- `renderSite(manifest, { islandBase })` to configure where island scripts are
  served (default `/_island`).
- Islands are built by a separate `tsconfig.islands.json` (DOM lib); the engine's
  Node code stays DOM-free. `gallery` now marks `data-wl-lightbox` when its
  lightbox is enabled.

## 0.4.0 — 2026-07-16

Additive and non-breaking — every `0.3.0` manifest still validates and renders
identically. Catalog 39 → 40.

### Added
- **`legal` block** — policy links (Terms, Privacy, Cookies, …) that open as
  **scrollable, dismissible dialogs** (pure CSS `:target`, no JavaScript). Each
  document's body is authored in a **safe Markdown subset** (headings, lists,
  links, emphasis, quotes, rules) — rich formatting, but **never raw HTML** (any
  literal HTML is escaped, not executed). Exports `renderMarkdown`. Catalog now
  40 blocks.

## 0.3.0 — 2026-07-16

Additive and non-breaking — every `0.2.0` manifest still validates and renders
identically. Catalog 37 → 39.

### Added
- **`search` block** — site search rendered as a full **search bar** or a
  compact **expanding icon button** (CSS-only, no JavaScript). A powered block
  that queries a host `search.query` runtime; degrades to an inert, valid GET
  form when unwired.
- **`directions` block** — a location card with **deep links that open the
  visitor’s map app for directions** (Google Maps universal URL + optional Apple
  Maps), built from an address, GPS coordinates, or a pasted map link. Static,
  no runtime. Catalog now 39 blocks.

## 0.2.0 — 2026-07-16

Rich, app-like PWAs. Additive and **non-breaking**: every `0.1.0` manifest still
validates and renders identically.

### Added
- **27 new blocks** (catalog now 37), all typed + totally-rendered:
  - chrome / app-shell: `app-shell`, `sidebar`, `announcement-bar`, `hero-app`
  - content: `about`, `rich-text`, `split`, `steps`, `stats`, `pricing`,
    `logos`, `team`
  - media: `carousel`, `video`, `map`
  - structured: `timeline`, `tabs`, `accordion`
  - collections: `blog-list`, `blog-post`, `feed`
  - dynamic (powered): `contact-form`, `newsletter`, `auth`
  - rhythm / links: `social-links`, `divider`, `spacer`
  - `rich-text` / `blog-post` use **typed content nodes** (never raw HTML).
- **Dynamic-block runtime contract** (`runtime.ts`): powered bricks declare
  `runtime.capabilities`; hosts wire them via a `RuntimeAdapter`
  (`NOOP_RUNTIME`, `pathRuntime`, `runtimeNeeds`). The engine bundles no backend.
- **Array-item edit ops** (`addItem` / `updateItem` / `removeItem` / `moveItem`)
  for surgical, single-item edits within a block's array field.
- **Theming**: named `DesignTokens` presets (`presets.ts` — `applyPreset`,
  `presetNames`, `getPreset`) and opt-in per-section `setOverrides` (palette
  **plus** `radius` / `spacing`).
- **Automatic light/dark**: `mode: 'auto'` now emits a
  `@media (prefers-color-scheme: dark)` palette that follows the viewer's OS
  theme; supply an optional `darkPalette` for the dark side (else a built-in
  default). `mode: 'light' | 'dark'` render single-palette as before.
- **Contrast-safe fills**: derived `--on-primary` / `--on-accent` tokens (via a
  WCAG-luminance `readableOn`) replace hardcoded `#fff` button text, so contrast
  holds on any palette. `readableOn` and `sectionOverrideCss` are exported.
- **PWA layer** (`pwa.ts`): derive `manifest.webmanifest` + a service worker from
  a `SiteManifest`; optional `pwa` / `seo` manifest fields; `renderSite` emits the
  matching `<head>` tags when opted in.
- `renderSite(manifest, { runtime })` to supply a host runtime.
- `VISION.md`; `docs/ARCHITECTURE.md` rewritten to cover only the engine.

## 0.1.0 — first shareable release

First release packaged for reuse across repositories.

- **Block engine**: compose a `SiteManifest` (design tokens + ordered typed
  blocks) → validate (strict) → total-render → one self-contained static HTML
  document. Rendering is a total function (never throws; unknown/invalid blocks
  are skipped).
- **10 blocks**: `nav`, `hero`, `features`, `services-catalogue`, `gallery`,
  `testimonials`, `faq`, `cta`, `contact-details`, `footer`.
- **AI contract**: `catalog()` / `catalogPrompt()` expose the block vocabulary as
  JSON Schema (for function-calling) and a compact prompt menu. `generateSite()`
  composes a manifest from a brief via an injected `ModelCall`; `editSite()`
  applies JSON edit ops. Validity is independent of model quality.
- **Design tokens**: a theme is a `DesignTokens` object (palette + scale/radius/
  spacing/motion); every block styles itself from CSS variables, so one token
  edit restyles the whole site.
- **Shareable artifacts**: `catalog.json` (the machine-readable contract) and
  `CATALOG.md` are generated on publish (`npm run emit:catalog`).
