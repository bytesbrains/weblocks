# Changelog

All notable changes to `@bytesbrains/weblocks` are documented here. The package
follows [semantic versioning](https://semver.org): the **block catalog** and the
**`SiteManifest` shape** are the public contract — additive block/field changes
are minor, breaking changes to either are major.

## Unreleased

Additive, non-breaking. Every 0.1.0 manifest still validates and renders
identically.

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
