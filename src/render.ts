/**
 * The renderer — a *total* function: manifest → one self-contained static HTML
 * document. It never throws. Unknown block types are skipped; missing config
 * fields are defaulted by each brick's schema; only the CSS of bricks actually
 * used is included. This is the second "wall" (the first being schema
 * validation): together they make a broken page structurally impossible.
 *
 * Powered bricks (forms, auth, search) receive a `RuntimeAdapter` via the render
 * options and speak the §6 contract; with the default no-op runtime they render
 * inert-but-valid. PWA/SEO head tags are emitted only when the manifest opts in.
 */
import { escapeAttr, escapeHtml, parse, sanitizeUrl } from './schema.js';
import { getSpec, needsIsland, REGISTRY, type RenderContext } from './registry.js';
import { normalizeTokens, sectionOverrideCss, tokensToCss } from './tokens.js';
import { NOOP_RUNTIME, type RuntimeAdapter } from './runtime.js';
import { buildAnchors, injectAnchorId, type Anchors } from './anchors.js';
import type { Block, SiteManifest } from './types.js';

export interface RenderOptions {
  /** Host runtime for powered bricks (§6). Defaults to the inert no-op adapter. */
  runtime?: RuntimeAdapter;
  /**
   * URL prefix where the host serves island scripts (from the package's
   * `./islands/*.js` subpath). Defaults to `/_island`, so a `lightbox` island is
   * emitted as `<script src="/_island/lightbox.js">`.
   */
  islandBase?: string;
}

const RESET_CSS = `
*,*::before,*::after{box-sizing:border-box}
body{margin:0;font-family:var(--font);font-size:var(--fs-base);color:var(--text);background:var(--bg);line-height:1.5;-webkit-font-smoothing:antialiased}
img{max-width:100%}
.blk-scope{display:block}
@media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
`.trim().replace(/\n/g, '');

// Print styles — makes any page (especially a résumé) export cleanly to PDF via
// the browser's print dialog: keep colours, hide `data-wl-noprint` controls,
// un-stick fixed chrome, and avoid splitting entries across pages.
const PRINT_CSS = `@media print{*{-webkit-print-color-adjust:exact;print-color-adjust:exact}[data-wl-noprint]{display:none!important}.blk-nav,.blk-app-shell,.blk-announcement-bar,.blk-sidebar{position:static!important}.blk-profile-header,.blk-experience .entry,.blk-skills .group,.blk-timeline li{break-inside:avoid}a[href]{text-decoration:none}@page{margin:1.4cm}}`;

/** Render one block: normalize its config, then hand markup to the brick. */
function renderBlock(block: Block, manifest: SiteManifest, runtime: RuntimeAdapter, anchors: Anchors): string {
  const spec = getSpec(block.type);
  if (!spec) return ''; // unknown type → skip (closed vocabulary; total)
  const { value } = parse(spec.schema, block.config ?? {});
  const tokens = normalizeTokens(manifest.design);
  const ctx: RenderContext = { id: block.id, runtime, resolveLink: anchors.resolve };
  let html = spec.render(value, tokens, ctx);
  // In-page anchor: emit a stable id on the section so nav links can scroll to it.
  const anchorId = anchors.idFor.get(block.id);
  if (anchorId) html = injectAnchorId(html, anchorId);
  // Opt-in per-section overrides: scope palette/radius/spacing as inherited CSS
  // vars on a wrapper (escaped for the style attribute).
  const style = sectionOverrideCss(block.overrides);
  if (style) html = `<div class="blk-scope" style="${escapeAttr(style)}">\n${html}\n</div>`;
  return html;
}

/** The full document. */
export function renderSite(manifest: SiteManifest, options: RenderOptions = {}): string {
  const runtime = options.runtime ?? NOOP_RUNTIME;
  const tokens = normalizeTokens(manifest?.design);
  const meta = manifest?.meta ?? { title: '', description: '', lang: '' };
  const blocks = (manifest?.blocks ?? []).filter((b) => b && b.visible !== false && getSpec(b.type));

  // Collect each used brick's CSS once, in registration order (stable output).
  const usedTypes = new Set(blocks.map((b) => b.type));
  const blockCss = [...REGISTRY.values()]
    .filter((s) => usedTypes.has(s.type) && s.css)
    .map((s) => s.css)
    .join('\n');

  const anchors = buildAnchors(blocks);
  const body = blocks.map((b) => renderBlock(b, manifest, runtime, anchors)).filter(Boolean).join('\n');

  // Islands to hydrate. Static-only pages emit none.
  const islands = new Set<string>();
  for (const b of blocks) {
    const spec = getSpec(b.type)!;
    const { value } = parse(spec.schema, b.config ?? {});
    if (needsIsland(spec, value)) islands.add(spec.island!);
  }
  const islandBase = (options.islandBase ?? '/_island').replace(/\/+$/, '');
  const islandTags = [...islands]
    .map((name) => `<script type="module" src="${escapeAttr(islandBase)}/${escapeAttr(name)}.js" data-island="${escapeAttr(name)}"></script>`)
    .join('\n');

  return `<!doctype html>
<html lang="${escapeAttr(meta.lang || 'en')}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(meta.title || 'Untitled site')}</title>${meta.description ? `\n<meta name="description" content="${escapeAttr(meta.description)}">` : ''}${headExtras(manifest, tokens.palette.primary)}
<style>${tokensToCss(tokens)}\n${RESET_CSS}\n${blockCss}\n${PRINT_CSS}</style>
</head>
<body>
${body}${islandTags ? '\n' + islandTags : ''}
</body>
</html>`;
}

/** A browser-tab favicon link from meta.favicon (emoji → data URI, else a URL). */
function faviconTag(fav: string | undefined): string {
  const s = String(fav ?? '').trim();
  if (!s) return '';
  // A short glyph with no scheme/slash/dot → treat as an emoji favicon.
  if ([...s].length <= 2 && !/[/:.]/.test(s)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${escapeHtml(s)}</text></svg>`;
    return `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(svg)}">`;
  }
  const url = sanitizeUrl(s);
  return url === '#' ? '' : `<link rel="icon" href="${escapeAttr(url)}">`;
}

/** SEO + PWA <head> tags, emitted only when the manifest opts in. */
function headExtras(manifest: SiteManifest | undefined, primary: string): string {
  const out: string[] = [];
  const seo = manifest?.seo;
  const pwa = manifest?.pwa;
  const title = manifest?.meta?.title ?? '';
  const desc = manifest?.meta?.description ?? '';

  const favicon = faviconTag(manifest?.meta?.favicon);
  if (favicon) out.push(favicon);

  if (seo) {
    if (seo.canonical) out.push(`<link rel="canonical" href="${escapeAttr(seo.canonical)}">`);
    if (seo.noindex) out.push('<meta name="robots" content="noindex">');
    out.push(`<meta property="og:title" content="${escapeAttr(seo.ogTitle || title)}">`);
    if (seo.ogDescription || desc) out.push(`<meta property="og:description" content="${escapeAttr(seo.ogDescription || desc)}">`);
    if (seo.ogImage) out.push(`<meta property="og:image" content="${escapeAttr(seo.ogImage)}">`);
    out.push(`<meta name="twitter:card" content="${escapeAttr(seo.twitterCard || 'summary_large_image')}">`);
  }

  if (pwa) {
    out.push('<link rel="manifest" href="/manifest.webmanifest">');
    out.push(`<meta name="theme-color" content="${escapeAttr(pwa.themeColor || primary)}">`);
    out.push('<meta name="mobile-web-app-capable" content="yes">');
    out.push('<meta name="apple-mobile-web-app-capable" content="yes">');
    if (pwa.offline !== false) {
      out.push(`<script>if('serviceWorker'in navigator){addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}</script>`);
    }
  }

  return out.length ? '\n' + out.join('\n') : '';
}
