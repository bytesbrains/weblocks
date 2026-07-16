/**
 * `profile-header` — the résumé/CV header: avatar, name, role/headline, location,
 * a contact + social row (brand icons), an optional short summary, and optional
 * **Download-PDF** (print) and **Share** action buttons. The buttons are wired by
 * the `resume` island (print → `window.print()` with the engine's print styles;
 * share → Web Share API + copy-link fallback) and are hidden from the printout.
 * Static markup; island only ships when an action button is enabled.
 */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';
import { BRAND_ICON_PATHS } from './brandIcons.js';

// Generic (non-brand) contact glyphs — filled, 24×24.
const GENERIC: Record<string, string> = {
  email: 'M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v.5l-10 6.25L2 6.5V6zm0 2.85V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.85l-9.47 5.92a1 1 0 0 1-1.06 0L2 8.85z',
  phone: 'M6.62 2.53c.5-.2 1.08.02 1.36.49l1.7 3.01c.24.42.18.95-.15 1.3L8.06 9.03a12 12 0 0 0 6.9 6.9l1.7-1.47c.35-.33.88-.39 1.3-.15l3.01 1.7c.47.28.69.86.49 1.36l-.98 2.4c-.22.55-.79.9-1.4.83C10.7 20.1 3.9 13.3 3.1 5.9c-.07-.6.28-1.18.83-1.4l2.69-1.97z',
  website: 'M14 3h7v7h-2V6.41l-8.29 8.3-1.42-1.42L17.59 5H14V3zM5 5h5v2H5v12h12v-5h2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
  location: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z',
};

const CONTACT_TYPES = ['email', 'phone', 'website', 'location', 'linkedin', 'github', 'twitter', 'x', 'custom'];

const schema: Schema = {
  name: { kind: 'string', required: true, default: '', max: 120 },
  headline: { kind: 'string', default: '', max: 160 }, // role / tagline
  location: { kind: 'string', default: '', max: 120 },
  avatar: { kind: 'string', default: '', max: 500 },
  summary: { kind: 'string', default: '', max: 400 },
  contacts: {
    kind: 'array', max: 10,
    of: {
      kind: 'object',
      fields: {
        type: { kind: 'enum', values: CONTACT_TYPES, default: 'custom' },
        value: { kind: 'string', required: true, default: '', max: 300 }, // email / phone / url / text
        label: { kind: 'string', default: '', max: 80 },                  // shown text (defaults to value)
      },
    },
  },
  showDownload: { kind: 'boolean', default: false },
  downloadLabel: { kind: 'string', default: 'Download PDF', max: 40 },
  showShare: { kind: 'boolean', default: false },
  shareLabel: { kind: 'string', default: 'Share', max: 40 },
};

const css = `
.blk-profile-header{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-profile-header .wrap{max-width:900px;margin:0 auto;display:flex;gap:calc(var(--space)*1.4);align-items:center;flex-wrap:wrap}
.blk-profile-header .avatar,.blk-profile-header .initials{width:112px;height:112px;border-radius:999px;flex:0 0 auto;object-fit:cover;display:flex;align-items:center;justify-content:center}
.blk-profile-header .initials{background:color-mix(in srgb,var(--primary) 18%,var(--surface));color:var(--primary);font-weight:800;font-size:var(--fs-xl)}
.blk-profile-header .info{flex:1;min-width:min(280px,100%)}
.blk-profile-header h1{margin:0;font-size:var(--fs-xl);font-weight:800;line-height:1.1}
.blk-profile-header .role{margin:.2em 0 0;color:var(--primary);font-weight:600;font-size:var(--fs-lg)}
.blk-profile-header .summary{margin:.5em 0 0;color:var(--muted)}
.blk-profile-header .contacts{display:flex;flex-wrap:wrap;gap:.4em 1.1em;margin:.8em 0 0}
.blk-profile-header .contacts a,.blk-profile-header .contacts span.c{display:inline-flex;align-items:center;gap:.4em;color:var(--muted);text-decoration:none;font-size:var(--fs-base)}
.blk-profile-header .contacts a:hover{color:var(--primary)}
.blk-profile-header .contacts svg{width:1.05em;height:1.05em;flex:0 0 auto}
.blk-profile-header .actions{display:flex;gap:.6em;flex-wrap:wrap;margin:calc(var(--space)*1.1) 0 0;flex-basis:100%}
.blk-profile-header .btn{font:inherit;font-weight:700;cursor:pointer;border:0;border-radius:var(--radius);padding:.6em 1.2em;background:var(--primary);color:var(--on-primary)}
.blk-profile-header .btn.ghost{background:transparent;color:var(--primary);border:1px solid var(--primary)}
@media(max-width:560px){.blk-profile-header .wrap{justify-content:center;text-align:center}.blk-profile-header .contacts{justify-content:center}}
`.trim();

interface Contact { type: string; value: string; label: string }

function svg(path: string): string {
  return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${path}"></path></svg>`;
}

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase() || '?';
}

function contact(c: Contact): string {
  const type = CONTACT_TYPES.includes(c.type) ? c.type : 'custom';
  const value = c.value;
  if (!value) return '';
  const text = escapeHtml(c.label || value);
  const iconPath = type === 'twitter' || type === 'x' ? BRAND_ICON_PATHS.x
    : (BRAND_ICON_PATHS[type] ?? GENERIC[type]);
  const icon = iconPath ? svg(iconPath) : '';

  if (type === 'location') return `<span class="c">${icon}${text}</span>`;
  let href = value;
  if (type === 'email') href = `mailto:${value}`;
  else if (type === 'phone') href = `tel:${value.replace(/[^0-9+]/g, '')}`;
  const safe = sanitizeUrl(href);
  if (safe === '#') return `<span class="c">${icon}${text}</span>`;
  return `<a href="${escapeAttr(safe)}" rel="noopener">${icon}${text}</a>`;
}

function render(config: Record<string, unknown>): string {
  const name = config.name as string;
  const headline = config.headline as string;
  const summary = config.summary as string;
  const avatarUrl = sanitizeUrl(config.avatar);
  const hasAvatar = avatarUrl !== '#' && !!(config.avatar as string);
  const contacts = ((config.contacts as Contact[]) ?? []).map(contact).filter(Boolean);
  const showDownload = config.showDownload === true;
  const showShare = config.showShare === true;

  const avatar = hasAvatar
    ? `<img class="avatar" src="${escapeAttr(avatarUrl)}" alt="${escapeAttr(name)}">`
    : `<div class="initials" aria-hidden="true">${escapeHtml(initials(name))}</div>`;

  const actions = (showDownload || showShare)
    ? `<div class="actions" data-wl-noprint>
      ${showDownload ? `<button class="btn" type="button" data-wl-print>${escapeHtml((config.downloadLabel as string) || 'Download PDF')}</button>` : ''}
      ${showShare ? `<button class="btn ghost" type="button" data-wl-share>${escapeHtml((config.shareLabel as string) || 'Share')}</button>` : ''}
    </div>`
    : '';

  return `<section class="blk-profile-header" aria-label="${escapeAttr(name || 'Profile')}">
  <div class="wrap">
    ${avatar}
    <div class="info">
      <h1>${escapeHtml(name)}</h1>
      ${headline ? `<p class="role">${escapeHtml(headline)}</p>` : ''}
      ${summary ? `<p class="summary">${escapeHtml(summary)}</p>` : ''}
      ${contacts.length ? `<div class="contacts">${contacts.join('')}</div>` : ''}
    </div>
    ${actions}
  </div>
</section>`;
}

export const profileHeader: BlockSpec = {
  type: 'profile-header',
  description: 'A résumé/CV header: avatar, name, role, location, a contact + social row, and optional Download-PDF and Share buttons.',
  schema,
  css,
  render,
  island: 'resume',
};
