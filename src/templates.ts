/**
 * Named **starter templates** (§ weblocks#31) — complete, valid `SiteManifest`s
 * with realistic placeholder copy and a fitting preset baked in.
 *
 * They serve two callers from ONE source of truth: a host can render a template
 * as an instant, zero-LLM starter/preview a user picks from, and generation can
 * seed a template as a scaffold to personalise ("keep this structure, rewrite
 * the copy for THIS business"). Every manifest here passes `validateManifest`
 * (asserted in `templates.test.ts`) and renders to a complete document
 * (`example-templates.ts` writes them all out).
 *
 * This module is the **registry** only — the templates themselves live one file
 * per vertical under `./templates/`, and each declares itself with `tpl()` from
 * `./templates/_helpers.js`. To add one: append to its vertical's array (or add
 * a module and list it below). Nothing else needs touching.
 *
 * Templates are filterable on three axes, so a picker can ask different
 * questions of the same set:
 *   - `vertical` — what KIND of business/person it is (`verticalNames()`)
 *   - `layout`   — what SHAPE the page takes (`TemplateLayout`), so a user can
 *                  ask for "the same business, a different look"
 *   - `tags`     — free facets (`pets`, `booking`, `dark`, `one-pager`, …)
 *
 * Additive + stable: add templates/variants freely; do NOT rename existing ids —
 * hosts persist them. Placeholder images use a neutral remote service so a
 * rendered starter looks real; hosts/users swap them.
 */
import type { Template } from './templates/_helpers.js';
import { restaurantTemplates } from './templates/restaurant.js';
import { retailTemplates } from './templates/retail.js';
import { salonTemplates } from './templates/salon.js';
import { fitnessTemplates } from './templates/fitness.js';
import { educationTemplates } from './templates/education.js';
import { healthcareTemplates } from './templates/healthcare.js';
import { manufacturingTemplates } from './templates/manufacturing.js';
import { ecommerceTemplates } from './templates/ecommerce.js';
import { serviceTemplates } from './templates/service.js';
import { franchiseTemplates } from './templates/franchise.js';
import { hospitalityTemplates } from './templates/hospitality.js';
import { realestateTemplates } from './templates/realestate.js';
import { personalTemplates } from './templates/personal.js';
import { techTemplates } from './templates/tech.js';
import { eventsTemplates } from './templates/events.js';
import { nonprofitTemplates } from './templates/nonprofit.js';
import { creatorTemplates } from './templates/creator.js';
import { blogTemplates } from './templates/blog.js';
import { careTemplates } from './templates/care.js';
import { tradesTemplates } from './templates/trades.js';
import { transportTemplates } from './templates/transport.js';
import { professionalTemplates } from './templates/professional.js';
import { otherTemplates } from './templates/other.js';

export type { Template, TemplateLayout } from './templates/_helpers.js';

/** Registration order = the order a picker shows them in, business-first. */
const ALL: readonly Template[] = [
  ...restaurantTemplates,
  ...retailTemplates,
  ...salonTemplates,
  ...fitnessTemplates,
  ...educationTemplates,
  ...healthcareTemplates,
  ...manufacturingTemplates,
  ...ecommerceTemplates,
  ...serviceTemplates,
  ...tradesTemplates,
  ...transportTemplates,
  ...careTemplates,
  ...professionalTemplates,
  ...franchiseTemplates,
  ...hospitalityTemplates,
  ...realestateTemplates,
  ...techTemplates,
  ...eventsTemplates,
  ...nonprofitTemplates,
  ...personalTemplates,
  ...creatorTemplates,
  ...blogTemplates,
  ...otherTemplates,
];

/**
 * Built by folding `ALL` into a map. A duplicate id would silently shadow an
 * earlier template (and break the "never rename an id" contract from the other
 * side), so it throws at import time rather than shipping a half-registry.
 */
export const TEMPLATES: Readonly<Record<string, Template>> = Object.freeze(
  ALL.reduce<Record<string, Template>>((acc, t) => {
    if (acc[t.id]) throw new Error(`duplicate template id: ${t.id}`);
    acc[t.id] = t;
    return acc;
  }, {}),
);

/** All template ids. */
export function templateNames(): string[] {
  return Object.keys(TEMPLATES);
}

/** Templates for a vertical id (may be empty for an unknown vertical). */
export function templatesForVertical(vertical: string): Template[] {
  return ALL.filter((t) => t.vertical === vertical);
}

/** Templates sharing a page shape, across every vertical. */
export function templatesForLayout(layout: string): Template[] {
  return ALL.filter((t) => t.layout === layout);
}

/** Templates carrying a tag (exact match on the lowercase-kebab facet). */
export function templatesByTag(tag: string): Template[] {
  return ALL.filter((t) => t.tags.includes(tag));
}

/** Every tag in use, sorted — the vocabulary a host can build a filter UI from. */
export function templateTags(): string[] {
  return [...new Set(ALL.flatMap((t) => t.tags))].sort();
}

/** A template by id, or `undefined`. */
export function getTemplate(id: string): Template | undefined {
  return TEMPLATES[id];
}
