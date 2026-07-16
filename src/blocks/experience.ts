/**
 * `experience` — a résumé section of dated, structured entries: role, org,
 * period, location, an optional summary, and achievement bullets. One block for
 * the whole family: set its `title` to "Experience", "Education",
 * "Certifications", "Volunteering", etc. Print-friendly (entries avoid page
 * breaks). Static brick.
 */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  title: { kind: 'string', default: 'Experience', max: 120 },
  items: {
    kind: 'array', max: 24,
    of: {
      kind: 'object',
      fields: {
        role: { kind: 'string', required: true, default: '', max: 120 },  // role / degree / title
        org: { kind: 'string', default: '', max: 120 },                   // company / school
        period: { kind: 'string', default: '', max: 60 },                 // e.g. "2021 – Present"
        location: { kind: 'string', default: '', max: 80 },
        url: { kind: 'string', default: '', max: 500 },                   // org link
        summary: { kind: 'string', default: '', max: 300 },
        bullets: { kind: 'array', max: 12, of: { kind: 'string', default: '', max: 300 } },
      },
    },
  },
};

const css = `
.blk-experience{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-experience .wrap{max-width:820px;margin:0 auto}
.blk-experience h2{font-size:var(--fs-xl);margin:0 0 var(--space);font-weight:800}
.blk-experience .entry{padding:0 0 calc(var(--space)*1.3);margin-bottom:calc(var(--space)*1.3);border-bottom:1px solid color-mix(in srgb,var(--text) 10%,transparent)}
.blk-experience .entry:last-child{border-bottom:0;margin-bottom:0}
.blk-experience .top{display:flex;justify-content:space-between;gap:1em;flex-wrap:wrap;align-items:baseline}
.blk-experience .role{font-weight:700;font-size:var(--fs-lg)}
.blk-experience .org{color:var(--primary);font-weight:600}
.blk-experience .org a{color:inherit;text-decoration:none}
.blk-experience .org a:hover{text-decoration:underline}
.blk-experience .period{color:var(--muted);font-size:var(--fs-base);font-variant-numeric:tabular-nums;white-space:nowrap}
.blk-experience .loc{color:var(--muted);font-size:var(--fs-base);margin:.1em 0 0}
.blk-experience .summary{margin:.5em 0 0;color:var(--muted)}
.blk-experience ul{margin:.5em 0 0;padding-left:1.3em}
.blk-experience li{margin:.25em 0;line-height:1.5}
`.trim();

interface Item { role: string; org: string; period: string; location: string; url: string; summary: string; bullets: string[] }

function entry(it: Item): string {
  if (!it.role) return '';
  const url = sanitizeUrl(it.url);
  const org = it.org
    ? `<span class="org">${(url !== '#' && it.url) ? `<a href="${escapeAttr(url)}" rel="noopener">${escapeHtml(it.org)}</a>` : escapeHtml(it.org)}</span>`
    : '';
  const bullets = (it.bullets ?? []).filter(Boolean).map((b) => `<li>${escapeHtml(b)}</li>`).join('');
  return `<div class="entry">
      <div class="top">
        <div><span class="role">${escapeHtml(it.role)}</span>${org ? ` · ${org}` : ''}</div>
        ${it.period ? `<span class="period">${escapeHtml(it.period)}</span>` : ''}
      </div>
      ${it.location ? `<p class="loc">${escapeHtml(it.location)}</p>` : ''}
      ${it.summary ? `<p class="summary">${escapeHtml(it.summary)}</p>` : ''}
      ${bullets ? `<ul>${bullets}</ul>` : ''}
    </div>`;
}

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const items = ((config.items as Item[]) ?? []).map(entry).filter(Boolean);
  return `<section class="blk-experience" aria-label="${escapeAttr(title || 'Experience')}">
  <div class="wrap">
    ${title ? `<h2>${escapeHtml(title)}</h2>` : ''}
    ${items.join('\n    ')}
  </div>
</section>`;
}

export const experience: BlockSpec = {
  type: 'experience',
  description: 'A résumé section of dated entries (role, org, period, location, bullets). Reuse for Experience, Education, Certifications by changing the title.',
  schema,
  css,
  render,
};
