/**
 * `steps` — a numbered how-it-works / process list. Each step is an
 * auto-numbered card with a title and optional supporting text. Static brick.
 */
import { escapeAttr, escapeHtml, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  title: { kind: 'string', default: '', max: 120 },
  subtitle: { kind: 'string', default: '', max: 240 },
  items: {
    kind: 'array',
    max: 12,
    of: {
      kind: 'object',
      fields: {
        title: { kind: 'string', required: true, default: 'Step', max: 100 },
        text: { kind: 'string', default: '', max: 300 },
      },
    },
  },
};

const css = `
.blk-steps{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-steps .wrap{max-width:1000px;margin:0 auto}
.blk-steps .head{text-align:center;margin-bottom:var(--space-lg)}
.blk-steps h2{font-size:var(--fs-xl);margin:0 0 .3em;font-weight:800}
.blk-steps .sub{color:var(--muted);font-size:var(--fs-lg);margin:0}
.blk-steps ol{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:calc(var(--space)*1.4)}
.blk-steps li{background:var(--surface);border-radius:var(--radius);padding:calc(var(--space)*1.3)}
.blk-steps .num{display:inline-flex;align-items:center;justify-content:center;width:2.2em;height:2.2em;border-radius:999px;background:var(--primary);color:var(--on-primary);font-weight:800;font-size:var(--fs-lg);margin-bottom:.5em}
.blk-steps h3{margin:0 0 .2em;font-size:var(--fs-lg);font-weight:700}
.blk-steps p{margin:0;color:var(--muted);line-height:1.5}
@media(max-width:480px){.blk-steps ol{grid-template-columns:1fr}}
`.trim();

type Item = { title: string; text: string };

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const subtitle = config.subtitle as string;
  const items = ((config.items as Item[]) ?? []).filter((it) => it && it.title);

  const head = (title || subtitle)
    ? `<div class="head">${title ? `<h2>${escapeHtml(title)}</h2>` : ''}${subtitle ? `<p class="sub">${escapeHtml(subtitle)}</p>` : ''}</div>`
    : '';

  const cards = items
    .map((it, i) => `<li>
        <div class="num" aria-hidden="true">${escapeAttr(i + 1)}</div>
        <h3>${escapeHtml(it.title)}</h3>
        ${it.text ? `<p>${escapeHtml(it.text)}</p>` : ''}
      </li>`)
    .join('\n      ');

  return `<section class="blk-steps" aria-label="${escapeAttr(title || 'Steps')}">
  <div class="wrap">
    ${head}
    <ol>
      ${cards}
    </ol>
  </div>
</section>`;
}

export const steps: BlockSpec = {
  type: 'steps',
  description: 'A numbered how-it-works / process list: an optional title and subtitle over auto-numbered step cards, each with a title and short text.',
  schema,
  css,
  render,
};
