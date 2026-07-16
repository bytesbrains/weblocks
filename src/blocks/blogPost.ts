/**
 * `blog-post` — a single article layout. The body is TYPED content blocks
 * (heading / paragraph / quote / bullet), never raw HTML, so it stays safe and
 * editable. Static brick.
 */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';
import { renderProse, type ProseNode } from './prose.js';

const schema: Schema = {
  title: { kind: 'string', required: true, default: '', max: 200 },
  date: { kind: 'string', default: '', max: 40 },
  author: { kind: 'string', default: '', max: 80 },
  cover: { kind: 'string', default: '', max: 500 },
  coverAlt: { kind: 'string', default: '', max: 200 },
  body: {
    kind: 'array', max: 120,
    of: {
      kind: 'object',
      fields: {
        kind: { kind: 'enum', values: ['heading', 'paragraph', 'quote', 'bullet'], default: 'paragraph' },
        text: { kind: 'string', required: true, default: '', max: 2000 },
      },
    },
  },
};

const css = `
.blk-blog-post{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-blog-post article{max-width:68ch;margin:0 auto}
.blk-blog-post .cover{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:var(--radius);margin:0 0 var(--space)}
.blk-blog-post h1{font-size:var(--fs-xl);margin:0 0 .3em;font-weight:800;line-height:1.15}
.blk-blog-post .meta{color:var(--muted);font-size:var(--fs-base);margin:0 0 var(--space-lg)}
.blk-blog-post h2{font-size:var(--fs-lg);margin:1.2em 0 .3em;font-weight:700}
.blk-blog-post p{margin:0 0 1em;font-size:var(--fs-lg);line-height:1.7}
.blk-blog-post blockquote{margin:1.2em 0;padding:.4em 0 .4em 1em;border-left:3px solid var(--accent);color:var(--muted);font-style:italic}
.blk-blog-post ul{margin:0 0 1em;padding-left:1.4em}
.blk-blog-post li{margin:.3em 0;font-size:var(--fs-lg);line-height:1.6}
`.trim();

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const date = config.date as string;
  const author = config.author as string;
  const cover = sanitizeUrl(config.cover);
  const hasCover = cover !== '#' && !!(config.cover as string);
  const body = renderProse(config.body as ProseNode[]);
  const meta = [author && `By ${escapeHtml(author)}`, date && escapeHtml(date)].filter(Boolean).join(' · ');

  return `<section class="blk-blog-post" aria-label="${escapeAttr(title || 'Article')}">
  <article>
    ${hasCover ? `<img class="cover" src="${escapeAttr(cover)}" alt="${escapeAttr(config.coverAlt)}" loading="lazy">` : ''}
    ${title ? `<h1>${escapeHtml(title)}</h1>` : ''}
    ${meta ? `<p class="meta">${meta}</p>` : ''}
    ${body}
  </article>
</section>`;
}

export const blogPost: BlockSpec = {
  type: 'blog-post',
  description: 'A single article layout with an optional cover, title, author/date, and a typed body (headings, paragraphs, quotes, bullets).',
  schema,
  css,
  render,
};
