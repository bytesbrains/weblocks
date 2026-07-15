/** `hero` — headline + optional eyebrow/subhead/CTA. Static brick. */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  eyebrow: { kind: 'string', default: '', max: 80 },
  headline: { kind: 'string', required: true, default: 'Your headline here', max: 160 },
  subhead: { kind: 'string', default: '', max: 320 },
  align: { kind: 'enum', values: ['center', 'left'], default: 'center' },
  cta: {
    kind: 'object',
    fields: {
      label: { kind: 'string', default: '', max: 40 },
      href: { kind: 'string', default: '#', max: 500 },
    },
  },
};

const css = `
.blk-hero{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-hero .wrap{max-width:960px;margin:0 auto;display:flex;flex-direction:column;gap:calc(var(--space)*0.9)}
.blk-hero[data-align="center"] .wrap{align-items:center;text-align:center}
.blk-hero .eyebrow{font-size:var(--fs-base);letter-spacing:.08em;text-transform:uppercase;color:var(--accent);font-weight:600}
.blk-hero h1{font-size:var(--fs-xl);line-height:1.05;margin:0;font-weight:800}
.blk-hero p{font-size:var(--fs-lg);color:var(--muted);margin:0;max-width:60ch}
.blk-hero .cta{display:inline-block;background:var(--primary);color:#fff;padding:.7em 1.4em;border-radius:var(--radius);text-decoration:none;font-weight:600;transition:transform var(--motion)}
.blk-hero .cta:hover{transform:translateY(-1px)}
`.trim();

function render(config: Record<string, unknown>): string {
  const eyebrow = config.eyebrow as string;
  const headline = config.headline as string;
  const subhead = config.subhead as string;
  const align = config.align as string;
  const cta = config.cta as { label: string; href: string };

  const parts = [
    eyebrow ? `<p class="eyebrow">${escapeHtml(eyebrow)}</p>` : '',
    `<h1>${escapeHtml(headline)}</h1>`,
    subhead ? `<p>${escapeHtml(subhead)}</p>` : '',
    cta.label ? `<a class="cta" href="${escapeAttr(sanitizeUrl(cta.href))}">${escapeHtml(cta.label)}</a>` : '',
  ].filter(Boolean).join('\n    ');

  return `<section class="blk-hero" data-align="${escapeAttr(align)}" aria-label="Hero">
  <div class="wrap">
    ${parts}
  </div>
</section>`;
}

export const hero: BlockSpec = {
  type: 'hero',
  description: 'Top-of-page banner: a big headline with an optional eyebrow, subheading, and one call-to-action button.',
  schema, css, render,
};
