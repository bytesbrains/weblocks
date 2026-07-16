/**
 * Core types for the block engine (see docs/APPS_BLOCKS_ARCHITECTURE.md).
 *
 * A `SiteManifest` is the single source of truth the AI *composes and edits* —
 * design tokens (the shared "baseplate") plus an ordered list of typed blocks
 * (the "bricks"). It is never raw HTML: the renderer turns a manifest into a
 * self-contained static document, and every reachable manifest is valid by
 * construction (schema-validated before it is applied).
 */

export type Mode = 'light' | 'dark' | 'auto';
export type Scale = 'compact' | 'default' | 'expressive';
export type Radius = 'sharp' | 'soft' | 'round';
export type Spacing = 'tight' | 'default' | 'airy';
export type Motion = 'none' | 'subtle' | 'lively';

/** The shared design system every block inherits (coherence = one edit changes the whole site). */
export interface Palette {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  primary: string;
  accent: string;
}

export interface DesignTokens {
  mode: Mode;
  palette: Palette;
  /**
   * Optional dark-mode palette. Only consulted when `mode: 'auto'`: the base
   * `palette` renders by default and this one takes over under
   * `@media (prefers-color-scheme: dark)`. Absent + `auto` → a built-in default
   * dark palette. Ignored for `mode: 'light' | 'dark'` (the palette is used as-is).
   */
  darkPalette?: Palette;
  typography: { fontStack: string; scale: Scale };
  radius: Radius;
  spacing: Spacing;
  motion: Motion;
}

/**
 * Per-section design overrides (opt-in). A block may tint itself away from the
 * shared baseplate for a subset of palette roles; the renderer scopes these as
 * CSS custom properties on a wrapper so only that section is affected and the
 * rest of the site stays coherent. Additive + optional — absent = inherit.
 */
export type SectionOverrides = Partial<Palette> & { radius?: Radius; spacing?: Spacing };

/** One placed brick: a type from the closed catalog + its typed, validated config. */
export interface Block {
  id: string;
  type: string;
  visible: boolean;
  config: Record<string, unknown>;
  /** Opt-in per-section palette overrides (§ theming). Absent = inherit tokens. */
  overrides?: SectionOverrides;
}

export interface SiteMeta {
  title: string;
  description: string;
  lang: string;
  /**
   * Optional browser-tab favicon: a URL to an icon (svg/png/ico), OR a single
   * emoji/glyph (rendered as an inline SVG data URI). Absent = no icon link.
   */
  favicon?: string;
}

/**
 * Optional PWA descriptor. When present the engine can emit a Web App Manifest
 * + service worker alongside the HTML, and the document gains installability
 * meta. Additive: a manifest without a `pwa` block renders exactly as before.
 */
export interface PwaConfig {
  name?: string;
  shortName?: string;
  description?: string;
  themeColor?: string;
  backgroundColor?: string;
  display?: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  startUrl?: string;
  scope?: string;
  icons?: Array<{ src: string; sizes: string; type?: string; purpose?: string }>;
  /** Precache the static shell + offer an offline fallback. */
  offline?: boolean;
}

/** Optional SEO/social descriptor emitted into <head>. Additive + optional. */
export interface SeoConfig {
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  noindex?: boolean;
}

export interface SiteManifest {
  meta: SiteMeta;
  design: DesignTokens;
  blocks: Block[];
  /** Bumped on each accepted edit → undo / history / draft-vs-publish. */
  version: number;
  /** Optional: emit a Web App Manifest + service worker (installable PWA). */
  pwa?: PwaConfig;
  /** Optional: SEO/social meta for <head>. */
  seo?: SeoConfig;
}
