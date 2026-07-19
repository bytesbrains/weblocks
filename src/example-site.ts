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
import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { renderSite } from './render.js';
import { validateManifest } from './validate.js';
import { TEMPLATES } from './templates.js';
import { escapeAttr, escapeHtml } from './schema.js';
import { showcaseBlocks, showcaseManifest } from './showcase.js';
import { catalog, catalogPrompt } from './catalog.js';
import { DEFAULT_TOKENS } from './tokens.js';
import type { SiteManifest } from './types.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'site');
mkdirSync(join(out, 'blocks'), { recursive: true });
mkdirSync(join(out, 'templates'), { recursive: true });

// Brand assets — logo, header mark, favicon.
cpSync(join(root, 'assets'), join(out, 'assets'), { recursive: true });

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
const shell = (title: string, body: string, extraCss = '', home = '../index.html'): string => {
  const up = home.startsWith('./') ? '.' : '..';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<link rel="icon" type="image/png" href="${up}/assets/favicon.png">
<style>
/* Themed with the engine's own DEFAULT_TOKENS (and its dark fallback) — the
   showcase runs on the same palette it ships. See src/tokens.ts. */
:root{color-scheme:light dark;--bg:#f7f4ee;--surface:#fff;--fg:#2a2622;--muted:#6b6459;
  --accent:#3a5a40;--warm:#c2703d;--line:rgba(42,38,34,.15)}
@media(prefers-color-scheme:dark){:root{--bg:#0d1117;--surface:#161b22;--fg:#e6edf3;--muted:#8b949e;
  --accent:#4c8dff;--warm:#f778ba;--line:rgba(230,237,243,.14)}}
*,*::before,*::after{box-sizing:border-box}
body{margin:0;font:16px/1.6 system-ui,-apple-system,sans-serif;color:var(--fg);background:var(--bg)}
.wrap{max-width:1100px;margin:0 auto;padding:0 1.2rem}
header.top{border-bottom:1px solid var(--line);padding:1.6rem 0}
header.top a.home{display:inline-flex;align-items:center;gap:.55rem;font-weight:700;text-decoration:none;color:var(--fg)}
header.top a.home img{width:27px;height:28px;display:block}
h1{font-size:1.7rem;margin:2rem 0 .4rem}
p.lede{color:var(--muted);margin:0 0 2rem;max-width:62ch}
a{color:var(--accent)}
footer{border-top:1px solid var(--line);margin-top:3rem;padding:1.6rem 0;color:var(--muted);font-size:.9rem}
code{font:.9em ui-monospace,SFMono-Regular,Menlo,monospace;background:color-mix(in srgb,var(--fg) 8%,transparent);padding:.1em .35em;border-radius:4px}
${extraCss}
</style></head><body>
<header class="top"><div class="wrap"><a class="home" href="${escapeAttr(home)}"><img src="${up}/assets/weblocks-mark.png" alt="" width="27" height="28">weblocks</a></div></header>
<main class="wrap">${body}</main>
<footer class="wrap">Every preview on this page is real <code>renderSite</code> output, generated from
<code>src/showcase.ts</code> and <code>src/templates.ts</code> on each deploy.
· <a href="https://www.npmjs.com/package/@bytesbrains/weblocks">npm</a>
· <a href="https://github.com/bytesbrains/weblocks">GitHub</a>
· MIT</footer>
</body></html>`;
};

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
// Each card shows what the starter actually *is*: a live preview over the
// ordered block vocabulary that composes it. The spine is the point — it's the
// manifest made visible, and it's the one thing a screenshot gallery can't show.
const SPINE_SHOWN = 7;
let templateFailures = 0;

const cardsHtml = Object.values(TEMPLATES).map((t) => {
  const v = validateManifest(t.manifest);
  if (!v.ok) { templateFailures++; console.error(`✗ ${t.id}: ${JSON.stringify(v.errors)}`); }
  const file = `${t.id}.html`;
  writeFileSync(join(out, 'templates', file), renderSite(t.manifest, { islandBase: '../_island' }), 'utf8');

  const types = t.manifest.blocks.map((b) => b.type);
  const shown = types.slice(0, SPINE_SHOWN).map((ty) => `<span class="chip">${escapeHtml(ty)}</span>`).join('');
  const rest = types.length - SPINE_SHOWN;
  const spine = shown + (rest > 0 ? `<span class="chip more">+${rest}</span>` : '');

  return `<a class="tpl" href="./${escapeAttr(file)}">
  <span class="shot"><iframe src="./${escapeAttr(file)}" title="" aria-hidden="true" tabindex="-1" loading="lazy" scrolling="no"></iframe></span>
  <span class="body">
    <span class="eyebrow">${escapeHtml(t.vertical)}</span>
    <span class="name">${escapeHtml(t.label)}${v.ok ? '' : ' <b class="bad">INVALID</b>'}</span>
    <span class="spine">${spine}</span>
    <span class="foot"><code>${escapeHtml(t.id)}</code><em>${types.length} blocks</em></span>
  </span>
</a>`;
}).join('\n');

// No vertical filter here on purpose: the set is currently one starter per
// vertical, so every filter option would match exactly one card. Add one when a
// vertical grows a second variant.
const galleryCss = `
:root{--shot:#efeae1;--chipbg:rgba(42,38,34,.06)}
@media(prefers-color-scheme:dark){:root{--shot:#161b22;--chipbg:rgba(230,237,243,.08)}}
.tpl{background:var(--surface)}
.grid{display:grid;gap:1.6rem;grid-template-columns:repeat(auto-fill,minmax(310px,1fr))}
.tpl{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:10px;overflow:hidden;
  text-decoration:none;color:var(--fg);background:var(--bg);transition:border-color .18s,transform .18s,box-shadow .18s}
.tpl:hover,.tpl:focus-visible{border-color:var(--accent);transform:translateY(-3px);box-shadow:0 10px 28px rgba(0,0,0,.10)}
.tpl:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
.shot{display:block;position:relative;aspect-ratio:16/10;overflow:hidden;background:var(--shot);border-bottom:1px solid var(--line)}
.shot iframe{position:absolute;top:0;left:0;width:1280px;height:800px;border:0;pointer-events:none;
  transform:scale(var(--s,.24));transform-origin:0 0}
.body{display:flex;flex-direction:column;gap:.5rem;padding:.95rem 1rem 1.05rem}
.eyebrow{font:.7rem/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.09em;text-transform:uppercase;color:var(--accent)}
.name{font-size:1.02rem;font-weight:650;letter-spacing:-.01em;line-height:1.25}
.bad{color:#c0392b;font-size:.75rem;font-weight:700}
.spine{display:flex;flex-wrap:wrap;gap:.25rem;margin-top:.1rem}
.chip{font:.68rem/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--muted);
  background:var(--chipbg);border-radius:4px;padding:.1em .42em}
.chip.more{color:var(--accent)}
.foot{display:flex;justify-content:space-between;align-items:baseline;gap:.6rem;margin-top:.35rem;
  padding-top:.6rem;border-top:1px solid var(--line);font-size:.76rem;color:var(--muted)}
.foot code{background:none;padding:0}
.foot em{font-style:normal}
@media(prefers-reduced-motion:reduce){.tpl{transition:none}.tpl:hover,.tpl:focus-visible{transform:none}}
`;

// Thumbnails are real pages scaled down, so the scale factor has to track the
// card's rendered width rather than be guessed at build time.
const galleryScript = `<script>
(function(){
  var shots=document.querySelectorAll('.shot');
  var fit=function(){shots.forEach(function(s){var w=s.clientWidth;if(w)s.style.setProperty('--s',w/1280);});};
  fit();addEventListener('resize',fit);addEventListener('load',fit);
})();
</script>`;

writeFileSync(
  join(out, 'templates', 'index.html'),
  shell(
    'weblocks — starter templates',
    `<h1>Starter templates</h1>
<p class="lede">One complete starter per vertical, each a validated <code>SiteManifest</code> rendered to a
self-contained document — the same output a host gets with zero LLM calls. Every preview below is the real
page; the chips under it are the blocks it is composed from.</p>
<div class="grid">${cardsHtml}</div>`,
    galleryCss,
  ).replace('</body>', `${galleryScript}</body>`),
  'utf8',
);

// ── landing ──────────────────────────────────────────────────────────────────
// The hero is the pipeline itself, shown with real artefacts rather than
// described: an English brief, the actual manifest that expresses it, and the
// live page it renders to. Nothing here is a mock — the JSON is sliced straight
// out of the template that the third panel embeds.
const NPM_URL = 'https://www.npmjs.com/package/@bytesbrains/weblocks';
const REPO_URL = 'https://github.com/bytesbrains/weblocks';
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as { version: string; engines: { node: string } };

const heroTpl = TEMPLATES['restaurant-modern'] ?? Object.values(TEMPLATES)[0]!;
const HERO_BLOCKS_SHOWN = 4;
// Hand-formatted rather than JSON.stringify'd: one block per line reads as a
// stack of bricks, which is the point being made, and fits the narrow column.
const heroJson = [
  `"meta":   { "title": ${JSON.stringify(heroTpl.manifest.meta?.title ?? '')} },`,
  `"design": { "palette": { "primary": ${JSON.stringify(heroTpl.manifest.design?.palette?.primary ?? '')} } },`,
  '"blocks": [',
  ...heroTpl.manifest.blocks.slice(0, HERO_BLOCKS_SHOWN)
    .map((b) => `  { "id": ${JSON.stringify(b.id)}, "type": ${JSON.stringify(b.type)} },`),
  `  … ${heroTpl.manifest.blocks.length - HERO_BLOCKS_SHOWN} more`,
  ']',
].join('\n');

const facts: Array<[string, string]> = [
  [String(entries.length), 'typed blocks'],
  [String(Object.keys(TEMPLATES).length), 'starter templates'],
  ['0', 'runtime dependencies'],
  ['1', 'file out — self-contained'],
];

const landingCss = `
/* The artwork carries its own near-white ground, so it sits on a light card in
   both themes rather than glowing as a white square on the dark palette. */
.logo{display:block;width:230px;height:auto;margin:2.2rem 0 .4rem;background:#fdfdfb;
  border:1px solid var(--line);border-radius:14px;padding:.6rem}
h1{margin-top:1.2rem}
.hero{display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;border:1px solid var(--line);border-radius:12px;
  overflow:hidden;margin:0 0 1.1rem;background:var(--surface)}
.stage{display:flex;flex-direction:column;min-width:0;border-right:1px solid var(--line)}
.stage:last-child{border-right:0}
.stage>h2{font:.68rem/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;text-transform:uppercase;
  color:var(--muted);margin:0;padding:.8rem .9rem;border-bottom:1px solid var(--line)}
.stage>.in{padding:.9rem;flex:1;min-height:150px}
.brief{font-size:1.06rem;line-height:1.45;color:var(--fg);margin:0}
.brief b{display:block;font:.72rem ui-monospace,Menlo,monospace;color:var(--warm);font-weight:400;margin-top:.7rem}
.json{margin:0;font:.7rem/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--muted);
  white-space:pre;overflow:auto}
.stage.out>.in{padding:0;position:relative;overflow:hidden}
.stage.out iframe{position:absolute;top:0;left:0;width:1280px;height:900px;border:0;pointer-events:none;
  transform:scale(var(--hs,.28));transform-origin:0 0}
.pipe{font:.72rem ui-monospace,Menlo,monospace;color:var(--muted);margin:0 0 2.6rem;text-align:center}
.pipe b{color:var(--warm);font-weight:400}
.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1px;background:var(--line);
  border:1px solid var(--line);border-radius:10px;overflow:hidden;margin:0 0 2.6rem}
.fact{background:var(--bg);padding:1rem 1.1rem}
.fact strong{display:block;font-size:1.7rem;font-weight:600;letter-spacing:-.02em;line-height:1}
.fact span{display:block;font-size:.8rem;color:var(--muted);margin-top:.3rem}
h2.sec{font-size:.72rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.12em;
  text-transform:uppercase;color:var(--muted);margin:0 0 .9rem;font-weight:400}
.install{display:flex;flex-wrap:wrap;align-items:center;gap:.8rem;margin:0 0 2.6rem}
.install pre{margin:0;flex:1;min-width:250px;background:var(--surface);border:1px solid var(--line);
  border-radius:8px;padding:.75rem .95rem;font:.86rem ui-monospace,SFMono-Regular,Menlo,monospace;overflow:auto}
.install pre span{color:var(--warm)}
.pill{font-size:.85rem;text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:.45em 1em;color:var(--fg)}
.pill:hover{border-color:var(--accent);color:var(--accent)}
.cards{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));margin:0 0 2.6rem}
.big{display:block;border:1px solid var(--line);border-radius:10px;padding:1.2rem;text-decoration:none;
  color:var(--fg);background:var(--surface);transition:border-color .18s,transform .18s}
.big:hover{border-color:var(--accent);transform:translateY(-2px)}
.big strong{font-size:1.05rem}
.big span{display:block;color:var(--muted);font-size:.92rem;margin-top:.35rem}
.feeds{display:grid;gap:1px;background:var(--line);border:1px solid var(--line);border-radius:10px;
  overflow:hidden;margin:0 0 2.6rem}
.feed{display:flex;flex-wrap:wrap;align-items:baseline;gap:.2rem .9rem;background:var(--bg);
  padding:.7rem 1rem;text-decoration:none;color:var(--fg)}
.feed:hover{background:var(--surface)}
.feed code{font-size:.86rem;background:none;padding:0;color:var(--accent);min-width:9.5rem}
.feed span{color:var(--muted);font-size:.88rem;flex:1;min-width:210px}
.feed span code{color:inherit;min-width:0}
.why{display:grid;gap:1.4rem;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));margin:0 0 1rem}
.why h3{font-size:.95rem;margin:0 0 .35rem}
.why p{margin:0;color:var(--muted);font-size:.92rem}
.why em{font-style:normal;color:var(--warm);font-family:ui-monospace,Menlo,monospace;font-size:.82rem}
@media(max-width:760px){.hero{grid-template-columns:1fr}.stage{border-right:0;border-bottom:1px solid var(--line)}}
@media(prefers-reduced-motion:reduce){.big{transition:none}.big:hover{transform:none}}
`;

const landingScript = `<script>
(function(){
  var s=document.querySelector('.stage.out .in');
  var fit=function(){if(s&&s.clientWidth)s.style.setProperty('--hs',s.clientWidth/1280);};
  fit();addEventListener('resize',fit);addEventListener('load',fit);
})();
</script>`;

writeFileSync(
  join(out, 'index.html'),
  shell(
    'weblocks — the block engine for AI-composable web apps',
    `<img class="logo" src="./assets/weblocks-logo.png" alt="weblocks — bricks for AI-composable web apps" width="230" height="230">
<h1>Lego bricks for AI-composable web apps</h1>
<p class="lede">A model composes a <code>SiteManifest</code> from a fixed catalog of typed blocks — its entire
API surface. The engine validates it and renders one self-contained static HTML document. No raw HTML from
the model, no framework runtime, nothing to trust at render time.</p>

<div class="hero">
  <section class="stage">
    <h2>1 · the brief</h2>
    <div class="in"><p class="brief">“a neighbourhood café with a menu, a gallery and opening hours”
      <b>generateSite(brief, callModel)</b></p></div>
  </section>
  <section class="stage">
    <h2>2 · the manifest</h2>
    <div class="in"><pre class="json">${escapeHtml(heroJson)}</pre></div>
  </section>
  <section class="stage out">
    <h2>3 · the document</h2>
    <div class="in"><iframe src="./templates/${escapeAttr(heroTpl.id)}.html" title="" aria-hidden="true" tabindex="-1" loading="lazy" scrolling="no"></iframe></div>
  </section>
</div>
<p class="pipe">typed JSON in <b>→</b> validate <b>→</b> render <b>→</b> one HTML file out</p>

<div class="facts">${facts.map(([n, l]) => `<div class="fact"><strong>${escapeHtml(n)}</strong><span>${escapeHtml(l)}</span></div>`).join('')}</div>

<h2 class="sec">Install</h2>
<div class="install">
  <pre><span>npm i</span> @bytesbrains/weblocks</pre>
  <a class="pill" href="${NPM_URL}">npm ↗</a>
  <a class="pill" href="${REPO_URL}">GitHub ↗</a>
  <a class="pill" href="${REPO_URL}#readme">Docs ↗</a>
</div>

<h2 class="sec">See it rendered</h2>
<div class="cards">
  <a class="big" href="./blocks/index.html"><strong>The block wall →</strong>
    <span>All ${entries.length} bricks, rendered live, each labelled with the island it hydrates with.</span></a>
  <a class="big" href="./templates/index.html"><strong>Starter templates →</strong>
    <span>${Object.keys(TEMPLATES).length} complete starter sites, one per vertical, with the blocks that compose them.</span></a>
</div>

<h2 class="sec">For AI agents</h2>
<p class="lede">The consumer of this package is a model, so the contract is fetchable without installing
anything. One request each — no npm, no build step.</p>
<div class="feeds">
  <a class="feed" href="./llms.txt"><code>/llms.txt</code><span>Index of everything below, in the convention models look for.</span></a>
  <a class="feed" href="./AGENT.md"><code>/AGENT.md</code><span>Prime directives, composing a manifest, editing with ops, guarantees.</span></a>
  <a class="feed" href="./catalog.json"><code>/catalog.json</code><span>All ${entries.length} block types with full JSON Schema for their config.</span></a>
  <a class="feed" href="./catalog.txt"><code>/catalog.txt</code><span>The same vocabulary, one line per block, cheap to put in a prompt.</span></a>
  <a class="feed" href="./tools.json"><code>/tools.json</code><span>A ready-to-use <code>compose_site</code> function-calling definition.</span></a>
</div>

<h2 class="sec">Why it is built this way</h2>
<div class="why">
  <div><h3>A closed vocabulary</h3><p>A block exists only if it is registered. An unknown type is skipped, so
    a confused model produces a plainer page — never a broken one. <em>illegal states unrepresentable</em></p></div>
  <div><h3>The renderer is total</h3><p>Every block fills defaults, escapes its input and never throws. Validity
    is independent of how good the model's output was. <em>validity ⟂ AI quality</em></p></div>
  <div><h3>Static first</h3><p>Pages ship zero JavaScript until a block earns it; interactive blocks hydrate
    from a small island, and turning the behaviour off ships nothing. <em>${entries.length} blocks, 8 islands</em></p></div>
  <div><h3>Yours to host</h3><p>Output is one document with inlined CSS and no external dependencies. Node
    ${escapeHtml(pkg.engines.node)}, MIT, v${escapeHtml(pkg.version)}. <em>0 runtime deps</em></p></div>
</div>`,
    landingCss,
    './index.html',
  ).replace('</body>', `${landingScript}</body>`),
  'utf8',
);

// ── the agent surface ────────────────────────────────────────────────────────
// This package is composed BY models, so the contract has to be reachable
// without installing anything. These five files let an agent fetch the entire
// closed vocabulary — and the rules for using it — in one request each.
const SITE_URL = 'https://bytesbrains.github.io/weblocks';

writeFileSync(join(out, 'catalog.json'), readFileSync(join(root, 'catalog.json'), 'utf8'), 'utf8');
writeFileSync(join(out, 'AGENT.md'), readFileSync(join(root, 'AGENT.md'), 'utf8'), 'utf8');

// Compact vocabulary — the token-cheap menu meant to sit in a system prompt.
writeFileSync(join(out, 'catalog.txt'), `${catalogPrompt()}\n`, 'utf8');

// Ready-to-paste function-calling definition: one tool that returns a whole
// SiteManifest, with every block type as a discriminated variant.
const tools = {
  name: 'compose_site',
  description:
    'Compose a complete website as a SiteManifest for @bytesbrains/weblocks. Use ONLY the block types in ' +
    'the enum — the engine skips anything unknown. The host validates and renders the result to one ' +
    'self-contained static HTML document.',
  input_schema: {
    type: 'object',
    required: ['meta', 'blocks'],
    properties: {
      meta: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          lang: { type: 'string' },
          favicon: { type: 'string', description: 'A single emoji.' },
        },
      },
      design: {
        type: 'object',
        description: 'Optional design tokens; omit for the default palette.',
        properties: {
          mode: { type: 'string', enum: ['light', 'dark', 'auto'] },
          palette: {
            type: 'object',
            properties: Object.fromEntries(
              ['bg', 'surface', 'text', 'muted', 'primary', 'accent'].map((k) => [k, { type: 'string' }]),
            ),
          },
        },
      },
      blocks: {
        type: 'array',
        description: 'Ordered sections of the page. Each id must be unique.',
        items: {
          type: 'object',
          required: ['id', 'type', 'config'],
          properties: {
            id: { type: 'string' },
            type: { type: 'string', enum: entries.map((e) => e.type) },
            visible: { type: 'boolean' },
            config: { type: 'object', description: 'Fields for this block type — see catalog.json.' },
          },
        },
      },
    },
  },
  blockSchemas: Object.fromEntries(catalog().map((b) => [b.type, b.schema])),
};
writeFileSync(join(out, 'tools.json'), `${JSON.stringify(tools, null, 2)}\n`, 'utf8');

// llms.txt — the convention for pointing a model at what matters on a site.
writeFileSync(join(out, 'llms.txt'), `# @bytesbrains/weblocks

> A block engine for AI-composable web apps. A model composes a \`SiteManifest\` from a fixed catalog of
> ${entries.length} typed blocks — its entire API surface — and the engine validates it and renders one
> self-contained static HTML document. The model never emits HTML, CSS or JavaScript.

If you are an AI composing a site with this package, read AGENT.md first, then use catalog.json as your
contract. An unknown block type is skipped rather than rendered, so staying inside the vocabulary is the
whole game.

## The contract
- [AGENT.md](${SITE_URL}/AGENT.md): How to use this package as a model — prime directives, composing a manifest, editing with ops, and the guarantees you can rely on.
- [catalog.json](${SITE_URL}/catalog.json): Machine-readable catalog. Every block type with a full JSON Schema for its config. This is the API reference to send to the model.
- [catalog.txt](${SITE_URL}/catalog.txt): The same vocabulary compacted to one line per block, for dropping into a system prompt cheaply.
- [tools.json](${SITE_URL}/tools.json): A ready-to-use function-calling tool definition (\`compose_site\`) with every block type as an enum, plus per-type config schemas.

## Seeing the output
- [Block wall](${SITE_URL}/blocks/): Every block rendered live, one page each.
- [Starter templates](${SITE_URL}/templates/): ${Object.keys(TEMPLATES).length} complete starter sites and the blocks composing them.

## Source
- [GitHub](${REPO_URL}): Source, issues, architecture docs.
- [npm](${NPM_URL}): \`npm i @bytesbrains/weblocks\` — zero runtime dependencies, Node ${pkg.engines.node}.
`, 'utf8');

console.log(`agent surface → llms.txt, catalog.json, catalog.txt, tools.json, AGENT.md`);
console.log(`\nWrote ${entries.length} blocks + ${Object.keys(TEMPLATES).length} templates → ${out}`);
console.log(`Open ${join(out, 'index.html')}`);
if (blockFailures || templateFailures) {
  console.error(`\n${blockFailures} block(s) and ${templateFailures} template(s) failed validation.`);
  process.exit(1);
}
