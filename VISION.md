# weblocks — Vision

**A web-block package built for AI.** The model builds rich PWAs by *arranging
and configuring blocks* from a fixed catalog — it never writes HTML, CSS, or JS.
The engine turns the AI's `SiteManifest` (design tokens + ordered, typed blocks)
into one self-contained, safe document.

## Why blocks, not freeform code

Letting a model emit raw HTML is unbounded: broken layouts, injection, silent
drift, no way to reliably change one thing later. **Blocks give the AI a closed
vocabulary and a typed configuration contract** — the *catalog*. The AI composes
from it; the engine guarantees the result is valid and coherent. The model's job
shrinks from "write a correct website" to "pick and fill known bricks," which is
exactly what LLMs are reliable at.

## Principles

1. **Contract-first.** The block **catalog** (`catalog.json` — JSON Schema, plus
   a prompt form) is the AI's API reference. Send it with every request; the AI
   may only compose from it. New capabilities = new registered blocks, so the
   model is never left guessing.

2. **Validity ⟂ model quality.** A `SiteManifest` is schema-validated and the
   renderer is **total** (never throws; unknown/invalid blocks are skipped, every
   field defaulted, all text escaped). A bad model reply degrades gracefully — a
   structurally broken page is impossible.

3. **Non-breaking by construction.** Configuration and evolution never break
   existing sites:
   - closed vocabulary + schema-checked, defaulted config per block;
   - additive growth — new blocks/fields are semver-**minor**; the **manifest
     shape and the catalog are the versioned public contract**, and breaking
     either is a **major**;
   - design tokens carry coherence — one token change restyles the whole site,
     with no per-block edits.

4. **Surgical editing.** Natural-language changes compile to **validated JSON
   edit ops** (`addBlock`, `updateBlock`, `removeBlock`, `moveBlock`,
   `setVisible`, `setDesignTokens`, `setMeta`) applied independently to a
   **versioned** manifest. Change one block — or one field — without disturbing
   the rest; every edit is inspectable, reversible, and can't corrupt the
   document (a bad op is a no-op, not a break).

5. **Static-first, progressively rich.** Only the CSS of *used* blocks ships;
   interactivity hydrates as islands, only where a block needs it. The path grows
   toward full PWA / dynamic-block capability without sacrificing the safe,
   fast static core.

## Who it's for

Any product that wants an AI to **build and edit real web pages reliably** —
site builders, in-app "make me a page / app" flows, and autonomous agents. The
engine is **provider-agnostic** (inject your own model call) and **reusable
across projects** via one shared catalog contract.

## Boundaries (what it is *not*)

- Not a freeform HTML generator.
- Not tied to any host, framework, provider, or downstream consumer.
- The catalog + manifest are the contract; changing them incompatibly is a major
  version, never a silent break.

## Directional roadmap

- **More blocks** — about, pricing, steps, logos, stats, test-drive dynamic ones
  (contact-form, newsletter, booking) behind the standard runtime contract.
- **Dynamic / PWA runtime** for interactive blocks (forms, data, offline).
- **Theming presets** — named `DesignTokens` palettes the AI (or a picker) selects.
- **Schema-driven catalog** — generate the catalog from component metadata so the
  contract is always in lock-step with the code.

---

*In one line: weblocks makes an AI a reliable web builder by giving it Lego —
typed bricks it snaps together, that the engine guarantees will always render,
and that anyone can surgically re-arrange later without breaking a thing.*
