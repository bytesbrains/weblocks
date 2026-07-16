/** `about` — story / mission prose with an optional side image. Static brick. */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  eyebrow: { kind: 'string', default: '', max: 60 },
  title: { kind: 'string', default: 'About us', max: 120 },
  body: { kind: 'string', default: '', max: 1200 },
  image: { kind: 'string', default: '', max: 500 },
  imageAlt: { kind: 'string', default: '', max: 200 },
  imageSide: { kind: 'enum', values: ['left', 'right'], default: 'right' },
};

const css = `
.blk-about{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-about .wrap{max-width:1080px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:calc(var(--space)*2);align-items:center}
.blk-about.no-img .wrap{grid-template-columns:min(64ch,100%);justify-content:center;text-align:center}
.blk-about.img-left .media{order:-1}
.blk-about .eyebrow{color:var(--accent);font-weight:700;letter-spacing:.04em;text-transform:uppercase;font-size:var(--fs-base);margin:0 0 .4em}
.blk-about h2{font-size:var(--fs-xl);margin:0 0 .4em;font-weight:800}
.blk-about p.body{color:var(--muted);font-size:var(--fs-lg);margin:0;white-space:pre-line}
.blk-about .media img{width:100%;border-radius:var(--radius);display:block;object-fit:cover}
@media(max-width:760px){.blk-about .wrap{grid-template-columns:1fr;text-align:left}.blk-about.img-left .media{order:0}}
`.trim();

function render(config: Record<string, unknown>): string {
  const eyebrow = config.eyebrow as string;
  const title = config.title as string;
  const body = config.body as string;
  const image = sanitizeUrl(config.image);
  const hasImg = image !== '#' && !!(config.image as string);
  const alt = config.imageAlt as string;
  const side = config.imageSide as string;

  const text = `<div class="text">
      ${eyebrow ? `<p class="eyebrow">${escapeHtml(eyebrow)}</p>` : ''}
      ${title ? `<h2>${escapeHtml(title)}</h2>` : ''}
      ${body ? `<p class="body">${escapeHtml(body)}</p>` : ''}
    </div>`;
  const media = hasImg ? `<div class="media"><img src="${escapeAttr(image)}" alt="${escapeAttr(alt)}" loading="lazy"></div>` : '';
  const cls = `blk-about${hasImg ? (side === 'left' ? ' img-left' : '') : ' no-img'}`;

  return `<section class="${cls}" aria-label="${escapeAttr(title || 'About')}">
  <div class="wrap">
    ${text}
    ${media}
  </div>
</section>`;
}

export const about: BlockSpec = {
  type: 'about',
  description: 'A story/mission section: eyebrow, title, prose body, and an optional side image (choose which side).',
  schema,
  css,
  render,
};
