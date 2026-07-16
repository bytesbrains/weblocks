/** `nav` — header bar: brand, links, optional CTA. Static brick. */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec, RenderContext } from '../registry.js';

const schema: Schema = {
  brand: { kind: 'string', required: true, default: 'Brand', max: 60 },
  sticky: { kind: 'boolean', default: false },
  links: {
    kind: 'array', max: 8,
    of: { kind: 'object', fields: { label: { kind: 'string', required: true, default: 'Link', max: 40 }, href: { kind: 'string', default: '#', max: 300 } } },
  },
  cta: { kind: 'object', fields: { label: { kind: 'string', default: '', max: 40 }, href: { kind: 'string', default: '#', max: 300 } } },
};

const css = `
.blk-nav{background:var(--surface);border-bottom:1px solid color-mix(in srgb,var(--text) 10%,transparent)}
.blk-nav[data-sticky="true"]{position:sticky;top:0;z-index:10}
.blk-nav .wrap{max-width:1120px;margin:0 auto;display:flex;align-items:center;gap:calc(var(--space)*1.2);padding:.9rem var(--space)}
.blk-nav .brand{font-weight:800;font-size:var(--fs-lg);color:var(--text);text-decoration:none}
.blk-nav .links{display:flex;gap:calc(var(--space)*1.1);margin-left:auto;flex-wrap:wrap}
.blk-nav .links a{color:var(--muted);text-decoration:none;font-weight:500}
.blk-nav .links a:hover{color:var(--text)}
.blk-nav .cta{background:var(--primary);color:var(--on-primary);padding:.5em 1.1em;border-radius:var(--radius);text-decoration:none;font-weight:600}
`.trim();

type Link = { label: string; href: string };

function render(config: Record<string, unknown>, _tokens?: unknown, ctx?: RenderContext): string {
  const brand = config.brand as string;
  const sticky = config.sticky as boolean;
  const links = (config.links as Link[]) ?? [];
  const cta = config.cta as Link;
  // Resolve in-page links to real section anchors (falls back to plain sanitize
  // when rendered without a page context, e.g. a single block in isolation).
  const href = (l: Link) => escapeAttr(sanitizeUrl(ctx?.resolveLink ? ctx.resolveLink(l.href, l.label) : l.href));
  const linkHtml = links.map((l) => `<a href="${href(l)}">${escapeHtml(l.label)}</a>`).join('');
  return `<nav class="blk-nav" data-sticky="${sticky ? 'true' : 'false'}" aria-label="Primary">
  <div class="wrap">
    <a class="brand" href="#">${escapeHtml(brand)}</a>
    <div class="links">${linkHtml}${cta.label ? `<a class="cta" href="${href(cta)}">${escapeHtml(cta.label)}</a>` : ''}</div>
  </div>
</nav>`;
}

export const nav: BlockSpec = {
  type: 'nav',
  description: 'Top navigation bar: brand/logo text, a row of links, and an optional call-to-action button. Place first.',
  schema, css, render,
};
