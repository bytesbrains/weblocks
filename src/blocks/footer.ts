/** `footer` — brand, links, copyright. Static brick. Place last. */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  brand: { kind: 'string', default: '', max: 60 },
  tagline: { kind: 'string', default: '', max: 160 },
  links: {
    kind: 'array', max: 12,
    of: { kind: 'object', fields: { label: { kind: 'string', required: true, default: 'Link', max: 40 }, href: { kind: 'string', default: '#', max: 300 } } },
  },
  copyright: { kind: 'string', default: '', max: 160 },
};

const css = `
.blk-footer{padding:var(--space-lg) var(--space);background:var(--text);color:color-mix(in srgb,var(--surface) 82%,var(--text))}
.blk-footer .wrap{max-width:1120px;margin:0 auto;display:flex;flex-wrap:wrap;gap:var(--space);align-items:baseline;justify-content:space-between}
.blk-footer .brand{font-weight:800;font-size:var(--fs-lg);color:var(--surface)}
.blk-footer .tagline{margin:.3em 0 0;opacity:.7;max-width:40ch}
.blk-footer .links{display:flex;flex-wrap:wrap;gap:calc(var(--space)*1.1)}
.blk-footer .links a{color:inherit;text-decoration:none;opacity:.85}
.blk-footer .links a:hover{opacity:1}
.blk-footer .copy{width:100%;opacity:.6;font-size:var(--fs-base);margin-top:var(--space)}
`.trim();

type Link = { label: string; href: string };

function render(config: Record<string, unknown>): string {
  const brand = config.brand as string;
  const tagline = config.tagline as string;
  const links = (config.links as Link[]) ?? [];
  const copyright = config.copyright as string;
  const linkHtml = links.map((l) => `<a href="${escapeAttr(sanitizeUrl(l.href))}">${escapeHtml(l.label)}</a>`).join('');
  return `<footer class="blk-footer">
  <div class="wrap">
    <div>${brand ? `<div class="brand">${escapeHtml(brand)}</div>` : ''}${tagline ? `<p class="tagline">${escapeHtml(tagline)}</p>` : ''}</div>
    ${links.length ? `<nav class="links" aria-label="Footer">${linkHtml}</nav>` : ''}
    ${copyright ? `<div class="copy">${escapeHtml(copyright)}</div>` : ''}
  </div>
</footer>`;
}

export const footer: BlockSpec = {
  type: 'footer',
  description: 'Page footer: brand, tagline, a row of links, and a copyright line. Place last.',
  schema, css, render,
};
