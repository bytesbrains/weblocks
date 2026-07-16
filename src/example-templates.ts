/**
 * Renders **every named starter template** to HTML under `templates-output/`
 * (one file per template + an `index.html` linking them) so the whole set can be
 * eyeballed in a browser. Also asserts each manifest is `validateManifest`-clean.
 * Run: `npm run example:templates`, then open `templates-output/index.html`.
 *
 * Same pattern as `example-resume.ts` — a live, reproducible render for review.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { renderSite } from './render.js';
import { validateManifest } from './validate.js';
import { TEMPLATES } from './templates.js';
import { escapeHtml } from './schema.js';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'templates-output');
mkdirSync(outDir, { recursive: true });

const rows: string[] = [];
let failures = 0;

for (const t of Object.values(TEMPLATES)) {
  const v = validateManifest(t.manifest);
  if (!v.ok) { failures++; console.error(`✗ ${t.id}: ${JSON.stringify(v.errors)}`); }
  const html = renderSite(t.manifest);
  const file = `${t.id}.html`;
  writeFileSync(join(outDir, file), html, 'utf8');
  console.log(`${v.ok ? '✓' : '✗'} ${t.id.padEnd(26)} (${t.vertical.padEnd(13)}) → ${file}  [${html.length} bytes]`);
  rows.push(
    `<li><a href="./${escapeHtml(file)}">${escapeHtml(t.label)}</a>` +
    ` <small>${escapeHtml(t.id)} · ${escapeHtml(t.vertical)}${v.ok ? '' : ' · INVALID'}</small></li>`,
  );
}

const index = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>weblocks — starter templates</title>
<style>body{font:16px/1.5 system-ui,sans-serif;max-width:640px;margin:3rem auto;padding:0 1rem}
h1{font-size:1.4rem}li{margin:.4rem 0}small{color:#666}a{color:#1668b0}</style>
</head><body>
<h1>weblocks — starter templates (${Object.keys(TEMPLATES).length})</h1>
<p>One starter per business vertical. Open any to preview; each is a complete,
validated <code>SiteManifest</code> rendered to a self-contained document.</p>
<ul>${rows.join('\n')}</ul>
</body></html>`;
writeFileSync(join(outDir, 'index.html'), index, 'utf8');

console.log(`\nWrote ${Object.keys(TEMPLATES).length} templates → ${outDir}`);
console.log(`Open ${join(outDir, 'index.html')} in a browser.`);
if (failures) { console.error(`\n${failures} template(s) failed validation.`); process.exit(1); }
