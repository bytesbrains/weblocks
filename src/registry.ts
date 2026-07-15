/**
 * The block registry — the *closed vocabulary*. A block type exists iff it is
 * registered here; the AI can only compose from this set, and an unknown type
 * is simply skipped by the renderer (total, never throws).
 *
 * Each brick owns its schema (studs), its own CSS (included once when used),
 * and a markup renderer. Adding a capability = registering a new brick that
 * clears the "brick definition-of-done" (see docs/APPS_BLOCKS_ARCHITECTURE.md).
 */
import type { Schema } from './schema.js';
import type { DesignTokens } from './types.js';
import { nav } from './blocks/nav.js';
import { hero } from './blocks/hero.js';
import { features } from './blocks/features.js';
import { services } from './blocks/services.js';
import { gallery } from './blocks/gallery.js';
import { testimonials } from './blocks/testimonials.js';
import { faq } from './blocks/faq.js';
import { cta } from './blocks/cta.js';
import { contactDetails } from './blocks/contactDetails.js';
import { footer } from './blocks/footer.js';

export interface BlockSpec {
  type: string;
  /** One line the AI sees in its menu — what this brick is for. */
  description: string;
  /** Typed contract the config must satisfy (defaults + validation). */
  schema: Schema;
  /** The brick's own styles; emitted once per document if the brick is used. */
  css?: string;
  /** Markup only — receives an already-normalized config + the shared tokens. */
  render(config: Record<string, unknown>, tokens: DesignTokens): string;
  /** Client island to hydrate (dynamic/interactive bricks). */
  island?: string;
}

// Registration order = the order block CSS is emitted (stable output) and the
// order bricks appear in the AI's menu. Roughly top-to-bottom on a page.
const SPECS: readonly BlockSpec[] = [
  nav, hero, features, services, gallery, testimonials, faq, cta, contactDetails, footer,
];

export const REGISTRY: ReadonlyMap<string, BlockSpec> = new Map(SPECS.map((s) => [s.type, s]));

export function getSpec(type: string): BlockSpec | undefined {
  return REGISTRY.get(type);
}

/** The vocabulary the AI is allowed to emit — its "menu" of brick types. */
export function blockTypes(): string[] {
  return [...REGISTRY.keys()];
}

/**
 * Whether a used block needs its island hydrated in THIS config. Static bricks
 * (and interactive bricks with their behaviour toggled off, e.g. gallery with
 * `lightbox:false`) ship zero JS — the "static-first" invariant.
 */
export function needsIsland(spec: BlockSpec, config: Record<string, unknown>): boolean {
  if (!spec.island) return false;
  if (spec.type === 'gallery') return config.lightbox === true;
  return true;
}
