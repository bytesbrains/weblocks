/**
 * `carousel` — a horizontal scroll-snap track of slides. Works fully without JS
 * (native scroll-snap); the `carousel` island can add arrows/autoplay. Static-
 * first: no behaviour ships unless the island is present.
 */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  title: { kind: 'string', default: '', max: 120 },
  items: {
    kind: 'array', max: 20,
    of: {
      kind: 'object',
      fields: {
        src: { kind: 'string', default: '', max: 500 },
        alt: { kind: 'string', default: '', max: 200 },
        caption: { kind: 'string', default: '', max: 200 },
      },
    },
  },
  autoplay: { kind: 'boolean', default: false },
};

const css = `
.blk-carousel{padding:var(--space-lg) var(--space);background:var(--bg)}
.blk-carousel .track{display:flex;gap:var(--space);overflow-x:auto;scroll-snap-type:x mandatory;max-width:1120px;margin:0 auto;padding-bottom:.5em}
.blk-carousel .slide{flex:0 0 min(88%,720px);scroll-snap-align:center;background:var(--surface);border-radius:var(--radius);overflow:hidden}
.blk-carousel img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover}
.blk-carousel figcaption{padding:.6em .8em;color:var(--muted);font-size:var(--fs-base)}
.blk-carousel .track::-webkit-scrollbar{height:8px}
`.trim();

type Item = { src: string; alt: string; caption: string };

function slide(it: Item): string {
  const src = sanitizeUrl(it.src);
  if (src === '#' || !it.src) return '';
  return `<figure class="slide">
        <img src="${escapeAttr(src)}" alt="${escapeAttr(it.alt)}" loading="lazy">
        ${it.caption ? `<figcaption>${escapeHtml(it.caption)}</figcaption>` : ''}
      </figure>`;
}

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const items = ((config.items as Item[]) ?? []).map(slide).filter(Boolean);
  const autoplay = config.autoplay === true;
  return `<section class="blk-carousel" aria-label="${escapeAttr(title || 'Carousel')}"${autoplay ? ' data-wl-autoplay="true"' : ''}>
  <div class="track">
    ${items.join('\n    ')}
  </div>
</section>`;
}

export const carousel: BlockSpec = {
  type: 'carousel',
  description: 'A horizontal, swipeable carousel of image slides with optional captions; scrolls natively and can be enhanced with arrows/autoplay.',
  schema,
  css,
  render,
  island: 'carousel',
};
