/**
 * `split` — alternating image + text rows. Each row is a 2-column grid; the
 * image side flips per row. Rows with no image collapse to a single text
 * column. Static brick.
 */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  rows: {
    kind: 'array',
    max: 8,
    of: {
      kind: 'object',
      fields: {
        title: { kind: 'string', default: '', max: 120 },
        text: { kind: 'string', default: '', max: 600 },
        image: { kind: 'string', default: '', max: 500 },
        imageAlt: { kind: 'string', default: '', max: 200 },
      },
    },
  },
};

const css = `
.blk-split{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-split .wrap{max-width:1080px;margin:0 auto;display:flex;flex-direction:column;gap:calc(var(--space)*2.2)}
.blk-split .row{display:grid;grid-template-columns:1fr 1fr;gap:calc(var(--space)*2);align-items:center}
.blk-split .row.text-only{grid-template-columns:min(68ch,100%);justify-content:center;text-align:center}
.blk-split .row.img-right .media{order:1}
.blk-split .row.img-left .media{order:-1}
.blk-split h2{font-size:var(--fs-xl);margin:0 0 .4em;font-weight:800}
.blk-split p{color:var(--muted);font-size:var(--fs-lg);margin:0;line-height:1.6;white-space:pre-line}
.blk-split .media img{width:100%;border-radius:var(--radius);display:block;object-fit:cover}
@media(max-width:760px){.blk-split .row{grid-template-columns:1fr;text-align:left}.blk-split .row .media{order:-1}}
`.trim();

type Row = { title: string; text: string; image: string; imageAlt: string };

function render(config: Record<string, unknown>): string {
  const rows = ((config.rows as Row[]) ?? []).filter(
    (r) => r && (r.title || r.text || r.image),
  );

  const html = rows
    .map((r, i) => {
      const url = sanitizeUrl(r.image);
      const hasImg = url !== '#' && !!r.image;
      const side = i % 2 === 0 ? 'img-left' : 'img-right';
      const cls = hasImg ? `row ${side}` : 'row text-only';
      const text = `<div class="text">
        ${r.title ? `<h2>${escapeHtml(r.title)}</h2>` : ''}
        ${r.text ? `<p>${escapeHtml(r.text)}</p>` : ''}
      </div>`;
      const media = hasImg
        ? `<div class="media"><img src="${escapeAttr(url)}" alt="${escapeAttr(r.imageAlt)}" loading="lazy"></div>`
        : '';
      return `<div class="${cls}">
      ${text}
      ${media}
    </div>`;
    })
    .join('\n    ');

  return `<section class="blk-split" aria-label="Details">
  <div class="wrap">
    ${html}
  </div>
</section>`;
}

export const split: BlockSpec = {
  type: 'split',
  description: 'Alternating image-and-text rows; the image side flips each row, and rows without an image collapse to centered text.',
  schema,
  css,
  render,
};
