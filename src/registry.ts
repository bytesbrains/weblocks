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
import type { RuntimeAdapter } from './runtime.js';
import { nav } from './blocks/nav.js';
import { announcementBar } from './blocks/announcementBar.js';
import { hero } from './blocks/hero.js';
import { heroApp } from './blocks/heroApp.js';
import { features } from './blocks/features.js';
import { about } from './blocks/about.js';
import { richText } from './blocks/richText.js';
import { split } from './blocks/split.js';
import { steps } from './blocks/steps.js';
import { stats } from './blocks/stats.js';
import { services } from './blocks/services.js';
import { pricing } from './blocks/pricing.js';
import { logos } from './blocks/logos.js';
import { team } from './blocks/team.js';
import { gallery } from './blocks/gallery.js';
import { carousel } from './blocks/carousel.js';
import { video } from './blocks/video.js';
import { map } from './blocks/map.js';
import { timeline } from './blocks/timeline.js';
import { tabs } from './blocks/tabs.js';
import { accordion } from './blocks/accordion.js';
import { testimonials } from './blocks/testimonials.js';
import { faq } from './blocks/faq.js';
import { blogList } from './blocks/blogList.js';
import { blogPost } from './blocks/blogPost.js';
import { feed } from './blocks/feed.js';
import { contactForm } from './blocks/contactForm.js';
import { newsletter } from './blocks/newsletter.js';
import { search } from './blocks/search.js';
import { auth } from './blocks/auth.js';
import { cta } from './blocks/cta.js';
import { socialLinks } from './blocks/socialLinks.js';
import { contactDetails } from './blocks/contactDetails.js';
import { directions } from './blocks/directions.js';
import { legal } from './blocks/legal.js';
import { divider } from './blocks/divider.js';
import { spacer } from './blocks/spacer.js';
import { copyright } from './blocks/copyright.js';
import { appShell } from './blocks/appShell.js';
import { sidebar } from './blocks/sidebar.js';
import { footer } from './blocks/footer.js';

/** What a brick's `render` receives beyond its config + tokens (powered bricks). */
export interface RenderContext {
  /** The placed block's id — stable handle for the runtime contract. */
  id: string;
  /** Host-provided runtime; `resolve` returns null when unwired (inert render). */
  runtime: RuntimeAdapter;
}

export interface BlockSpec {
  type: string;
  /** One line the AI sees in its menu — what this brick is for. */
  description: string;
  /** Typed contract the config must satisfy (defaults + validation). */
  schema: Schema;
  /** The brick's own styles; emitted once per document if the brick is used. */
  css?: string;
  /**
   * Markup only — receives an already-normalized config + the shared tokens.
   * Powered bricks also read `ctx` (block id + runtime) to wire the §6 contract;
   * static bricks ignore it (signature is backwards-compatible).
   */
  render(config: Record<string, unknown>, tokens: DesignTokens, ctx?: RenderContext): string;
  /** Client island to hydrate (dynamic/interactive bricks). */
  island?: string;
  /**
   * Powered brick: the host runtime capabilities this brick needs (§6). Absent =
   * a pure static brick that works with no backend.
   */
  runtime?: { capabilities: string[] };
}

// Registration order = the order block CSS is emitted (stable output) and the
// order bricks appear in the AI's menu. Roughly top-to-bottom on a page.
const SPECS: readonly BlockSpec[] = [
  // chrome / app shell
  appShell, nav, announcementBar, sidebar,
  // heroes
  hero, heroApp,
  // content
  features, about, richText, split, steps, stats,
  services, pricing, logos, team,
  // media
  gallery, carousel, video, map,
  // structured content
  timeline, tabs, accordion, testimonials, faq,
  // collections
  blogList, blogPost, feed,
  // dynamic / powered
  contactForm, newsletter, search, auth,
  // conversion / contact
  cta, socialLinks, contactDetails, directions, legal,
  // rhythm
  divider, spacer,
  copyright, footer,
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
