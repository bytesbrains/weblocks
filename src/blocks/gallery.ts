/**
 * `gallery` — responsive image grid. Static markup; the lightbox is a client
 * "island" (declared via `island`), hydrated only when `lightbox` is true.
 */
import { escapeAttr, escapeHtml, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  layout: { kind: 'enum', values: ['grid', 'masonry', 'carousel'], default: 'grid' },
  columns: { kind: 'int', oneOf: [2, 3, 4], default: 3 },
  gap: { kind: 'enum', values: ['sm', 'md', 'lg'], default: 'md' },
  lightbox: { kind: 'boolean', default: true },
  items: {
    kind: 'array',
    max: 60,
    of: {
      kind: 'object',
      fields: {
        src: { kind: 'string', required: true, default: '', max: 500 },
        alt: { kind: 'string', required: true, default: '', max: 200 },
        caption: { kind: 'string', default: '', max: 200 },
      },
    },
  },
};

const GAP_REM: Record<string, string> = { sm: '0.4rem', md: '0.8rem', lg: '1.4rem' };

const css = `
.blk-gallery{padding:var(--space-lg) var(--space);background:var(--bg)}
.blk-gallery .wrap{max-width:1120px;margin:0 auto}
.blk-gallery .grid{display:grid;grid-template-columns:repeat(var(--cols,3),1fr);gap:var(--gap,0.8rem)}
.blk-gallery figure{margin:0;border-radius:var(--radius);overflow:hidden;background:var(--surface)}
.blk-gallery img{display:block;width:100%;height:100%;object-fit:cover;aspect-ratio:4/3}
.blk-gallery figcaption{padding:.5em .7em;color:var(--muted);font-size:var(--fs-base)}
@media(max-width:720px){.blk-gallery .grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:440px){.blk-gallery .grid{grid-template-columns:1fr}}
`.trim();

type Item = { src: string; alt: string; caption: string };

function figure(it: Item): string {
  // Drop items with no source rather than emit a broken <img> (total render).
  if (!it.src) return '';
  return `<figure>
        <img src="${escapeAttr(it.src)}" alt="${escapeAttr(it.alt)}" loading="lazy">
        ${it.caption ? `<figcaption>${escapeHtml(it.caption)}</figcaption>` : ''}
      </figure>`;
}

function render(config: Record<string, unknown>): string {
  const columns = Number.isInteger(config.columns) ? (config.columns as number) : 3;
  const gap = GAP_REM[config.gap as string] ?? GAP_REM.md;
  const lightbox = config.lightbox === true; // flag for the `lightbox` island
  const items = ((config.items as Item[]) ?? []).map(figure).filter(Boolean);

  return `<section class="blk-gallery" aria-label="Gallery"${lightbox ? ' data-wl-lightbox="true"' : ''}>
  <div class="wrap">
    <div class="grid" style="--cols:${columns};--gap:${gap}">
      ${items.join('\n      ')}
    </div>
  </div>
</section>`;
}

export const gallery: BlockSpec = {
  type: 'gallery',
  description: 'A responsive image grid (grid/masonry/carousel) with an optional click-to-zoom lightbox. Each item needs a src and alt text.',
  schema,
  css,
  render,
  // Only hydrated when lightbox:true (see registry.needsIsland). Static otherwise.
  island: 'lightbox',
};
