<!-- See VISION.md and CONTRIBUTING.md. Keep changes additive and consumer-neutral. -->

## What & why

<!-- One or two sentences. Link the issue. -->

## Checklist

- [ ] Additive & **non-breaking** — every existing manifest still validates and
      renders identically (or this is a documented major change with a migration).
- [ ] New blocks/ops have a **typed schema** (no raw-HTML field), consume shared
      **design tokens**, and **render totally** (defaults + escaping, never throws).
- [ ] Powered bricks declare `runtime.capabilities`; no host-specific code in the
      engine.
- [ ] `npm run build && npm test` pass; `npm run emit:catalog` regenerated and
      `catalog.json` / `CATALOG.md` committed.
- [ ] **Consumer-neutral** — nothing about any specific host, backend, or consumer.
