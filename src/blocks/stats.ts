/**
 * `stats` — a grid of metric counters. Each stat shows an optional prefix, a
 * big value, an optional suffix, and a muted label. The final value renders
 * statically; the `stats` island can enhance it with a count-up animation
 * (reading `data-wl-count`), so the block works with zero JS.
 */
import { escapeAttr, escapeHtml, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  title: { kind: 'string', default: '', max: 120 },
  columns: { kind: 'int', oneOf: [2, 3, 4], default: 4 },
  items: {
    kind: 'array',
    max: 8,
    of: {
      kind: 'object',
      fields: {
        value: { kind: 'string', required: true, default: '', max: 24 },
        label: { kind: 'string', required: true, default: '', max: 60 },
        prefix: { kind: 'string', default: '', max: 8 },
        suffix: { kind: 'string', default: '', max: 8 },
      },
    },
  },
};

const css = `
.blk-stats{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-stats .wrap{max-width:1080px;margin:0 auto}
.blk-stats h2{text-align:center;font-size:var(--fs-xl);margin:0 0 var(--space-lg);font-weight:800}
.blk-stats .grid{display:grid;grid-template-columns:repeat(var(--cols,4),1fr);gap:calc(var(--space)*1.4)}
.blk-stats .item{text-align:center}
.blk-stats .value{font-size:var(--fs-xl);font-weight:800;line-height:1;color:var(--primary)}
.blk-stats .affix{color:var(--accent)}
.blk-stats .label{margin:.5em 0 0;color:var(--muted);font-size:var(--fs-base)}
@media(max-width:720px){.blk-stats .grid{grid-template-columns:1fr 1fr}}
@media(max-width:420px){.blk-stats .grid{grid-template-columns:1fr}}
`.trim();

type Item = { value: string; label: string; prefix: string; suffix: string };

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const columns = config.columns as number;
  const items = ((config.items as Item[]) ?? []).filter((it) => it && it.value && it.label);

  const cards = items
    .map((it) => `<div class="item">
        <div class="value" data-wl-count="${escapeAttr(it.value)}">${it.prefix ? `<span class="affix">${escapeHtml(it.prefix)}</span>` : ''}${escapeHtml(it.value)}${it.suffix ? `<span class="affix">${escapeHtml(it.suffix)}</span>` : ''}</div>
        <p class="label">${escapeHtml(it.label)}</p>
      </div>`)
    .join('\n      ');

  const heading = title ? `<h2>${escapeHtml(title)}</h2>` : '';

  return `<section class="blk-stats" aria-label="${escapeAttr(title || 'Statistics')}">
  <div class="wrap">
    ${heading}
    <div class="grid" style="--cols:${columns}">
      ${cards}
    </div>
  </div>
</section>`;
}

export const stats: BlockSpec = {
  type: 'stats',
  description: 'A grid of metric counters: each stat shows an optional prefix/suffix around a big value with a muted label, with an optional count-up animation.',
  schema,
  css,
  render,
  island: 'stats',
};
