/** `pricing` — plan/tier cards with features and a CTA. Static brick. */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  title: { kind: 'string', default: '', max: 120 },
  subtitle: { kind: 'string', default: '', max: 240 },
  plans: {
    kind: 'array', max: 6,
    of: {
      kind: 'object',
      fields: {
        name: { kind: 'string', required: true, default: '', max: 60 },
        price: { kind: 'string', required: true, default: '', max: 24 },
        period: { kind: 'string', default: '', max: 24 }, // e.g. "/mo"
        features: {
          kind: 'array', max: 12,
          of: { kind: 'string', default: '', max: 120 },
        },
        ctaLabel: { kind: 'string', default: 'Choose', max: 40 },
        ctaHref: { kind: 'string', default: '', max: 500 },
        featured: { kind: 'boolean', default: false },
      },
    },
  },
};

const css = `
.blk-pricing{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-pricing .wrap{max-width:1120px;margin:0 auto}
.blk-pricing .head{text-align:center;margin-bottom:var(--space-lg)}
.blk-pricing h2{font-size:var(--fs-xl);margin:0 0 .3em;font-weight:800}
.blk-pricing .sub{color:var(--muted);font-size:var(--fs-lg);margin:0}
.blk-pricing .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:calc(var(--space)*1.2);align-items:stretch}
.blk-pricing .plan{display:flex;flex-direction:column;background:var(--surface);border:1px solid color-mix(in srgb,var(--muted) 30%,transparent);border-radius:var(--radius);padding:calc(var(--space)*1.2)}
.blk-pricing .plan.featured{border:2px solid var(--primary);position:relative}
.blk-pricing .badge{position:absolute;top:-.8em;left:50%;transform:translateX(-50%);background:var(--primary);color:var(--bg);font-size:var(--fs-base);font-weight:700;padding:.15em .8em;border-radius:var(--radius)}
.blk-pricing .name{font-size:var(--fs-lg);font-weight:700;margin:0 0 .3em}
.blk-pricing .price{font-size:var(--fs-xl);font-weight:800;margin:0 0 .6em}
.blk-pricing .price .period{font-size:var(--fs-base);font-weight:500;color:var(--muted)}
.blk-pricing ul{list-style:none;margin:0 0 var(--space);padding:0;flex:1}
.blk-pricing ul li{padding:.35em 0;color:var(--muted);border-top:1px solid color-mix(in srgb,var(--muted) 18%,transparent)}
.blk-pricing .cta{display:block;text-align:center;text-decoration:none;background:var(--primary);color:var(--bg);font-weight:700;padding:.7em 1em;border-radius:var(--radius);transition:opacity var(--motion)}
.blk-pricing .cta:hover{opacity:.88}
.blk-pricing .plan:not(.featured) .cta{background:transparent;color:var(--primary);border:1px solid var(--primary)}
@media(max-width:440px){.blk-pricing .grid{grid-template-columns:1fr}}
`.trim();

type Plan = {
  name: string; price: string; period: string;
  features: string[]; ctaLabel: string; ctaHref: string; featured: boolean;
};

function planCard(p: Plan): string {
  // Drop incomplete plans (need a name + price to be meaningful).
  if (!p.name || !p.price) return '';
  const feats = (p.features ?? [])
    .filter((f) => !!f)
    .map((f) => `<li>${escapeHtml(f)}</li>`)
    .join('\n        ');
  const href = sanitizeUrl(p.ctaHref);
  const hasHref = href !== '#' && !!p.ctaHref;
  const label = p.ctaLabel || 'Choose';
  const cta = hasHref
    ? `<a class="cta" href="${escapeAttr(href)}">${escapeHtml(label)}</a>`
    : '';
  return `<div class="plan${p.featured ? ' featured' : ''}">
        ${p.featured ? '<span class="badge">Popular</span>' : ''}
        <p class="name">${escapeHtml(p.name)}</p>
        <p class="price">${escapeHtml(p.price)}${p.period ? `<span class="period">${escapeHtml(p.period)}</span>` : ''}</p>
        ${feats ? `<ul>${feats}</ul>` : '<ul></ul>'}
        ${cta}
      </div>`;
}

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const subtitle = config.subtitle as string;
  const plans = ((config.plans as Plan[]) ?? []).map(planCard).filter(Boolean);
  const head = (title || subtitle)
    ? `<div class="head">${title ? `<h2>${escapeHtml(title)}</h2>` : ''}${subtitle ? `<p class="sub">${escapeHtml(subtitle)}</p>` : ''}</div>`
    : '';

  return `<section class="blk-pricing" aria-label="${escapeAttr(title || 'Pricing')}">
  <div class="wrap">
    ${head}
    <div class="grid">
      ${plans.join('\n      ')}
    </div>
  </div>
</section>`;
}

export const pricing: BlockSpec = {
  type: 'pricing',
  description: 'A row of pricing/tier cards, each with a name, price, feature list, and a call-to-action button; one plan can be highlighted.',
  schema,
  css,
  render,
};
