/**
 * Shared authoring helpers + the `Template` shape for the per-vertical template
 * modules in this folder. Kept separate from `../templates.js` (the registry) so
 * a vertical module never has to import the registry that imports it.
 *
 * Every template is declared with a single `tpl({...})` call so the metadata a
 * picker filters on (vertical, tags, layout, preset) sits right next to the copy
 * it describes, and so adding a field later is a one-place change.
 */
import type { SiteManifest, Block } from '../types.js';
import { getPreset } from '../presets.js';
import { DEFAULT_TOKENS } from '../tokens.js';

/**
 * Coarse page-shape family — the *structural* axis, orthogonal to `vertical`
 * (which is the *subject* axis). A host can offer "show me the editorial ones"
 * across every industry, or "another layout for this same business".
 */
export type TemplateLayout =
  /** Nav → image hero → alternating sections → contact → footer. The safe default. */
  | 'classic'
  /** Type-led, long-form, generous whitespace; images support the text. */
  | 'editorial'
  /** Very few sections, no ornament, one clear action. */
  | 'minimal'
  /** Full-bleed hero, heavy type, high-contrast preset, punchy CTAs. */
  | 'bold'
  /** App-shell / tab-bar chrome, `hero-app`, install prompt — reads like a product. */
  | 'app'
  /** Built around a person: profile-header, experience, skills, socials. */
  | 'profile'
  /** The list IS the page: services, menu, pricing or product grids up top. */
  | 'catalogue'
  /** Images first and largest — gallery/carousel carries the persuasion. */
  | 'showcase'
  /** Single-purpose conversion page: proof, offer, one CTA repeated. */
  | 'landing'
  /** Chat/feed-shaped — chat-thread or feed as the primary content. */
  | 'conversational';

export interface Template {
  /** Stable id, e.g. `restaurant-modern`. Never rename — hosts persist it. */
  id: string;
  /** A `verticalNames()` value this template belongs to. */
  vertical: string;
  /** Human label for a picker, conventionally `"<Thing> — <Variant>"`. */
  label: string;
  /** One line describing who it is for — shown under the label in a picker. */
  description: string;
  /** Lowercase-kebab facets for search/filtering, e.g. `['pets', 'booking']`. */
  tags: readonly string[];
  /** Page-shape family, for "another layout for the same business". */
  layout: TemplateLayout;
  /** The `presetNames()` value baked into `manifest.design` (kept recoverable). */
  preset: string;
  /** Complete, `validateManifest`-clean manifest with realistic copy. */
  manifest: SiteManifest;
}

/** Neutral remote placeholder photo — hosts/users swap these for real images. */
export const img = (seed: string): string => `https://picsum.photos/seed/${seed}/800/600`;

/** A visible block with an explicit id (all template blocks are visible). */
export const b = (id: string, type: string, config: Record<string, unknown>): Block => ({ id, type, visible: true, config });

/** Declare one template: metadata + meta + blocks in a single call site. */
export function tpl(t: {
  id: string;
  vertical: string;
  label: string;
  description: string;
  tags: readonly string[];
  layout: TemplateLayout;
  preset: string;
  meta: SiteManifest['meta'];
  blocks: Block[];
}): Template {
  const { meta, blocks, preset, ...rest } = t;
  return {
    ...rest,
    preset,
    manifest: { meta, design: getPreset(preset) ?? DEFAULT_TOKENS, blocks, version: 1 },
  };
}
