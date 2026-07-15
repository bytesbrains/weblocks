/** `team` — a grid of people cards (photo, role, bio, socials). Static brick. */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  title: { kind: 'string', default: '', max: 120 },
  subtitle: { kind: 'string', default: '', max: 240 },
  columns: { kind: 'int', oneOf: [2, 3, 4], default: 3 },
  members: {
    kind: 'array', max: 24,
    of: {
      kind: 'object',
      fields: {
        name: { kind: 'string', required: true, default: '', max: 80 },
        role: { kind: 'string', default: '', max: 80 },
        photo: { kind: 'string', default: '', max: 500 },
        bio: { kind: 'string', default: '', max: 240 },
        socials: {
          kind: 'array', max: 5,
          of: {
            kind: 'object',
            fields: {
              label: { kind: 'string', required: true, default: '', max: 40 },
              href: { kind: 'string', default: '', max: 500 },
            },
          },
        },
      },
    },
  },
};

const css = `
.blk-team{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-team .wrap{max-width:1120px;margin:0 auto}
.blk-team .head{text-align:center;margin-bottom:var(--space-lg)}
.blk-team h2{font-size:var(--fs-xl);margin:0 0 .3em;font-weight:800}
.blk-team .sub{color:var(--muted);font-size:var(--fs-lg);margin:0}
.blk-team .grid{display:grid;grid-template-columns:repeat(var(--cols,3),1fr);gap:calc(var(--space)*1.4)}
.blk-team .card{background:var(--surface);border-radius:var(--radius);padding:calc(var(--space)*1.2);text-align:center}
.blk-team .avatar,.blk-team .initials{width:88px;height:88px;border-radius:999px;margin:0 auto .7em;object-fit:cover;display:flex;align-items:center;justify-content:center}
.blk-team .initials{background:color-mix(in srgb,var(--primary) 18%,var(--surface));color:var(--primary);font-weight:800;font-size:var(--fs-lg)}
.blk-team .name{margin:0;font-size:var(--fs-lg);font-weight:700}
.blk-team .role{margin:.15em 0 .5em;color:var(--accent);font-size:var(--fs-base);font-weight:600}
.blk-team .bio{margin:0 0 .6em;color:var(--muted);font-size:var(--fs-base);line-height:1.5}
.blk-team .socials{display:flex;justify-content:center;gap:.6em;flex-wrap:wrap}
.blk-team .socials a{color:var(--muted);font-size:var(--fs-base);text-decoration:none;font-weight:600}
.blk-team .socials a:hover,.blk-team .socials a:focus-visible{color:var(--primary)}
@media(max-width:720px){.blk-team .grid{grid-template-columns:1fr 1fr}}
@media(max-width:440px){.blk-team .grid{grid-template-columns:1fr}}
`.trim();

type Social = { label: string; href: string };
type Member = { name: string; role: string; photo: string; bio: string; socials: Social[] };

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase() || '?';
}

function card(m: Member): string {
  if (!m.name) return '';
  const photo = sanitizeUrl(m.photo);
  const avatar = (photo !== '#' && m.photo)
    ? `<img class="avatar" src="${escapeAttr(photo)}" alt="${escapeAttr(m.name)}" loading="lazy">`
    : `<div class="initials" aria-hidden="true">${escapeHtml(initials(m.name))}</div>`;
  const socials = (m.socials ?? [])
    .filter((s) => s && s.label && sanitizeUrl(s.href) !== '#')
    .map((s) => `<a href="${escapeAttr(sanitizeUrl(s.href))}" rel="noopener">${escapeHtml(s.label)}</a>`)
    .join('');
  return `<div class="card">
        ${avatar}
        <p class="name">${escapeHtml(m.name)}</p>
        ${m.role ? `<p class="role">${escapeHtml(m.role)}</p>` : ''}
        ${m.bio ? `<p class="bio">${escapeHtml(m.bio)}</p>` : ''}
        ${socials ? `<div class="socials">${socials}</div>` : ''}
      </div>`;
}

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const subtitle = config.subtitle as string;
  const columns = config.columns as number;
  const members = ((config.members as Member[]) ?? []).map(card).filter(Boolean);
  const head = (title || subtitle)
    ? `<div class="head">${title ? `<h2>${escapeHtml(title)}</h2>` : ''}${subtitle ? `<p class="sub">${escapeHtml(subtitle)}</p>` : ''}</div>`
    : '';

  return `<section class="blk-team" aria-label="${escapeAttr(title || 'Team')}">
  <div class="wrap">
    ${head}
    <div class="grid" style="--cols:${columns}">
      ${members.join('\n      ')}
    </div>
  </div>
</section>`;
}

export const team: BlockSpec = {
  type: 'team',
  description: 'A grid of people cards with photo (or initials), name, role, a short bio, and optional social links.',
  schema,
  css,
  render,
};
