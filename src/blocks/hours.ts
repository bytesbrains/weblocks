const TIME_VALUE_MAX_LENGTH = 5;
const MAX_DAYS_COUNT = 21;
const MAX_NOTE_LENGTH = 200;
const MAX_TIMEZONE_LENGTH = 60;
const MAX_TITLE_LENGTH = 120; /**
 * `hours` — structured weekly opening hours with a live "open now / closed"
 * badge. Static-first: the renderer emits the full week as an accessible table
 * (always correct, no JS), with each row carrying `data-*` hooks; the shipped
 * `hours` island reads them at view time to fill the badge and highlight today,
 * so the "open now" state is live rather than frozen at generation time.
 *
 * Today it's a freeform string on `contact-details`; this gives it structure.
 * Times are 24h "HH:MM". A day with no ranges (or `closed:true`) shows "Closed".
 */
import { escapeAttr, escapeHtml, type Schema } from "../schema.js";
import type { BlockSpec } from "../registry.js";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const LABELS: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

const schema: Schema = {
  title: { kind: "string", default: "Opening hours", max: MAX_TITLE_LENGTH },
  timezone: { kind: "string", default: "", max: MAX_TIMEZONE_LENGTH },
  note: { kind: "string", default: "", max: MAX_NOTE_LENGTH },
  days: {
    kind: "array",
    max: MAX_DAYS_COUNT,
    of: {
      kind: "object",
      fields: {
        day: { kind: "enum", values: DAYS, required: true, default: "mon" },
        open: { kind: "string", default: "", max: TIME_VALUE_MAX_LENGTH },
        close: { kind: "string", default: "", max: 5 },
        closed: { kind: "boolean", default: false },
      },
    },
  },
};

const css = `
.blk-hours{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-hours .wrap{max-width:560px;margin:0 auto}
.blk-hours .head{display:flex;flex-wrap:wrap;align-items:baseline;gap:.6em;margin-bottom:var(--space)}
.blk-hours h2{font-size:var(--fs-xl);margin:0;font-weight:800}
.blk-hours .badge{font-size:var(--fs-base);font-weight:700;border-radius:999px;padding:.15em .7em;background:color-mix(in srgb,var(--text) 10%,transparent);color:var(--muted)}
.blk-hours .badge[data-state="open"]{background:color-mix(in srgb,#2f9e44 20%,transparent);color:#2b8a3e}
.blk-hours .badge[data-state="closed"]{background:color-mix(in srgb,#e03131 18%,transparent);color:#c92a2a}
.blk-hours table{width:100%;border-collapse:collapse}
.blk-hours th,.blk-hours td{text-align:left;padding:.55em 0;border-bottom:1px solid color-mix(in srgb,var(--text) 10%,transparent)}
.blk-hours td.time{text-align:right;font-variant-numeric:tabular-nums;color:var(--muted)}
.blk-hours tr[data-today] th,.blk-hours tr[data-today] td{font-weight:800;color:var(--text)}
.blk-hours .closed{color:color-mix(in srgb,var(--text) 45%,transparent)}
.blk-hours .note{color:var(--muted);font-size:var(--fs-base);margin:var(--space) 0 0}
.blk-hours .tz{color:var(--muted);font-weight:400;font-size:var(--fs-base)}
`.trim();

interface DayCfg {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

/** Group configured ranges by weekday, preserving order (supports split shifts). */
function byDay(days: DayCfg[]): Record<string, DayCfg[]> {
  const out: Record<string, DayCfg[]> = {};
  for (const d of days) {
    if (!d || !DAYS.includes(d.day as (typeof DAYS)[number])) continue;
    (out[d.day] ??= []).push(d);
  }
  return out;
}

function rangeText(ranges: DayCfg[]): {
  text: string;
  closed: boolean;
  data: string;
} {
  const open = ranges.filter((r) => !r.closed && r.open && r.close);
  if (!open.length) return { text: "Closed", closed: true, data: "" };
  const text = open
    .map((r) => `${escapeHtml(r.open)}–${escapeHtml(r.close)}`)
    .join(", ");
  const data = open.map((r) => `${r.open}-${r.close}`).join(",");
  return { text, closed: false, data };
}

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const timezone = String(config.timezone ?? "").trim();
  const note = config.note as string;
  const grouped = byDay((config.days as DayCfg[]) ?? []);

  const rows = DAYS.map((day) => {
    const { text, closed, data } = rangeText(grouped[day] ?? []);
    return `<tr data-day="${day}"${data ? ` data-hours="${escapeAttr(data)}"` : ""}>
        <th scope="row">${LABELS[day]}</th>
        <td class="time${closed ? " closed" : ""}">${text}</td>
      </tr>`;
  }).join("\n      ");

  return `<section class="blk-hours" aria-label="${escapeAttr(title || "Opening hours")}" data-wl-hours="true">
  <div class="wrap">
    <div class="head">
      ${title ? `<h2>${escapeHtml(title)}${timezone ? ` <span class="tz">(${escapeHtml(timezone)})</span>` : ""}</h2>` : ""}
      <span class="badge" data-hours-badge hidden></span>
    </div>
    <table>
      <tbody>
      ${rows}
      </tbody>
    </table>
    ${note ? `<p class="note">${escapeHtml(note)}</p>` : ""}
  </div>
</section>`;
}

export const hours: BlockSpec = {
  type: "hours",
  description:
    'Structured weekly opening hours (24h times per day, split shifts allowed) rendered as an accessible table with a live "open now / closed" badge. Use for shops, cafés, salons, and clinics.',
  schema,
  css,
  render,
  island: "hours",
};
