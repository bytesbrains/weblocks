# @bytesbrains/weblocks

The **block engine** for AI-composable web apps — the "Lego bricks" spine.
The AI composes a `SiteManifest` from a **fixed block catalog** (its API
contract); the engine **validates** it and **renders** static HTML. Shareable
across repos. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

```
SiteManifest (design tokens + ordered typed blocks)
     │   validateManifest()  ← strict gate for AI edit ops (reject invalid)
     ▼
  renderSite()               ← TOTAL: never throws → one self-contained HTML doc
     ▼
  static HTML  (+ island <script> only where a brick is interactive)
```

## Install

```bash
npm install @bytesbrains/weblocks   # Node ≥ 20, ESM
```

The AI's contract ships with the package as **`catalog.json`** (the machine
JSON-Schema of every block) and **`CATALOG.md`** (human reference) — send
`catalog()` / `catalogPrompt()` (or the JSON) to the model so it composes only
valid blocks.

```ts
import { generateSite, renderSite, catalog } from '@bytesbrains/weblocks';
import catalogJson from '@bytesbrains/weblocks/catalog.json' with { type: 'json' };

// brief → manifest (model call injected → provider-agnostic) → static HTML
const { ok, manifest } = await generateSite(brief, callModel);
if (ok) writeFileSync('index.html', renderSite(manifest));
```

This is deliberately **zero-dependency, pure TypeScript** (mirrors the tested
helpers in `functions/`). It proves the invariants before any framework choice:

- **Closed vocabulary** — a block type exists iff it is in the `REGISTRY`
  (`hero`, `services-catalogue`, `gallery` today). Unknown types are skipped.
- **Illegal states unrepresentable** — `validateManifest` rejects bad configs so
  an edit op is refused, not applied.
- **Total renderer** — `renderSite` defaults every field, escapes all text, and
  cannot throw; a broken page is structurally impossible.
- **Static-first** — only the CSS of *used* bricks ships; islands hydrate only
  when a brick's behaviour is on (`gallery` lightbox).
- **Coherence** — every brick styles from shared design-token CSS variables.

## Use

```bash
npm install          # dev deps only (typescript, @types/node)
npm test             # tsc + node --test
npm run example      # renders a sample → example-output.html (open in a browser)
```

Drive it with a **real** model (dev harness — provider is config, not code):

```bash
# switching provider/model is env, never an edit — one wire-adapter per API shape
PROVIDER=deepseek  DEEPSEEK_API_KEY=sk-…  npm run ai -- generate "a Lisbon bakery landing page"
PROVIDER=openai    OPENAI_API_KEY=sk-…    npm run ai -- generate "…"
PROVIDER=anthropic ANTHROPIC_API_KEY=sk-… npm run ai -- generate "…"
PROVIDER=gemini    GEMINI_API_KEY=…       npm run ai -- generate "…"
#  → ai-manifest.json + ai-output.html
PROVIDER=deepseek DEEPSEEK_API_KEY=sk-…   npm run ai -- edit "make it dark, add a gallery"
```

Providers: `deepseek · openai · grok · together · ollama · anthropic · gemini`
(overrides: `SITE_MODEL`, `BASE_URL`, `API_KEY`). Mirrors `functions/src/providers.ts`.

```ts
import {
  renderSite, validateManifest, blockTypes,
  catalog, catalogPrompt,           // the AI's menu (JSON Schema + a prompt string)
  generateSite, editSite,           // brief → manifest ; NL message → edit ops
  applyOp, applyOps,                // deterministic, validated manifest mutations
} from '@bytesbrains/weblocks';

const html = renderSite(manifest);              // self-contained static document

// AI compose — the model call is INJECTED (provider-agnostic, testable):
const { ok, manifest } = await generateSite(brief, callModel);

// AI edit — natural language → validated ops → new versioned manifest:
const { manifest: edited, applied } = await editSite(manifest, 'go dark and add a gallery', callModel);

// Or drive ops directly (what a chat/inspector emits):
applyOp(manifest, { op: 'updateBlock', id: 'hero-1', config: { headline: 'New' } });
```

`callModel: (args:{system,user}) => Promise<string>` is wired to `functions/`
`callProvider` at the edge — the engine itself has no provider dependency, so
page validity never depends on the model being right.

## Adding a brick

Register a `BlockSpec` (`type` + `schema` + `css` + `render`) in `registry.ts`.
It must clear the **brick definition-of-done** in the architecture doc: typed
interface, consumes shared tokens, renders totally, valid regardless of
neighbours, only-typed-knobs (no raw-HTML field), snapshot tests.

## Not yet here (by design)

Client island scripts (lightbox etc.), the dynamic per-site runtime (`/_api/*`
for `contact-form`/chatbot), the real `callModel` wiring in `functions/`, and
CEM→schema generation (the schemas are hand-written for now). This package is the
render + validate + compose/edit spine those build on.
