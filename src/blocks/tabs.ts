/**
 * `tabs` — tabbed content panels, CSS-ONLY (no JavaScript, no island). Hidden
 * radio inputs drive `:checked ~` sibling rules to show one panel at a time. The
 * radio group name is scoped to the placed block's id (via the render context)
 * so multiple `tabs` blocks on one page never collide.
 */
import { escapeAttr, escapeHtml, type Schema } from '../schema.js';
import type { BlockSpec, RenderContext } from '../registry.js';

const schema: Schema = {
  items: {
    kind: 'array', max: 8,
    of: {
      kind: 'object',
      fields: {
        label: { kind: 'string', required: true, default: '', max: 60 },
        text: { kind: 'string', default: '', max: 2000 },
      },
    },
  },
};

const css = `
.blk-tabs{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-tabs .wrap{max-width:820px;margin:0 auto}
.blk-tabs input{position:absolute;opacity:0;pointer-events:none}
.blk-tabs .tablist{display:flex;flex-wrap:wrap;gap:.3em;border-bottom:1px solid color-mix(in srgb,var(--text) 15%,transparent);margin-bottom:var(--space)}
.blk-tabs label{cursor:pointer;padding:.55em .9em;border-radius:var(--radius) var(--radius) 0 0;color:var(--muted);font-weight:600;font-size:var(--fs-base)}
.blk-tabs label:hover{color:var(--text)}
.blk-tabs .panel{display:none;line-height:1.6;color:var(--muted);font-size:var(--fs-lg);white-space:pre-line}
${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `.blk-tabs input.t${i}:checked ~ .tablist label.l${i}{color:var(--primary);border-bottom:2px solid var(--primary);margin-bottom:-1px}
.blk-tabs input.t${i}:checked ~ .panels .panel.p${i}{display:block}`).join('\n')}
`.trim();

type Item = { label: string; text: string };

function render(config: Record<string, unknown>, _tokens?: unknown, ctx?: RenderContext): string {
  const base = (ctx?.id || 'tabs').replace(/[^A-Za-z0-9_-]/g, '') || 'tabs';
  const items = ((config.items as Item[]) ?? []).filter((it) => it && it.label);
  if (!items.length) return `<section class="blk-tabs" aria-label="Tabs"><div class="wrap"></div></section>`;

  const inputs = items.map((_it, i) =>
    `<input class="t${i}" type="radio" name="${escapeAttr(base)}" id="${escapeAttr(base)}-${i}"${i === 0 ? ' checked' : ''}>`).join('\n    ');
  const labels = items.map((it, i) =>
    `<label class="l${i}" for="${escapeAttr(base)}-${i}">${escapeHtml(it.label)}</label>`).join('\n      ');
  const panels = items.map((it, i) =>
    `<div class="panel p${i}">${escapeHtml(it.text)}</div>`).join('\n      ');

  return `<section class="blk-tabs" aria-label="Tabs">
  <div class="wrap">
    ${inputs}
    <div class="tablist" role="tablist">
      ${labels}
    </div>
    <div class="panels">
      ${panels}
    </div>
  </div>
</section>`;
}

export const tabs: BlockSpec = {
  type: 'tabs',
  description: 'Tabbed content panels that switch with no JavaScript; each tab has a label and a text panel.',
  schema,
  css,
  render,
};
