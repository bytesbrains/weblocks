/** `services-catalogue` — a grid of services/products. Static brick. */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  title: { kind: 'string', default: '', max: 120 },
  subtitle: { kind: 'string', default: '', max: 240 },
  items: {
    kind: 'array',
    max: 24,
    of: {
      kind: 'object',
      fields: {
        name: { kind: 'string', required: true, default: 'Service', max: 80 },
        description: { kind: 'string', default: '', max: 300 },
        price: { kind: 'string', default: '', max: 40 },
        ctaLabel: { kind: 'string', default: '', max: 40 },
        ctaHref: { kind: 'string', default: '#', max: 500 },
      },
    },
  },
};

const css = `
.blk-services{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-services .wrap{max-width:1080px;margin:0 auto}
.blk-services .head{text-align:center;margin-bottom:var(--space-lg)}
.blk-services h2{font-size:var(--fs-xl);margin:0 0 .3em;font-weight:800}
.blk-services .sub{color:var(--muted);font-size:var(--fs-lg);margin:0}
.blk-services .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:calc(var(--space)*1.1)}
.blk-services .card{background:var(--surface);border:1px solid color-mix(in srgb,var(--text) 12%,transparent);border-radius:var(--radius);padding:calc(var(--space)*1.3);display:flex;flex-direction:column;gap:.5em}
.blk-services .card h3{margin:0;font-size:var(--fs-lg);font-weight:700}
.blk-services .card .price{color:var(--accent);font-weight:700}
.blk-services .card p{margin:0;color:var(--muted)}
.blk-services .card .cta{margin-top:auto;align-self:flex-start;color:var(--primary);text-decoration:none;font-weight:600}
`.trim();

type Item = { name: string; description: string; price: string; ctaLabel: string; ctaHref: string };

function card(it: Item): string {
  return `<article class="card">
      <h3>${escapeHtml(it.name)}</h3>
      ${it.price ? `<span class="price">${escapeHtml(it.price)}</span>` : ''}
      ${it.description ? `<p>${escapeHtml(it.description)}</p>` : ''}
      ${it.ctaLabel ? `<a class="cta" href="${escapeAttr(sanitizeUrl(it.ctaHref))}">${escapeHtml(it.ctaLabel)} →</a>` : ''}
    </article>`;
}

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const subtitle = config.subtitle as string;
  const items = (config.items as Item[]) ?? [];
  const head = (title || subtitle)
    ? `<div class="head">
      ${title ? `<h2>${escapeHtml(title)}</h2>` : ''}
      ${subtitle ? `<p class="sub">${escapeHtml(subtitle)}</p>` : ''}
    </div>`
    : '';

  return `<section class="blk-services" aria-label="${escapeAttr(title || 'Services')}">
  <div class="wrap">
    ${head}
    <div class="grid">
      ${items.map(card).join('\n      ')}
    </div>
  </div>
</section>`;
}

export const services: BlockSpec = {
  type: 'services-catalogue',
  description: 'A grid of services or products, each with a name, optional price, description, and link. Use for "what we offer".',
  schema, css, render,
};
