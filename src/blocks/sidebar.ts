/** `sidebar` — section / drawer nav for multi-view apps. Static brick. */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  title: { kind: 'string', default: '', max: 60 },
  links: {
    kind: 'array',
    max: 20,
    of: {
      kind: 'object',
      fields: {
        label: { kind: 'string', required: true, default: '', max: 60 },
        href: { kind: 'string', default: '', max: 500 },
        icon: { kind: 'string', default: '', max: 8 }, // emoji or a single glyph
      },
    },
  },
};

const css = `
.blk-sidebar{background:var(--surface);color:var(--text);font-family:var(--font);padding:var(--space);border-right:1px solid color-mix(in srgb, var(--text) 15%, transparent)}
.blk-sidebar .wrap{max-width:280px}
.blk-sidebar .title{margin:0 0 var(--space);font-size:var(--fs-lg);font-weight:800;color:var(--text)}
.blk-sidebar ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:.15em}
.blk-sidebar a{display:flex;align-items:center;gap:.6em;padding:.55em .7em;text-decoration:none;color:var(--muted);font-size:var(--fs-base);border-radius:var(--radius);transition:color var(--motion),background var(--motion)}
.blk-sidebar a:hover,.blk-sidebar a:focus-visible{color:var(--primary);background:color-mix(in srgb, var(--primary) 10%, transparent)}
.blk-sidebar .ico{font-size:1.15em;line-height:1;flex:0 0 auto}
.blk-sidebar .lbl{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media(min-width:900px){.blk-sidebar{position:sticky;top:0;align-self:flex-start;min-height:100vh}}
@media(max-width:899px){.blk-sidebar{border-right:0;border-bottom:1px solid color-mix(in srgb, var(--text) 15%, transparent)}.blk-sidebar .wrap{max-width:none}.blk-sidebar ul{flex-direction:row;flex-wrap:wrap}}
`.trim();

type Link = { label: string; href: string; icon: string };

function linkItem(l: Link): string {
  // Drop links with no label rather than emit an empty target (total render).
  if (!l.label) return '';
  const href = escapeAttr(sanitizeUrl(l.href || '#'));
  return `<li><a href="${href}">
        ${l.icon ? `<span class="ico" aria-hidden="true">${escapeHtml(l.icon)}</span>` : ''}
        <span class="lbl">${escapeHtml(l.label)}</span>
      </a></li>`;
}

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const links = ((config.links as Link[]) ?? []).map(linkItem).filter(Boolean);

  return `<nav class="blk-sidebar" aria-label="${escapeAttr(title || 'Sidebar')}">
  <div class="wrap">
    ${title ? `<p class="title">${escapeHtml(title)}</p>` : ''}
    <ul>
      ${links.join('\n      ')}
    </ul>
  </div>
</nav>`;
}

export const sidebar: BlockSpec = {
  type: 'sidebar',
  description: 'A vertical section/drawer navigation for multi-view apps: an optional title over a list of icon-and-label links.',
  schema,
  css,
  render,
};
