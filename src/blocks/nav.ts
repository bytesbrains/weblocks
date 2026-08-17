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
 * With no logo the markup and CSS are byte-for-byte what they were before the
 * lockup existed — no wrapper span, no modifier class — so an existing manifest
 * (or a stylesheet targeting `.blk-nav .brand`) cannot be disturbed by a
 * feature it never opted into.
 *
 * `logo.placeholder` opts a site into the built-in weblocks mark when no `src`
 * resolves — useful while composing, before real artwork exists. It is off by
 * default and never inferred: this engine renders *other people's* sites, so a
 * mark they did not ask for must never appear in their header.
 */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import { LOGO_FIELD, logoImg, type Logo } from './brandLockup.js';
import type { BlockSpec, RenderContext } from '../registry.js';

const schema: Schema = {
  // Not `required`: a logo-only header sets this to '' deliberately. Absent
  // still defaults to 'Brand', so existing manifests render exactly as before.
  brand: { kind: 'string', default: 'Brand', max: 60 },
  logo: LOGO_FIELD,
  sticky: { kind: 'boolean', default: false },
  links: {
    kind: 'array', max: 8,
    of: { kind: 'object', fields: { label: { kind: 'string', required: true, default: 'Link', max: 40 }, href: { kind: 'string', default: '#', max: 300 } } },
  },
  cta: { kind: 'object', fields: { label: { kind: 'string', default: '', max: 40 }, href: { kind: 'string', default: '#', max: 300 } } },
};

// The `.brand` rule is untouched from before the lockup; the lockup adds only
// the `.has-logo` modifier and the image sizing, so a text-only brand keeps its
// exact previous box.
const css = `
.blk-nav{background:var(--surface);border-bottom:1px solid color-mix(in srgb,var(--text) 10%,transparent)}
.blk-nav[data-sticky="true"]{position:sticky;top:0;z-index:10}
.blk-nav .wrap{max-width:1120px;margin:0 auto;display:flex;align-items:center;gap:calc(var(--space)*1.2);padding:.9rem var(--space)}
.blk-nav .brand{font-weight:800;font-size:var(--fs-lg);color:var(--text);text-decoration:none}
.blk-nav .brand.has-logo{display:inline-flex;align-items:center;gap:.5em}
.blk-nav .brand img{display:block;width:auto;object-fit:contain}
.blk-nav .links{display:flex;gap:calc(var(--space)*1.1);margin-left:auto;flex-wrap:wrap}
.blk-nav .links a:not(.cta){color:var(--muted);text-decoration:none;font-weight:500}
.blk-nav .links a:not(.cta):hover{color:var(--text)}
.blk-nav .cta{background:var(--primary);color:var(--on-primary);padding:.5em 1.1em;border-radius:var(--radius);text-decoration:none;font-weight:600;transition:filter var(--motion)}
.blk-nav .cta:hover{filter:brightness(1.08)}
`.trim();

type Link = { label: string; href: string };

function render(config: Record<string, unknown>, _tokens?: unknown, ctx?: RenderContext): string {
  const brand = String(config.brand ?? '').trim();
  const sticky = config.sticky as boolean;
  const links = (config.links as Link[]) ?? [];
  const cta = config.cta as Link;
  // Resolve in-page links to real section anchors (falls back to plain sanitize
  // when rendered without a page context, e.g. a single block in isolation).
  const href = (l: Link) => escapeAttr(sanitizeUrl(ctx?.resolveLink ? ctx.resolveLink(l.href, l.label) : l.href));
  const linkHtml = links.map((l) => `<a href="${href(l)}">${escapeHtml(l.label)}</a>`).join('');

  // The anchor is a link, so it must never be left without an accessible name.
  const img = logoImg(config.logo as Logo, !!brand, 'Home');
  const text = brand ? escapeHtml(brand) : '';
  // No image → the plain wordmark exactly as it rendered before the lockup.
  const inner = img ? `${img}${text ? `<span class="name">${text}</span>` : ''}` : text;
  // Both halves empty (brand cleared, no logo) → no anchor at all, rather than
  // an empty link with no accessible name.
  const lockup = inner ? `<a class="brand${img ? ' has-logo' : ''}" href="#">${inner}</a>` : '';

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
