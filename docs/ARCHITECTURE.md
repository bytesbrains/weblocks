# Apps — Block catalog & AI-composable architecture

**Status:** Design / exploration
**Owner:** @nandal
**Relates to:** [`APPS_SITE_PUBLISHING.md`](./APPS_SITE_PUBLISHING.md) (v1 = single-shot static HTML)

This spec is the evolution path from "AI writes one HTML blob" to a **block
catalog the AI composes and edits by contract** — the substrate for gallery,
blog, services, contact forms, chatbot, and (later) plugins, plus conversational
("chat to edit your site") management.

---

## The Lego model — the mental model

The system is **Lego bricks for websites**: a finite, curated set of
interchangeable pieces the AI *assembles and configures* — it never moulds new
plastic (writes raw HTML/JS). This is not just an analogy; each Lego property is
a design constraint.

| Lego | This system |
|---|---|
| Finite, curated set of brick types | The **closed block catalog** (nouns) |
| Universal studs — every brick connects the same way | Shared **design-token + manifest contract** → any block fits |
| You physically *can't* connect them wrong | **Illegal states unrepresentable** (valid by construction) |
| Bricks come in colours/sizes | **Typed params/tokens** (adjectives) — same brick, different config |
| Infinite builds from finite parts | **Small but composable** — power is in combination, not per-brick flexibility |
| The builder *snaps bricks*, never *melts plastic* | The AI **assembles**, never writes raw HTML — **no escape hatch = no melting** |
| New capability → design a new brick, add to the set | Grow the vocabulary with **typed primitives, legacy-safe** |
| The instruction booklet | The **manifest** — precise, reproducible, diffable, undoable |
| QA the bricks, and *any* build is sound | Your **test surface is N bricks, not ∞ pages** |

**Powered bricks.** Classic bricks are inert, but a few blocks have behaviour
(forms submit, chatbots talk). Those are the Technic/Mindstorms pieces — they
clip onto a shared baseplate with wiring (the per-site runtime, §6) via **one
standard interface (`/_api/*`)**, never a bespoke backend. Static bricks are
passive HTML; powered bricks plug into the same power/control system.

Everything upstream falls out of this: generation = *snapping a build*; editing =
*swap one brick*; chat = *instruct the builder*; cheaper models = *the builder
can be junior because bricks can't be misassembled*; plugins = *powered bricks
from a curated bin*.

## Design invariants — non-negotiable

These hold for every block, every edit, every PR. Violating one reintroduces
broken pages or the security risk v1 removed.

1. **Closed vocabulary.** The AI may only emit validated operations over a
   bounded set of block types, typed params/tokens, and verbs (`add / update /
   remove / move / setTokens`). If a request can't be expressed in the
   vocabulary, the answer is **add a typed primitive — never an escape hatch.**
2. **Illegal states unrepresentable.** Every reachable manifest is valid by
   construction (schema-validated before apply). Worst case is a *rejected op*,
   never a corrupted site.
3. **No escape hatch.** No "custom HTML/JS" block and no free-form markup field
   within the AI's reach. Raw output = melting plastic = the risk we designed away.
4. **Parameterize, don't free-form.** Prefer typed knobs (tokens, enums) over
   free strings. Every free-string field is a place a page can break.
5. **Total renderer.** The renderer is defined for every valid manifest —
   defaults for all optionals, SSR-able to static HTML, cannot throw. (Schema =
   valid by construction; renderer = can't fail to render: the two walls.)
6. **Validity ⟂ AI quality.** Page *validity* comes from schema + renderer, not
   from the model being right — so models are swappable/downgradable (Gemini ↔
   Opus) with zero risk of broken pages. The model affects taste and wording only.
7. **Legacy-safe growth.** Grow only additively; old manifests must keep
   rendering (unknown/absent → safe default, per `SiteStatus.fromName`).
   Removing/renaming a brick or param needs a migration.

## Brick definition-of-done — admitting a new block

A block joins the catalog only when it:

- [ ] declares a **typed interface** (its studs) via Custom Elements Manifest → JSON Schema;
- [ ] consumes the **shared design tokens** (fits the baseplate) — no ad-hoc styling;
- [ ] **renders totally**: a sensible default for every optional field, SSR-able to static HTML, cannot throw;
- [ ] is **valid regardless of neighbours** (no coupling beyond declared placement rules, e.g. `nav` top / `footer` bottom);
- [ ] if **powered** (dynamic), speaks the **standard runtime contract (`/_api/*`)** — captcha / verify / rate-limit / store handled by the vetted runtime, not a bespoke backend;
- [ ] exposes **only typed knobs — no raw-HTML field** (no melting);
- [ ] ships **snapshot tests** for its param combinations (the test surface is the brick, not the ∞ pages built from it).

---

## 1. The model in one picture

```
 Component library (Lit/vanilla custom elements, SSR-able)
        │  each exposes a typed interface (Custom Elements Manifest)
        ▼
 Interface catalog (auto-generated CEM/JSON Schema)  ──► fed to the AI as its "menu"
        │
        ▼
 Site manifest (typed JSON: design tokens + ordered blocks + integrations)
        │  AI *composes/edits* this via validated tool-calls — never raw HTML/JS
        ▼
 Renderer  ──► SSR each block to static HTML at publish  ──► R2/KV  ──► *.wrok.in
        │  hydrate ONLY interactive "islands" (form, gallery lightbox, chatbot)
        ▼
 Dynamic blocks call a per-site runtime API (forms, chatbot, plugins)
```

**Invariants**
- The AI targets **interfaces**, not framework code. Worst case is a rejected
  tool-call, never corrupted markup.
- Static-first: pages are HTML+CSS; JS loads only for interactive islands.
- The **design system is top-level state** every block inherits, so coherence
  survives edits ("make the whole site warmer" = one token change).

---

## 2. Site manifest (top-level shape)

```ts
type SiteManifest = {
  meta:   { title: string; description: string; lang: string; favicon?: string };
  pwa:    { name: string; shortName: string; themeColor: string;
            backgroundColor: string; icons: Icon[]; installable: boolean;
            offline: boolean };                       // → webmanifest + service worker
  seo:    { ogTitle?: string; ogImage?: string; canonical?: string; noindex?: boolean };
  design: DesignTokens;                                // the shared design system
  blocks: Block[];                                     // ordered page sections
  integrations: {
    forms?:   { provider: 'builtin'; notifyEmail: string };
    chatbot?: { persona: string; model: string };
    plugins?: PluginBinding[];                         // later (OAuth-backed)
  };
  version: number;                                     // bumped per edit → undo/history
};

type Block = { id: string; type: BlockType; visible: boolean; config: object };

type DesignTokens = {
  mode: 'light' | 'dark' | 'auto';
  palette: { bg: string; surface: string; text: string; muted: string;
             primary: string; accent: string };
  typography: { fontStack: string; scale: 'compact'|'default'|'expressive' };
  radius: 'sharp'|'soft'|'round';
  spacing: 'tight'|'default'|'airy';
  motion: 'none'|'subtle'|'lively';
};
```

Every block's `config` is validated against that block type's JSON Schema
(derived from the component's Custom Elements Manifest) before it is applied.

---

## 3. The block catalog

Covering the sections of a modern single-page responsive PWA. **Static** blocks
render to pure HTML (no JS unless an island is noted). **Dynamic** blocks need
the per-site **runtime** (§6).

### Chrome / structure
| type | purpose | kind |
|---|---|---|
| `nav` | logo, links, CTA, mobile hamburger | static (+island: mobile menu) |
| `announcement-bar` | dismissible top banner | static (+island: dismiss) |
| `footer` | links, social, legal, copyright | static |

### Content sections
| type | purpose | kind |
|---|---|---|
| `hero` | headline, subhead, CTA(s), media/gradient bg | static |
| `features` | icon + title + text grid (value props) | static |
| `services-catalogue` | services/products: title, desc, price, CTA | static |
| `gallery` | image grid / masonry / carousel | static (+island: lightbox) |
| `about` | story / mission narrative | static |
| `team` | people cards (photo, role, socials) | static |
| `testimonials` | quotes, avatar, rating | static (+island: carousel) |
| `logos` | client/press logo strip | static |
| `stats` | animated metric counters | static (+island: count-up) |
| `pricing` | tiers/plans, feature matrix | static (+island: monthly/annual toggle) |
| `steps` | how-it-works / process | static |
| `faq` | question/answer accordion | static (+island: expand) |
| `cta` | conversion band | static |
| `video` | inline/lazy-embedded video | static (+island: lazy player) |
| `contact-details` | address, phone, email, hours | static |
| `map` | location embed | static (+island: map tiles) |
| `social-links` | icon row | static |

### Blog
| type | purpose | kind |
|---|---|---|
| `blog-list` | recent posts grid → links to post pages | dynamic (posts store + routing) |
| `blog-post` | a rendered post page (own route) | dynamic |

### Dynamic / interactive
| type | purpose | kind |
|---|---|---|
| `contact-form` | fields + **captcha** + submit | **dynamic** (endpoint, verify, email, store) |
| `newsletter` | email capture | **dynamic** (store + email provider) |
| `booking` | calendar slot booking | **dynamic** (plugin/OAuth) |
| `chatbot` | LLM widget grounded on site content | **dynamic** (LLM endpoint, rate-limited) |

### Atomic primitives (used inside blocks; not usually top-level)
`button`, `badge`, `icon`, `image`, `heading`, `text`, `divider`, `spacer`,
`card`, `accordion-item`, `tab`.

---

## 4. Block end-to-end #1 — `gallery` (static + lightbox island)

**(a) Interface** — from the component's Custom Elements Manifest (excerpt):

```jsonc
{ "tagName": "x-gallery",
  "attributes": [
    { "name": "layout",   "type": "\"grid\"|\"masonry\"|\"carousel\"", "default": "grid" },
    { "name": "columns",  "type": "2|3|4", "default": 3 },
    { "name": "gap",      "type": "\"sm\"|\"md\"|\"lg\"", "default": "md" },
    { "name": "lightbox", "type": "boolean", "default": true } ],
  "slots": [ { "name": "items", "description": "gallery <figure> items" } ] }
```

**(b) JSON Schema** (what the AI must satisfy; auto-derived from the CEM):

```jsonc
{ "type": "object", "required": ["items"],
  "properties": {
    "layout":  { "enum": ["grid","masonry","carousel"], "default": "grid" },
    "columns": { "enum": [2,3,4], "default": 3 },
    "gap":     { "enum": ["sm","md","lg"], "default": "md" },
    "lightbox":{ "type": "boolean", "default": true },
    "items":   { "type": "array", "maxItems": 60, "items": {
      "type": "object", "required": ["mediaId","alt"],
      "properties": { "mediaId": { "type": "string" },   // → R2 object, uploaded via UI
                      "alt": { "type": "string" }, "caption": { "type": "string" } } } } } }
```

**(c) Manifest snippet the AI emits:**

```json
{ "id": "gal_1", "type": "gallery", "visible": true,
  "config": { "layout": "masonry", "columns": 3, "lightbox": true,
    "items": [ { "mediaId": "m_a1", "alt": "Studio, morning light" },
               { "mediaId": "m_b2", "alt": "Ceramic bowls" } ] } }
```

**(d) SSR output** (static HTML at publish; inherits design tokens; no framework):

```html
<section class="x-gallery x-gallery--masonry" data-cols="3" aria-label="Gallery">
  <figure><img src="/media/m_a1.avif" alt="Studio, morning light" loading="lazy" width="800" height="1000"></figure>
  <figure><img src="/media/m_b2.avif" alt="Ceramic bowls" loading="lazy" width="800" height="800"></figure>
</section>
<script type="module" src="/_island/lightbox.js" data-for="x-gallery"></script>  <!-- only if lightbox:true -->
```

**(e) Chat edit hook** — "make it 2 columns and turn off the popup":
```
updateBlock("gal_1", { columns: 2, lightbox: false })
```
Validated → applied → version++ → re-render. Media upload stays a UI action; the
AI references already-uploaded `mediaId`s (or inserts placeholders + asks).

---

## 5. Block end-to-end #2 — `contact-form` with captcha (dynamic)

**(a) JSON Schema:**
```jsonc
{ "type": "object", "required": ["fields","recipient"],
  "properties": {
    "recipient":     { "type": "string", "format": "email" },   // owner-verified, server-side
    "captcha":       { "enum": ["turnstile","none"], "default": "turnstile" },
    "submitLabel":   { "type": "string", "default": "Send" },
    "successMessage":{ "type": "string", "default": "Thanks — we'll be in touch." },
    "fields": { "type": "array", "minItems": 1, "maxItems": 12, "items": {
      "type": "object", "required": ["name","label","type"],
      "properties": { "name": { "type": "string" }, "label": { "type": "string" },
        "type": { "enum": ["text","email","tel","textarea","select","checkbox"] },
        "required": { "type": "boolean", "default": false },
        "options": { "type": "array", "items": { "type": "string" } } } } } } }
```

**(b) SSR output** — posts to the **per-site runtime**, with a Turnstile widget:
```html
<form class="x-contact-form" method="post" action="/_api/forms/{siteId}/cf_1">
  <label>Name <input name="name" required></label>
  <label>Email <input name="email" type="email" required></label>
  <label>Message <textarea name="message" required></textarea></label>
  <div class="cf-turnstile" data-sitekey="{TURNSTILE_SITE_KEY}"></div>   <!-- captcha -->
  <button type="submit">Send</button>
</form>
<script type="module" src="/_island/contact-form.js"></script>  <!-- progressive enhance + Turnstile -->
```

**(c) Runtime** (the real engineering — a Worker/Function endpoint per submission):
1. **Verify captcha** server-side (Turnstile siteverify) — reject bots.
2. **Validate** against the block's field schema (never trust the client).
3. **Rate-limit / abuse-cap** per site + per IP — *reuse the existing rate-limit
   machinery* (`site_limits.ts` pattern).
4. **Store** submission (`sites/{siteId}/submissions`), **notify** owner (email).
5. Return success/`successMessage` (or the error) to the island.

**(d) Chat edit hook** — "add a phone field and send to me@studio.com":
```
updateBlock("cf_1", { recipient: "me@studio.com",
  fields: [ …existing, { name: "phone", label: "Phone", type: "tel" } ] })
```
Config is trivial via chat; the **safety-critical parts (captcha, verify, email,
abuse) live in the vetted block runtime**, not in anything the AI writes.

---

## 6. Static vs. dynamic — what needs a runtime

- **Static blocks** (most of §3): SSR → R2 → served by the existing Worker. No
  new backend.
- **Dynamic blocks** need a **per-site runtime API** (`/_api/*` on the app
  subdomain), each a *vetted* implementation the AI only *configures*:
  - `contact-form`, `newsletter` → submission endpoint + Turnstile + email + store + abuse caps.
  - `blog` → posts store + multi-route rendering (post pages).
  - `chatbot` → LLM endpoint (reuse `callProvider`), **rate-limited & cost-capped**, grounded on site content.
  - `booking`/plugins → OAuth (out-of-band consent) + secret vault + **sandboxed execution (Wasm component model, curated registry)**.

The AI never writes runtime code; it selects a block and fills its typed config.

---

## 7. The AI contract & chat editing

- **Generation:** AI emits a full manifest (design tokens + ordered blocks) from
  a brief — bounded, schema-validated. (Single model call; no agent needed.)
- **Editing/management (chat):** a small tool-calling agent over the manifest —
  `addBlock / updateBlock / removeBlock / moveBlock / setDesignTokens /
  writeBlogPost / configureForm`. Each op validated → applied → `version++`
  (undo/history/draft-vs-publish for free). Config edits run at **low
  temperature**; creative content/design at higher. Not the pi-style coding
  agent — a constrained document agent.
- **Interfaces are auto-generated from components (CEM)** → the AI's menu never
  drifts from the real component library.
- Pair chat with a **direct-manipulation inspector** over the same manifest
  (click a block, edit a field, drag to reorder) — chat for creation/coarse
  moves, inspector for fine control.

---

## 8. Tech choices (deliberate)

- **Components:** Lit or vanilla custom elements, **SSR-able**, output lean
  static HTML + island hydration. **Avoid Angular Elements as the *delivery*
  mechanism** (ships the framework runtime → LCP/SEO tax on static pages);
  frameworks are fine for *authoring* only if you SSR to static.
- **Interface catalog:** Custom Elements Manifest → JSON Schema (single source
  of truth for humans + AI).
- **Captcha:** Cloudflare Turnstile (server-side siteverify).
- **Runtime/data:** Cloudflare Worker `/_api/*` + D1/KV + R2 (media) + Email;
  Durable Objects for chatbot sessions. Firestore stays the authoring store.
- **Plugins:** Wasm Component Model in a **curated/private** registry, later.

---

## 9. Phasing (each phase ships a real capability + de-risks the next)

1. **Block engine** — manifest + design tokens + renderer + SSR; migrate
   generation to emit a manifest; ship static blocks (hero, features,
   services-catalogue, gallery, about, testimonials, faq, cta, contact-details,
   footer, nav). *Unlocks:* section-level chat editing + coherent design.
2. **Chat editor** — the tool-calling document agent + an inspector panel.
3. **First dynamic block: `contact-form` + captcha** — builds the per-site
   runtime backbone (endpoint, Turnstile, email, abuse caps). Newsletter rides along.
4. **Blog** — posts store, multi-route rendering, AI-drafted posts.
5. **Chatbot** — LLM endpoint, rate-limited/cost-capped (reuse existing machinery).
6. **Plugins (Calendar/booking)** — OAuth + secret vault + Wasm sandbox.

**Start-now, long-lead:** the **PSL submission for `wrok.in`** — required before
forms/auth for sibling-subdomain cookie isolation (already flagged in the v1 doc).
