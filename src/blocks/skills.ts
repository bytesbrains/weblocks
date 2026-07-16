/**
 * `skills` — grouped skills shown as **tags** (chips, with optional proficiency
 * dots) or **bars** (labelled level bars). Doubles for Languages, Tools, etc.
 * Static brick.
 */
import { escapeAttr, escapeHtml, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  title: { kind: 'string', default: 'Skills', max: 120 },
  display: { kind: 'enum', values: ['tags', 'bars'], default: 'tags' },
  groups: {
    kind: 'array', max: 10,
    of: {
      kind: 'object',
      fields: {
        name: { kind: 'string', default: '', max: 60 }, // e.g. "Languages"
        items: {
          kind: 'array', max: 40,
          of: {
            kind: 'object',
            fields: {
              label: { kind: 'string', required: true, default: '', max: 60 },
              level: { kind: 'int', min: 0, max: 5, default: 0 }, // 0 = unrated
            },
          },
        },
      },
    },
  },
};

const css = `
.blk-skills{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-skills .wrap{max-width:820px;margin:0 auto}
.blk-skills h2{font-size:var(--fs-xl);margin:0 0 var(--space);font-weight:800}
.blk-skills .group{margin-bottom:calc(var(--space)*1.1)}
.blk-skills .group:last-child{margin-bottom:0}
.blk-skills .gname{font-weight:700;font-size:var(--fs-base);margin:0 0 .5em;color:var(--muted);text-transform:uppercase;letter-spacing:.04em}
.blk-skills .tags{display:flex;flex-wrap:wrap;gap:.5em}
.blk-skills .tag{display:inline-flex;align-items:center;gap:.5em;padding:.4em .8em;border-radius:999px;background:var(--surface);border:1px solid color-mix(in srgb,var(--text) 14%,transparent);font-size:var(--fs-base);font-weight:600}
.blk-skills .dots{display:inline-flex;gap:2px}
.blk-skills .dots i{width:6px;height:6px;border-radius:999px;background:color-mix(in srgb,var(--text) 25%,transparent)}
.blk-skills .dots i.on{background:var(--primary)}
.blk-skills .bars{display:grid;gap:.6em}
.blk-skills .bar{display:grid;grid-template-columns:minmax(90px,180px) 1fr;gap:.8em;align-items:center}
.blk-skills .bar .blabel{font-weight:600;font-size:var(--fs-base)}
.blk-skills .track{height:8px;border-radius:999px;background:color-mix(in srgb,var(--text) 12%,transparent);overflow:hidden}
.blk-skills .fill{height:100%;background:var(--primary);border-radius:999px}
@media(max-width:480px){.blk-skills .bar{grid-template-columns:1fr}}
`.trim();

interface Skill { label: string; level: number }
interface Group { name: string; items: Skill[] }

function dots(level: number): string {
  const n = Math.max(0, Math.min(5, level | 0));
  if (!n) return '';
  return `<span class="dots" aria-hidden="true">${Array.from({ length: 5 }, (_v, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</span>`;
}

function group(g: Group, display: string): string {
  const items = (g.items ?? []).filter((s) => s && s.label);
  if (!items.length) return '';
  let body: string;
  if (display === 'bars') {
    body = `<div class="bars">${items.map((s) => {
      const pct = Math.max(0, Math.min(5, s.level | 0)) * 20;
      return `<div class="bar"><span class="blabel">${escapeHtml(s.label)}</span><span class="track"><span class="fill" style="width:${pct}%"></span></span></div>`;
    }).join('')}</div>`;
  } else {
    body = `<div class="tags">${items.map((s) => `<span class="tag">${escapeHtml(s.label)}${dots(s.level)}</span>`).join('')}</div>`;
  }
  return `<div class="group">
      ${g.name ? `<p class="gname">${escapeHtml(g.name)}</p>` : ''}
      ${body}
    </div>`;
}

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const display = config.display === 'bars' ? 'bars' : 'tags';
  const groups = ((config.groups as Group[]) ?? []).map((g) => group(g, display)).filter(Boolean);
  return `<section class="blk-skills" aria-label="${escapeAttr(title || 'Skills')}">
  <div class="wrap">
    ${title ? `<h2>${escapeHtml(title)}</h2>` : ''}
    ${groups.join('\n    ')}
  </div>
</section>`;
}

export const skills: BlockSpec = {
  type: 'skills',
  description: 'Grouped skills shown as tags (with optional proficiency dots) or labelled level bars; also for languages and tools.',
  schema,
  css,
  render,
};
