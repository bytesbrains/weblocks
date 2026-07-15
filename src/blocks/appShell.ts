/** `app-shell` — persistent bottom tab bar (app-like nav). Static brick. */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  brand: { kind: 'string', default: '', max: 60 },
  tabs: {
    kind: 'array',
    max: 6,
    of: {
      kind: 'object',
      fields: {
        label: { kind: 'string', required: true, default: '', max: 40 },
        href: { kind: 'string', default: '', max: 500 },
        icon: { kind: 'string', default: '', max: 8 }, // emoji or a single glyph
      },
    },
  },
};

const css = `
.blk-app-shell{position:sticky;bottom:0;left:0;right:0;z-index:20;background:var(--surface);color:var(--text);border-top:1px solid color-mix(in srgb, var(--text) 15%, transparent);font-family:var(--font)}
.blk-app-shell .wrap{max-width:720px;margin:0 auto;display:flex;align-items:stretch;justify-content:space-around;gap:.2em}
.blk-app-shell .brand{display:none}
.blk-app-shell a{flex:1 1 0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.15em;padding:.5em .3em;text-decoration:none;color:var(--muted);font-size:var(--fs-base);text-align:center;border-radius:var(--radius);transition:color var(--motion),background var(--motion)}
.blk-app-shell a:hover,.blk-app-shell a:focus-visible{color:var(--primary);background:color-mix(in srgb, var(--primary) 10%, transparent)}
.blk-app-shell .ico{font-size:1.4em;line-height:1}
.blk-app-shell .lbl{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media(max-width:440px){.blk-app-shell a{font-size:calc(var(--fs-base)*.9);padding:.45em .2em}.blk-app-shell .ico{font-size:1.3em}}
`.trim();

type Tab = { label: string; href: string; icon: string };

function tabItem(t: Tab): string {
  // Drop tabs with no label rather than emit an empty target (total render).
  if (!t.label) return '';
  const href = escapeAttr(sanitizeUrl(t.href || '#'));
  return `<a href="${href}">
        ${t.icon ? `<span class="ico" aria-hidden="true">${escapeHtml(t.icon)}</span>` : ''}
        <span class="lbl">${escapeHtml(t.label)}</span>
      </a>`;
}

function render(config: Record<string, unknown>): string {
  const brand = config.brand as string;
  const tabs = ((config.tabs as Tab[]) ?? []).map(tabItem).filter(Boolean);

  return `<nav class="blk-app-shell" aria-label="${escapeAttr(brand || 'App navigation')}">
  <div class="wrap">
    ${brand ? `<span class="brand">${escapeHtml(brand)}</span>` : ''}
    ${tabs.join('\n    ')}
  </div>
</nav>`;
}

export const appShell: BlockSpec = {
  type: 'app-shell',
  description: 'A persistent bottom tab bar for app-like navigation, each tab an optional icon plus a label linking to a view.',
  schema,
  css,
  render,
};
