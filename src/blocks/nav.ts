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
 *
 * ## Collapsing on small screens
 *
 * Below `BREAKPOINT` the link row collapses behind a toggle and expands as a
 * stacked panel; above it, the flat row renders exactly as it always has. The
 * toggle is a visually hidden checkbox driving `:checked ~ .links` — no island,
 * no `<script>`, and no dependency on JavaScript having loaded to reach the
 * links.
 *
 * `<details>/<summary>` would be the better *semantics* (and is what `accordion`
 * uses), but it cannot do this: a closed `<details>` hides its content through
 * `::details-content { content-visibility: hidden }`, which a child rule cannot
 * override, so the wide layout would need either `::details-content` support or
 * a server-rendered `open` — and `open` is a single choice baked into one static
 * file, while the state we need differs by viewport. A browser without
 * `::details-content` would render a desktop header with no visible links at
 * all. The checkbox has no such failure mode.
 *
 * The trade-off is announcement: the control reads as a checkbox named "Menu"
 * rather than an expandable button. `aria-expanded` is deliberately *not* set —
 * without JavaScript it could only ever be a hardcoded `false`, which becomes a
 * lie the moment the panel opens. A stale ARIA state is worse than none.
 *
 * The toggle is emitted only when there is something to collapse. A nav with no
 * links and no CTA renders byte-for-byte as before, toggle included in nothing.
 */
import { escapeAttr, escapeHtml, sanitizeUrl, slugify, type Schema } from '../schema.js';
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

/**
 * Where the flat row becomes a panel.
 *
 * Measured rather than guessed: laying all 136 starter-template navs out and
 * counting which ones wrap gives 5 of 136 still wrapping at 800px, 1 at 850–900,
 * and none from 950 up. A header is wider than the bricks below it — `about` and
 * `blog-list` turn over at 760 — because a brand, five labels and a CTA sit on
 * one line where those have a grid to collapse.
 *
 * 900 clears 135 of the 136. The straggler (a five-link nav with a 21-character
 * CTA) wraps to a second row between 900 and 950 exactly as it does today, which
 * is the pre-existing fallback rather than a regression.
 */
const BREAKPOINT = 900;

// The `.brand` rule is untouched from before the lockup; the lockup adds only
// the `.has-logo` modifier and the image sizing, so a text-only brand keeps its
// exact previous box.
//
// Above the breakpoint the toggle is `display:none` on both parts, so it
// contributes no box, no flex child and no computed style to the wide header —
// the row is laid out by exactly the rules that laid it out before.
const css = `
.blk-nav{background:var(--surface);border-bottom:1px solid color-mix(in srgb,var(--text) 10%,transparent)}
.blk-nav[data-sticky="true"]{position:sticky;top:0;z-index:10}
.blk-nav .wrap{max-width:1120px;margin:0 auto;display:flex;align-items:center;gap:calc(var(--space)*1.2);padding:.9rem var(--space)}
.blk-nav .brand{font-weight:800;font-size:var(--fs-lg);color:var(--text);text-decoration:none}
.blk-nav .brand.has-logo{display:inline-flex;align-items:center;gap:.5em}
.blk-nav .brand img{display:block;width:auto;object-fit:contain}
.blk-nav .menu-toggle,.blk-nav .menu-btn{display:none}
.blk-nav .links{display:flex;gap:calc(var(--space)*1.1);margin-left:auto;flex-wrap:wrap}
.blk-nav .links a:not(.cta){color:var(--muted);text-decoration:none;font-weight:500}
.blk-nav .links a:not(.cta):hover{color:var(--text)}
.blk-nav .cta{background:var(--primary);color:var(--on-primary);padding:.5em 1.1em;border-radius:var(--radius);text-decoration:none;font-weight:600;transition:filter var(--motion)}
.blk-nav .cta:hover{filter:brightness(1.08)}
@media(max-width:${BREAKPOINT}px){
.blk-nav .wrap{position:relative;flex-wrap:wrap}
.blk-nav .menu-toggle{position:absolute;width:1px;height:1px;margin:0;opacity:0}
.blk-nav .menu-btn{display:inline-flex;align-items:center;justify-content:center;margin-left:auto;padding:.6em;color:var(--text);cursor:pointer;border-radius:var(--radius)}
.blk-nav .menu-toggle:focus-visible+.menu-btn{outline:2px solid var(--primary);outline-offset:2px}
.blk-nav .menu-label{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.blk-nav .bars,.blk-nav .bars::before,.blk-nav .bars::after{display:block;width:1.25em;height:2px;background:currentColor;border-radius:2px;transition:transform var(--motion),background var(--motion),top var(--motion)}
.blk-nav .bars{position:relative}
.blk-nav .bars::before,.blk-nav .bars::after{content:"";position:absolute;left:0}
.blk-nav .bars::before{top:-6px}
.blk-nav .bars::after{top:6px}
.blk-nav .menu-toggle:checked+.menu-btn .bars{background:transparent}
.blk-nav .menu-toggle:checked+.menu-btn .bars::before{top:0;transform:rotate(45deg)}
.blk-nav .menu-toggle:checked+.menu-btn .bars::after{top:0;transform:rotate(-45deg)}
.blk-nav .links{display:none;flex-direction:column;flex-wrap:nowrap;align-items:stretch;width:100%;margin-left:0;gap:0;max-height:min(70vh,26rem);overflow-y:auto}
.blk-nav .menu-toggle:checked~.links{display:flex}
.blk-nav .links a{padding:.8em .1em}
.blk-nav .links a:not(.cta){border-top:1px solid color-mix(in srgb,var(--text) 10%,transparent)}
.blk-nav .cta{order:-1;margin:.4em 0 .6em;text-align:center}
}
@media(prefers-reduced-motion:reduce){.blk-nav .bars,.blk-nav .bars::before,.blk-nav .bars::after{transition:none}}
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

  // Nothing to collapse → no toggle, and the render stays what it always was.
  // The id is derived from the placed block's id so two navs on one page cannot
  // share a `for=`/`id=` pair and toggle each other; `slugify` keeps it
  // DOM-safe, and the fallback covers a render with no page context.
  const menuId = `wl-nav-${slugify(ctx?.id) || 'menu'}`;
  const toggle = links.length || cta.label
    ? `<input class="menu-toggle" type="checkbox" id="${escapeAttr(menuId)}">
    <label class="menu-btn" for="${escapeAttr(menuId)}"><span class="bars" aria-hidden="true"></span><span class="menu-label">Menu</span></label>
    `
    : '';

  return `<nav class="blk-nav" data-sticky="${sticky ? 'true' : 'false'}" aria-label="Primary">
  <div class="wrap">
    ${lockup}
    ${toggle}<div class="links">${linkHtml}${cta.label ? `<a class="cta" href="${href(cta)}">${escapeHtml(cta.label)}</a>` : ''}</div>
  </div>
</nav>`;
}

export const nav: BlockSpec = {
  type: 'nav',
  description: 'Top navigation bar: a brand lockup (wordmark text, a logo image, or both), a row of links, and an optional call-to-action button. Set `logo.src` for artwork and clear `brand` for a logo-only header. Responsive with no configuration — a flat row on wide screens, collapsing behind a menu toggle on phones. Place first.',
  schema, css, render,
};
