/**
 * `progress` — value-toward-a-target indicators: fundraising goals, course
 * completion, capacity and scarcity. Four shapes over one schema — `bars`
 * (track + fill), `segments` (discrete cells), `rings` (SVG donut, for grid
 * tiles) and `meters` (track with a scale and an optional target marker).
 *
 * Deliberately NOT a rating: `skills` already owns 0–5 proficiency. Here every
 * item is a real `value` against a real `max`, with units, so "£12,400 of
 * £20,000" and "8 of 40 left" come out of the same contract.
 *
 * Position-in-a-flow (a stepper) is intentionally absent — it needs
 * `aria-current="step"` and a completed/current/upcoming state rather than a
 * value, so it belongs in its own brick (weblocks#65, open question 1).
 *
 * Accessibility is the point of this brick, not a finish: every indicator is a
 * real `role="progressbar"` with `aria-valuenow/min/max` and an `aria-valuetext`
 * that spells out the units, because a bare "62" tells a screen-reader user
 * nothing. Colour never carries meaning alone — the figure is always reachable
 * as text. Static brick; the optional count-up island is pure enhancement.
 */
import { escapeAttr, escapeHtml, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  title: { kind: 'string', default: '', max: 120 },
  subtitle: { kind: 'string', default: '', max: 240 },
  display: { kind: 'enum', values: ['bars', 'segments', 'rings', 'meters'], default: 'bars' },
  layout: { kind: 'enum', values: ['stack', 'grid', 'inline'], default: 'stack' },
  columns: { kind: 'int', oneOf: [1, 2, 3, 4], default: 3 },
  size: { kind: 'enum', values: ['sm', 'md', 'lg'], default: 'md' },
  /** Render the figure as text next to the label (it is always in aria-valuetext). */
  showValue: { kind: 'boolean', default: true },
  /** Grow the fill on scroll-in. Progressive enhancement — see islands/progress.ts. */
  animate: { kind: 'boolean', default: false },
  items: {
    kind: 'array', max: 12,
    of: {
      kind: 'object',
      fields: {
        label: { kind: 'string', required: true, default: '', max: 80 },
        value: { kind: 'int', default: 0, min: 0 },
        max: { kind: 'int', default: 100, min: 1 },
        /** Unit affixes, e.g. prefix '£' or suffix '%' / ' places'. */
        prefix: { kind: 'string', default: '', max: 8 },
        suffix: { kind: 'string', default: '', max: 16 },
        /** Free line under the indicator, e.g. "£12,400 raised of a £20,000 target". */
        caption: { kind: 'string', default: '', max: 160 },
        /** Optional target marker, in the same units as `value`. */
        threshold: { kind: 'int', default: 0, min: 0 },
        state: { kind: 'enum', values: ['default', 'accent', 'success', 'warning', 'danger'], default: 'default' },
        icon: { kind: 'string', default: '', max: 8 },
      },
    },
  },
};

// Brand states derive from tokens (as `announcement-bar` does). success/warning/
// danger use the same fixed hues as `hours` open/closed: green-good and red-bad
// are conventions a brand token cannot express, and re-deriving them from
// --primary would make a "danger" bar render reassuring on a red-branded site.
const css = `
.blk-progress{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-progress .wrap{max-width:920px;margin:0 auto}
.blk-progress h2{font-size:var(--fs-xl);margin:0 0 .25em;font-weight:800}
.blk-progress .sub{color:var(--muted);margin:0 0 var(--space);max-width:60ch}
.blk-progress .items{display:grid;gap:calc(var(--space)*0.8)}
.blk-progress .items.grid{grid-template-columns:repeat(var(--cols,3),minmax(0,1fr))}
.blk-progress .items.inline{gap:calc(var(--space)*0.5)}
.blk-progress .item{min-width:0}
.blk-progress .head{display:flex;align-items:baseline;justify-content:space-between;gap:.8em;margin-bottom:.4em}
.blk-progress .ilabel{font-weight:600;font-size:var(--fs-base);display:inline-flex;align-items:baseline;gap:.4em}
.blk-progress .ivalue{font-weight:700;font-size:var(--fs-base);white-space:nowrap;font-variant-numeric:tabular-nums}
.blk-progress .caption{margin:.4em 0 0;color:var(--muted);font-size:var(--fs-base)}
.blk-progress .track{position:relative;border-radius:999px;background:color-mix(in srgb,var(--text) 12%,transparent);overflow:hidden}
.blk-progress .fill{display:block;height:100%;border-radius:999px;background:var(--primary);transition:width var(--motion)}
.blk-progress.sz-sm .track{height:6px}
.blk-progress.sz-md .track{height:10px}
.blk-progress.sz-lg .track{height:16px}
/* inline — label, bar and figure on one row */
.blk-progress .items.inline .item{display:grid;grid-template-columns:minmax(80px,10rem) 1fr auto;align-items:center;gap:.8em}
.blk-progress .items.inline .head{display:contents}
.blk-progress .items.inline .caption{grid-column:1/-1;margin:0}
/* segments — discrete cells rather than a continuous fill */
.blk-progress .segs{display:flex;gap:3px}
.blk-progress .seg{flex:1 1 0;border-radius:3px;background:color-mix(in srgb,var(--text) 12%,transparent)}
.blk-progress.sz-sm .seg{height:6px}
.blk-progress.sz-md .seg{height:10px}
.blk-progress.sz-lg .seg{height:16px}
.blk-progress .seg.on{background:var(--primary)}
/* meters — a scale under the track plus an optional target marker */
.blk-progress .scale{display:flex;justify-content:space-between;margin-top:.3em;color:var(--muted);font-size:calc(var(--fs-base)*.86);font-variant-numeric:tabular-nums}
.blk-progress .mark{position:absolute;top:-3px;bottom:-3px;width:2px;background:var(--text);opacity:.55;border-radius:2px}
/* rings — SVG donut, sized by the block scale */
.blk-progress .ring{display:flex;flex-direction:column;align-items:center;text-align:center;gap:.5em}
.blk-progress .ring svg{display:block;transform:rotate(-90deg)}
.blk-progress .ring .rtrack{stroke:color-mix(in srgb,var(--text) 12%,transparent)}
.blk-progress .ring .rfill{stroke:var(--primary);transition:stroke-dashoffset var(--motion)}
.blk-progress .ring .rval{font-weight:800;font-size:var(--fs-lg);font-variant-numeric:tabular-nums}
/* states — brand-derived, then the two conventional ones */
.blk-progress .state-accent .fill,.blk-progress .state-accent .seg.on{background:var(--accent)}
.blk-progress .state-accent .rfill{stroke:var(--accent)}
.blk-progress .state-success .fill,.blk-progress .state-success .seg.on{background:#2f9e44}
.blk-progress .state-success .rfill{stroke:#2f9e44}
.blk-progress .state-warning .fill,.blk-progress .state-warning .seg.on{background:#e8930c}
.blk-progress .state-warning .rfill{stroke:#e8930c}
.blk-progress .state-danger .fill,.blk-progress .state-danger .seg.on{background:#e03131}
.blk-progress .state-danger .rfill{stroke:#e03131}
@media(max-width:600px){
  .blk-progress .items.grid{grid-template-columns:repeat(auto-fit,minmax(140px,1fr))}
  .blk-progress .items.inline .item{grid-template-columns:1fr}
}
@media(prefers-reduced-motion:reduce){.blk-progress .fill,.blk-progress .ring .rfill{transition:none}}
`.trim();

interface Item {
  label: string; value: number; max: number; prefix: string; suffix: string;
  caption: string; threshold: number; state: string; icon: string;
}

const RING = { sm: 68, md: 92, lg: 116 } as const;

/** Clamp into 0..max and derive a percentage. Total: max ≤ 0 can never divide. */
function ratio(value: number, max: number): { pct: number; value: number; max: number } {
  const m = Number.isFinite(max) && max > 0 ? max : 100;
  const v = Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), m);
  return { pct: (v / m) * 100, value: v, max: m };
}

/** The figure as a reader sees it — affixes included, so units survive. */
const figure = (n: number, it: Item): string => `${it.prefix}${n}${it.suffix}`;

/**
 * "£12,400 of £20,000", "8 of 40 left", "62 of 100%".
 *
 * A prefix is a per-figure unit (currency) so it repeats; a suffix is usually a
 * trailing phrase (" left", " of 41") and repeating it reads as gibberish —
 * "34 of 41 of 41 of 41" — so it lands once, at the end.
 */
const valueText = (value: number, max: number, it: Item): string =>
  `${it.prefix}${value} of ${it.prefix}${max}${it.suffix}`;

function indicator(it: Item, display: string, size: string, animate: boolean): string {
  const { pct, value, max } = ratio(it.value, it.max);
  const shown = pct.toFixed(2).replace(/\.?0+$/, '');
  // A bare "62" is meaningless read aloud; spell out the units and the target.
  const spoken = valueText(value, max, it);
  const aria = `role="progressbar" aria-valuenow="${escapeAttr(String(value))}" aria-valuemin="0"`
    + ` aria-valuemax="${escapeAttr(String(max))}" aria-valuetext="${escapeAttr(spoken)}"`
    + ` aria-label="${escapeAttr(it.label)}"`;
  // The island reads the target width; the correct width is ALREADY inline, so
  // JS-off and pre-hydration render identically.
  const anim = animate ? ` data-wl-progress="${escapeAttr(shown)}"` : '';

  if (display === 'rings') {
    const box = RING[size as keyof typeof RING] ?? RING.md;
    const stroke = size === 'sm' ? 7 : size === 'lg' ? 12 : 9;
    const r = (box - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - pct / 100);
    return `<div class="ring">
        <svg width="${box}" height="${box}" viewBox="0 0 ${box} ${box}" ${aria}${anim} data-wl-circ="${circ.toFixed(2)}" focusable="false">
          <circle class="rtrack" cx="${box / 2}" cy="${box / 2}" r="${r.toFixed(2)}" fill="none" stroke-width="${stroke}"></circle>
          <circle class="rfill" cx="${box / 2}" cy="${box / 2}" r="${r.toFixed(2)}" fill="none" stroke-width="${stroke}"
            stroke-linecap="round" stroke-dasharray="${circ.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"></circle>
        </svg>
        <span class="rval" aria-hidden="true">${escapeHtml(figure(value, it))}</span>
      </div>`;
  }

  if (display === 'segments') {
    // One cell per unit while that stays legible, else a fixed 20-cell scale.
    const cells = max <= 20 ? max : 20;
    const on = Math.round((pct / 100) * cells);
    const segs = Array.from({ length: cells }, (_v, i) => `<span class="seg${i < on ? ' on' : ''}"></span>`).join('');
    return `<div class="segs" ${aria}${anim}>${segs}</div>`;
  }

  // bars + meters share the track; meters add a scale and an optional marker.
  const t = ratio(it.threshold, it.max);
  const marker = display === 'meters' && it.threshold > 0
    ? `<span class="mark" style="left:${t.pct.toFixed(2)}%" aria-hidden="true"></span>`
    : '';
  const scale = display === 'meters'
    ? `<div class="scale" aria-hidden="true"><span>${escapeHtml(figure(0, it))}</span><span>${escapeHtml(figure(max, it))}</span></div>`
    : '';
  return `<div class="track" ${aria}${anim}><span class="fill" style="width:${shown}%"></span>${marker}</div>${scale}`;
}

function item(it: Item, display: string, size: string, showValue: boolean, animate: boolean): string {
  const { value } = ratio(it.value, it.max);
  const label = `<span class="ilabel">${it.icon ? `<span aria-hidden="true">${escapeHtml(it.icon)}</span>` : ''}${escapeHtml(it.label)}</span>`;
  // Rings carry their own centred figure, so a second one would just repeat it.
  const readout = showValue && display !== 'rings'
    ? `<span class="ivalue">${escapeHtml(figure(value, it))}</span>` : '';
  const head = display === 'rings' ? '' : `<div class="head">${label}${readout}</div>`;
  const ringLabel = display === 'rings' ? `<div class="head">${label}</div>` : '';
  const caption = it.caption ? `<p class="caption">${escapeHtml(it.caption)}</p>` : '';
  const state = ['accent', 'success', 'warning', 'danger'].includes(it.state) ? it.state : 'default';
  return `<div class="item state-${state}">
      ${head}${indicator(it, display, size, animate)}${ringLabel}${caption}
    </div>`;
}

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const subtitle = config.subtitle as string;
  const display = ['bars', 'segments', 'rings', 'meters'].includes(config.display as string) ? (config.display as string) : 'bars';
  const layout = ['stack', 'grid', 'inline'].includes(config.layout as string) ? (config.layout as string) : 'stack';
  const size = ['sm', 'md', 'lg'].includes(config.size as string) ? (config.size as string) : 'md';
  const columns = Number.isInteger(config.columns) ? (config.columns as number) : 3;
  const showValue = config.showValue !== false;
  const animate = config.animate === true;
  // Rings only make sense tiled — a full-width donut is not a thing anyone wants.
  const effective = display === 'rings' && layout === 'stack' ? 'grid' : layout;

  const items = ((config.items as Item[]) ?? [])
    .filter((it) => it && it.label)
    .map((it) => item(it, display, size, showValue, animate))
    .join('\n      ');

  return `<section class="blk-progress sz-${escapeAttr(size)}" aria-label="${escapeAttr(title || 'Progress')}">
  <div class="wrap">
    ${title ? `<h2>${escapeHtml(title)}</h2>` : ''}
    ${subtitle ? `<p class="sub">${escapeHtml(subtitle)}</p>` : ''}
    <div class="items ${escapeAttr(effective)}" style="--cols:${columns}">
      ${items}
    </div>
  </div>
</section>`;
}

export const progress: BlockSpec = {
  type: 'progress',
  description: 'Progress and goal indicators — fundraising totals, completion, capacity or scarcity — as bars, discrete segments, donut rings or scaled meters, each with units and an optional target marker.',
  schema,
  css,
  render,
  island: 'progress',
};
