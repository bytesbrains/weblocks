# Contributing to `@bytesbrains/weblocks`

Thanks for your interest! This engine has a strong spine — please read
[`VISION.md`](./VISION.md) first. Every change is measured against its invariants.

## Ground rules

- **Catalog-first, additive, non-breaking.** New capability = a new typed block
  or an optional field. Every existing manifest must still validate and render
  identically. Removing/renaming a block or field is a breaking change (major
  version) and needs a migration.
- **No escape hatch.** No raw-HTML / free-markup field within the AI's reach.
  Freeform content is expressed as *typed* content nodes (see `rich-text`).
- **Total render.** A brick's `render` must default every field, escape all text
  (`escapeHtml`/`escapeAttr`), sanitize every URL (`sanitizeUrl`), and never
  throw.
- **Host-neutral.** No bundled backend/provider/host. Powered bricks *declare*
  runtime needs; hosts wire them.

## Dev loop

```bash
npm install          # dev deps only
npm run build        # tsc → lib/
npm test             # block definition-of-done + engine invariants
npm run example      # render a sample to example-output.html
npm run emit:catalog # regenerate catalog.json + CATALOG.md from code
```

## Adding a block

1. Create `src/blocks/<name>.ts` exporting a `BlockSpec` (`type` + `description`
   + `schema` + `css` + `render`, plus `island`/`runtime` if interactive/powered).
   Copy an existing brick as a template — `features.ts` (static grid) or
   `contactForm.ts` (powered).
2. Register it in `src/registry.ts`.
3. Clear the **brick definition-of-done** in
   [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md#brick-definition-of-done--admitting-a-new-block).
   The shared suite in `src/blocks.test.ts` runs the DoD against every brick.
4. Add the new type to the closed-vocabulary list in `blocks.test.ts`.
5. Give it demo config for the published block wall — place it in a starter
   template, or add an entry to `SUPPLEMENT` in `src/showcase.ts`.
   `showcase.test.ts` fails on any registered type without one. Check it with
   `npm run site`.
6. `npm run emit:catalog` and update docs if needed.

## Adding a starter template

One file to touch: append a `tpl({...})` entry to its vertical's array in
`src/templates/<vertical>.ts`. The registry in `src/templates.ts` picks it up.

1. Read the block schemas you need in [`CATALOG.md`](./CATALOG.md) /
   `catalog.json` **before** writing config. Unknown keys are *silently dropped*
   by `parse`, so a guessed field means content vanishes from the render while
   validation still passes.
2. Give it complete metadata — `description`, 3–6 lowercase-kebab `tags`, a
   `layout` the blocks actually match, and the `preset` you pass to `tpl()`.
3. Write **real, specific copy** — a named business, plausible prices, addresses
   and hours, testimonials that sound like a person wrote them. Keep each
   template internally consistent in currency, address and phone format.
4. Make it *different* from its siblings: vary the block set and order, not just
   the nouns. Use distinct `img()` seeds — a reused seed shows the same photo
   twice in the gallery.
5. `npm run check:templates <vertical>` until clean, then `npm test`.
6. Never rename an existing template `id` — hosts persist them.

New vertical? Add it to `src/verticals.ts` first (additive only — never rename or
repurpose an existing `id`), then create `src/templates/<vertical>.ts` and list it
in `src/templates.ts`.

## Branches & releases

Two long-lived branches, with different jobs:

| Branch | What lands there | How it merges |
| --- | --- | --- |
| `dev` | **All continuous work** — features, fixes, docs, chores | **Squash merge** from a feature branch |
| `main` | **Tagged releases only** | Merge from `dev`, in a versioned release PR |

```
feat/my-thing ──squash──▶ dev ──release PR──▶ main ──▶ tag v0.10.0
```

**Day to day:** branch off `dev`, open your PR against `dev`, and squash-merge it.
One feature, one commit on `dev` — so `dev`'s history reads as a changelog and any
single change can be reverted cleanly. Name branches `feat/…`, `fix/…`, `docs/…`,
`chore/…`.

**Releasing:** open one PR from `dev` → `main` that bumps the version and writes
the `CHANGELOG.md` entry. Nothing else ever targets `main` — no feature branch
goes there directly, so `main` is always exactly the set of published releases and
every commit on it corresponds to a tag. Tag `main` after the merge; the OIDC
publish workflow fires on `v*`.

Because `main` only moves at release time, `dev` is normally *ahead* of it. If you
find `dev` behind `main`, that is drift to fix before branching — sync it first,
or your PR will carry the release commits `dev` is missing on top of your own.

## Before you open a PR

- It targets **`dev`**, not `main` (see [Branches & releases](#branches--releases)) —
  unless it *is* the release PR.
- `npm run build && npm test && npm run emit:catalog` are green from a clean
  clone.
- `catalog.json` / `CATALOG.md` are regenerated and committed.
- The leak-grep in the release checklist stays clean — nothing about any specific
  host, backend, or consumer.
- The PR is consumer-neutral throughout.
