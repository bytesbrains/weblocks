/**
 * Sample config for **every registered brick** — the source of truth behind the
 * published block wall (`example-site.ts` → GitHub Pages).
 *
 * Two sources, in priority order, so realistic copy is written once:
 *   1. `TEMPLATES` — if a starter already places a brick, that placement *is*
 *      the demo. Tuned copy stays in one file and the wall tracks it for free.
 *   2. `SUPPLEMENT` — hand-written config for the types no template happens to
 *      use (chrome, utility, and powered bricks, mostly).
 *
 * `showcaseBlocks()` covering the whole registry is asserted in
 * `showcase.test.ts`, so registering a brick without giving it a demo fails CI —
 * same "generated artefact can't go stale" gate as `catalog-current`.
 */
import type { Block } from './types.js';
import { blockTypes, getSpec } from './registry.js';
import { TEMPLATES } from './templates.js';

const img = (seed: string): string => `https://picsum.photos/seed/${seed}/800/600`;

/** First placement of each type across the starters — realistic copy, already reviewed. */
function fromTemplates(): Map<string, Record<string, unknown>> {
  const out = new Map<string, Record<string, unknown>>();
  for (const t of Object.values(TEMPLATES)) {
    for (const b of t.manifest.blocks) {
      if (b.type && !out.has(b.type)) out.set(b.type, b.config ?? {});
    }
  }
  return out;
}

/**
 * Demo config for types no starter places. Powered bricks (booking,
 * contact-form, newsletter, auth) render inert here — the wall has no host
 * runtime — which is exactly what a reader should see before wiring one.
 */
const SUPPLEMENT: Record<string, Record<string, unknown>> = {
  'app-shell': {
    brand: 'Fieldnote',
    tabs: [
      { label: 'Home', href: '#home', icon: '🏠' },
      { label: 'Search', href: '#search', icon: '🔍' },
      { label: 'Saved', href: '#saved', icon: '🔖' },
      { label: 'Profile', href: '#profile', icon: '👤' },
    ],
  },
  'announcement-bar': {
    text: 'Free delivery on orders over £40 this week.',
    linkLabel: 'Shop now',
    href: '#',
    tone: 'promo',
    dismissible: true,
  },
  'install-prompt': {
    title: 'Add Fieldnote to your home screen',
    body: 'Works offline and opens full-screen, like an app.',
    actionLabel: 'How to install',
    position: 'bottom',
    tone: 'info',
    delayMs: 600,
    dismissible: true,
    rememberDismiss: false,
  },
  sidebar: {
    title: 'Workspace',
    links: [
      { label: 'Overview', href: '#overview', icon: '▦' },
      { label: 'Projects', href: '#projects', icon: '◲' },
      { label: 'Reports', href: '#reports', icon: '◷' },
      { label: 'Settings', href: '#settings', icon: '⚙' },
    ],
  },
  'rich-text': {
    blocks: [
      { kind: 'heading', text: 'How we work' },
      { kind: 'paragraph', text: 'Every project starts with a short discovery call. We map the problem, agree a scope, and only then quote — no open-ended retainers.' },
      { kind: 'subheading', text: 'What you get' },
      { kind: 'bullet', text: 'A named lead for the whole engagement' },
      { kind: 'bullet', text: 'Weekly written updates, no status meetings' },
      { kind: 'bullet', text: 'Source and assets handed over at the end' },
      { kind: 'quote', text: 'They shipped in six weeks what our last agency scoped for six months.' },
    ],
  },
  split: {
    rows: [
      { title: 'Built for the way you actually work', text: 'Import what you already have, keep your file names, and pick up where you left off on any device.', image: img('split-a'), imageAlt: 'A desk with a laptop and notebook' },
      { title: 'Fast by default', text: 'Pages are static HTML with no framework runtime, so they load instantly even on a weak connection.', image: img('split-b'), imageAlt: 'A phone showing a loading page' },
    ],
  },
  menu: {
    title: 'Kitchen',
    subtitle: 'Served noon till late. Ask us about allergens.',
    sections: [
      {
        name: 'Small plates',
        note: 'Two or three per person',
        items: [
          { name: 'Padrón peppers', description: 'Sea salt, lemon.', price: '£6', tags: ['v', 'gf'] },
          { name: 'Crispy squid', description: 'Smoked paprika aioli.', price: '£9' },
        ],
      },
      {
        name: 'Larger',
        items: [
          { name: 'Half chicken', description: 'Charred lemon, garlic butter.', price: '£17' },
          { name: 'Wild mushroom orzo', description: 'Aged parmesan, thyme.', price: '£15', tags: ['v'] },
        ],
      },
    ],
  },
  product: {
    title: 'This season',
    subtitle: 'Made in small runs, restocked rarely.',
    columns: 3,
    items: [
      { name: 'Canvas weekender', description: 'Waxed cotton, leather trim.', price: '£145', was: '£180', image: img('prod-1'), badge: 'Sale', ctaLabel: 'Add to bag', ctaHref: '#' },
      { name: 'Merino crew', description: 'Mid-weight, machine washable.', price: '£85', image: img('prod-2'), ctaLabel: 'Add to bag', ctaHref: '#' },
      { name: 'Field cap', description: 'Six-panel, cotton twill.', price: '£38', image: img('prod-3'), badge: 'New', ctaLabel: 'Add to bag', ctaHref: '#' },
    ],
  },
  carousel: {
    title: 'Around the studio',
    autoplay: false,
    items: [
      { src: img('carousel-1'), alt: 'The workshop floor', caption: 'The workshop, early morning' },
      { src: img('carousel-2'), alt: 'Tools on a bench', caption: 'Everything is made by hand' },
      { src: img('carousel-3'), alt: 'Finished pieces on a shelf', caption: 'Ready to ship' },
    ],
  },
  video: {
    provider: 'youtube',
    src: 'aqz-KE-bpKQ',
    title: 'Big Buck Bunny',
    caption: 'A short film — swap for your own embed or self-hosted file.',
  },
  'video-gallery': {
    title: 'Watch',
    layout: 'grid',
    columns: 3,
    items: [
      { provider: 'youtube', src: 'aqz-KE-bpKQ', title: 'Studio tour' },
      { provider: 'youtube', src: 'aqz-KE-bpKQ', title: 'How it is made' },
      { provider: 'youtube', src: 'aqz-KE-bpKQ', title: 'Customer stories' },
    ],
  },
  map: {
    query: 'Tate Modern, London',
    zoom: 15,
    height: 380,
    label: 'Find us on the South Bank',
  },
  tabs: {
    items: [
      { label: 'Overview', text: 'A short summary of the offer, written for someone who has just landed on the page and knows nothing yet.' },
      { label: 'What is included', text: 'Discovery, design, build, and a handover session. Hosting and domain are billed separately at cost.' },
      { label: 'Timeline', text: 'Most projects run four to eight weeks from kick-off, depending on how much content is ready on day one.' },
    ],
  },
  accordion: {
    title: 'Before you book',
    items: [
      { heading: 'Do you take walk-ins?', body: 'We hold a few tables back each evening, but booking is the only way to be sure.' },
      { heading: 'Is there step-free access?', body: 'Yes — level entry from the street and an accessible WC on the ground floor.' },
      { heading: 'Can you cater for allergies?', body: 'Tell us when you book and the kitchen will talk you through the menu on arrival.' },
    ],
  },
  reviews: {
    title: 'What people say',
    subtitle: 'Verified reviews from the last six months.',
    average: '4.8',
    count: '213',
    source: 'Google',
    items: [
      { rating: 5, quote: 'Booked on a Tuesday, fitted by Thursday. Tidy work and a fair price.', author: 'Marcus D.', date: 'March 2026', source: 'google' },
      { rating: 5, quote: 'Explained every option without pushing the expensive one. Rare.', author: 'Aisha K.', date: 'February 2026', source: 'google' },
      { rating: 4, quote: 'Great job overall, ran about an hour late on the day.', author: 'Tom W.', date: 'January 2026', source: 'trustpilot' },
    ],
  },
  'blog-list': {
    title: 'Journal',
    columns: 3,
    posts: [
      { title: 'Why we stopped shipping a framework', excerpt: 'Static HTML turned out to be the fastest path to a page that loads in under a second.', href: '#', image: img('blog-1'), date: '12 May 2026', tag: 'Engineering' },
      { title: 'A field guide to design tokens', excerpt: 'Colour, type, spacing, radius — and how to keep them coherent across fifty pages.', href: '#', image: img('blog-2'), date: '3 April 2026', tag: 'Design' },
      { title: 'What one year of user interviews taught us', excerpt: 'People do not want more options. They want a good default and a way out.', href: '#', image: img('blog-3'), date: '18 March 2026', tag: 'Research' },
    ],
  },
  'blog-post': {
    title: 'Why we stopped shipping a framework',
    date: '12 May 2026',
    author: 'Dana Okafor',
    cover: img('post-cover'),
    coverAlt: 'A browser window on a desk',
    body: [
      { kind: 'paragraph', text: 'We spent two years convinced the answer was a better component runtime. It was not. The answer was sending less.' },
      { kind: 'heading', text: 'The measurement that changed our minds' },
      { kind: 'paragraph', text: 'On a mid-range Android over 4G, our own marketing page took 4.1 seconds to become interactive. The same content as static HTML took 0.7.' },
      { kind: 'bullet', text: 'No hydration step to wait on' },
      { kind: 'bullet', text: 'No framework bundle to parse' },
      { kind: 'bullet', text: 'Interactivity added per-block, only where it earns its bytes' },
      { kind: 'quote', text: 'Ship the page first. Add JavaScript when a feature cannot exist without it.' },
    ],
  },
  feed: {
    title: 'Latest updates',
    layout: 'cards',
    items: [
      { title: 'Spring timetable is live', subtitle: '2 June', text: 'Twelve new classes across the week, including two early-morning slots.', href: '#', image: img('feed-1'), badge: 'News' },
      { title: 'We are hiring a duty manager', subtitle: '24 May', text: 'Full-time, weekends on rotation. No agencies, please.', href: '#', image: img('feed-2'), badge: 'Jobs' },
      { title: 'Car park resurfacing', subtitle: '9 May', text: 'The rear car park is closed for two weeks. Street parking is free after 6pm.', href: '#', badge: 'Notice' },
    ],
  },
  booking: {
    title: 'Request an appointment',
    intro: 'Tell us when suits and we will confirm by email within one working day.',
    submitLabel: 'Request booking',
    successMessage: 'Thanks — we will confirm shortly.',
    serviceLabel: 'Service',
    services: [
      { name: 'Consultation', duration: '30 min', price: 'Free' },
      { name: 'Full service', duration: '90 min', price: '£120' },
      { name: 'Follow-up', duration: '45 min', price: '£60' },
    ],
    askDate: true,
    askTime: true,
    askParty: false,
    askPhone: true,
    askNotes: true,
    notesLabel: 'Anything we should know?',
  },
  'contact-form': {
    title: 'Get in touch',
    intro: 'We reply to everything, usually the same day.',
    submitLabel: 'Send message',
    successMessage: 'Thanks — your message is on its way.',
    fields: [
      { name: 'name', label: 'Your name', type: 'text', placeholder: 'Alex Morgan', required: true },
      { name: 'email', label: 'Email', type: 'email', placeholder: 'alex@example.com', required: true },
      { name: 'topic', label: 'What is it about?', type: 'select', options: ['New project', 'Existing project', 'Something else'] },
      { name: 'message', label: 'Message', type: 'textarea', placeholder: 'A sentence or two is plenty.', required: true },
      { name: 'consent', label: 'You may email me about this enquiry', type: 'checkbox' },
    ],
  },
  newsletter: {
    title: 'One email a month',
    intro: 'New work, occasional writing, nothing else. Unsubscribe in one click.',
    placeholder: 'you@example.com',
    submitLabel: 'Subscribe',
    successMessage: 'Check your inbox to confirm.',
  },
  search: {
    layout: 'bar',
    placeholder: 'Search the site…',
    label: 'Search',
    buttonLabel: 'Search',
    name: 'q',
    align: 'center',
  },
  auth: {
    mode: 'signin',
    title: 'Sign in to your account',
    providers: [
      { label: 'Continue with Google', provider: 'google' },
      { label: 'Continue with GitHub', provider: 'github' },
    ],
    showEmail: true,
  },
  'social-links': {
    title: 'Follow along',
    layout: 'row',
    variant: 'labeled',
    align: 'center',
    links: [
      { platform: 'instagram', href: 'https://instagram.com/', label: 'Instagram' },
      { platform: 'x', href: 'https://x.com/', label: 'X' },
      { platform: 'github', href: 'https://github.com/bytesbrains/weblocks', label: 'GitHub' },
      { platform: 'linkedin', href: 'https://linkedin.com/', label: 'LinkedIn' },
    ],
  },
  hours: {
    title: 'Opening hours',
    timezone: 'Europe/London',
    note: 'Last orders 30 minutes before close. Closed bank holidays.',
    days: [
      { day: 'mon', closed: true },
      { day: 'tue', open: '09:00', close: '17:30' },
      { day: 'wed', open: '09:00', close: '17:30' },
      { day: 'thu', open: '09:00', close: '20:00' },
      { day: 'fri', open: '09:00', close: '20:00' },
      { day: 'sat', open: '10:00', close: '14:00' },
      { day: 'sat', open: '16:00', close: '22:00' },
      { day: 'sun', open: '11:00', close: '16:00' },
    ],
  },
  directions: {
    title: 'How to find us',
    place: 'Tate Modern',
    address: 'Bankside, London SE1 9TG',
    lat: '51.5076',
    lng: '-0.0994',
    directionsLabel: 'Get directions',
    appleMaps: true,
  },
  legal: {
    title: 'Legal',
    align: 'center',
    separator: '·',
    documents: [
      { label: 'Terms', title: 'Terms of service', content: 'These are placeholder terms. Replace this text with your own before publishing — the dialog scrolls, so length is not a problem.' },
      { label: 'Privacy', title: 'Privacy policy', content: 'Placeholder privacy policy. Describe what you collect, why, how long you keep it, and how someone asks for it to be deleted.' },
      { label: 'Cookies', title: 'Cookie notice', content: 'Placeholder cookie notice. A static weblocks page sets no cookies of its own; anything here comes from embeds you add.' },
    ],
  },
  divider: { style: 'gradient' },
  spacer: { size: 'lg' },
  copyright: {
    holder: 'Fieldnote Ltd',
    text: 'All rights reserved.',
    showSymbol: true,
    align: 'center',
  },
};

export interface ShowcaseEntry {
  type: string;
  /** One-line brick description, straight from the registry. */
  description: string;
  config: Record<string, unknown>;
  /** Where the demo config came from — surfaced on the wall for provenance. */
  source: 'template' | 'supplement';
  /** Island module this brick hydrates with, if any (`null` for static bricks). */
  island: string | null;
  /** True when the island is host-served, so it stays inert without a runtime. */
  powered: boolean;
}

/** Every registered brick with demo config, in registry order. */
export function showcaseBlocks(): ShowcaseEntry[] {
  const harvested = fromTemplates();
  const out: ShowcaseEntry[] = [];
  for (const type of blockTypes()) {
    const spec = getSpec(type);
    if (!spec) continue;
    const config = harvested.get(type) ?? SUPPLEMENT[type];
    if (!config) continue; // absent ⇒ showcase.test.ts fails
    out.push({
      type,
      description: spec.description ?? '',
      config,
      source: harvested.has(type) ? 'template' : 'supplement',
      island: spec.island ?? null,
      powered: (spec.runtime?.capabilities?.length ?? 0) > 0,
    });
  }
  return out;
}

/** A one-block manifest, so each brick can be rendered on its own page. */
export function showcaseManifest(entry: ShowcaseEntry, design?: unknown): Record<string, unknown> {
  const block: Block = { id: entry.type, type: entry.type, visible: true, config: entry.config };
  return {
    meta: { title: `${entry.type} — weblocks`, description: entry.description, lang: 'en' },
    design,
    blocks: [block],
    version: 1,
  };
}
