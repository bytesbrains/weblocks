/**
 * Builds the **published demo site** (`site/`) that GitHub Pages serves:
 *
 *   /                  landing — what weblocks is, and the two galleries
 *   /blocks/           the wall — every registered brick, rendered live
 *   /blocks/<type>.html  one brick, full page, its own real document
 *   /templates/        the starter gallery (index + one page per template)
 *   /_island/*.js      island modules, so interactivity actually runs
 *
 * Every preview is a genuine `renderSite` output, not a screenshot or a mock —
 * the wall embeds each brick's own page in a same-origin iframe, which keeps
 * fixed/sticky chrome (nav, app-shell, sidebar) from fighting over one viewport
 * and gives each brick honest CSS isolation.
 *
 * Islands are emitted as `<script src="{islandBase}/{name}.js">`, so the build
 * passes a *relative* `islandBase` and copies `lib/islands/*.js` alongside. That
 * makes the output work both under a project path (`/weblocks/`) and opened
 * straight off disk.
 *
 * Run: `npm run site`, then open `site/index.html`.
 */
import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { renderSite } from './render.js';
import { validateManifest } from './validate.js';
import { TEMPLATES } from './templates.js';
import { escapeAttr, escapeHtml } from './schema.js';
import { showcaseBlocks, showcaseManifest } from './showcase.js';
import { DEFAULT_TOKENS } from './tokens.js';
import type { SiteManifest } from './types.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'site');
mkdirSync(join(out, 'blocks'), { recursive: true });
mkdirSync(join(out, 'templates'), { recursive: true });

// Island modules — the engine-shipped ones only; powered bricks' islands are
// host-served by design, so those stay inert here (see registry.needsIsland).
cpSync(join(root, 'lib', 'islands'), join(out, '_island'), {
  recursive: true,
  filter: (src) => !src.endsWith('.d.ts'), // runtime only — no types on a web host
});

/**
 * Shared chrome for the index pages — deliberately plain, so the bricks are the
 * subject. `home` is relative because the landing page sits one level above the
 * two galleries.
 */
const shell = (title: string, body: string, extraCss = '', home = '../index.html'): string =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
:root{color-scheme:light dark;--fg:#111;--muted:#666;--line:#e5e5e5;--bg:#fff;--accent:#1668b0}
@media(prefers-color-scheme:dark){:root{--fg:#e8e8e8;--muted:#9a9a9a;--line:#2a2a2a;--bg:#121212;--accent:#6fb3f0}}
*,*::before,*::after{box-sizing:border-box}
body{margin:0;font:16px/1.6 system-ui,-apple-system,sans-serif;color:var(--fg);background:var(--bg)}
.wrap{max-width:1100px;margin:0 auto;padding:0 1.2rem}
header.top{border-bottom:1px solid var(--line);padding:1.6rem 0}
header.top a.home{font-weight:700;text-decoration:none;color:var(--fg)}
h1{font-size:1.7rem;margin:2rem 0 .4rem}
p.lede{color:var(--muted);margin:0 0 2rem;max-width:62ch}
a{color:var(--accent)}
footer{border-top:1px solid var(--line);margin-top:3rem;padding:1.6rem 0;color:var(--muted);font-size:.9rem}
code{font:.9em ui-monospace,SFMono-Regular,Menlo,monospace;background:color-mix(in srgb,var(--fg) 8%,transparent);padding:.1em .35em;border-radius:4px}
${extraCss}
</style></head><body>
<header class="top"><div class="wrap"><a class="home" href="${escapeAttr(home)}">weblocks</a></div></header>
<main class="wrap">${body}</main>
<footer class="wrap">Every preview on this page is real <code>renderSite</code> output, generated from
<code>src/showcase.ts</code> and <code>src/templates.ts</code> on each deploy.
· <a href="https://github.com/bytesbrains/weblocks">GitHub</a></footer>
</body></html>`;

// ── the wall ─────────────────────────────────────────────────────────────────
const entries = showcaseBlocks();
let blockFailures = 0;

const cards = entries.map((e) => {
  const manifest = showcaseManifest(e, DEFAULT_TOKENS) as unknown as SiteManifest;
  const v = validateManifest(manifest);
  if (!v.ok) { blockFailures++; console.error(`✗ ${e.type}: ${JSON.stringify(v.errors)}`); }
  const html = renderSite(manifest, { islandBase: '../_island' });
  const file = `${e.type}.html`;
  writeFileSync(join(out, 'blocks', file), html, 'utf8');
  console.log(`${v.ok ? '✓' : '✗'} ${e.type.padEnd(20)} ${e.source.padEnd(10)} ${(e.island ?? '—').padEnd(18)} [${html.length} bytes]`);

  const tags = [
    e.island ? `<span class="tag js">island: ${escapeHtml(e.island)}</span>` : '<span class="tag">no JS</span>',
    e.powered ? '<span class="tag pw">needs host runtime</span>' : '',
  ].join('');
  return `<article class="card" id="${escapeAttr(e.type)}">
  <div class="meta">
    <h2><a href="./${escapeAttr(file)}"><code>${escapeHtml(e.type)}</code></a></h2>
    <p>${escapeHtml(e.description)}</p>
    <div class="tags">${tags}</div>
  </div>
  <iframe src="./${escapeAttr(file)}" title="${escapeAttr(e.type)} preview" loading="lazy" scrolling="no"></iframe>
  <a class="open" href="./${escapeAttr(file)}" target="_blank" rel="noopener">Open full page ↗</a>
</article>`;
}).join('\n');

const wallCss = `
.card{border:1px solid var(--line);border-radius:10px;overflow:hidden;margin:0 0 2.4rem}
.card .meta{padding:1rem 1.1rem .9rem;border-bottom:1px solid var(--line)}
.card h2{font-size:1.05rem;margin:0 0 .3rem}
.card h2 a{text-decoration:none}
.card p{margin:0;color:var(--muted);font-size:.92rem;max-width:78ch}
.tags{margin-top:.6rem;display:flex;gap:.4rem;flex-wrap:wrap}
.tag{font-size:.74rem;letter-spacing:.02em;text-transform:uppercase;border:1px solid var(--line);color:var(--muted);border-radius:999px;padding:.15em .6em}
.tag.js{border-color:#3a7;color:#3a7}
.tag.pw{border-color:#b80;color:#b80}
.card iframe{display:block;width:100%;height:420px;border:0;background:#fff}
.card .open{display:block;padding:.6rem 1.1rem;font-size:.85rem;border-top:1px solid var(--line);text-decoration:none}
.toc{display:flex;flex-wrap:wrap;gap:.35rem;margin:0 0 2.5rem;padding:0;list-style:none}
.toc a{font:.82rem ui-monospace,Menlo,monospace;text-decoration:none;border:1px solid var(--line);border-radius:6px;padding:.2em .5em}
`;

const toc = entries.map((e) => `<li><a href="#${escapeAttr(e.type)}">${escapeHtml(e.type)}</a></li>`).join('');

// Same-origin, so the wall can size each frame to its content instead of
// guessing — with a cap, since full-page bricks (app-shell) are tall by design.
const resizer = `<script>
addEventListener('load',function(){
  document.querySelectorAll('iframe').forEach(function(f){
    var fit=function(){try{
      var h=f.contentDocument.body.scrollHeight;
      if(h>40)f.style.height=Math.min(h,900)+'px';
    }catch(e){}};
    f.addEventListener('load',fit);fit();
  });
});
</script>`;

writeFileSync(
  join(out, 'blocks', 'index.html'),
  shell(
    `weblocks — all ${entries.length} blocks`,
    `<h1>The block wall</h1>
<p class="lede">Every one of the ${entries.length} bricks in the registry, rendered live. Each frame below is
that brick's own page — open any of them to see the complete, self-contained document weblocks emits.</p>
<ul class="toc">${toc}</ul>
${cards}`,
    wallCss,
  ).replace('</body>', `${resizer}</body>`),
  'utf8',
);

// ── the starter gallery ──────────────────────────────────────────────────────
let templateFailures = 0;
const rows = Object.values(TEMPLATES).map((t) => {
  const v = validateManifest(t.manifest);
  if (!v.ok) { templateFailures++; console.error(`✗ ${t.id}: ${JSON.stringify(v.errors)}`); }
  const file = `${t.id}.html`;
  writeFileSync(join(out, 'templates', file), renderSite(t.manifest, { islandBase: '../_island' }), 'utf8');
  return `<li><a href="./${escapeAttr(file)}">${escapeHtml(t.label)}</a>
    <small>${escapeHtml(t.id)} · ${escapeHtml(t.vertical)}${v.ok ? '' : ' · INVALID'}</small></li>`;
}).join('\n');

writeFileSync(
  join(out, 'templates', 'index.html'),
  shell(
    'weblocks — starter templates',
    `<h1>Starter templates</h1>
<p class="lede">One complete starter per business vertical. Each is a validated <code>SiteManifest</code>
rendered to a self-contained document — the same output a host gets with zero LLM calls.</p>
<ul class="list">${rows}</ul>`,
    '.list{list-style:none;padding:0}.list li{padding:.7rem 0;border-bottom:1px solid var(--line)}.list small{color:var(--muted);margin-left:.5rem}',
  ),
  'utf8',
);

// ── landing ──────────────────────────────────────────────────────────────────
writeFileSync(
  join(out, 'index.html'),
  shell(
    'weblocks — live block gallery',
    `<h1>weblocks</h1>
<p class="lede">A block engine for AI-composable web apps. An AI composes a <code>SiteManifest</code> from a
fixed catalog; the engine validates it and renders static HTML. These pages are that renderer's real
output, rebuilt from source on every push.</p>
<div class="cards">
  <a class="big" href="./blocks/index.html"><strong>The block wall →</strong>
    <span>All ${entries.length} bricks, rendered live, with the island each one hydrates with.</span></a>
  <a class="big" href="./templates/index.html"><strong>Starter templates →</strong>
    <span>${Object.keys(TEMPLATES).length} complete starter sites, one per vertical.</span></a>
</div>`,
    '.cards{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));margin-bottom:2rem}' +
    '.big{display:block;border:1px solid var(--line);border-radius:10px;padding:1.2rem;text-decoration:none;color:var(--fg)}' +
    '.big:hover{border-color:var(--accent)}.big span{display:block;color:var(--muted);font-size:.92rem;margin-top:.35rem}',
    './index.html',
  ),
  'utf8',
);

console.log(`\nWrote ${entries.length} blocks + ${Object.keys(TEMPLATES).length} templates → ${out}`);
console.log(`Open ${join(out, 'index.html')}`);
if (blockFailures || templateFailures) {
  console.error(`\n${blockFailures} block(s) and ${templateFailures} template(s) failed validation.`);
  process.exit(1);
}
