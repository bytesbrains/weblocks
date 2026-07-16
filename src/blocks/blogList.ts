/**
 * `blog-list` — a post index as a card grid. The post list is static config for
 * now (a host can later feed it from a store via the runtime contract). Static
 * brick.
 */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  title: { kind: 'string', default: '', max: 120 },
  columns: { kind: 'int', oneOf: [2, 3], default: 3 },
  posts: {
    kind: 'array', max: 24,
    of: {
      kind: 'object',
      fields: {
        title: { kind: 'string', required: true, default: '', max: 160 },
        excerpt: { kind: 'string', default: '', max: 280 },
        href: { kind: 'string', default: '', max: 500 },
        image: { kind: 'string', default: '', max: 500 },
        date: { kind: 'string', default: '', max: 40 },
        tag: { kind: 'string', default: '', max: 40 },
      },
    },
  },
};

const css = `
.blk-blog-list{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-blog-list .wrap{max-width:1120px;margin:0 auto}
.blk-blog-list h2{font-size:var(--fs-xl);margin:0 0 var(--space-lg);font-weight:800;text-align:center}
.blk-blog-list .grid{display:grid;grid-template-columns:repeat(var(--cols,3),1fr);gap:calc(var(--space)*1.4)}
.blk-blog-list .card{display:flex;flex-direction:column;background:var(--surface);border-radius:var(--radius);overflow:hidden}
.blk-blog-list a.card{text-decoration:none;color:inherit;transition:transform var(--motion)}
.blk-blog-list a.card:hover{transform:translateY(-3px)}
.blk-blog-list .cover{aspect-ratio:16/9;object-fit:cover;width:100%;background:color-mix(in srgb,var(--muted) 15%,transparent)}
.blk-blog-list .body{padding:calc(var(--space)*1.1);display:flex;flex-direction:column;gap:.4em}
.blk-blog-list .meta{display:flex;gap:.6em;color:var(--muted);font-size:var(--fs-base)}
.blk-blog-list .tag{color:var(--accent);font-weight:700}
.blk-blog-list h3{margin:0;font-size:var(--fs-lg);font-weight:700;line-height:1.3}
.blk-blog-list p{margin:0;color:var(--muted);line-height:1.5}
@media(max-width:760px){.blk-blog-list .grid{grid-template-columns:1fr 1fr}}
@media(max-width:440px){.blk-blog-list .grid{grid-template-columns:1fr}}
`.trim();

type Post = { title: string; excerpt: string; href: string; image: string; date: string; tag: string };

function card(p: Post): string {
  if (!p.title) return '';
  const href = sanitizeUrl(p.href);
  const linked = href !== '#' && !!p.href;
  const img = sanitizeUrl(p.image);
  const cover = (img !== '#' && p.image) ? `<img class="cover" src="${escapeAttr(img)}" alt="${escapeAttr(p.title)}" loading="lazy">` : '';
  const meta = (p.tag || p.date)
    ? `<div class="meta">${p.tag ? `<span class="tag">${escapeHtml(p.tag)}</span>` : ''}${p.date ? `<span>${escapeHtml(p.date)}</span>` : ''}</div>`
    : '';
  const inner = `${cover}
        <div class="body">
          ${meta}
          <h3>${escapeHtml(p.title)}</h3>
          ${p.excerpt ? `<p>${escapeHtml(p.excerpt)}</p>` : ''}
        </div>`;
  return linked
    ? `<a class="card" href="${escapeAttr(href)}">${inner}</a>`
    : `<article class="card">${inner}</article>`;
}

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const columns = Number.isInteger(config.columns) ? (config.columns as number) : 3;
  const posts = ((config.posts as Post[]) ?? []).map(card).filter(Boolean);

  return `<section class="blk-blog-list" aria-label="${escapeAttr(title || 'Posts')}">
  <div class="wrap">
    ${title ? `<h2>${escapeHtml(title)}</h2>` : ''}
    <div class="grid" style="--cols:${columns}">
      ${posts.join('\n      ')}
    </div>
  </div>
</section>`;
}

export const blogList: BlockSpec = {
  type: 'blog-list',
  description: 'A post index as a grid of cards, each with an optional cover image, tag, date, title, and excerpt linking to the post.',
  schema,
  css,
  render,
};
