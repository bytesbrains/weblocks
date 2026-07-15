/** `testimonials` — customer quotes. Static brick. */
import { escapeAttr, escapeHtml, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  title: { kind: 'string', default: '', max: 120 },
  items: {
    kind: 'array', max: 12,
    of: {
      kind: 'object',
      fields: {
        quote: { kind: 'string', required: true, default: '', max: 400 },
        author: { kind: 'string', default: '', max: 80 },
        role: { kind: 'string', default: '', max: 80 },
      },
    },
  },
};

const css = `
.blk-testimonials{padding:var(--space-lg) var(--space);background:var(--surface)}
.blk-testimonials .wrap{max-width:1080px;margin:0 auto}
.blk-testimonials h2{text-align:center;font-size:var(--fs-xl);margin:0 0 var(--space-lg);font-weight:800;color:var(--text)}
.blk-testimonials .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:calc(var(--space)*1.2)}
.blk-testimonials figure{margin:0;background:var(--bg);border-radius:var(--radius);padding:calc(var(--space)*1.3)}
.blk-testimonials blockquote{margin:0;font-size:var(--fs-lg);color:var(--text);line-height:1.4}
.blk-testimonials figcaption{margin-top:.8em;color:var(--muted);font-weight:600}
.blk-testimonials figcaption .role{font-weight:400}
`.trim();

type Item = { quote: string; author: string; role: string };

function item(it: Item): string {
  if (!it.quote) return '';
  const cap = it.author
    ? `<figcaption>${escapeHtml(it.author)}${it.role ? ` <span class="role">· ${escapeHtml(it.role)}</span>` : ''}</figcaption>`
    : '';
  return `<figure>
        <blockquote>“${escapeHtml(it.quote)}”</blockquote>
        ${cap}
      </figure>`;
}

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const items = ((config.items as Item[]) ?? []).map(item).filter(Boolean);
  return `<section class="blk-testimonials" aria-label="${escapeAttr(title || 'Testimonials')}">
  <div class="wrap">
    ${title ? `<h2>${escapeHtml(title)}</h2>` : ''}
    <div class="grid">
      ${items.join('\n      ')}
    </div>
  </div>
</section>`;
}

export const testimonials: BlockSpec = {
  type: 'testimonials',
  description: 'A grid of customer quotes, each with the quote text and an optional author name and role.',
  schema, css, render,
};
