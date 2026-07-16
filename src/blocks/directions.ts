/**
 * `directions` — a location card with **deep links that open the visitor's map
 * app for directions**. Unlike `map` (an inline embed), this is lightweight and
 * link-based: give it an address, GPS coordinates, and/or a pasted map link, and
 * it builds cross-platform "Get directions" links.
 *
 * - Google Maps universal URL (`.../maps/dir/?api=1&destination=…`) opens the
 *   Google Maps app on iOS/Android when installed, else the web.
 * - An optional Apple Maps link (`maps.apple.com/?daddr=…`) for iOS users.
 * - GPS coordinates, when valid, are used as a precise destination.
 *
 * Static brick — no runtime, no JS. Links are built with `encodeURIComponent`;
 * a pasted `mapUrl` is scheme-sanitized.
 */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const PIN =
  '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11z"></path><circle cx="12" cy="10" r="2.5"></circle></svg>';

const schema: Schema = {
  title: { kind: 'string', default: '', max: 120 },
  place: { kind: 'string', default: '', max: 120 },   // name of the location
  address: { kind: 'string', default: '', max: 240 }, // shown + query fallback
  lat: { kind: 'string', default: '', max: 24 },      // GPS latitude  (e.g. 38.7223)
  lng: { kind: 'string', default: '', max: 24 },      // GPS longitude (e.g. -9.1393)
  mapUrl: { kind: 'string', default: '', max: 500 },  // a pasted Google/other map link
  directionsLabel: { kind: 'string', default: 'Get directions', max: 40 },
  appleMaps: { kind: 'boolean', default: true },      // also offer an Apple Maps link
};

const css = `
.blk-directions{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-directions .wrap{max-width:640px;margin:0 auto}
.blk-directions h2{font-size:var(--fs-xl);margin:0 0 var(--space);font-weight:800;text-align:center}
.blk-directions .card{display:flex;gap:1em;align-items:flex-start;background:var(--surface);border:1px solid color-mix(in srgb,var(--text) 12%,transparent);border-radius:var(--radius);padding:calc(var(--space)*1.2)}
.blk-directions .pin{flex:0 0 auto;display:inline-flex;color:var(--primary);line-height:0;padding-top:.15em}
.blk-directions .info{flex:1;min-width:0}
.blk-directions .place{margin:0;font-weight:700;font-size:var(--fs-lg)}
.blk-directions .addr{margin:.25em 0 0;color:var(--muted)}
.blk-directions .coords{margin:.25em 0 0;color:var(--muted);font-size:var(--fs-base);font-variant-numeric:tabular-nums}
.blk-directions .actions{display:flex;flex-wrap:wrap;gap:.5em;margin-top:calc(var(--space)*.9)}
.blk-directions .btn{display:inline-flex;align-items:center;gap:.4em;text-decoration:none;font-weight:600;font-size:var(--fs-base);padding:.55em 1em;border-radius:var(--radius);border:1px solid var(--primary);color:var(--primary);transition:opacity var(--motion),background var(--motion)}
.blk-directions .btn.primary{background:var(--primary);color:var(--on-primary);border-color:var(--primary)}
.blk-directions .btn:hover{opacity:.9}
@media(max-width:440px){.blk-directions .card{flex-direction:column}.blk-directions .actions .btn{flex:1;justify-content:center}}
`.trim();

/** Parse a coordinate string to a valid lat/lng pair, or null. */
function coords(latRaw: unknown, lngRaw: unknown): { lat: number; lng: number } | null {
  const latStr = String(latRaw ?? '').trim();
  const lngStr = String(lngRaw ?? '').trim();
  if (!latStr || !lngStr) return null; // empty → not set (Number('') is 0, so guard first)
  const lat = Number(latStr);
  const lng = Number(lngStr);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const place = config.place as string;
  const address = config.address as string;
  const gps = coords(config.lat, config.lng);
  const mapUrl = sanitizeUrl(config.mapUrl);
  const hasMapUrl = mapUrl !== '#' && !!(config.mapUrl as string);
  const directionsLabel = (config.directionsLabel as string) || 'Get directions';
  const appleMaps = config.appleMaps !== false;

  // Precise coords win as the destination; else the address; else the place name.
  const dest = gps ? `${gps.lat},${gps.lng}` : (address || place);
  const enc = dest ? encodeURIComponent(dest) : '';
  const gDir = enc ? `https://www.google.com/maps/dir/?api=1&destination=${enc}` : '';
  const aDir = enc ? `https://maps.apple.com/?daddr=${enc}` : '';

  const btn = (href: string, label: string, primary = false) =>
    `<a class="btn${primary ? ' primary' : ''}" href="${escapeAttr(href)}" target="_blank" rel="noopener">${escapeHtml(label)}</a>`;

  const actions = [
    gDir && btn(gDir, directionsLabel, true),
    appleMaps && aDir && btn(aDir, 'Apple Maps'),
    hasMapUrl && btn(mapUrl, 'Open map'),
  ].filter(Boolean).join('\n          ');

  return `<section class="blk-directions" aria-label="${escapeAttr(title || place || 'Directions')}">
  <div class="wrap">
    ${title ? `<h2>${escapeHtml(title)}</h2>` : ''}
    <div class="card">
      <span class="pin" aria-hidden="true">${PIN}</span>
      <div class="info">
        ${place ? `<p class="place">${escapeHtml(place)}</p>` : ''}
        ${address ? `<p class="addr">${escapeHtml(address)}</p>` : ''}
        ${gps ? `<p class="coords">${escapeHtml(`${gps.lat}, ${gps.lng}`)}</p>` : ''}
        ${actions ? `<div class="actions">\n          ${actions}\n        </div>` : ''}
      </div>
    </div>
  </div>
</section>`;
}

export const directions: BlockSpec = {
  type: 'directions',
  description: 'A location card with deep links that open the visitor’s map app (Google/Apple Maps) for directions, from an address, GPS coordinates, or a pasted map link.',
  schema,
  css,
  render,
};
