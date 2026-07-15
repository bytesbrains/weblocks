/**
 * The renderer — a *total* function: manifest → one self-contained static HTML
 * document. It never throws. Unknown block types are skipped; missing config
 * fields are defaulted by each brick's schema; only the CSS of bricks actually
 * used is included. This is the second "wall" (the first being schema
 * validation): together they make a broken page structurally impossible.
 */
import { escapeAttr, escapeHtml, parse } from './schema.js';
import { getSpec, needsIsland, REGISTRY } from './registry.js';
import { normalizeTokens, tokensToCss } from './tokens.js';
import type { Block, SiteManifest } from './types.js';

const RESET_CSS = `
*,*::before,*::after{box-sizing:border-box}
body{margin:0;font-family:var(--font);font-size:var(--fs-base);color:var(--text);background:var(--bg);line-height:1.5;-webkit-font-smoothing:antialiased}
img{max-width:100%}
@media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
`.trim().replace(/\n/g, '');

/** Render one block: normalize its config, then hand markup to the brick. */
function renderBlock(block: Block, manifest: SiteManifest): string {
  const spec = getSpec(block.type);
  if (!spec) return ''; // unknown type → skip (closed vocabulary; total)
  const { value } = parse(spec.schema, block.config ?? {});
  const tokens = normalizeTokens(manifest.design);
  return spec.render(value, tokens);
}

/** The full document. */
export function renderSite(manifest: SiteManifest): string {
  const tokens = normalizeTokens(manifest?.design);
  const meta = manifest?.meta ?? { title: '', description: '', lang: '' };
  const blocks = (manifest?.blocks ?? []).filter((b) => b && b.visible !== false && getSpec(b.type));

  // Collect each used brick's CSS once, in registration order (stable output).
  const usedTypes = new Set(blocks.map((b) => b.type));
  const blockCss = [...REGISTRY.values()]
    .filter((s) => usedTypes.has(s.type) && s.css)
    .map((s) => s.css)
    .join('\n');

  const body = blocks.map((b) => renderBlock(b, manifest)).filter(Boolean).join('\n');

  // Islands to hydrate (skeleton emits markers; the actual scripts land with
  // the dynamic-runtime phase). Static-only pages emit none.
  const islands = new Set<string>();
  for (const b of blocks) {
    const spec = getSpec(b.type)!;
    const { value } = parse(spec.schema, b.config ?? {});
    if (needsIsland(spec, value)) islands.add(spec.island!);
  }
  const islandTags = [...islands]
    .map((name) => `<script type="module" src="/_island/${escapeAttr(name)}.js" data-island="${escapeAttr(name)}"></script>`)
    .join('\n');

  return `<!doctype html>
<html lang="${escapeAttr(meta.lang || 'en')}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(meta.title || 'Untitled site')}</title>${meta.description ? `\n<meta name="description" content="${escapeAttr(meta.description)}">` : ''}
<style>${tokensToCss(tokens)}\n${RESET_CSS}\n${blockCss}</style>
</head>
<body>
${body}${islandTags ? '\n' + islandTags : ''}
</body>
</html>`;
}
