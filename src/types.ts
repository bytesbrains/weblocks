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
  typography: { fontStack: string; scale: Scale };
  radius: Radius;
  spacing: Spacing;
  motion: Motion;
}

/** One placed brick: a type from the closed catalog + its typed, validated config. */
export interface Block {
  id: string;
  type: string;
  visible: boolean;
  config: Record<string, unknown>;
}

export interface SiteMeta {
  title: string;
  description: string;
  lang: string;
}

export interface SiteManifest {
  meta: SiteMeta;
  design: DesignTokens;
  blocks: Block[];
  /** Bumped on each accepted edit → undo / history / draft-vs-publish. */
  version: number;
}
