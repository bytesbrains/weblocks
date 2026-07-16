/**
 * `search` — site search as either a full **bar** or a compact **icon** button
 * that expands on focus (CSS-only, no JavaScript). Powered brick (§6): the query
 * target is resolved by the host via the `search.query` capability. With no
 * runtime wired it degrades to a harmless same-page GET form, keeping the
 * `data-wl-*` hooks so a host can enhance it client-side.
 */
import { escapeAttr, escapeHtml, type Schema } from '../schema.js';
import type { BlockSpec, RenderContext } from '../registry.js';
import { NOOP_RUNTIME, safeMethod } from '../runtime.js';

const CAPABILITY = 'search.query';

// Inline magnifier — self-contained, inherits colour via currentColor.
const ICON =
  '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><line x1="20" y1="20" x2="16.65" y2="16.65"></line></svg>';

const schema: Schema = {
  layout: { kind: 'enum', values: ['bar', 'icon'], default: 'bar' },
  placeholder: { kind: 'string', default: 'Search…', max: 80 },
  label: { kind: 'string', default: 'Search', max: 60 },       // accessible name
  buttonLabel: { kind: 'string', default: 'Search', max: 40 }, // submit text (bar layout)
  name: { kind: 'string', default: 'q', max: 40 },             // query param name
  align: { kind: 'enum', values: ['start', 'center', 'end'], default: 'center' },
};

const css = `
.blk-search{padding:var(--space) var(--space);background:var(--bg);color:var(--text);display:flex}
.blk-search.align-start{justify-content:flex-start}
.blk-search.align-center{justify-content:center}
.blk-search.align-end{justify-content:flex-end}
.blk-search .field{display:flex;align-items:center;background:var(--surface);border:1px solid color-mix(in srgb,var(--text) 16%,transparent);border-radius:var(--radius);transition:border-color var(--motion),box-shadow var(--motion)}
.blk-search .field:focus-within{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 18%,transparent)}
.blk-search .ico{display:inline-flex;align-items:center;justify-content:center;padding:.5em .2em .5em .65em;color:var(--muted);cursor:text;line-height:0}
.blk-search .input{font:inherit;color:inherit;background:transparent;border:0;outline:0;padding:.55em .5em;min-width:0}
.blk-search .input::placeholder{color:var(--muted)}
.blk-search .go{display:inline-flex;align-items:center;font:inherit;font-weight:700;cursor:pointer;border:0;border-radius:var(--radius);white-space:nowrap}
.blk-search .vh{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
/* Bar: input always open, text submit button. */
.blk-search.layout-bar .field{width:min(520px,100%)}
.blk-search.layout-bar .input{flex:1}
.blk-search.layout-bar .go{background:var(--primary);color:var(--on-primary);padding:.5em 1em;margin:3px}
.blk-search.layout-bar .go:hover{opacity:.9}
/* Icon: collapsed magnifier that expands on focus-within; Enter submits. */
.blk-search.layout-icon .field{border-radius:999px}
.blk-search.layout-icon .input{width:0;padding-left:0;padding-right:0;opacity:0;transition:width var(--motion),opacity var(--motion),padding var(--motion)}
.blk-search.layout-icon .field:focus-within .input{width:min(240px,60vw);opacity:1;padding:.55em .5em .55em .2em}
.blk-search.layout-icon .go{display:none}
@media(max-width:480px){.blk-search.layout-icon .field:focus-within .input{width:52vw}}
`.trim();

function render(config: Record<string, unknown>, _tokens?: unknown, ctx?: RenderContext): string {
  const id = ctx?.id ?? 'search';
  const runtime = ctx?.runtime ?? NOOP_RUNTIME;
  const layout = config.layout === 'icon' ? 'icon' : 'bar';
  const align = ['start', 'center', 'end'].includes(config.align as string) ? (config.align as string) : 'center';
  const label = (config.label as string) || 'Search';
  const placeholder = config.placeholder as string;
  const buttonLabel = (config.buttonLabel as string) || 'Search';
  const qname = String(config.name ?? 'q').replace(/[^A-Za-z0-9_-]/g, '') || 'q';
  const fid = `s-${String(id).replace(/[^A-Za-z0-9_-]/g, '') || 'search'}`;

  const action = runtime.resolve(CAPABILITY, id);
  // Search is a query, so GET by default; the host adapter may override.
  const method = action ? safeMethod(action.method) : 'get';

  return `<section class="blk-search layout-${layout} align-${align}" aria-label="${escapeAttr(label)}">
  <form class="wrap" role="search" method="${method}" action="${action ? escapeAttr(action.url) : '#'}" data-wl-capability="${CAPABILITY}" data-wl-block="${escapeAttr(id)}"${action ? '' : ' data-wl-inert="true"'}>
    <div class="field">
      <label class="ico" for="${escapeAttr(fid)}" aria-hidden="true">${ICON}</label>
      <input class="input" id="${escapeAttr(fid)}" type="search" name="${escapeAttr(qname)}" placeholder="${escapeAttr(placeholder)}" aria-label="${escapeAttr(label)}" autocomplete="off">
      <button class="go" type="submit"><span class="go-label">${escapeHtml(buttonLabel)}</span></button>
    </div>
  </form>
</section>`;
}

export const search: BlockSpec = {
  type: 'search',
  description: 'A site search rendered as a full search bar or a compact expanding icon button; queries a host-provided search runtime.',
  schema,
  css,
  render,
  runtime: { capabilities: [CAPABILITY] },
};
