/**
 * `map` — a location map embedded from a place query. The query is URL-encoded
 * into a standard maps embed; no raw URL is interpolated. Static brick (embed).
 */
import { escapeAttr, escapeHtml, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  query: { kind: 'string', required: true, default: '', max: 200 },
  zoom: { kind: 'int', min: 1, max: 20, default: 14 },
  height: { kind: 'int', min: 160, max: 800, default: 360 },
  label: { kind: 'string', default: '', max: 120 },
};

const css = `
.blk-map{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-map .wrap{max-width:1000px;margin:0 auto}
.blk-map .frame{border-radius:var(--radius);overflow:hidden;background:var(--surface)}
.blk-map iframe{display:block;width:100%;border:0}
.blk-map .more{display:inline-block;margin:.6em 0 0;color:var(--primary);font-weight:600;font-size:var(--fs-base);text-decoration:none}
.blk-map .more:hover,.blk-map .more:focus-visible{text-decoration:underline}
`.trim();

function render(config: Record<string, unknown>): string {
  const query = String(config.query ?? '');
  const zoom = Number.isInteger(config.zoom) ? (config.zoom as number) : 14;
  const height = Number.isInteger(config.height) ? (config.height as number) : 360;
  const label = (config.label as string) || query;
  const enc = encodeURIComponent(query);
  const embed = query ? `https://maps.google.com/maps?q=${enc}&z=${zoom}&output=embed` : '';
  const link = `https://maps.google.com/maps?q=${enc}`;

  return `<section class="blk-map" aria-label="${escapeAttr(label || 'Map')}">
  <div class="wrap">
    <div class="frame">
      ${embed ? `<iframe src="${escapeAttr(embed)}" title="${escapeAttr(label || 'Map')}" height="${height}" loading="lazy"></iframe>` : ''}
    </div>
    ${query ? `<a class="more" href="${escapeAttr(link)}" rel="noopener" target="_blank">View larger map</a>` : ''}
  </div>
</section>`;
}

export const map: BlockSpec = {
  type: 'map',
  description: 'An embedded location map for a place or address query, with configurable zoom and height and a link to the full map.',
  schema,
  css,
  render,
};
