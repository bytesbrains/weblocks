/**
 * `announcement-bar` — dismissible top strip (promo / notice). Static markup;
 * the dismiss button is a client "island" (declared via `island`). Renders
 * fine without JS — the strip simply stays put.
 */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  text: { kind: 'string', required: true, default: '', max: 200 },
  linkLabel: { kind: 'string', default: '', max: 40 },
  href: { kind: 'string', default: '', max: 500 },
  tone: { kind: 'enum', values: ['info', 'promo', 'warning'], default: 'info' },
  dismissible: { kind: 'boolean', default: true },
};

const css = `
.blk-announcement-bar{width:100%;background:var(--surface);color:var(--text);font-family:var(--font);font-size:var(--fs-base);border-bottom:1px solid color-mix(in srgb, var(--text) 15%, transparent)}
.blk-announcement-bar.tone-info{background:color-mix(in srgb, var(--primary) 12%, var(--surface))}
.blk-announcement-bar.tone-promo{background:color-mix(in srgb, var(--accent) 16%, var(--surface))}
.blk-announcement-bar.tone-warning{background:color-mix(in srgb, var(--accent) 22%, var(--surface))}
.blk-announcement-bar .wrap{max-width:1080px;margin:0 auto;display:flex;align-items:center;justify-content:center;gap:.6em;padding:.55em var(--space);text-align:center}
.blk-announcement-bar .msg{margin:0}
.blk-announcement-bar a{color:var(--primary);font-weight:700;text-decoration:underline;text-underline-offset:2px}
.blk-announcement-bar a:hover,.blk-announcement-bar a:focus-visible{color:var(--accent)}
.blk-announcement-bar .close{flex:0 0 auto;margin-left:auto;background:none;border:0;color:inherit;font-size:1.2em;line-height:1;cursor:pointer;padding:.15em .4em;border-radius:var(--radius);opacity:.7;transition:opacity var(--motion),background var(--motion)}
.blk-announcement-bar .close:hover,.blk-announcement-bar .close:focus-visible{opacity:1;background:color-mix(in srgb, var(--text) 12%, transparent)}
@media(max-width:440px){.blk-announcement-bar .wrap{flex-wrap:wrap;gap:.3em;font-size:calc(var(--fs-base)*.95)}}
`.trim();

const TONES = new Set(['info', 'promo', 'warning']);

function render(config: Record<string, unknown>): string {
  const text = config.text as string;
  // Nothing to announce → render an empty but valid landmark (total render).
  const linkLabel = config.linkLabel as string;
  const href = escapeAttr(sanitizeUrl(config.href));
  const hasLink = !!linkLabel && href !== '#';
  const toneRaw = config.tone as string;
  const tone = TONES.has(toneRaw) ? toneRaw : 'info';
  const dismissible = config.dismissible as boolean;

  const link = hasLink ? ` <a href="${href}">${escapeHtml(linkLabel)}</a>` : '';
  const close = dismissible
    ? `<button type="button" class="close" data-wl-dismiss aria-label="Dismiss">&times;</button>`
    : '';

  return `<section class="blk-announcement-bar tone-${tone}" aria-label="Announcement">
  <div class="wrap">
    <p class="msg">${escapeHtml(text)}${link}</p>
    ${close}
  </div>
</section>`;
}

export const announcementBar: BlockSpec = {
  type: 'announcement-bar',
  description: 'A dismissible full-width strip for a short promo or notice, with an optional inline link and info/promo/warning tone.',
  schema,
  css,
  render,
  // Dismiss is JS-enhanced; the strip renders and reads fine with no JS.
  island: 'announcement-bar',
};
