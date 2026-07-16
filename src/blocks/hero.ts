/**
 * `hero` — headline + optional eyebrow/subhead/CTA, optionally over a background
 * **image banner**. When `image` is set the photo sits behind the content with a
 * legibility overlay (scrim/dark/light) and the text flips to a readable colour;
 * with no image it renders exactly as a plain text hero. Static brick.
 */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  eyebrow: { kind: 'string', default: '', max: 80 },
  headline: { kind: 'string', required: true, default: 'Your headline here', max: 160 },
  subhead: { kind: 'string', default: '', max: 320 },
  align: { kind: 'enum', values: ['center', 'left'], default: 'center' },
  image: { kind: 'string', default: '', max: 500 },                                   // background banner image
  overlay: { kind: 'enum', values: ['scrim', 'dark', 'light', 'none'], default: 'scrim' }, // legibility layer (with image)
  minHeight: { kind: 'enum', values: ['auto', 'sm', 'md', 'lg', 'full'], default: 'auto' },
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
.blk-hero .cta{display:inline-block;background:var(--primary);color:var(--on-primary);padding:.7em 1.4em;border-radius:var(--radius);text-decoration:none;font-weight:600;transition:transform var(--motion)}
.blk-hero .cta:hover{transform:translateY(-1px)}
/* Image banner */
.blk-hero.has-image{position:relative;isolation:isolate;color:#fff}
.blk-hero.has-image .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2}
.blk-hero.has-image .scrim{position:absolute;inset:0;z-index:-1}
.blk-hero.overlay-dark .scrim{background:rgba(0,0,0,.55)}
.blk-hero.overlay-scrim .scrim{background:linear-gradient(180deg,rgba(0,0,0,.2),rgba(0,0,0,.6))}
.blk-hero.overlay-light{color:var(--text)}
.blk-hero.overlay-light .scrim{background:rgba(255,255,255,.62)}
.blk-hero.has-image.overlay-none{color:var(--text)}
.blk-hero.overlay-none .scrim{display:none}
.blk-hero.has-image .eyebrow,.blk-hero.has-image p{color:inherit;opacity:.9}
.blk-hero.mh-sm{min-height:36vh}.blk-hero.mh-md{min-height:52vh}.blk-hero.mh-lg{min-height:72vh}.blk-hero.mh-full{min-height:100vh}
.blk-hero.mh-sm,.blk-hero.mh-md,.blk-hero.mh-lg,.blk-hero.mh-full{display:flex;flex-direction:column;justify-content:center}
`.trim();

function render(config: Record<string, unknown>): string {
  const eyebrow = config.eyebrow as string;
  const headline = config.headline as string;
  const subhead = config.subhead as string;
  const align = config.align as string;
  const cta = config.cta as { label: string; href: string };

  const imageUrl = sanitizeUrl(config.image);
  const hasImg = imageUrl !== '#' && !!(config.image as string);
  const overlay = ['scrim', 'dark', 'light', 'none'].includes(config.overlay as string) ? (config.overlay as string) : 'scrim';
  const minHeight = ['auto', 'sm', 'md', 'lg', 'full'].includes(config.minHeight as string) ? (config.minHeight as string) : 'auto';

  const classes = ['blk-hero'];
  if (hasImg) classes.push('has-image', `overlay-${overlay}`);
  if (minHeight !== 'auto') classes.push(`mh-${minHeight}`);

  const banner = hasImg
    ? `<img class="bg" src="${escapeAttr(imageUrl)}" alt="" aria-hidden="true">\n  <div class="scrim"></div>\n  `
    : '';

  const parts = [
    eyebrow ? `<p class="eyebrow">${escapeHtml(eyebrow)}</p>` : '',
    `<h1>${escapeHtml(headline)}</h1>`,
    subhead ? `<p>${escapeHtml(subhead)}</p>` : '',
    cta.label ? `<a class="cta" href="${escapeAttr(sanitizeUrl(cta.href))}">${escapeHtml(cta.label)}</a>` : '',
  ].filter(Boolean).join('\n    ');

  return `<section class="${classes.join(' ')}" data-align="${escapeAttr(align)}" aria-label="Hero">
  ${banner}<div class="wrap">
    ${parts}
  </div>
</section>`;
}

export const hero: BlockSpec = {
  type: 'hero',
  description: 'Top-of-page hero: a big headline with optional eyebrow, subheading, and CTA — optionally over a full-bleed background image banner with a legibility overlay.',
  schema, css, render,
};
