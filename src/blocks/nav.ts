/**
 * `nav` — header bar: brand, links, optional CTA. Static brick.
 *
 * The brand slot is a *lockup*, not a single string: an optional `logo` image
 * sits next to the `brand` wordmark, and either half can stand alone. The three
 * shapes fall out of what is set, with no mode flag to keep in sync:
 *
 *   brand only              → wordmark (the historic behaviour, unchanged)
 *   brand + logo.src        → mark next to wordmark
 *   logo.src, brand: ''     → mark alone (the logo already says the name)
 *
 * `logo.placeholder` opts a site into the built-in weblocks mark when no `src`
 * resolves — useful while composing, before real artwork exists. It is off by
 * default and never inferred: this engine renders *other people's* sites, so a
 * mark they did not ask for must never appear in their header.
 */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec, RenderContext } from '../registry.js';

const schema: Schema = {
  // Not `required`: a logo-only header sets this to '' deliberately. Absent
  // still defaults to 'Brand', so existing manifests render exactly as before.
  brand: { kind: 'string', default: 'Brand', max: 60 },
  logo: {
    kind: 'object',
    fields: {
      src: { kind: 'string', default: '', max: 500 },
      alt: { kind: 'string', default: '', max: 120 },
      height: { kind: 'int', default: 28, min: 16, max: 64 }, // rendered px height
      placeholder: { kind: 'boolean', default: false },       // fall back to the weblocks mark
    },
  },
  sticky: { kind: 'boolean', default: false },
  links: {
    kind: 'array', max: 8,
    of: { kind: 'object', fields: { label: { kind: 'string', required: true, default: 'Link', max: 40 }, href: { kind: 'string', default: '#', max: 300 } } },
  },
  cta: { kind: 'object', fields: { label: { kind: 'string', default: '', max: 40 }, href: { kind: 'string', default: '#', max: 300 } } },
};

/**
 * The weblocks brick mark, inlined as a data URI rather than linked from
 * `assets/` — a rendered site is copied anywhere, so a relative asset path
 * would break. Kept in sync with `assets/weblocks-mark.svg`.
 */
const PLACEHOLDER_MARK =
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

const css = `
.blk-nav{background:var(--surface);border-bottom:1px solid color-mix(in srgb,var(--text) 10%,transparent)}
.blk-nav[data-sticky="true"]{position:sticky;top:0;z-index:10}
.blk-nav .wrap{max-width:1120px;margin:0 auto;display:flex;align-items:center;gap:calc(var(--space)*1.2);padding:.9rem var(--space)}
.blk-nav .brand{display:inline-flex;align-items:center;gap:.5em;font-weight:800;font-size:var(--fs-lg);color:var(--text);text-decoration:none}
.blk-nav .brand img{display:block;width:auto;object-fit:contain}
.blk-nav .links{display:flex;gap:calc(var(--space)*1.1);margin-left:auto;flex-wrap:wrap}
.blk-nav .links a:not(.cta){color:var(--muted);text-decoration:none;font-weight:500}
.blk-nav .links a:not(.cta):hover{color:var(--text)}
.blk-nav .cta{background:var(--primary);color:var(--on-primary);padding:.5em 1.1em;border-radius:var(--radius);text-decoration:none;font-weight:600;transition:filter var(--motion)}
.blk-nav .cta:hover{filter:brightness(1.08)}
`.trim();

type Link = { label: string; href: string };
type Logo = { src: string; alt: string; height: number; placeholder: boolean };

/**
 * Resolve the brand image to a usable src, or '' for "render text only".
 * An unsafe or empty `src` degrades rather than emitting a broken <img>; the
 * opt-in placeholder is the last resort, never a silent default.
 */
function logoSrc(logo: Logo): string {
  const raw = String(logo?.src ?? '').trim();
  if (raw) {
    const safe = sanitizeUrl(raw);
    if (safe !== '#') return safe;
  }
  return logo?.placeholder ? PLACEHOLDER_MARK : '';
}

function render(config: Record<string, unknown>, _tokens?: unknown, ctx?: RenderContext): string {
  const brand = String(config.brand ?? '').trim();
  const logo = config.logo as Logo;
  const sticky = config.sticky as boolean;
  const links = (config.links as Link[]) ?? [];
  const cta = config.cta as Link;
  // Resolve in-page links to real section anchors (falls back to plain sanitize
  // when rendered without a page context, e.g. a single block in isolation).
  const href = (l: Link) => escapeAttr(sanitizeUrl(ctx?.resolveLink ? ctx.resolveLink(l.href, l.label) : l.href));
  const linkHtml = links.map((l) => `<a href="${href(l)}">${escapeHtml(l.label)}</a>`).join('');

  const src = logoSrc(logo);
  // Alt text carries the site name only when the mark stands alone. Beside a
  // visible wordmark the image is decorative — captioning it too would make a
  // screen reader announce the brand twice.
  const alt = brand ? '' : (String(logo?.alt ?? '').trim() || 'Home');
  // The one value interpolated outside an escaper (it lands in `style`), so it
  // is coerced and clamped here too rather than trusting the schema to have run.
  const height = Math.min(64, Math.max(16, Math.round(Number(logo?.height)) || 28));
  // No `loading="lazy"`: the header is above the fold, where deferring the
  // brand image only delays LCP.
  const img = src
    ? `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}"${brand ? ' aria-hidden="true"' : ''} style="height:${height}px" decoding="async">`
    : '';
  const wordmark = brand ? `<span class="name">${escapeHtml(brand)}</span>` : '';
  // Both halves empty (brand cleared, no logo) → no anchor at all, rather than
  // an empty link with no accessible name.
  const lockup = img || wordmark ? `<a class="brand" href="#">${img}${wordmark}</a>` : '';

  return `<nav class="blk-nav" data-sticky="${sticky ? 'true' : 'false'}" aria-label="Primary">
  <div class="wrap">
    ${lockup}
    <div class="links">${linkHtml}${cta.label ? `<a class="cta" href="${href(cta)}">${escapeHtml(cta.label)}</a>` : ''}</div>
  </div>
</nav>`;
}

export const nav: BlockSpec = {
  type: 'nav',
  description: 'Top navigation bar: a brand lockup (wordmark text, a logo image, or both), a row of links, and an optional call-to-action button. Set `logo.src` for artwork and clear `brand` for a logo-only header. Place first.',
  schema, css, render,
};
