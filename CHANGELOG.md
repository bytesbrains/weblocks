# Changelog

All notable changes to `@bytesbrains/weblocks` are documented here. The package
follows [semantic versioning](https://semver.org): the **block catalog** and the
**`SiteManifest` shape** are the public contract — additive block/field changes
are minor, breaking changes to either are major.

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
