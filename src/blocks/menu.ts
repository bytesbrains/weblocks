/**
 * `menu` — a food/drink menu: named sections, each a list of items with an
 * optional price, dietary/allergen tags, and a 0–3 spice level. Static brick.
 * `services-catalogue` approximates a flat item+price grid but has no menu
 * semantics (sections, dietary tags, spice) — this block does.
 */
import { escapeAttr, escapeHtml, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  title: { kind: 'string', default: 'Menu', max: 120 },
  subtitle: { kind: 'string', default: '', max: 240 },
  sections: {
    kind: 'array', max: 20,
    of: {
      kind: 'object',
      fields: {
        name: { kind: 'string', required: true, default: 'Section', max: 80 },
        note: { kind: 'string', default: '', max: 200 },
        items: {
          kind: 'array', max: 40,
          of: {
            kind: 'object',
            fields: {
              name: { kind: 'string', required: true, default: 'Item', max: 100 },
              description: { kind: 'string', default: '', max: 300 },
              price: { kind: 'string', default: '', max: 40 },
              tags: { kind: 'array', max: 8, of: { kind: 'string', default: '', max: 12 } },
              spice: { kind: 'int', default: 0, min: 0, max: 3 },
            },
          },
        },
      },
    },
  },
};

const css = `
.blk-menu{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-menu .wrap{max-width:820px;margin:0 auto}
.blk-menu .head{text-align:center;margin-bottom:var(--space-lg)}
.blk-menu h2{font-size:var(--fs-xl);margin:0 0 .3em;font-weight:800}
.blk-menu .sub{color:var(--muted);font-size:var(--fs-lg);margin:0}
.blk-menu .section{margin-top:var(--space-lg)}
.blk-menu .section:first-of-type{margin-top:0}
.blk-menu h3{font-size:var(--fs-lg);margin:0 0 .1em;font-weight:700;border-bottom:2px solid color-mix(in srgb,var(--text) 12%,transparent);padding-bottom:.3em}
.blk-menu .section-note{color:var(--muted);font-size:var(--fs-base);margin:.3em 0 0}
.blk-menu .item{display:grid;grid-template-columns:1fr auto;gap:.2em .8em;padding:calc(var(--space)*.7) 0;border-bottom:1px dashed color-mix(in srgb,var(--text) 10%,transparent)}
.blk-menu .item .name{font-weight:700}
.blk-menu .item .price{color:var(--accent);font-weight:700;white-space:nowrap}
.blk-menu .item .desc{grid-column:1/-1;color:var(--muted);margin:.15em 0 0}
.blk-menu .tags{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:.35em;margin-top:.35em}
.blk-menu .tag{font-size:var(--fs-base);font-weight:600;color:var(--primary);background:color-mix(in srgb,var(--primary) 12%,transparent);border-radius:999px;padding:.1em .6em}
.blk-menu .spice{color:#d9480f}
`.trim();

interface Item { name: string; description: string; price: string; tags: string[]; spice: number }
interface Section { name: string; note: string; items: Item[] }

function itemRow(it: Item): string {
  const spice = it.spice > 0 ? ` <span class="spice" aria-label="spice level ${Math.min(3, it.spice)}">${'🌶️'.repeat(Math.min(3, it.spice))}</span>` : '';
  const tags = (it.tags ?? []).filter(Boolean);
  const tagRow = tags.length ? `<div class="tags">${tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>` : '';
  return `<div class="item">
        <span class="name">${escapeHtml(it.name)}${spice}</span>
        ${it.price ? `<span class="price">${escapeHtml(it.price)}</span>` : '<span></span>'}
        ${it.description ? `<p class="desc">${escapeHtml(it.description)}</p>` : ''}
        ${tagRow}
      </div>`;
}

function section(s: Section): string {
  const items = ((s.items as Item[]) ?? []).map(itemRow).join('\n      ');
  return `<div class="section">
      <h3>${escapeHtml(s.name)}</h3>
      ${s.note ? `<p class="section-note">${escapeHtml(s.note)}</p>` : ''}
      ${items}
    </div>`;
}

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const subtitle = config.subtitle as string;
  const sections = ((config.sections as Section[]) ?? []).filter((s) => s && s.name);
  const head = (title || subtitle)
    ? `<div class="head">
      ${title ? `<h2>${escapeHtml(title)}</h2>` : ''}
      ${subtitle ? `<p class="sub">${escapeHtml(subtitle)}</p>` : ''}
    </div>`
    : '';

  return `<section class="blk-menu" aria-label="${escapeAttr(title || 'Menu')}">
  <div class="wrap">
    ${head}
    ${sections.map(section).join('\n    ')}
  </div>
</section>`;
}

export const menu: BlockSpec = {
  type: 'menu',
  description: 'A food/drink menu: named sections, each with items that have an optional price, dietary/allergen tags (e.g. V, VG, GF), and a 0–3 spice level. Use for restaurants and cafés.',
  schema, css, render,
};
