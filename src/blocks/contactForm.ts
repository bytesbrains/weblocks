/**
 * `contact-form` — a powered brick (§6). Emits a real, accessible form whose
 * fields are TYPED config (never raw HTML). The submit target is resolved by the
 * host runtime via the `contact-form.submit` capability; with no runtime wired
 * the form renders inert-but-valid (action `#`, disabled submit, a visible note)
 * while keeping the `data-wl-*` hooks so a host can still enhance it client-side.
 *
 * The safety-critical parts (spam/captcha, server-side validation, delivery,
 * abuse caps) live in the host's vetted runtime — never in anything the AI emits.
 */
import { escapeAttr, escapeHtml, type Schema } from '../schema.js';
import type { BlockSpec, RenderContext } from '../registry.js';
import { NOOP_RUNTIME } from '../runtime.js';

const CAPABILITY = 'contact-form.submit';

const schema: Schema = {
  title: { kind: 'string', default: 'Get in touch', max: 120 },
  intro: { kind: 'string', default: '', max: 280 },
  submitLabel: { kind: 'string', default: 'Send', max: 40 },
  successMessage: { kind: 'string', default: "Thanks — we'll be in touch.", max: 200 },
  fields: {
    kind: 'array', max: 12,
    of: {
      kind: 'object',
      fields: {
        name: { kind: 'string', required: true, default: 'field', max: 40 },
        label: { kind: 'string', required: true, default: 'Field', max: 80 },
        type: { kind: 'enum', values: ['text', 'email', 'tel', 'textarea', 'select', 'checkbox'], default: 'text' },
        placeholder: { kind: 'string', default: '', max: 80 },
        required: { kind: 'boolean', default: false },
        options: { kind: 'array', max: 24, of: { kind: 'string', default: '', max: 80 } },
      },
    },
  },
};

const css = `
.blk-contact-form{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-contact-form .wrap{max-width:560px;margin:0 auto}
.blk-contact-form h2{font-size:var(--fs-xl);margin:0 0 .2em;font-weight:800}
.blk-contact-form .intro{color:var(--muted);margin:0 0 var(--space)}
.blk-contact-form form{display:grid;gap:calc(var(--space)*.9)}
.blk-contact-form label{display:grid;gap:.35em;font-weight:600}
.blk-contact-form .row-check{grid-auto-flow:column;justify-content:start;align-items:center;gap:.5em}
.blk-contact-form input,.blk-contact-form textarea,.blk-contact-form select{font:inherit;color:inherit;background:var(--surface);border:1px solid color-mix(in srgb,var(--text) 18%,transparent);border-radius:var(--radius);padding:.6em .7em;width:100%}
.blk-contact-form textarea{min-height:7em;resize:vertical}
.blk-contact-form button{font:inherit;font-weight:700;cursor:pointer;border:0;border-radius:var(--radius);padding:.7em 1.2em;background:var(--primary);color:var(--on-primary);transition:opacity var(--motion)}
.blk-contact-form button[disabled]{opacity:.55;cursor:not-allowed}
.blk-contact-form .note{margin:.4em 0 0;font-size:var(--fs-base);color:var(--muted)}
`.trim();

interface FieldCfg { name: string; label: string; type: string; placeholder: string; required: boolean; options: string[] }

function control(f: FieldCfg): string {
  const id = `f-${escapeAttr(f.name)}`;
  const req = f.required ? ' required' : '';
  const ph = f.placeholder ? ` placeholder="${escapeAttr(f.placeholder)}"` : '';
  const nm = escapeAttr(f.name);
  if (f.type === 'textarea') {
    return `<label for="${id}">${escapeHtml(f.label)}<textarea id="${id}" name="${nm}"${ph}${req}></textarea></label>`;
  }
  if (f.type === 'checkbox') {
    return `<label class="row-check" for="${id}"><input id="${id}" type="checkbox" name="${nm}"${req}>${escapeHtml(f.label)}</label>`;
  }
  if (f.type === 'select') {
    const opts = (f.options ?? []).filter(Boolean).map((o) => `<option value="${escapeAttr(o)}">${escapeHtml(o)}</option>`).join('');
    return `<label for="${id}">${escapeHtml(f.label)}<select id="${id}" name="${nm}"${req}>${opts}</select></label>`;
  }
  const t = ['text', 'email', 'tel'].includes(f.type) ? f.type : 'text';
  return `<label for="${id}">${escapeHtml(f.label)}<input id="${id}" type="${t}" name="${nm}"${ph}${req}></label>`;
}

function render(config: Record<string, unknown>, _tokens: unknown, ctx?: RenderContext): string {
  const id = ctx?.id ?? 'contact-form';
  const runtime = ctx?.runtime ?? NOOP_RUNTIME;
  const title = config.title as string;
  const intro = config.intro as string;
  const submitLabel = (config.submitLabel as string) || 'Send';
  const fields = (config.fields as FieldCfg[]) ?? [];
  const action = runtime.resolve(CAPABILITY, id);
  const controls = fields.map(control).join('\n      ');

  return `<section class="blk-contact-form" aria-label="${escapeAttr(title || 'Contact form')}">
  <div class="wrap">
    ${title ? `<h2>${escapeHtml(title)}</h2>` : ''}
    ${intro ? `<p class="intro">${escapeHtml(intro)}</p>` : ''}
    <form method="${action ? action.method.toLowerCase() : 'post'}" action="${action ? escapeAttr(action.url) : '#'}" data-wl-capability="${CAPABILITY}" data-wl-block="${escapeAttr(id)}"${action ? '' : ' data-wl-inert="true"'}>
      ${controls}
      <button type="submit"${action ? '' : ' disabled'}>${escapeHtml(submitLabel)}</button>
      ${action ? '' : '<p class="note">This form needs a runtime to be wired before it can send.</p>'}
    </form>
  </div>
</section>`;
}

export const contactForm: BlockSpec = {
  type: 'contact-form',
  description: 'A configurable contact form with typed fields (text, email, tel, textarea, select, checkbox) that posts to a host-provided runtime. No raw HTML.',
  schema,
  css,
  render,
  island: 'contact-form',
  runtime: { capabilities: [CAPABILITY] },
};
