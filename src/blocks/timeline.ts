/** `timeline` — a vertical list of chronological milestones. Static brick. */
import { escapeAttr, escapeHtml, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  title: { kind: 'string', default: '', max: 120 },
  items: {
    kind: 'array', max: 24,
    of: {
      kind: 'object',
      fields: {
        date: { kind: 'string', default: '', max: 40 },
        title: { kind: 'string', required: true, default: '', max: 120 },
        text: { kind: 'string', default: '', max: 400 },
      },
    },
  },
};

const css = `
.blk-timeline{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-timeline .wrap{max-width:760px;margin:0 auto}
.blk-timeline h2{font-size:var(--fs-xl);margin:0 0 var(--space-lg);font-weight:800;text-align:center}
.blk-timeline ol{list-style:none;margin:0;padding:0;position:relative}
.blk-timeline ol::before{content:"";position:absolute;left:7px;top:.4em;bottom:.4em;width:2px;background:color-mix(in srgb,var(--muted) 35%,transparent)}
.blk-timeline li{position:relative;padding:0 0 calc(var(--space)*1.6) calc(var(--space)*2)}
.blk-timeline li:last-child{padding-bottom:0}
.blk-timeline li::before{content:"";position:absolute;left:0;top:.35em;width:16px;height:16px;border-radius:999px;background:var(--primary);box-shadow:0 0 0 3px var(--bg)}
.blk-timeline .date{color:var(--accent);font-weight:700;font-size:var(--fs-base)}
.blk-timeline h3{margin:.1em 0 .2em;font-size:var(--fs-lg);font-weight:700}
.blk-timeline p{margin:0;color:var(--muted);line-height:1.55}
`.trim();

type Item = { date: string; title: string; text: string };

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const items = ((config.items as Item[]) ?? []).filter((it) => it && it.title);

  const entries = items.map((it) => `<li>
        ${it.date ? `<span class="date">${escapeHtml(it.date)}</span>` : ''}
        <h3>${escapeHtml(it.title)}</h3>
        ${it.text ? `<p>${escapeHtml(it.text)}</p>` : ''}
      </li>`).join('\n      ');

  return `<section class="blk-timeline" aria-label="${escapeAttr(title || 'Timeline')}">
  <div class="wrap">
    ${title ? `<h2>${escapeHtml(title)}</h2>` : ''}
    <ol>
      ${entries}
    </ol>
  </div>
</section>`;
}

export const timeline: BlockSpec = {
  type: 'timeline',
  description: 'A vertical timeline of chronological milestones, each with an optional date, a title, and supporting text.',
  schema,
  css,
  render,
};
