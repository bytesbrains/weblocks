/**
 * `legal` — policy links (Terms, Privacy, Cookies, …) that open as **scrollable,
 * dismissible dialogs**. Each document's body is authored in a SAFE Markdown
 * subset (see markdown.ts) — rich formatting, but never raw HTML (any literal
 * HTML is escaped, not executed). Static brick: the dialog is pure CSS
 * (`:target`), so it works with zero JavaScript — click a link to open, click
 * the ✕ or the backdrop to dismiss.
 *
 * Drop it near the `footer` for the familiar "Terms · Privacy" footer row.
 */
import { escapeAttr, escapeHtml, type Schema } from '../schema.js';
import type { BlockSpec, RenderContext } from '../registry.js';
import { renderMarkdown } from '../markdown.js';

const schema: Schema = {
  title: { kind: 'string', default: '', max: 120 },
  align: { kind: 'enum', values: ['start', 'center', 'end'], default: 'center' },
  separator: { kind: 'string', default: '·', max: 4 },
  documents: {
    kind: 'array', max: 8,
    of: {
      kind: 'object',
      fields: {
        label: { kind: 'string', required: true, default: '', max: 60 },   // link text
        title: { kind: 'string', default: '', max: 120 },                  // dialog heading (defaults to label)
        content: { kind: 'string', default: '', max: 40000 },              // Markdown body
      },
    },
  },
};

const css = `
.blk-legal{padding:var(--space) var(--space);background:var(--bg);color:var(--text)}
.blk-legal .links{display:flex;flex-wrap:wrap;align-items:center;gap:.35em .8em;max-width:1080px;margin:0 auto}
.blk-legal.align-center .links{justify-content:center}
.blk-legal.align-end .links{justify-content:flex-end}
.blk-legal .lead{color:var(--muted);font-size:var(--fs-base)}
.blk-legal .links a.open{color:var(--muted);text-decoration:none;font-size:var(--fs-base);border-bottom:1px solid transparent}
.blk-legal .links a.open:hover,.blk-legal .links a.open:focus-visible{color:var(--primary);border-bottom-color:currentColor}
.blk-legal .sep{color:var(--muted);opacity:.6;user-select:none}
/* Dialog — hidden until its id is the URL :target. */
.blk-legal .modal{position:fixed;inset:0;z-index:1000;display:none;padding:calc(var(--space)*1.2)}
.blk-legal .modal:target{display:grid;place-items:center}
.blk-legal .backdrop{position:absolute;inset:0;background:color-mix(in srgb,#000 55%,transparent);border:0;display:block}
.blk-legal .panel{position:relative;display:flex;flex-direction:column;width:min(680px,100%);max-height:85vh;background:var(--surface);color:var(--text);border-radius:var(--radius);box-shadow:0 24px 60px -12px rgba(0,0,0,.5);overflow:hidden}
.blk-legal .pbar{display:flex;align-items:center;justify-content:space-between;gap:1em;padding:calc(var(--space)*1.1) calc(var(--space)*1.3);border-bottom:1px solid color-mix(in srgb,var(--text) 12%,transparent)}
.blk-legal .pbar h2{margin:0;font-size:var(--fs-lg);font-weight:800}
.blk-legal .close{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;width:2em;height:2em;border-radius:999px;text-decoration:none;color:var(--muted);font-size:1.3em;line-height:1;background:color-mix(in srgb,var(--text) 6%,transparent)}
.blk-legal .close:hover,.blk-legal .close:focus-visible{color:var(--text);background:color-mix(in srgb,var(--text) 12%,transparent)}
.blk-legal .body{overflow:auto;padding:calc(var(--space)*1.3);line-height:1.65;overscroll-behavior:contain}
.blk-legal .body>:first-child{margin-top:0}
.blk-legal .body>:last-child{margin-bottom:0}
.blk-legal .body h2{font-size:var(--fs-lg);font-weight:800;margin:1.4em 0 .4em}
.blk-legal .body h3{font-size:var(--fs-lg);font-weight:700;margin:1.2em 0 .3em}
.blk-legal .body h4{font-size:var(--fs-base);font-weight:700;margin:1em 0 .3em;text-transform:uppercase;letter-spacing:.03em;color:var(--muted)}
.blk-legal .body p{margin:0 0 1em}
.blk-legal .body ul,.blk-legal .body ol{margin:0 0 1em;padding-left:1.4em}
.blk-legal .body li{margin:.3em 0}
.blk-legal .body a{color:var(--primary);text-decoration:underline;text-underline-offset:2px}
.blk-legal .body blockquote{margin:1em 0;padding:.2em 0 .2em 1em;border-left:3px solid var(--accent);color:var(--muted)}
.blk-legal .body code{background:color-mix(in srgb,var(--text) 8%,transparent);padding:.1em .35em;border-radius:4px;font-size:.9em}
.blk-legal .body hr{border:0;border-top:1px solid color-mix(in srgb,var(--text) 15%,transparent);margin:1.4em 0}
/* Lock background scroll while a dialog is open (progressive; no-op if unsupported). */
html:has(.blk-legal .modal:target){overflow:hidden}
`.trim();

interface Doc { label: string; title: string; content: string }

function render(config: Record<string, unknown>, _tokens?: unknown, ctx?: RenderContext): string {
  const bid = String(ctx?.id ?? 'legal').replace(/[^A-Za-z0-9_-]/g, '') || 'legal';
  const title = config.title as string;
  const align = ['start', 'center', 'end'].includes(config.align as string) ? (config.align as string) : 'center';
  const sep = escapeHtml((config.separator as string) || '·');
  const docs = ((config.documents as Doc[]) ?? []).filter((d) => d && d.label);

  const links = docs
    .map((d, i) => `<a class="open" id="open-${bid}-${i}" href="#${bid}-${i}">${escapeHtml(d.label)}</a>`)
    .join(`<span class="sep" aria-hidden="true">${sep}</span>`);

  const dialogs = docs.map((d, i) => {
    const did = `${bid}-${i}`;
    const heading = d.title || d.label;
    return `<div class="modal" id="${did}" role="dialog" aria-modal="true" aria-labelledby="h-${did}">
    <a class="backdrop" href="#open-${did}" aria-label="Close" tabindex="-1"></a>
    <div class="panel">
      <div class="pbar">
        <h2 id="h-${did}">${escapeHtml(heading)}</h2>
        <a class="close" href="#open-${did}" aria-label="Close dialog">&times;</a>
      </div>
      <div class="body">${renderMarkdown(d.content)}</div>
    </div>
  </div>`;
  }).join('\n  ');

  return `<section class="blk-legal align-${align}" aria-label="${escapeAttr(title || 'Legal')}">
  <div class="links">
    ${title ? `<span class="lead">${escapeHtml(title)}</span>` : ''}
    ${links}
  </div>
  ${dialogs}
</section>`;
}

export const legal: BlockSpec = {
  type: 'legal',
  description: 'Policy links (terms, privacy, cookies, …) that open as scrollable, dismissible dialogs; each body is safe Markdown (never raw HTML). No JavaScript.',
  schema,
  css,
  render,
};
