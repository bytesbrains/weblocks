// Emit the block catalog as shareable artifacts:
//   - catalog.json  — the machine-readable API contract sent to the AI and
//                     consumed by any repo that builds web apps with this engine.
//   - CATALOG.md    — a human-readable reference of the same.
// Run after build (lib/ must exist): `npm run emit:catalog`.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { catalog, catalogPrompt } from '../lib/index.js';
import pkg from '../package.json' with { type: 'json' };

const root = (name) => fileURLToPath(new URL(`../${name}`, import.meta.url));
const entries = catalog();

// ---- catalog.json (the contract) ----
const contract = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  package: pkg.name,
  version: pkg.version,
  description:
    'Block catalog for @bytesbrains/weblocks. Send this to the model as its ' +
    'API reference; it composes a SiteManifest ({ meta, design, blocks[] }) ' +
    'using ONLY these block types. The engine then validates and renders it.',
  blockTypes: entries.map((b) => b.type),
  blocks: entries, // [{ type, description, schema: JsonSchema }]
};
writeFileSync(root('catalog.json'), JSON.stringify(contract, null, 2) + '\n');

// ---- CATALOG.md (human reference) ----
let md = `# ${pkg.name} — Block Catalog (v${pkg.version})\n\n`;
md +=
  'The AI composes a `SiteManifest` (`{ meta, design, blocks[] }`) using **only** ' +
  'the block types below, then the engine validates + renders it to static HTML. ' +
  'This file is generated from the code (`npm run emit:catalog`) — do not edit by hand.\n\n';
md += `**Block types:** ${entries.map((b) => `\`${b.type}\``).join(' · ')}\n\n`;
for (const b of entries) {
  md += `## \`${b.type}\`\n\n${b.description}\n\n`;
  const props = b.schema?.properties ?? {};
  const req = new Set(b.schema?.required ?? []);
  const keys = Object.keys(props);
  if (keys.length) {
    md += '| field | type | required | notes |\n|---|---|---|---|\n';
    for (const k of keys) {
      const f = props[k] ?? {};
      const type = f.type + (f.enum ? ` (${f.enum.join('\\|')})` : '');
      md += `| \`${k}\` | ${type} | ${req.has(k) ? 'yes' : ''} | ${f.description ?? ''} |\n`;
    }
    md += '\n';
  }
}
writeFileSync(root('CATALOG.md'), md);

// A trivial sanity check that the prompt form still builds.
if (!catalogPrompt().includes(entries[0].type)) {
  throw new Error('catalogPrompt() out of sync with catalog()');
}

console.log(`emit-catalog: wrote catalog.json + CATALOG.md (${entries.length} block types)`);
