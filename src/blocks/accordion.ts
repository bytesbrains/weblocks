/**
 * `accordion` — generic disclosure panels built on native `<details>/<summary>`
 * (no JavaScript, no island). FAQ is a specialization of this pattern; use this
 * for any collapsible content. Static brick.
 */
import { escapeAttr, escapeHtml, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  title: { kind: 'string', default: '', max: 120 },
  items: {
    kind: 'array', max: 24,
    of: {
      kind: 'object',
      fields: {
        heading: { kind: 'string', required: true, default: '', max: 200 },
        body: { kind: 'string', default: '', max: 1200 },
      },
    },
  },
};

const css = `
.blk-accordion{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-accordion .wrap{max-width:760px;margin:0 auto}
.blk-accordion h2{font-size:var(--fs-xl);margin:0 0 var(--space);font-weight:800;text-align:center}
.blk-accordion details{border:1px solid color-mix(in srgb,var(--text) 15%,transparent);border-radius:var(--radius);background:var(--surface);margin-bottom:.6em;overflow:hidden}
.blk-accordion summary{cursor:pointer;list-style:none;padding:.9em 1em;font-weight:700;display:flex;justify-content:space-between;align-items:center;gap:1em}
.blk-accordion summary::-webkit-details-marker{display:none}
.blk-accordion summary::after{content:"+";color:var(--primary);font-weight:800;font-size:1.2em;transition:transform var(--motion)}
.blk-accordion details[open] summary::after{content:"–"}
.blk-accordion .body{padding:0 1em 1em;color:var(--muted);line-height:1.6;white-space:pre-line}
`.trim();

type Item = { heading: string; body: string };

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const items = ((config.items as Item[]) ?? []).filter((it) => it && it.heading);

  const panels = items.map((it) => `<details>
        <summary>${escapeHtml(it.heading)}</summary>
        ${it.body ? `<div class="body">${escapeHtml(it.body)}</div>` : ''}
      </details>`).join('\n      ');

  return `<section class="blk-accordion" aria-label="${escapeAttr(title || 'Accordion')}">
  <div class="wrap">
    ${title ? `<h2>${escapeHtml(title)}</h2>` : ''}
    ${panels}
  </div>
</section>`;
}

export const accordion: BlockSpec = {
  type: 'accordion',
  description: 'Generic collapsible disclosure panels (native details/summary, no JavaScript); each panel has a heading and body.',
  schema,
  css,
  render,
};
