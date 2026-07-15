/**
 * `video` — a responsive embedded video (YouTube / Vimeo) or a self-hosted file.
 * Provider embeds are built from a sanitized id (privacy-friendly hosts), so no
 * arbitrary URL is ever interpolated into the iframe src. Static brick (native
 * players — no island).
 */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  provider: { kind: 'enum', values: ['youtube', 'vimeo', 'file'], default: 'youtube' },
  src: { kind: 'string', required: true, default: '', max: 500 },
  title: { kind: 'string', default: 'Video', max: 120 },
  poster: { kind: 'string', default: '', max: 500 },
  caption: { kind: 'string', default: '', max: 200 },
};

const css = `
.blk-video{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-video .wrap{max-width:900px;margin:0 auto}
.blk-video .frame{position:relative;aspect-ratio:16/9;border-radius:var(--radius);overflow:hidden;background:var(--surface)}
.blk-video iframe,.blk-video video{position:absolute;inset:0;width:100%;height:100%;border:0;display:block;object-fit:cover}
.blk-video figcaption{margin:.6em 0 0;color:var(--muted);font-size:var(--fs-base);text-align:center}
`.trim();

function ytId(src: string): string {
  // Accept a bare id or a common URL; reduce to the safe id charset only.
  const m = /(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/.exec(src);
  return (m ? m[1]! : src).replace(/[^A-Za-z0-9_-]/g, '');
}

function render(config: Record<string, unknown>): string {
  const provider = config.provider as string;
  const src = String(config.src ?? '');
  const title = (config.title as string) || 'Video';
  const caption = config.caption as string;

  let frame: string;
  if (provider === 'file') {
    const url = sanitizeUrl(src);
    const poster = sanitizeUrl(config.poster);
    frame = url === '#'
      ? ''
      : `<video controls preload="metadata"${poster !== '#' && config.poster ? ` poster="${escapeAttr(poster)}"` : ''}><source src="${escapeAttr(url)}"></video>`;
  } else if (provider === 'vimeo') {
    const id = src.replace(/[^0-9]/g, '');
    frame = id ? `<iframe src="https://player.vimeo.com/video/${escapeAttr(id)}" title="${escapeAttr(title)}" loading="lazy" allowfullscreen></iframe>` : '';
  } else {
    const id = ytId(src);
    frame = id ? `<iframe src="https://www.youtube-nocookie.com/embed/${escapeAttr(id)}" title="${escapeAttr(title)}" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen></iframe>` : '';
  }

  return `<section class="blk-video" aria-label="${escapeAttr(title)}">
  <figure class="wrap">
    <div class="frame">${frame}</div>
    ${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ''}
  </figure>
</section>`;
}

export const video: BlockSpec = {
  type: 'video',
  description: 'A responsive embedded video from YouTube or Vimeo (by id or URL) or a self-hosted file, with an optional caption.',
  schema,
  css,
  render,
};
