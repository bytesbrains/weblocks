/**
 * In-page anchors — makes nav links actually scroll (issue #26).
 *
 * `renderSite` emits sections without ids, so `#about` / `#menu` resolve to
 * nothing. This module computes a stable, de-duped anchor id per content section
 * (a canonical slug that can differ from the block's short CSS class, e.g.
 * `contact-details` → `contact`, `services-catalogue` → `services`) and resolves
 * a nav/CTA link — by its `#hash`, its label, or a common alias — to a real id.
 * Chrome blocks (nav, app-shell, sidebar, announcement-bar, install-prompt) and pure rhythm
 * blocks get no anchor. Unresolved links fall back to `#` (top), never a dead
 * anchor. Render-side, so re-rendering an existing manifest just works.
 */
import { slugify } from './schema.js';
import type { Block } from './types.js';

const SKIP = new Set(['nav', 'app-shell', 'sidebar', 'announcement-bar', 'install-prompt', 'divider', 'spacer']);

/** Canonical anchor slug per block type (default = the type name). */
const SECTION_SLUG: Record<string, string> = {
  hero: 'home', 'hero-app': 'home', 'profile-header': 'home',
  about: 'about',
  'contact-details': 'contact', 'contact-form': 'contact',
  'services-catalogue': 'services',
  testimonials: 'reviews',
  'blog-list': 'blog', 'blog-post': 'blog',
  'video-gallery': 'videos',
};

/** Common nav-label slugs → the canonical section slug they mean. */
const ALIAS: Record<string, string> = {
  menu: 'services', catalog: 'services', catalogue: 'services', products: 'services', shop: 'services',
  story: 'about', 'our-story': 'about', 'about-us': 'about', bio: 'about', 'who-we-are': 'about',
  'get-in-touch': 'contact', 'contact-us': 'contact', 'reach-us': 'contact', reach: 'contact', hire: 'contact', 'hire-me': 'contact',
  testimonials: 'reviews', feedback: 'reviews',
  work: 'gallery', portfolio: 'gallery', photos: 'gallery',
  questions: 'faq', help: 'faq',
  plans: 'pricing', prices: 'pricing',
};

function sectionSlug(type: string): string | null {
  if (SKIP.has(type)) return null;
  return SECTION_SLUG[type] ?? type;
}

export interface Anchors {
  /** blockId → the anchor id emitted on its section (absent = skipped). */
  idFor: Map<string, string>;
  /** Resolve a nav/CTA link (by hash, label, or alias) to a working href. */
  resolve(href: unknown, label?: string): string;
}

/** Assign a unique anchor id to each anchorable block and build a link resolver. */
export function buildAnchors(blocks: Block[]): Anchors {
  const idFor = new Map<string, string>();
  const ids = new Set<string>();       // every emitted anchor id
  const slugToId = new Map<string, string>(); // canonical slug → first emitted id of that type

  for (const b of blocks) {
    const base = b && sectionSlug(b.type);
    if (!base || !b.id) continue;
    let id = base;
    for (let n = 2; ids.has(id); n++) id = `${base}-${n}`; // de-dup repeats
    ids.add(id);
    idFor.set(b.id, id);
    if (!slugToId.has(base)) slugToId.set(base, id);
  }

  // A slug → an existing anchor id: exact id (incl. de-duped like `features-2`),
  // canonical slug, or a common alias. '' when nothing matches.
  const lookup = (key: string): string =>
    (ids.has(key) ? key : slugToId.get(key) ?? slugToId.get(ALIAS[key] ?? '') ?? '');

  const resolve = (href: unknown, label = ''): string => {
    const raw = String(href ?? '').trim();
    if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) return raw; // scheme (http/mailto/tel/…) → external, untouched
    if (raw && !raw.startsWith('#')) return raw;       // relative path/query → untouched
    const key = slugify(raw.startsWith('#') && raw.length > 1 ? raw.slice(1) : label); // hash text, else label
    if (!key || key === 'home' || key === 'top' || key === 'start') return '#'; // Home/Top → page top
    const id = lookup(key);
    return id ? `#${id}` : '#'; // resolved anchor, else top (never a dead anchor)
  };

  return { idFor, resolve };
}

/** Insert an anchor `id` into the first element of a block's rendered HTML. */
export function injectAnchorId(html: string, id: string): string {
  return html.replace(/^(\s*<[a-zA-Z][\w-]*)(\s|>)/, (_m, open, next) => `${open} id="${id}"${next}`);
}
