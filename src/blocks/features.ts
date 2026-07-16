/** `features` — icon + title + text grid (value props). Static brick. */
import { escapeAttr, escapeHtml, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  title: { kind: 'string', default: '', max: 120 },
  subtitle: { kind: 'string', default: '', max: 240 },
  columns: { kind: 'int', oneOf: [2, 3, 4], default: 3 },
  items: {
    kind: 'array', max: 12,
    of: {
      kind: 'object',
      fields: {
        icon: { kind: 'string', default: '', max: 8 }, // emoji or a single glyph
        title: { kind: 'string', required: true, default: 'Feature', max: 80 },
        text: { kind: 'string', default: '', max: 240 },
      },
    },
  },
};

const css = `
.blk-features{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-features .wrap{max-width:1080px;margin:0 auto}
.blk-features .head{text-align:center;margin-bottom:var(--space-lg)}
.blk-features h2{font-size:var(--fs-xl);margin:0 0 .3em;font-weight:800}
.blk-features .sub{color:var(--muted);font-size:var(--fs-lg);margin:0}
.blk-features .grid{display:grid;grid-template-columns:repeat(var(--cols,3),1fr);gap:calc(var(--space)*1.4)}
.blk-features .item .ico{font-size:1.8em;line-height:1}
.blk-features .item h3{margin:.4em 0 .2em;font-size:var(--fs-lg);font-weight:700}
.blk-features .item p{margin:0;color:var(--muted)}
@media(max-width:720px){.blk-features .grid{grid-template-columns:1fr 1fr}}
@media(max-width:440px){.blk-features .grid{grid-template-columns:1fr}}
`.trim();

type Item = { icon: string; title: string; text: string };

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const subtitle = config.subtitle as string;
  const columns = Number.isInteger(config.columns) ? (config.columns as number) : 3;
  const items = (config.items as Item[]) ?? [];
  const head = (title || subtitle)
    ? `<div class="head">${title ? `<h2>${escapeHtml(title)}</h2>` : ''}${subtitle ? `<p class="sub">${escapeHtml(subtitle)}</p>` : ''}</div>`
    : '';
  const cards = items.map((it) => `<div class="item">
        ${it.icon ? `<div class="ico" aria-hidden="true">${escapeHtml(it.icon)}</div>` : ''}
        <h3>${escapeHtml(it.title)}</h3>
        ${it.text ? `<p>${escapeHtml(it.text)}</p>` : ''}
      </div>`).join('\n      ');

  return `<section class="blk-features" aria-label="${escapeAttr(title || 'Features')}">
  <div class="wrap">
    ${head}
    <div class="grid" style="--cols:${columns}">
      ${cards}
    </div>
  </div>
</section>`;
}

export const features: BlockSpec = {
  type: 'features',
  description: 'A grid of value propositions, each with an optional icon/emoji, a title, and a short line of text.',
  schema, css, render,
};
