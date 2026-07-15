# Vision — `@bytesbrains/weblocks`

**An AI composes a web app by snapping together typed blocks from a fixed
catalog. The engine validates the composition and renders it to a self-contained
static document. It never writes raw HTML, and it can never produce a broken
page.**

This file is the north star. Every block, every edit op, every PR is measured
against the principles below. Code, `catalog.json`, and `CATALOG.md` are the
*contract*; this is the *why* behind it.

---

## The problem

Letting a model emit raw HTML/CSS/JS for a whole site is powerful and unsafe: the
output can be malformed, insecure (injection), incoherent (every section styled
differently), and impossible to edit surgically or reason about. "Regenerate the
whole page to change one word" is not an architecture.

## The idea — Lego bricks for web apps

The system is **Lego bricks for websites**: a finite, curated set of
interchangeable pieces the AI *assembles and configures* — it never moulds new
plastic (writes raw markup). The mental model is load-bearing, not decorative —
each Lego property maps to a design constraint:

| Lego | This engine |
|---|---|
| A finite, curated set of brick types | The **closed block catalog** (the vocabulary) |
| Universal studs — every brick connects the same way | Shared **design tokens + manifest contract** → any block fits |
| You physically *can't* connect them wrong | **Illegal states unrepresentable** (valid by construction) |
| Bricks come in colours/sizes | **Typed params + tokens** — same brick, different config |
| Infinite builds from finite parts | Power is in **combination**, not per-brick flexibility |
| The builder *snaps bricks*, never *melts plastic* | The AI **assembles**; no raw-HTML escape hatch = no melting |
| New capability → design a new brick | Grow the vocabulary with **typed, legacy-safe primitives** |
| The instruction booklet | The **manifest** — precise, reproducible, diffable, undoable |
| QA the bricks, and *any* build is sound | The **test surface is N bricks, not ∞ pages** |

Everything falls out of this: generation = *snapping a build*; editing = *swap or
tweak one brick*; chat = *instruct the builder*; cheaper models work fine =
*the builder can be junior because bricks can't be misassembled*.

## What a manifest is

A `SiteManifest` is the single source of truth the AI composes and edits:

```
SiteManifest = { meta, design (tokens), blocks[] (ordered, typed), version, pwa?, seo? }
```

- **design** is the shared baseplate — CSS custom properties every brick styles
  from, so one edit ("make the whole thing warmer") restyles the entire app.
- **blocks** are placed bricks: `{ id, type, visible, config, overrides? }`. The
  `type` comes from the closed catalog; `config` is validated against that
  brick's schema before it is ever applied.
- **version** bumps on every accepted edit → undo / history / draft-vs-publish
  come for free.

The manifest is never raw HTML. The renderer turns it into one self-contained
static document; the schema layer guarantees every reachable manifest is valid.

---

## Design invariants — non-negotiable

These hold for every block, every edit, every PR. Violating one reintroduces the
broken-page or security risk this design removes.

1. **Catalog-first / closed vocabulary.** A block type exists iff it is
   registered. The AI may only emit validated operations over the bounded set of
   block types, typed params/tokens, and edit verbs. If a request can't be
   expressed in the vocabulary, the answer is **add a typed primitive — never an
   escape hatch.**
2. **Illegal states unrepresentable.** Every reachable manifest is valid by
   construction (schema-validated before apply). Worst case is a *rejected op*,
   never a corrupted site.
3. **No escape hatch.** No "custom HTML/JS" block, no free-form markup field
   within the AI's reach. Raw output = melting plastic = the risk we designed
   away. `rich-text`/`blog-post` are *typed* content nodes, not raw HTML.
4. **Parameterize, don't free-form.** Prefer typed knobs (tokens, enums) over
   free strings. Every free-string field is a place a page can break — and every
   one is escaped on render.
5. **Total renderer.** The renderer is defined for every manifest — a default for
   every optional field, escaping for all text, and it **cannot throw**. Schema =
   valid by construction; renderer = can't fail to render. Two walls.
6. **Validity ⟂ AI quality.** Page *validity* comes from schema + renderer, not
   from the model being right — so models are swappable/downgradable with zero
   risk of broken pages. The model affects taste and wording only.
7. **Legacy-safe, additive growth.** Grow the vocabulary only additively
   (semver-minor); every old manifest must keep validating and rendering
   identically. Removing or renaming a brick or field is a breaking change that
   needs a migration.
8. **Host-neutral.** The engine bundles no backend, no provider, no host. The
   model call is injected (`callModel`); powered bricks *declare* their runtime
   needs and a host wires them (see below). The engine reveals nothing about who
   consumes it.
9. **Static-first.** Pages are HTML + CSS; JavaScript loads only for the
   interactive islands a brick actually needs, and only when its behaviour is on.

## Powered bricks & the runtime contract

Classic bricks are inert HTML. A few are *powered* — a form submits, auth signs
in, search queries. They can't be pure static markup, but the engine stays
host-neutral by **declaring** each powered brick's capabilities in the catalog
and emitting a documented client contract (`data-wl-capability` hooks). The
**host provides the runtime through a small adapter**; there is no bundled
backend and no per-block glue — one adapter serves every powered brick. With no
runtime wired, a powered brick renders inert-but-valid, never broken.

The safety-critical parts (spam/captcha, server-side validation, delivery, abuse
caps, identity) live in the host's vetted runtime — never in anything the AI
emits.

## The AI contract

- **Generation:** the model emits a full manifest from a brief — bounded,
  schema-validated. A single call; no agent required.
- **Editing:** a small tool-calling agent emits validated **edit ops**
  (`addBlock`, `updateBlock`, `move`, array-item ops, `applyPreset`, …). Each is
  validated → applied → `version++`. A bad op is a no-op, never a corruption.
- The catalog (`catalog()` / `catalogPrompt()` / shipped `catalog.json`) is the
  *only* surface the model is told it may use — the closed vocabulary made
  legible as JSON Schema or a compact prompt.

---

## Roadmap direction

The engine grows toward **rich, app-like, installable PWAs** — always within the
invariants above. Broad strokes (tracked in the issues):

- **More blocks** — content, media, collections, app-shell/navigation — each a
  registered, typed, totally-rendering brick.
- **Dynamic bricks** on the runtime contract (forms, newsletter, auth, search).
- **PWA layer** — a Web App Manifest + service worker derived from the
  `SiteManifest` (installable, offline-capable).
- **Finer-grained edit ops** — array-item-level surgical edits so the AI changes
  *one item* without rewriting a block.
- **Theming** — named `DesignTokens` presets and opt-in per-section overrides.

Every one of these ships as an **additive, non-breaking** change: a new typed
primitive or an optional field. If a capability can't be added that way, it needs
a migration and a major version — never an escape hatch.

## Definition of done for any new capability

- [ ] A registered brick (or engine op) with a **typed schema** — no raw-HTML
      field.
- [ ] Consumes the **shared design tokens**; no ad-hoc styling.
- [ ] **Total render**: a sensible default for every optional field, all text
      escaped, cannot throw.
- [ ] **Additive & non-breaking**: every existing manifest still validates and
      renders identically.
- [ ] Powered bricks conform to the **runtime contract**; no host-specific code
      in the engine.
- [ ] **Tests** for the brick/op, and `catalog.json` / `CATALOG.md` regenerated.
- [ ] Docs updated; **consumer-neutral** throughout.
