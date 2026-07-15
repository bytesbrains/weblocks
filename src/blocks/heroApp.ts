/** `hero-app` — app landing hero: install CTA + a row of screenshots. Static brick. */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  headline: { kind: 'string', required: true, default: '', max: 120 },
  subhead: { kind: 'string', default: '', max: 240 },
  installLabel: { kind: 'string', default: 'Install app', max: 40 },
  installHref: { kind: 'string', default: '', max: 500 },
  screenshots: {
    kind: 'array',
    max: 6,
    of: {
      kind: 'object',
      fields: {
        src: { kind: 'string', required: true, default: '', max: 500 },
        alt: { kind: 'string', default: '', max: 200 },
      },
    },
  },
};

const css = `
.blk-hero-app{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text);font-family:var(--font);text-align:center}
.blk-hero-app .wrap{max-width:1080px;margin:0 auto}
.blk-hero-app h1{font-size:var(--fs-xl);margin:0 0 .3em;font-weight:800;line-height:1.1}
.blk-hero-app .sub{color:var(--muted);font-size:var(--fs-lg);margin:0 auto;max-width:60ch}
.blk-hero-app .cta{margin:var(--space-lg) 0 0}
.blk-hero-app .install{display:inline-block;padding:.7em 1.6em;border-radius:var(--radius);background:var(--primary);color:var(--on-primary);text-decoration:none;font-weight:700;font-size:var(--fs-lg);transition:filter var(--motion)}
.blk-hero-app .install:hover,.blk-hero-app .install:focus-visible{filter:brightness(1.08)}
.blk-hero-app .shots{display:flex;gap:var(--space);overflow-x:auto;scroll-snap-type:x mandatory;padding:var(--space-lg) .2em .4em;margin-top:var(--space);justify-content:flex-start}
.blk-hero-app .shots::-webkit-scrollbar{height:8px}
.blk-hero-app .shot{flex:0 0 auto;width:min(240px,60vw);scroll-snap-align:center}
.blk-hero-app .shot img{display:block;width:100%;border-radius:calc(var(--radius)*1.5);background:var(--surface);border:1px solid color-mix(in srgb, var(--text) 15%, transparent);aspect-ratio:9/19;object-fit:cover}
@media(min-width:720px){.blk-hero-app .shots{justify-content:center}}
@media(max-width:440px){.blk-hero-app .shot{width:70vw}}
`.trim();

type Shot = { src: string; alt: string };

function shot(s: Shot): string {
  // Drop items with no source rather than emit a broken <img> (total render).
  if (!s.src) return '';
  return `<div class="shot"><img src="${escapeAttr(sanitizeUrl(s.src))}" alt="${escapeAttr(s.alt)}" loading="lazy"></div>`;
}

function render(config: Record<string, unknown>): string {
  const headline = config.headline as string;
  const subhead = config.subhead as string;
  const installLabel = (config.installLabel as string) || 'Install app';
  const installHref = escapeAttr(sanitizeUrl(config.installHref || '#'));
  const shots = ((config.screenshots as Shot[]) ?? []).map(shot).filter(Boolean);

  const gallery = shots.length
    ? `<div class="shots">\n      ${shots.join('\n      ')}\n    </div>`
    : '';

  return `<section class="blk-hero-app" aria-label="${escapeAttr(headline || 'App')}">
  <div class="wrap">
    ${headline ? `<h1>${escapeHtml(headline)}</h1>` : ''}
    ${subhead ? `<p class="sub">${escapeHtml(subhead)}</p>` : ''}
    <div class="cta"><a class="install" href="${installHref}">${escapeHtml(installLabel)}</a></div>
    ${gallery}
  </div>
</section>`;
}

export const heroApp: BlockSpec = {
  type: 'hero-app',
  description: 'An app landing hero: a headline and subhead over a primary install button, with a horizontal scroll row of app screenshots.',
  schema,
  css,
  render,
};
