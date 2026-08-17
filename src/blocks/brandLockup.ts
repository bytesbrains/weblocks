/**
 * Shared brand-lockup parts for the bricks that show a site's identity
 * (`nav`, `footer`) — the schema field, the placeholder mark, and the <img>.
 *
 * Each brick composes its own wrapper and CSS: a header lockup is a link and a
 * footer lockup is not, and they sit on different backgrounds at different
 * sizes. Only the parts that must not drift live here.
 *
 * `app-shell` deliberately has no lockup: its `brand` is `display:none` and
 * exists only to name the bottom tab bar via `aria-label`, so an image there
 * would render nothing.
 */
import { escapeAttr, sanitizeUrl, type Field } from '../schema.js';

export type Logo = { src: string; alt: string; height: number; placeholder: boolean };

/** The `logo` object field, identical across the bricks that accept one. */
export const LOGO_FIELD: Field = {
  kind: 'object',
  fields: {
    src: { kind: 'string', default: '', max: 500 },
    alt: { kind: 'string', default: '', max: 120 },
    height: { kind: 'int', default: 28, min: 16, max: 64 }, // rendered px height
    placeholder: { kind: 'boolean', default: false },       // fall back to the weblocks mark
  },
};

/**
 * The weblocks brick mark, inlined as a data URI rather than linked from
 * `assets/` — a rendered site is copied anywhere, so a relative asset path
 * would break. Kept in sync with `assets/weblocks-mark.svg`.
 */
export const PLACEHOLDER_MARK =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
    '<g stroke="#16375e" stroke-width="2.2" stroke-linejoin="round">' +
    '<path fill="#f5b942" d="M32 5 6 20l26 15z"/><path fill="#e8382f" d="M32 5l26 15-26 15z"/>' +
    '<path fill="#f0a32b" d="M6 20l26 15v13L6 33z"/><path fill="#0e9c8c" d="M6 33l26 15v13L6 46z"/>' +
    '<path fill="#2e6fd0" d="M58 20 32 35v13l26-15z"/><path fill="#16375e" d="M58 33 32 48v13l26-15z"/></g>' +
    '<g fill="#16375e" opacity=".25"><ellipse cx="23" cy="19" rx="5.4" ry="3.1"/>' +
    '<ellipse cx="41" cy="19" rx="5.4" ry="3.1"/></g>' +
    '<path fill="#fff" d="M54.1 37.6 35.9 48.1v8.05l18.2-10.5z"/></svg>',
  );

/**
 * Resolve the brand image to a usable src, or '' for "render text only".
 * An unsafe or empty `src` degrades rather than emitting a broken <img>; the
 * opt-in placeholder is the last resort, never a silent default.
 */
function logoSrc(logo: Logo | undefined): string {
  const raw = String(logo?.src ?? '').trim();
  if (raw) {
    const safe = sanitizeUrl(raw);
    if (safe !== '#') return safe;
  }
  return logo?.placeholder ? PLACEHOLDER_MARK : '';
}

/**
 * The brand <img>, or '' when nothing usable resolves.
 *
 * `decorative` means a visible wordmark sits beside it — the image is then
 * captioned empty, because announcing the brand twice is worse than not
 * announcing the image at all. Standing alone it takes `logo.alt`, falling back
 * to `fallbackAlt` (a header lockup is a link, so it must never be left
 * nameless; a footer mark may legitimately end up decorative).
 */
export function logoImg(logo: Logo | undefined, decorative: boolean, fallbackAlt = ''): string {
  const src = logoSrc(logo);
  if (!src) return '';
  const alt = decorative ? '' : (String(logo?.alt ?? '').trim() || fallbackAlt);
  // The one value interpolated outside an escaper (it lands in `style`), so it
  // is coerced and clamped here rather than trusting the schema to have run.
  const height = Math.min(64, Math.max(16, Math.round(Number(logo?.height)) || 28));
  // No `loading="lazy"`: a header brand is above the fold, where deferring it
  // only delays LCP.
  return `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}"${alt ? '' : ' aria-hidden="true"'} style="height:${height}px" decoding="async">`;
}
