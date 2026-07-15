/** `cta` — a conversion band with a headline and one button. Static brick. */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  headline: { kind: 'string', required: true, default: 'Ready to start?', max: 160 },
  subhead: { kind: 'string', default: '', max: 240 },
  background: { kind: 'enum', values: ['primary', 'accent', 'surface'], default: 'primary' },
  button: {
    kind: 'object',
    fields: { label: { kind: 'string', default: 'Get started', max: 40 }, href: { kind: 'string', default: '#', max: 300 } },
  },
};

const css = `
.blk-cta{padding:var(--space-lg) var(--space);text-align:center}
.blk-cta[data-bg="primary"]{background:var(--primary);color:#fff}
.blk-cta[data-bg="accent"]{background:var(--accent);color:#fff}
.blk-cta[data-bg="surface"]{background:var(--surface);color:var(--text)}
.blk-cta .wrap{max-width:720px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:calc(var(--space)*0.9)}
.blk-cta h2{font-size:var(--fs-xl);margin:0;font-weight:800}
.blk-cta p{margin:0;opacity:.9;font-size:var(--fs-lg)}
.blk-cta .btn{display:inline-block;background:#fff;color:var(--text);padding:.7em 1.6em;border-radius:var(--radius);text-decoration:none;font-weight:700}
.blk-cta[data-bg="surface"] .btn{background:var(--primary);color:#fff}
`.trim();

function render(config: Record<string, unknown>): string {
  const headline = config.headline as string;
  const subhead = config.subhead as string;
  const bg = config.background as string;
  const button = config.button as { label: string; href: string };
  return `<section class="blk-cta" data-bg="${escapeAttr(bg)}" aria-label="Call to action">
  <div class="wrap">
    <h2>${escapeHtml(headline)}</h2>
    ${subhead ? `<p>${escapeHtml(subhead)}</p>` : ''}
    ${button.label ? `<a class="btn" href="${escapeAttr(sanitizeUrl(button.href))}">${escapeHtml(button.label)}</a>` : ''}
  </div>
</section>`;
}

export const cta: BlockSpec = {
  type: 'cta',
  description: 'A full-width call-to-action band: a headline, optional subheading, and one button. Use near the bottom.',
  schema, css, render,
};
