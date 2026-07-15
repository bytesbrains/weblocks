/**
 * `faq` — question/answer accordion. Uses native <details>/<summary>, so it
 * expands/collapses accessibly with ZERO JavaScript (static-first — no island).
 */
import { escapeAttr, escapeHtml, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  title: { kind: 'string', default: 'Frequently asked questions', max: 120 },
  items: {
    kind: 'array', max: 20,
    of: {
      kind: 'object',
      fields: {
        question: { kind: 'string', required: true, default: '', max: 200 },
        answer: { kind: 'string', default: '', max: 800 },
      },
    },
  },
};

const css = `
.blk-faq{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-faq .wrap{max-width:760px;margin:0 auto}
.blk-faq h2{font-size:var(--fs-xl);margin:0 0 var(--space-lg);font-weight:800;text-align:center}
.blk-faq details{border-bottom:1px solid color-mix(in srgb,var(--text) 12%,transparent);padding:.9em 0}
.blk-faq summary{cursor:pointer;font-weight:600;font-size:var(--fs-lg);list-style:none;display:flex;justify-content:space-between;gap:1em}
.blk-faq summary::-webkit-details-marker{display:none}
.blk-faq summary::after{content:"+";color:var(--accent);transition:transform var(--motion)}
.blk-faq details[open] summary::after{content:"–"}
.blk-faq .ans{margin:.6em 0 0;color:var(--muted)}
`.trim();

type Item = { question: string; answer: string };

function item(it: Item): string {
  if (!it.question) return '';
  return `<details>
        <summary>${escapeHtml(it.question)}</summary>
        ${it.answer ? `<p class="ans">${escapeHtml(it.answer)}</p>` : ''}
      </details>`;
}

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const items = ((config.items as Item[]) ?? []).map(item).filter(Boolean);
  return `<section class="blk-faq" aria-label="${escapeAttr(title || 'FAQ')}">
  <div class="wrap">
    ${title ? `<h2>${escapeHtml(title)}</h2>` : ''}
    ${items.join('\n    ')}
  </div>
</section>`;
}

export const faq: BlockSpec = {
  type: 'faq',
  description: 'An accordion of question/answer pairs. Expands/collapses natively (no JS).',
  schema, css, render,
};
