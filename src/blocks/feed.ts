/**
 * `feed` — a generic data-driven list of items (list or card layout). Items are
 * static config for now; a host can later back them with a data source via the
 * runtime contract. Static brick.
 */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  title: { kind: 'string', default: '', max: 120 },
  layout: { kind: 'enum', values: ['list', 'cards'], default: 'list' },
  items: {
    kind: 'array', max: 50,
    of: {
      kind: 'object',
      fields: {
        title: { kind: 'string', required: true, default: '', max: 160 },
        subtitle: { kind: 'string', default: '', max: 120 },
        text: { kind: 'string', default: '', max: 280 },
        href: { kind: 'string', default: '', max: 500 },
        image: { kind: 'string', default: '', max: 500 },
        badge: { kind: 'string', default: '', max: 40 },
      },
    },
  },
};

const css = `
.blk-feed{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-feed .wrap{max-width:900px;margin:0 auto}
.blk-feed h2{font-size:var(--fs-xl);margin:0 0 var(--space-lg);font-weight:800;text-align:center}
.blk-feed .items{display:flex;flex-direction:column;gap:.7em}
.blk-feed.cards .items{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:calc(var(--space)*1.1)}
.blk-feed .item{display:flex;gap:1em;align-items:center;background:var(--surface);border-radius:var(--radius);padding:.9em 1em;text-decoration:none;color:inherit}
.blk-feed.cards .item{flex-direction:column;align-items:stretch}
.blk-feed a.item{transition:transform var(--motion)}
.blk-feed a.item:hover{transform:translateY(-2px)}
.blk-feed .thumb{width:56px;height:56px;border-radius:var(--radius);object-fit:cover;flex:0 0 auto}
.blk-feed.cards .thumb{width:100%;height:140px}
.blk-feed .it-body{flex:1;min-width:0}
.blk-feed .it-top{display:flex;gap:.5em;align-items:baseline;justify-content:space-between}
.blk-feed .it-title{margin:0;font-size:var(--fs-lg);font-weight:700}
.blk-feed .badge{color:var(--accent);font-weight:700;font-size:var(--fs-base);flex:0 0 auto}
.blk-feed .it-sub{margin:.1em 0 0;color:var(--muted);font-size:var(--fs-base)}
.blk-feed .it-text{margin:.3em 0 0;color:var(--muted);font-size:var(--fs-base);line-height:1.5}
`.trim();

type Item = { title: string; subtitle: string; text: string; href: string; image: string; badge: string };

function item(it: Item): string {
  if (!it.title) return '';
  const href = sanitizeUrl(it.href);
  const linked = href !== '#' && !!it.href;
  const img = sanitizeUrl(it.image);
  const thumb = (img !== '#' && it.image) ? `<img class="thumb" src="${escapeAttr(img)}" alt="${escapeAttr(it.title)}" loading="lazy">` : '';
  const inner = `${thumb}
        <div class="it-body">
          <div class="it-top">
            <p class="it-title">${escapeHtml(it.title)}</p>
            ${it.badge ? `<span class="badge">${escapeHtml(it.badge)}</span>` : ''}
          </div>
          ${it.subtitle ? `<p class="it-sub">${escapeHtml(it.subtitle)}</p>` : ''}
          ${it.text ? `<p class="it-text">${escapeHtml(it.text)}</p>` : ''}
        </div>`;
  return linked ? `<a class="item" href="${escapeAttr(href)}">${inner}</a>` : `<div class="item">${inner}</div>`;
}

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const layout = config.layout === 'cards' ? 'cards' : 'list';
  const items = ((config.items as Item[]) ?? []).map(item).filter(Boolean);

  return `<section class="blk-feed ${layout}" aria-label="${escapeAttr(title || 'Feed')}">
  <div class="wrap">
    ${title ? `<h2>${escapeHtml(title)}</h2>` : ''}
    <div class="items">
      ${items.join('\n      ')}
    </div>
  </div>
</section>`;
}

export const feed: BlockSpec = {
  type: 'feed',
  description: 'A generic data-driven list of items in a list or card layout, each with a title, optional subtitle/text, badge, image, and link.',
  schema,
  css,
  render,
};
