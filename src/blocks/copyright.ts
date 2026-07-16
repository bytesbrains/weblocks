/**
 * `copyright` — a small "© year holder · rights" bar for the very bottom of a
 * page. A standalone alternative to the `footer` block's copyright line: pair it
 * with `legal` and `social-links` for a lightweight footer, or use it under the
 * full `footer`. The year auto-fills to the current year when left blank (or give
 * an explicit year / range like "2020–2026"). Static brick.
 */
import { escapeHtml, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  holder: { kind: 'string', default: '', max: 120 },                    // e.g. "Acme Inc."
  year: { kind: 'string', default: '', max: 24 },                       // blank → current year
  text: { kind: 'string', default: 'All rights reserved.', max: 160 },  // trailing note
  showSymbol: { kind: 'boolean', default: true },                       // the © symbol
  align: { kind: 'enum', values: ['start', 'center', 'end'], default: 'center' },
};

const css = `
.blk-copyright{padding:var(--space) var(--space);background:var(--bg);color:var(--muted);border-top:1px solid color-mix(in srgb,var(--text) 10%,transparent)}
.blk-copyright .wrap{max-width:1080px;margin:0 auto;font-size:var(--fs-base)}
.blk-copyright.align-center .wrap{text-align:center}
.blk-copyright.align-end .wrap{text-align:right}
.blk-copyright p{margin:0}
`.trim();

function render(config: Record<string, unknown>): string {
  const holder = config.holder as string;
  const yearIn = String(config.year ?? '').trim();
  const year = yearIn || String(new Date().getFullYear()); // blank → current year
  const text = config.text as string;
  const symbol = config.showSymbol !== false;
  const align = ['start', 'center', 'end'].includes(config.align as string) ? (config.align as string) : 'center';

  let line = `${symbol ? '© ' : ''}${escapeHtml(year)}`;
  if (holder) line += ` ${escapeHtml(holder)}`;
  // Add the note, but don't double punctuation when the holder ends in "." (Inc./Co./Ltd.).
  if (text) line += `${/[.!?]$/.test(line) ? ' ' : '. '}${escapeHtml(text)}`;

  return `<footer class="blk-copyright align-${align}" aria-label="Copyright">
  <div class="wrap">
    <p>${line}</p>
  </div>
</footer>`;
}

export const copyright: BlockSpec = {
  type: 'copyright',
  description: 'A small copyright bar (© year holder + rights text) for the bottom of a page; the year auto-fills to the current year when left blank.',
  schema,
  css,
  render,
};
