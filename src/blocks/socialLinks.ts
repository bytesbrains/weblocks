/** `social-links` — a centered icon row linking out to profiles. Static brick. */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  title: { kind: 'string', default: '', max: 120 },
  links: {
    kind: 'array', max: 12,
    of: {
      kind: 'object',
      fields: {
        label: { kind: 'string', required: true, default: '', max: 40 },
        href: { kind: 'string', required: true, default: '', max: 500 },
        icon: { kind: 'string', default: '', max: 8 }, // emoji or a single glyph
      },
    },
  },
};

const css = `
.blk-social-links{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text);text-align:center}
.blk-social-links .wrap{max-width:800px;margin:0 auto}
.blk-social-links h2{font-size:var(--fs-lg);font-weight:700;margin:0 0 var(--space)}
.blk-social-links .row{display:flex;flex-wrap:wrap;justify-content:center;gap:.8em}
.blk-social-links a{display:inline-flex;align-items:center;gap:.4em;padding:.5em .9em;border-radius:var(--radius);text-decoration:none;color:var(--text);background:var(--surface);border:1px solid color-mix(in srgb,var(--text) 15%,transparent);font-size:var(--fs-base);font-weight:600;transition:color var(--motion),border-color var(--motion)}
.blk-social-links a:hover,.blk-social-links a:focus-visible{color:var(--primary);border-color:var(--primary)}
.blk-social-links .ico{font-size:1.15em;line-height:1}
`.trim();

type Link = { label: string; href: string; icon: string };

function link(l: Link): string {
  const href = sanitizeUrl(l.href);
  if (!l.label || href === '#' || !l.href) return '';
  return `<a href="${escapeAttr(href)}" rel="noopener">
        ${l.icon ? `<span class="ico" aria-hidden="true">${escapeHtml(l.icon)}</span>` : ''}
        <span>${escapeHtml(l.label)}</span>
      </a>`;
}

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const links = ((config.links as Link[]) ?? []).map(link).filter(Boolean);

  return `<section class="blk-social-links" aria-label="${escapeAttr(title || 'Social links')}">
  <div class="wrap">
    ${title ? `<h2>${escapeHtml(title)}</h2>` : ''}
    <div class="row">
      ${links.join('\n      ')}
    </div>
  </div>
</section>`;
}

export const socialLinks: BlockSpec = {
  type: 'social-links',
  description: 'A centered row of links to social or external profiles, each an optional icon plus a label.',
  schema,
  css,
  render,
};
