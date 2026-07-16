/**
 * `product` — a shoppable product grid: each item has an image, price, optional
 * badge, and a buy/enquire link. Static brick. `pricing` is subscription tiers
 * and `gallery` is images-only; neither is a per-item shop grid. The actual
 * cart/checkout is the host's job — each card links out (or to a host page).
 */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  title: { kind: 'string', default: '', max: 120 },
  subtitle: { kind: 'string', default: '', max: 240 },
  columns: { kind: 'int', oneOf: [2, 3, 4], default: 3 },
  items: {
    kind: 'array', max: 48,
    of: {
      kind: 'object',
      fields: {
        name: { kind: 'string', required: true, default: 'Product', max: 100 },
        description: { kind: 'string', default: '', max: 240 },
        price: { kind: 'string', default: '', max: 40 },
        was: { kind: 'string', default: '', max: 40 },
        image: { kind: 'string', default: '', max: 500 },
        badge: { kind: 'string', default: '', max: 24 },
        ctaLabel: { kind: 'string', default: 'Buy', max: 40 },
        ctaHref: { kind: 'string', default: '#', max: 500 },
      },
    },
  },
};

const css = `
.blk-product{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-product .wrap{max-width:1120px;margin:0 auto}
.blk-product .head{text-align:center;margin-bottom:var(--space-lg)}
.blk-product h2{font-size:var(--fs-xl);margin:0 0 .3em;font-weight:800}
.blk-product .sub{color:var(--muted);font-size:var(--fs-lg);margin:0}
.blk-product .grid{display:grid;gap:calc(var(--space)*1.1);grid-template-columns:repeat(var(--cols,3),1fr)}
@media (max-width:900px){.blk-product .grid{grid-template-columns:repeat(2,1fr)}}
@media (max-width:560px){.blk-product .grid{grid-template-columns:1fr}}
.blk-product .card{background:var(--surface);border:1px solid color-mix(in srgb,var(--text) 12%,transparent);border-radius:var(--radius);overflow:hidden;display:flex;flex-direction:column}
.blk-product .media{position:relative;aspect-ratio:4/3;background:color-mix(in srgb,var(--text) 6%,transparent)}
.blk-product .media img{width:100%;height:100%;object-fit:cover;display:block}
.blk-product .badge{position:absolute;top:.6em;left:.6em;background:var(--accent);color:var(--on-accent);font-weight:700;font-size:var(--fs-base);border-radius:999px;padding:.15em .7em}
.blk-product .body{padding:calc(var(--space)*1.1);display:flex;flex-direction:column;gap:.4em;flex:1}
.blk-product .name{font-weight:700;font-size:var(--fs-lg)}
.blk-product .desc{color:var(--muted);margin:0}
.blk-product .prices{display:flex;align-items:baseline;gap:.5em;margin-top:auto}
.blk-product .price{color:var(--accent);font-weight:800;font-size:var(--fs-lg)}
.blk-product .was{color:var(--muted);text-decoration:line-through;font-size:var(--fs-base)}
.blk-product .cta{margin-top:.6em;text-align:center;font:inherit;font-weight:700;border-radius:var(--radius);padding:.6em 1em;background:var(--primary);color:var(--on-primary);text-decoration:none;display:block}
`.trim();

interface Item { name: string; description: string; price: string; was: string; image: string; badge: string; ctaLabel: string; ctaHref: string }

function card(it: Item): string {
  const media = it.image
    ? `<div class="media">${it.badge ? `<span class="badge">${escapeHtml(it.badge)}</span>` : ''}<img src="${escapeAttr(sanitizeUrl(it.image))}" alt="${escapeAttr(it.name)}" loading="lazy"></div>`
    : (it.badge ? `<div class="media"><span class="badge">${escapeHtml(it.badge)}</span></div>` : '');
  const prices = (it.price || it.was)
    ? `<div class="prices">${it.price ? `<span class="price">${escapeHtml(it.price)}</span>` : ''}${it.was ? `<span class="was">${escapeHtml(it.was)}</span>` : ''}</div>`
    : '';
  const cta = it.ctaLabel ? `<a class="cta" href="${escapeAttr(sanitizeUrl(it.ctaHref))}">${escapeHtml(it.ctaLabel)}</a>` : '';
  return `<article class="card">
      ${media}
      <div class="body">
        <span class="name">${escapeHtml(it.name)}</span>
        ${it.description ? `<p class="desc">${escapeHtml(it.description)}</p>` : ''}
        ${prices}
        ${cta}
      </div>
    </article>`;
}

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const subtitle = config.subtitle as string;
  const cols = (config.columns as number) || 3;
  const items = ((config.items as Item[]) ?? []).filter((i) => i && i.name);
  const head = (title || subtitle)
    ? `<div class="head">
      ${title ? `<h2>${escapeHtml(title)}</h2>` : ''}
      ${subtitle ? `<p class="sub">${escapeHtml(subtitle)}</p>` : ''}
    </div>`
    : '';

  return `<section class="blk-product" aria-label="${escapeAttr(title || 'Products')}">
  <div class="wrap">
    ${head}
    <div class="grid" style="--cols:${cols}">
      ${items.map(card).join('\n      ')}
    </div>
  </div>
</section>`;
}

export const product: BlockSpec = {
  type: 'product',
  description: 'A shoppable product grid: each item has an image, price (with optional "was" price and badge), and a buy/enquire link. Use for retail and e-commerce; the cart/checkout is the host\'s.',
  schema, css, render,
};
