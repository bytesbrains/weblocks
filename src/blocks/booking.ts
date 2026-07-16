/**
 * `booking` — an appointment/reservation request form. Powered brick (§6): the
 * submit target is resolved by the host via the `booking.request` capability.
 * With no runtime wired it renders inert-but-valid (disabled submit + a note)
 * while keeping the `data-wl-*` hooks so a host can enhance it client-side.
 *
 * This is the home for the booking-driven verticals (salon, clinic, gym, hotel,
 * events) — `contact-form` is generic and `auth` is login; neither fits. The
 * safety-critical parts (availability, double-booking, delivery, spam) live in
 * the host's vetted runtime, never in anything the AI emits. Works without JS
 * via a native form post; a host `booking` island can enhance it (live slots).
 */
import { escapeAttr, escapeHtml, type Schema } from '../schema.js';
import type { BlockSpec, RenderContext } from '../registry.js';
import { NOOP_RUNTIME, safeMethod } from '../runtime.js';

const CAPABILITY = 'booking.request';

const schema: Schema = {
  title: { kind: 'string', default: 'Book an appointment', max: 120 },
  intro: { kind: 'string', default: '', max: 280 },
  submitLabel: { kind: 'string', default: 'Request booking', max: 40 },
  successMessage: { kind: 'string', default: "Thanks — we'll confirm your booking shortly.", max: 200 },
  serviceLabel: { kind: 'string', default: 'Service', max: 60 },
  services: {
    kind: 'array', max: 40,
    of: {
      kind: 'object',
      fields: {
        name: { kind: 'string', required: true, default: 'Service', max: 80 },
        duration: { kind: 'string', default: '', max: 40 },
        price: { kind: 'string', default: '', max: 40 },
      },
    },
  },
  askDate: { kind: 'boolean', default: true },
  askTime: { kind: 'boolean', default: true },
  askParty: { kind: 'boolean', default: false },
  askPhone: { kind: 'boolean', default: true },
  askNotes: { kind: 'boolean', default: true },
  notesLabel: { kind: 'string', default: 'Anything we should know?', max: 80 },
};

const css = `
.blk-booking{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-booking .wrap{max-width:620px;margin:0 auto}
.blk-booking h2{font-size:var(--fs-xl);margin:0 0 .2em;font-weight:800}
.blk-booking .intro{color:var(--muted);margin:0 0 var(--space)}
.blk-booking form{display:grid;gap:calc(var(--space)*.9)}
.blk-booking .grid2{display:grid;gap:calc(var(--space)*.9);grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}
.blk-booking label{display:grid;gap:.35em;font-weight:600}
.blk-booking input,.blk-booking textarea,.blk-booking select{font:inherit;color:inherit;background:var(--surface);border:1px solid color-mix(in srgb,var(--text) 18%,transparent);border-radius:var(--radius);padding:.6em .7em;width:100%}
.blk-booking textarea{min-height:6em;resize:vertical}
.blk-booking button{font:inherit;font-weight:700;cursor:pointer;border:0;border-radius:var(--radius);padding:.7em 1.2em;background:var(--primary);color:var(--on-primary);transition:opacity var(--motion)}
.blk-booking button[disabled]{opacity:.55;cursor:not-allowed}
.blk-booking .note{margin:.4em 0 0;font-size:var(--fs-base);color:var(--muted)}
`.trim();

interface Service { name: string; duration: string; price: string }

function serviceLabel(s: Service): string {
  const meta = [s.duration, s.price].filter(Boolean).join(' · ');
  return meta ? `${s.name} (${meta})` : s.name;
}

function render(config: Record<string, unknown>, _tokens: unknown, ctx?: RenderContext): string {
  const id = ctx?.id ?? 'booking';
  const runtime = ctx?.runtime ?? NOOP_RUNTIME;
  const title = config.title as string;
  const intro = config.intro as string;
  const submitLabel = (config.submitLabel as string) || 'Request booking';
  const services = ((config.services as Service[]) ?? []).filter((s) => s && s.name);
  const action = runtime.resolve(CAPABILITY, id);
  const base = `bk-${id}`;

  const serviceField = services.length
    ? `<label for="${escapeAttr(base)}-service">${escapeHtml(config.serviceLabel as string)}
        <select id="${escapeAttr(base)}-service" name="service" required>
          ${services.map((s) => `<option value="${escapeAttr(s.name)}">${escapeHtml(serviceLabel(s))}</option>`).join('\n          ')}
        </select></label>`
    : '';

  const dateTime = (config.askDate || config.askTime)
    ? `<div class="grid2">
        ${config.askDate ? `<label for="${escapeAttr(base)}-date">Date<input id="${escapeAttr(base)}-date" type="date" name="date" required></label>` : ''}
        ${config.askTime ? `<label for="${escapeAttr(base)}-time">Time<input id="${escapeAttr(base)}-time" type="time" name="time" required></label>` : ''}
      </div>`
    : '';

  const party = config.askParty
    ? `<label for="${escapeAttr(base)}-party">Party size<input id="${escapeAttr(base)}-party" type="number" name="party" min="1" inputmode="numeric"></label>`
    : '';

  const contact = `<div class="grid2">
      <label for="${escapeAttr(base)}-name">Your name<input id="${escapeAttr(base)}-name" type="text" name="name" required></label>
      <label for="${escapeAttr(base)}-email">Email<input id="${escapeAttr(base)}-email" type="email" name="email" required></label>
    </div>`;
  const phone = config.askPhone
    ? `<label for="${escapeAttr(base)}-phone">Phone<input id="${escapeAttr(base)}-phone" type="tel" name="phone"></label>`
    : '';
  const notes = config.askNotes
    ? `<label for="${escapeAttr(base)}-notes">${escapeHtml(config.notesLabel as string)}<textarea id="${escapeAttr(base)}-notes" name="notes"></textarea></label>`
    : '';

  return `<section class="blk-booking" aria-label="${escapeAttr(title || 'Booking')}">
  <div class="wrap">
    ${title ? `<h2>${escapeHtml(title)}</h2>` : ''}
    ${intro ? `<p class="intro">${escapeHtml(intro)}</p>` : ''}
    <form method="${safeMethod(action?.method)}" action="${action ? escapeAttr(action.url) : '#'}" data-wl-capability="${CAPABILITY}" data-wl-block="${escapeAttr(id)}"${action ? '' : ' data-wl-inert="true"'}>
      ${serviceField}
      ${dateTime}
      ${party}
      ${contact}
      ${phone}
      ${notes}
      <button type="submit"${action ? '' : ' disabled'}>${escapeHtml(submitLabel)}</button>
      ${action ? '' : '<p class="note">This booking form needs a runtime to be wired before it can send.</p>'}
    </form>
  </div>
</section>`;
}

export const booking: BlockSpec = {
  type: 'booking',
  description: 'An appointment/reservation request form (service, date, time, contact) that posts to a host-provided runtime. For booking-driven businesses — salons, clinics, gyms, hotels, events. No raw HTML.',
  schema,
  css,
  render,
  island: 'booking',
  runtime: { capabilities: [CAPABILITY] },
};
