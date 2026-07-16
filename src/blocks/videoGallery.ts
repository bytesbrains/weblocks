/**
 * `video-gallery` — a grid or carousel of **click-to-play video cards**
 * (YouTube / Vimeo / self-hosted). Each card is a lightweight *facade*: a
 * thumbnail + play button, so no heavy player iframe loads until the visitor
 * presses play — then the `video` island swaps in the real player inline.
 *
 * Progressive enhancement: with no JavaScript each card is a link that opens the
 * video on its platform; with the island, it plays inline. YouTube thumbnails are
 * derived from the id automatically (give a `poster` for Vimeo/file). Static-first
 * brick — the island only adds inline playback.
 */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';
import {
  youtubeId, vimeoId, youtubeThumb, youtubeEmbed, youtubeWatch, vimeoEmbed, vimeoWatch, PLAY_ICON,
} from './videoUtil.js';

const schema: Schema = {
  title: { kind: 'string', default: '', max: 120 },
  layout: { kind: 'enum', values: ['grid', 'carousel'], default: 'grid' },
  columns: { kind: 'int', oneOf: [2, 3, 4], default: 3 },
  items: {
    kind: 'array', max: 24,
    of: {
      kind: 'object',
      fields: {
        provider: { kind: 'enum', values: ['youtube', 'vimeo', 'file'], default: 'youtube' },
        src: { kind: 'string', required: true, default: '', max: 500 }, // id or url
        title: { kind: 'string', default: '', max: 160 },
        poster: { kind: 'string', default: '', max: 500 }, // thumbnail (auto for youtube)
      },
    },
  },
};

const css = `
.blk-video-gallery{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-video-gallery .wrap{max-width:1120px;margin:0 auto}
.blk-video-gallery h2{font-size:var(--fs-xl);margin:0 0 var(--space-lg);font-weight:800;text-align:center}
.blk-video-gallery .grid{display:grid;grid-template-columns:repeat(var(--cols,3),1fr);gap:calc(var(--space)*1.2)}
.blk-video-gallery.layout-carousel .grid{display:flex;grid-template-columns:none;overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:.5em}
.blk-video-gallery.layout-carousel .v-card{flex:0 0 min(88%,440px);scroll-snap-align:center}
.blk-video-gallery .v-card{display:block;text-decoration:none;color:inherit;background:var(--surface);border-radius:var(--radius);overflow:hidden;transition:transform var(--motion)}
.blk-video-gallery .v-card:hover{transform:translateY(-3px)}
.blk-video-gallery .v-media{position:relative;display:block;aspect-ratio:16/9;background:#000}
.blk-video-gallery .v-media img{width:100%;height:100%;object-fit:cover;display:block}
.blk-video-gallery .v-play{position:absolute;inset:0;margin:auto;width:62px;height:62px;display:flex;align-items:center;justify-content:center;border-radius:999px;background:rgba(0,0,0,.55);color:#fff;transition:background var(--motion),transform var(--motion)}
.blk-video-gallery .v-card:hover .v-play{background:var(--primary);color:var(--on-primary);transform:scale(1.06)}
.blk-video-gallery .v-play svg{margin-left:3px}
.blk-video-gallery .v-title{display:block;padding:.7em .9em;font-weight:600;font-size:var(--fs-base)}
.blk-video-gallery .v-frame{position:absolute;inset:0;width:100%;height:100%;border:0}
@media(max-width:720px){.blk-video-gallery .grid{grid-template-columns:1fr 1fr}}
@media(max-width:440px){.blk-video-gallery .grid{grid-template-columns:1fr}}
`.trim();

interface Item { provider: string; src: string; title: string; poster: string }

function card(it: Item): string {
  const provider = ['youtube', 'vimeo', 'file'].includes(it.provider) ? it.provider : 'youtube';
  const title = it.title;
  const posterUrl = sanitizeUrl(it.poster);
  const poster = (posterUrl !== '#' && it.poster) ? posterUrl : '';

  let thumb = '', embed = '', watch = '';
  if (provider === 'youtube') {
    const id = youtubeId(it.src);
    if (!id) return '';
    thumb = poster || youtubeThumb(id);
    embed = youtubeEmbed(id, true);
    watch = youtubeWatch(id);
  } else if (provider === 'vimeo') {
    const id = vimeoId(it.src);
    if (!id) return '';
    thumb = poster;
    embed = vimeoEmbed(id, true);
    watch = vimeoWatch(id);
  } else {
    const url = sanitizeUrl(it.src);
    if (url === '#' || !it.src) return '';
    thumb = poster;
    embed = url;
    watch = url;
  }

  const media = `<span class="v-media">
        ${thumb ? `<img src="${escapeAttr(thumb)}" alt="${escapeAttr(title)}" loading="lazy">` : ''}
        <span class="v-play" aria-hidden="true">${PLAY_ICON}</span>
      </span>`;
  return `<a class="v-card" href="${escapeAttr(watch)}" target="_blank" rel="noopener" data-wl-video data-wl-provider="${provider}" data-wl-embed="${escapeAttr(embed)}" data-wl-title="${escapeAttr(title || 'Video')}" aria-label="Play video: ${escapeAttr(title || 'video')}">
      ${media}
      ${title ? `<span class="v-title">${escapeHtml(title)}</span>` : ''}
    </a>`;
}

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const layout = config.layout === 'carousel' ? 'carousel' : 'grid';
  const columns = Number.isInteger(config.columns) ? (config.columns as number) : 3;
  const items = ((config.items as Item[]) ?? []).map(card).filter(Boolean);

  return `<section class="blk-video-gallery layout-${layout}" aria-label="${escapeAttr(title || 'Videos')}">
  <div class="wrap">
    ${title ? `<h2>${escapeHtml(title)}</h2>` : ''}
    <div class="grid" style="--cols:${columns}">
      ${items.join('\n      ')}
    </div>
  </div>
</section>`;
}

export const videoGallery: BlockSpec = {
  type: 'video-gallery',
  description: 'A grid or carousel of click-to-play video cards (YouTube/Vimeo/file); each loads its player inline on click (a lightweight facade — no heavy iframes up front).',
  schema,
  css,
  render,
  island: 'video',
};
