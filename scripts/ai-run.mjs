/**
 * Dev harness: drive the block engine's generate/edit spine with a real LLM,
 * so we can see AI → manifest → static HTML end-to-end without the app.
 *
 * PROVIDER-AGNOSTIC BY CONFIG. There are three *wire-format* adapters
 * (openai-compatible, anthropic, gemini); every vendor maps to one of them, so
 * switching provider/model is configuration — never a code edit. This is a dev
 * harness only: bring your own provider key via env; the published engine takes
 * an injected `callModel` and has no provider dependency of its own.
 *
 * Usage:
 *   PROVIDER=deepseek  DEEPSEEK_API_KEY=sk-...  npm run ai -- generate "a Lisbon bakery landing page"
 *   PROVIDER=openai    OPENAI_API_KEY=sk-...    npm run ai -- generate "…"
 *   PROVIDER=anthropic ANTHROPIC_API_KEY=sk-... npm run ai -- generate "…"
 *   PROVIDER=gemini    GEMINI_API_KEY=...       npm run ai -- generate "…"
 *   PROVIDER=ollama                             npm run ai -- generate "…"   (local, no key)
 *   …then:  PROVIDER=deepseek DEEPSEEK_API_KEY=sk-... npm run ai -- edit "make it dark, add a gallery"
 *
 * Overrides (any provider): SITE_MODEL, BASE_URL, API_KEY.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { generateSite, editSite, renderSite, validateManifest, blockTypes } from '../lib/index.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_HTML = join(HERE, '..', 'ai-output.html');
const OUT_MANIFEST = join(HERE, '..', 'ai-manifest.json');

// ── Wire-format adapters ────────────────────────────────────────────────────
// Each maps {baseUrl, apiKey, model, temperature, system, user} → assistant text.
// One adapter per API SHAPE — not per vendor — so N vendors reuse M adapters.
const WIRE = {
  // OpenAI Chat Completions: DeepSeek, OpenAI, Grok, Together, Fireworks, Ollama…
  openai: async ({ baseUrl, apiKey, model, temperature, system, user }) => {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(apiKey && { Authorization: `Bearer ${apiKey}` }) },
      body: JSON.stringify({
        model, temperature, max_tokens: 8000, stream: false,
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      }),
    });
    if (!res.ok) throw new Error(`${model} ${res.status}: ${(await res.text().catch(() => '')).slice(0, 300)}`);
    return (await res.json())?.choices?.[0]?.message?.content ?? '';
  },

  // Anthropic Messages API. (No temperature — removed on Opus 4.7/4.8.)
  anthropic: async ({ baseUrl, apiKey, model, system, user }) => {
    const res = await fetch(`${baseUrl}/v1/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: 8000, system, messages: [{ role: 'user', content: user }] }),
    });
    if (!res.ok) throw new Error(`${model} ${res.status}: ${(await res.text().catch(() => '')).slice(0, 300)}`);
    const d = await res.json();
    return (d?.content ?? []).filter((b) => b.type === 'text').map((b) => b.text).join('');
  },

  // Google Gemini generateContent.
  gemini: async ({ baseUrl, apiKey, model, temperature, system, user }) => {
    const res = await fetch(`${baseUrl}/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { temperature, maxOutputTokens: 8000 },
      }),
    });
    if (!res.ok) throw new Error(`${model} ${res.status}: ${(await res.text().catch(() => '')).slice(0, 300)}`);
    const d = await res.json();
    return (d?.candidates?.[0]?.content?.parts ?? []).map((p) => p.text || '').join('');
  },
};

// ── Vendor registry: which wire format + defaults. `PROVIDER=<key>` picks one. ──
const PROVIDERS = {
  deepseek:  { wire: 'openai',    baseUrl: 'https://api.deepseek.com',                 keyEnv: 'DEEPSEEK_API_KEY',  model: 'deepseek-chat' },
  openai:    { wire: 'openai',    baseUrl: 'https://api.openai.com/v1',                keyEnv: 'OPENAI_API_KEY',    model: 'gpt-4o-mini' },
  grok:      { wire: 'openai',    baseUrl: 'https://api.x.ai/v1',                      keyEnv: 'GROK_API_KEY',      model: 'grok-2-latest' },
  together:  { wire: 'openai',    baseUrl: 'https://api.together.xyz/v1',              keyEnv: 'TOGETHER_API_KEY',  model: 'deepseek-ai/DeepSeek-V3' },
  ollama:    { wire: 'openai',    baseUrl: 'http://localhost:11434/v1',                keyEnv: null,                model: 'llama3.1' },
  anthropic: { wire: 'anthropic', baseUrl: 'https://api.anthropic.com',                keyEnv: 'ANTHROPIC_API_KEY', model: 'claude-opus-4-8' },
  gemini:    { wire: 'gemini',    baseUrl: 'https://generativelanguage.googleapis.com', keyEnv: 'GEMINI_API_KEY',    model: 'gemini-2.5-flash' },
};

function resolveProvider() {
  const name = process.env.PROVIDER || 'deepseek';
  const p = PROVIDERS[name];
  if (!p) {
    console.error(`Unknown PROVIDER "${name}". Options: ${Object.keys(PROVIDERS).join(', ')}`);
    process.exit(2);
  }
  const apiKey = process.env.API_KEY || (p.keyEnv ? process.env[p.keyEnv] : '') || '';
  if (p.keyEnv && !apiKey) {
    console.error(`Set ${p.keyEnv} (or API_KEY) for PROVIDER=${name}.`);
    process.exit(1);
  }
  return {
    name,
    wire: WIRE[p.wire],
    baseUrl: (process.env.BASE_URL || p.baseUrl).replace(/\/+$/, ''),
    apiKey,
    model: process.env.SITE_MODEL || p.model,
  };
}

/** Build an injected ModelCall at a temperature (hot for creation, cold for edits). */
function makeModelCall(cfg, temperature) {
  return ({ system, user }) => cfg.wire({ ...cfg, temperature, system, user });
}

function writeOutputs(manifest) {
  writeFileSync(OUT_MANIFEST, JSON.stringify(manifest, null, 2), 'utf8');
  const html = renderSite(manifest);
  writeFileSync(OUT_HTML, html, 'utf8');
  return html.length;
}

function report(label, { ok, errors, warnings }) {
  console.log(`${label}: ok=${ok}`);
  if (errors?.length) console.log('  errors:', errors);
  if (warnings?.length) console.log('  warnings:', warnings.slice(0, 8));
}

async function main() {
  const mode = process.argv[2];
  const text = process.argv.slice(3).join(' ').trim();
  if (!mode || !text || !['generate', 'edit'].includes(mode)) {
    console.error('Usage: PROVIDER=<name> <KEY_ENV>=… npm run ai -- <generate|edit> "<brief or message>"');
    console.error(`Providers: ${Object.keys(PROVIDERS).join(', ')}`);
    process.exit(2);
  }
  const cfg = resolveProvider();
  console.log(`provider=${cfg.name}  model=${cfg.model} @ ${cfg.baseUrl}\nbricks=[${blockTypes().join(', ')}]\n`);

  if (mode === 'generate') {
    const r = await generateSite(text, makeModelCall(cfg, 1.0));
    report('generateSite', r);
    const bytes = writeOutputs(r.manifest);
    console.log(`\nblocks: ${r.manifest.blocks.map((b) => b.type).join(' → ') || '(none)'}`);
    console.log(`rendered ${bytes} bytes → ${OUT_HTML}`);
    console.log(`manifest → ${OUT_MANIFEST}`);
    return;
  }

  // edit
  if (!existsSync(OUT_MANIFEST)) {
    console.error(`No ${OUT_MANIFEST} — run "npm run ai -- generate ..." first.`);
    process.exit(1);
  }
  const current = JSON.parse(readFileSync(OUT_MANIFEST, 'utf8'));
  const r = await editSite(current, text, makeModelCall(cfg, 0.2));
  if (r.parseError) console.log('parseError:', r.parseError);
  console.log(`editSite: applied ${r.applied}/${r.results.length} ops`);
  for (const res of r.results) {
    const tag = res.ok ? 'ok' : 'REJECTED';
    console.log(`  [${tag}] ${res.op.op}${res.errors.length ? ' — ' + res.errors.join('; ') : ''}`);
  }
  report('validateManifest', validateManifest(r.manifest));
  const bytes = writeOutputs(r.manifest);
  console.log(`\nrendered ${bytes} bytes → ${OUT_HTML}`);
}

main().catch((err) => {
  console.error('\nFailed:', err?.message || err);
  process.exit(1);
});
