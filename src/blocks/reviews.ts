/**
 * `reviews` — star-rated customer reviews with an optional source (Google, Yelp,
 * …) and an aggregate summary. Richer than `testimonials` quotes: each review
 * carries a 1–5 star rating and where it came from. Static brick.
 */
import { escapeAttr, escapeHtml, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const SOURCES = ['google', 'yelp', 'facebook', 'trustpilot', 'tripadvisor', 'app-store', 'other'] as const;

const schema: Schema = {
  title: { kind: 'string', default: '', max: 120 },
  subtitle: { kind: 'string', default: '', max: 240 },
  average: { kind: 'string', default: '', max: 8 },
  count: { kind: 'string', default: '', max: 24 },
  source: { kind: 'string', default: '', max: 40 },
  items: {
    kind: 'array', max: 24,
    of: {
      kind: 'object',
      fields: {
        rating: { kind: 'int', default: 5, min: 1, max: 5 },
        quote: { kind: 'string', required: true, default: '', max: 500 },
        author: { kind: 'string', default: '', max: 80 },
        date: { kind: 'string', default: '', max: 40 },
        source: { kind: 'enum', values: SOURCES, default: 'other' },
      },
    },
  },
};

const css = `
.blk-reviews{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-reviews .wrap{max-width:1080px;margin:0 auto}
.blk-reviews .head{text-align:center;margin-bottom:var(--space-lg)}
.blk-reviews h2{font-size:var(--fs-xl);margin:0 0 .3em;font-weight:800}
.blk-reviews .sub{color:var(--muted);font-size:var(--fs-lg);margin:0}
.blk-reviews .agg{display:inline-flex;align-items:baseline;gap:.5em;margin-top:.6em;font-weight:700}
.blk-reviews .agg .score{font-size:var(--fs-lg);color:var(--accent)}
.blk-reviews .agg .count{color:var(--muted);font-weight:400}
.blk-reviews .stars{color:var(--accent);letter-spacing:.05em;font-size:1.05em;white-space:nowrap}
.blk-reviews .stars .off{color:color-mix(in srgb,var(--text) 22%,transparent)}
.blk-reviews .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:calc(var(--space)*1.2)}
.blk-reviews .card{background:var(--surface);border:1px solid color-mix(in srgb,var(--text) 12%,transparent);border-radius:var(--radius);padding:calc(var(--space)*1.3);display:flex;flex-direction:column;gap:.6em}
.blk-reviews blockquote{margin:0;color:var(--text);line-height:1.5}
.blk-reviews .by{color:var(--muted);font-weight:600;font-size:var(--fs-base)}
.blk-reviews .by .src{font-weight:400;text-transform:capitalize}
`.trim();

type Item = { rating: number; quote: string; author: string; date: string; source: string };

/** A 1–5 star row with an accessible label. */
function stars(rating: number): string {
  const n = Math.max(1, Math.min(5, Math.round(rating || 0)));
  const filled = '★'.repeat(n);
  const empty = n < 5 ? `<span class="off">${'★'.repeat(5 - n)}</span>` : '';
  return `<span class="stars" role="img" aria-label="${n} out of 5 stars">${filled}${empty}</span>`;
}

function card(it: Item): string {
  if (!it.quote) return '';
  const src = it.source && it.source !== 'other' ? it.source.replace(/-/g, ' ') : '';
  const meta = [it.author, it.date].filter(Boolean).join(' · ');
  const by = (meta || src)
    ? `<div class="by">${escapeHtml(meta)}${src ? ` <span class="src">· via ${escapeHtml(src)}</span>` : ''}</div>`
    : '';
  return `<article class="card">
        ${stars(it.rating)}
        <blockquote>${escapeHtml(it.quote)}</blockquote>
        ${by}
      </article>`;
}

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const subtitle = config.subtitle as string;
  const average = String(config.average ?? '').trim();
  const count = String(config.count ?? '').trim();
  const source = String(config.source ?? '').trim();
  const items = ((config.items as Item[]) ?? []).map(card).filter(Boolean);

  const agg = average
    ? `<div class="agg">${stars(parseFloat(average))} <span class="score">${escapeHtml(average)}</span>${count ? ` <span class="count">from ${escapeHtml(count)} reviews${source ? ` on ${escapeHtml(source)}` : ''}</span>` : (source ? ` <span class="count">on ${escapeHtml(source)}</span>` : '')}</div>`
    : '';
  const head = (title || subtitle || agg)
    ? `<div class="head">
      ${title ? `<h2>${escapeHtml(title)}</h2>` : ''}
      ${subtitle ? `<p class="sub">${escapeHtml(subtitle)}</p>` : ''}
      ${agg}
    </div>`
    : '';

  return `<section class="blk-reviews" aria-label="${escapeAttr(title || 'Reviews')}">
  <div class="wrap">
    ${head}
    <div class="grid">
      ${items.join('\n      ')}
    </div>
  </div>
</section>`;
}

export const reviews: BlockSpec = {
  type: 'reviews',
  description: 'Star-rated customer reviews (1–5 stars) each with an optional author, date, and source (Google, Yelp, …), plus an optional aggregate score. Richer than plain testimonial quotes.',
  schema, css, render,
};
