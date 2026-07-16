/** `logos` — a "trusted by" strip of client/partner logos. Static brick. */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  title: { kind: 'string', default: 'Trusted by', max: 120 },
  items: {
    kind: 'array', max: 24,
    of: {
      kind: 'object',
      fields: {
        src: { kind: 'string', required: true, default: '', max: 500 },
        alt: { kind: 'string', default: '', max: 120 },
        href: { kind: 'string', default: '', max: 500 },
      },
    },
  },
};

const css = `
.blk-logos{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-logos .wrap{max-width:1120px;margin:0 auto;text-align:center}
.blk-logos h2{font-size:var(--fs-lg);font-weight:700;color:var(--muted);margin:0 0 var(--space)}
.blk-logos .strip{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:calc(var(--space)*1.6)}
.blk-logos .logo{display:inline-flex}
.blk-logos img{display:block;height:2.2rem;width:auto;max-width:160px;object-fit:contain;filter:grayscale(1);opacity:.65;transition:filter var(--motion),opacity var(--motion)}
.blk-logos .logo:hover img,.blk-logos a:hover img{filter:grayscale(0);opacity:1}
@media(max-width:440px){.blk-logos .strip{gap:var(--space)}.blk-logos img{height:1.8rem}}
`.trim();

type Item = { src: string; alt: string; href: string };

function logo(it: Item): string {
  // Drop items with no source rather than emit a broken <img>.
  if (!it.src) return '';
  const src = sanitizeUrl(it.src);
  if (src === '#') return '';
  const img = `<img src="${escapeAttr(src)}" alt="${escapeAttr(it.alt)}" loading="lazy">`;
  const href = sanitizeUrl(it.href);
  const hasHref = href !== '#' && !!it.href;
  return hasHref
    ? `<a class="logo" href="${escapeAttr(href)}" rel="noopener">${img}</a>`
    : `<span class="logo">${img}</span>`;
}

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const items = ((config.items as Item[]) ?? []).map(logo).filter(Boolean);

  return `<section class="blk-logos" aria-label="${escapeAttr(title || 'Logos')}">
  <div class="wrap">
    ${title ? `<h2>${escapeHtml(title)}</h2>` : ''}
    <div class="strip">
      ${items.join('\n      ')}
    </div>
  </div>
</section>`;
}

export const logos: BlockSpec = {
  type: 'logos',
  description: 'A centered strip of client or partner logos (grayscale until hover), each optionally linking out, under a short heading.',
  schema,
  css,
  render,
};
