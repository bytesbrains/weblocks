/** `contact-details` — address / phone / email / hours. Static brick. */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  title: { kind: 'string', default: 'Get in touch', max: 120 },
  address: { kind: 'string', default: '', max: 200 },
  phone: { kind: 'string', default: '', max: 40 },
  email: { kind: 'string', default: '', max: 120 },
  hours: { kind: 'string', default: '', max: 160 },
};

const css = `
.blk-contact{padding:var(--space-lg) var(--space);background:var(--surface);color:var(--text)}
.blk-contact .wrap{max-width:760px;margin:0 auto}
.blk-contact h2{font-size:var(--fs-xl);margin:0 0 var(--space);font-weight:800}
.blk-contact dl{display:grid;grid-template-columns:auto 1fr;gap:.5em 1.2em;margin:0}
.blk-contact dt{color:var(--muted);font-weight:600}
.blk-contact dd{margin:0}
.blk-contact a{color:var(--primary);text-decoration:none}
`.trim();

function row(label: string, value: string, href?: string): string {
  if (!value) return '';
  const v = href ? `<a href="${escapeAttr(sanitizeUrl(href))}">${escapeHtml(value)}</a>` : escapeHtml(value);
  return `<dt>${escapeHtml(label)}</dt><dd>${v}</dd>`;
}

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const address = config.address as string;
  const phone = config.phone as string;
  const email = config.email as string;
  const hours = config.hours as string;
  const rows = [
    row('Address', address),
    row('Phone', phone, phone ? `tel:${phone.replace(/[^+\d]/g, '')}` : undefined),
    row('Email', email, email ? `mailto:${email}` : undefined),
    row('Hours', hours),
  ].filter(Boolean).join('\n      ');

  return `<section class="blk-contact" aria-label="${escapeAttr(title || 'Contact')}">
  <div class="wrap">
    ${title ? `<h2>${escapeHtml(title)}</h2>` : ''}
    <dl>
      ${rows}
    </dl>
  </div>
</section>`;
}

export const contactDetails: BlockSpec = {
  type: 'contact-details',
  description: 'A contact info block: address, phone, email, and opening hours (each optional). Read-only — no form.',
  schema, css, render,
};
