/**
 * `credit` — a one-line attribution: "Powered by X", "Created by X", "Managed by
 * X". The relationship word is the free-text `label`, so any phrasing works
 * ("Built by", "Designed and built by", "A project of") without a new block.
 *
 * The name links out to whoever is credited — an external destination, so it
 * opens in a new tab by default (`rel="noopener noreferrer"`, plus a visually
 * hidden "opens in a new tab" for screen readers, which the arrow glyph alone
 * cannot convey). Set `newTab:false` to keep it in the same tab; leave `href`
 * blank for an unlinked credit.
 *
 * Distinct from `copyright`, which asserts *ownership* of the content (© year
 * holder). This one credits the *maker/operator* — pair them, or use either on
 * its own. Static brick; place last, under the footer.
 */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  label: { kind: 'string', default: 'Powered by', max: 40 },  // "Created by" / "Managed by" / …
  name: { kind: 'string', required: true, default: '', max: 80 }, // who is credited
  href: { kind: 'string', default: '', max: 500 },            // blank → unlinked credit
  newTab: { kind: 'boolean', default: true },                 // external link → new tab
  logo: { kind: 'string', default: '', max: 500 },            // image URL or a single emoji
  note: { kind: 'string', default: '', max: 160 },            // trailing note, after a "·"
  variant: { kind: 'enum', values: ['bar', 'badge', 'inline'], default: 'bar' },
  align: { kind: 'enum', values: ['start', 'center', 'end'], default: 'center' },
};

const css = `
.blk-credit{padding:var(--space) var(--space);background:var(--bg);color:var(--muted)}
.blk-credit.variant-bar{border-top:1px solid color-mix(in srgb,var(--text) 10%,transparent)}
.blk-credit.variant-inline{padding:calc(var(--space)*.55) var(--space)}
.blk-credit .wrap{max-width:1080px;margin:0 auto;display:flex;font-size:var(--fs-base)}
.blk-credit.align-center .wrap{justify-content:center}
.blk-credit.align-end .wrap{justify-content:flex-end}
.blk-credit .line{margin:0;display:inline-flex;align-items:center;flex-wrap:wrap;gap:.42em}
.blk-credit.variant-badge .line{padding:.45em .95em;border-radius:999px;background:var(--surface);border:1px solid color-mix(in srgb,var(--text) 12%,transparent)}
.blk-credit .who{display:inline-flex;align-items:center;gap:.4em;color:var(--text);font-weight:700;text-decoration:none;border-bottom:1px solid transparent;transition:color var(--motion),border-color var(--motion)}
.blk-credit a.who:hover,.blk-credit a.who:focus-visible{color:var(--primary);border-bottom-color:currentColor}
.blk-credit .logo{width:1.15em;height:1.15em;object-fit:contain;display:block;border-radius:.2em}
.blk-credit .logo.emoji{width:auto;height:auto;font-size:1.1em;line-height:1}
.blk-credit .ext{font-size:.8em;opacity:.7}
.blk-credit .note:not(:first-child)::before{content:"·";margin-right:.42em;opacity:.6}
.blk-credit .vh{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
`.trim();

/** An image URL renders as a logo; anything shorter (an emoji/glyph) as text. */
function logoMarkup(logo: unknown): string {
  const s = String(logo ?? '').trim();
  if (!s) return '';
  if (/^(?:https?:\/\/|\/|\.{1,2}\/)/i.test(s)) {
    const src = sanitizeUrl(s);
    return src === '#' ? '' : `<img class="logo" src="${escapeAttr(src)}" alt="" aria-hidden="true" width="18" height="18" loading="lazy" decoding="async">`;
  }
  return `<span class="logo emoji" aria-hidden="true">${escapeHtml(s)}</span>`;
}

function render(config: Record<string, unknown>): string {
  const label = String(config.label ?? '').trim();
  const name = String(config.name ?? '').trim();
  const note = String(config.note ?? '').trim();
  const newTab = config.newTab !== false;
  const variant = ['bar', 'badge', 'inline'].includes(config.variant as string) ? (config.variant as string) : 'bar';
  const align = ['start', 'center', 'end'].includes(config.align as string) ? (config.align as string) : 'center';
  const href = sanitizeUrl(config.href);
  const linked = href !== '#' && String(config.href ?? '').trim() !== '';
  const logo = logoMarkup(config.logo);

  const inner = `${logo}${name ? `<span class="nm">${escapeHtml(name)}</span>` : ''}`;
  // Nothing to credit (defaults, or a logo-only URL that failed sanitizing) →
  // the label alone still renders: total, and the landmark stays.
  const who = !inner
    ? ''
    : linked
      // The arrow is decorative; the new-tab warning has to be real text.
      ? `<a class="who" href="${escapeAttr(href)}"${newTab ? ' target="_blank" rel="noopener noreferrer"' : ''}>${inner}${newTab ? '<span class="ext" aria-hidden="true">↗</span><span class="vh"> (opens in a new tab)</span>' : ''}</a>`
      : `<span class="who">${inner}</span>`;

  return `<section class="blk-credit variant-${variant} align-${align}" aria-label="Credit">
  <div class="wrap">
    <p class="line">${label ? `<span class="lbl">${escapeHtml(label)}</span>` : ''}${who}${note ? `<span class="note">${escapeHtml(note)}</span>` : ''}</p>
  </div>
</section>`;
}

export const credit: BlockSpec = {
  type: 'credit',
  description: 'A one-line attribution — "Powered by / Created by / Managed by <name>" — with an optional logo and an outbound link that opens in a new tab; credits the maker or operator (use `copyright` for ownership).',
  schema,
  css,
  render,
};
