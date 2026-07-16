# Changelog

All notable changes to `@bytesbrains/weblocks` are documented here. The package
follows [semantic versioning](https://semver.org): the **block catalog** and the
**`SiteManifest` shape** are the public contract — additive block/field changes
are minor, breaking changes to either are major.

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
