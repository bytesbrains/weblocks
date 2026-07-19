/**
 * Named **starter templates** (§ weblocks#31) — complete, valid `SiteManifest`s
 * per vertical, with realistic placeholder copy and a fitting preset baked in.
 *
 * They serve two callers from ONE source of truth: a host can render a template
 * as an instant, zero-LLM starter/preview a user picks from, and generation can
 * seed a template as a scaffold to personalise ("keep this structure, rewrite
 * the copy for THIS business"). Every manifest here passes `validateManifest`
 * (asserted in `templates.test.ts`) and renders to a complete document
 * (`example-templates.ts` writes them all out).
 *
 * Additive + stable: add templates/variants freely; don't rename existing ids.
 * Design tokens come from the vertical's fitting preset (`getPreset`) so a
 * started site is coherent out of the box. Placeholder images use a neutral
 * remote service so a rendered starter looks real; hosts/users swap them.
 *
 * This ships one template per vertical (rollout step 1 of weblocks#31); add
 * 2–3 variants for the high-traffic verticals next.
 */
import type { SiteManifest, Block } from './types.js';
import { getPreset } from './presets.js';
import { DEFAULT_TOKENS } from './tokens.js';

export interface Template {
  /** Stable id, e.g. `restaurant-modern`. */
  id: string;
  /** A `verticalNames()` value this template belongs to. */
  vertical: string;
  /** Human label for a picker. */
  label: string;
  /** Complete, `validateManifest`-clean manifest with realistic copy. */
  manifest: SiteManifest;
}

const img = (seed: string): string => `https://picsum.photos/seed/${seed}/800/600`;

/** Assemble a manifest from a preset name + meta + blocks (keeps each template terse). */
function manifest(preset: string, meta: SiteManifest['meta'], blocks: Block[]): SiteManifest {
  return { meta, design: getPreset(preset) ?? DEFAULT_TOKENS, blocks, version: 1 };
}

/** A visible block with an explicit id (all template blocks are visible). */
const b = (id: string, type: string, config: Record<string, unknown>): Block => ({ id, type, visible: true, config });

// ── restaurant ───────────────────────────────────────────────────────────────
const restaurantModern = manifest('sand',
  { title: 'Brew & Bloom — Neighbourhood Café', description: 'Specialty coffee, fresh bakes, and a warm corner to slow down.', lang: 'en', favicon: '☕' },
  [
    b('nav', 'nav', { brand: 'Brew & Bloom', sticky: true, links: [{ label: 'Menu', href: '#menu' }, { label: 'Gallery', href: '#gallery' }, { label: 'Visit', href: '#visit' }], cta: { label: 'Order online', href: '#' } }),
    b('hero', 'hero', { eyebrow: 'Open daily · 7am', headline: 'Coffee worth slowing down for', subhead: 'Small-batch roasts, all-butter pastries, and a seat by the window.', align: 'center', minHeight: 'lg', image: img('cafe-hero'), overlay: 'scrim', cta: { label: 'See the menu', href: '#menu' } }),
    b('menu', 'services-catalogue', { title: 'Menu', subtitle: 'Roasted in-house, baked this morning.', items: [
      { name: 'Flat White', description: 'Double ristretto, silky microfoam.', price: '£3.40' },
      { name: 'Filter of the day', description: 'Rotating single origin, pour-over.', price: '£3.20' },
      { name: 'Almond croissant', description: 'Twice-baked, frangipane.', price: '£3.80' },
      { name: 'Avocado toast', description: 'Sourdough, chilli, lime.', price: '£7.50' },
    ] }),
    b('gallery', 'gallery', { layout: 'grid', columns: 3, gap: 'md', lightbox: true, items: [{ src: img('cafe-1'), alt: 'Latte art' }, { src: img('cafe-2'), alt: 'Pastry case' }, { src: img('cafe-3'), alt: 'Window seat' }] }),
    b('reviews', 'testimonials', { title: 'Regulars say', items: [
      { quote: 'The best flat white on this side of town.', author: 'Priya', role: 'Local' },
      { quote: 'My default work-from-café. Fast wifi, kind staff.', author: 'Tom', role: 'Regular' },
    ] }),
    b('visit', 'contact-details', { title: 'Visit us', address: '18 Marsh Lane, Bristol BS1 2AB', phone: '+44 117 000 0000', email: 'hello@brewandbloom.cafe', hours: 'Mon–Fri 7:00–18:00 · Sat–Sun 8:00–17:00' }),
    b('cta', 'cta', { headline: 'Booking a table for a group?', subhead: 'We hold the big table for parties of six or more.', background: 'primary', button: { label: 'Reserve', href: '#' } }),
    b('footer', 'footer', { brand: 'Brew & Bloom', tagline: 'Neighbourhood café since 2019.', links: [{ label: 'Menu', href: '#menu' }, { label: 'Instagram', href: '#' }], copyright: '© Brew & Bloom' }),
  ],
);

// ── retail ───────────────────────────────────────────────────────────────────
const retailBoutique = manifest('sand',
  { title: 'Fern & Oak — Homeware & Gifts', description: 'A little shop of well-made homeware, plants, and local gifts.', lang: 'en', favicon: '🪴' },
  [
    b('nav', 'nav', { brand: 'Fern & Oak', sticky: true, links: [{ label: 'Shop', href: '#shop' }, { label: 'Gallery', href: '#gallery' }, { label: 'Visit', href: '#visit' }], cta: { label: 'Visit the shop', href: '#visit' } }),
    b('hero', 'hero', { eyebrow: 'On the high street', headline: 'Well-made things for a home you love', subhead: 'Ceramics, candles, houseplants, and cards — hand-picked from local makers.', align: 'left', minHeight: 'md', image: img('shop-hero'), overlay: 'light', cta: { label: 'What we stock', href: '#shop' } }),
    b('gallery', 'gallery', { layout: 'masonry', columns: 3, gap: 'md', lightbox: true, items: [{ src: img('shop-1'), alt: 'Shelf of ceramics' }, { src: img('shop-2'), alt: 'Candles' }, { src: img('shop-3'), alt: 'Plants by the window' }, { src: img('shop-4'), alt: 'Greeting cards' }] }),
    b('shop', 'services-catalogue', { title: 'What we stock', subtitle: 'A rotating edit — pop in to see this week’s finds.', items: [
      { name: 'Stoneware mugs', description: 'Hand-thrown, dishwasher-safe.', price: 'from £16' },
      { name: 'Soy candles', description: 'Small-batch, 40-hour burn.', price: '£22' },
      { name: 'Houseplants', description: 'Potted and ready to gift.', price: 'from £9' },
      { name: 'Local art cards', description: 'Blank inside, recycled stock.', price: '£3.50' },
    ] }),
    b('reviews', 'testimonials', { title: 'Loved by locals', items: [
      { quote: 'My go-to for a thoughtful gift. Always something lovely.', author: 'Hannah', role: 'Customer' },
      { quote: 'Beautifully curated and the staff really know their makers.', author: 'Dev', role: 'Regular' },
    ] }),
    b('visit', 'contact-details', { title: 'Come say hello', address: '5 Church Street, York YO1 8BE', phone: '+44 1904 000 000', email: 'hello@fernandoak.shop', hours: 'Tue–Sat 9:30–17:30 · Sun 11:00–16:00' }),
    b('footer', 'footer', { brand: 'Fern & Oak', tagline: 'Well-made homeware & gifts.', links: [{ label: 'Shop', href: '#shop' }, { label: 'Instagram', href: '#' }], copyright: '© Fern & Oak' }),
  ],
);

// ── salon (booking) ──────────────────────────────────────────────────────────
const salonSpa = manifest('candy',
  { title: 'Lumière — Salon & Spa', description: 'Hair, skin, and nails in a calm, unhurried studio.', lang: 'en', favicon: '💇' },
  [
    b('nav', 'nav', { brand: 'Lumière', sticky: true, links: [{ label: 'Services', href: '#services' }, { label: 'Gallery', href: '#gallery' }, { label: 'Visit', href: '#visit' }], cta: { label: 'Book now', href: '#book' } }),
    b('hero', 'hero', { eyebrow: 'By appointment', headline: 'An hour that’s all about you', subhead: 'Expert cuts, colour, facials, and nails — in an unhurried, calming studio.', align: 'center', minHeight: 'lg', image: img('salon-hero'), overlay: 'scrim', cta: { label: 'Book an appointment', href: '#book' } }),
    b('services', 'services-catalogue', { title: 'Services', subtitle: 'Every visit starts with a proper consultation.', items: [
      { name: 'Cut & finish', description: 'Consultation, cut, wash, style.', price: 'from £45' },
      { name: 'Colour', description: 'Gloss, balayage, or full colour.', price: 'from £70' },
      { name: 'Signature facial', description: '60 minutes, tailored to your skin.', price: '£65' },
      { name: 'Gel manicure', description: 'Shape, cuticle care, long-wear gel.', price: '£30' },
    ] }),
    b('gallery', 'gallery', { layout: 'grid', columns: 3, gap: 'md', lightbox: true, items: [{ src: img('salon-1'), alt: 'Styling chair' }, { src: img('salon-2'), alt: 'Colour work' }, { src: img('salon-3'), alt: 'Treatment room' }] }),
    b('reviews', 'testimonials', { title: 'From the chair', items: [
      { quote: 'Best colour I’ve had in years — and it grew out beautifully.', author: 'Sofia', role: 'Client' },
      { quote: 'Genuinely relaxing. I book my next one before I leave.', author: 'Amara', role: 'Regular' },
    ] }),
    b('visit', 'contact-details', { title: 'Find the studio', address: '22 Wellington Row, Bath BA1 2QP', phone: '+44 1225 000 000', email: 'hello@lumiere.salon', hours: 'Tue–Sat 9:00–18:00' }),
    b('book', 'cta', { headline: 'Ready for a little time out?', subhead: 'Book online in under a minute, or message us.', background: 'primary', button: { label: 'Book an appointment', href: '#' } }),
    b('footer', 'footer', { brand: 'Lumière', tagline: 'Salon & spa.', links: [{ label: 'Services', href: '#services' }, { label: 'Book', href: '#book' }], copyright: '© Lumière' }),
  ],
);

// ── fitness (booking) ────────────────────────────────────────────────────────
const fitnessGym = manifest('midnight',
  { title: 'Ironwood Strength', description: 'A no-nonsense strength gym with real coaching.', lang: 'en', favicon: '🏋️' },
  [
    b('nav', 'nav', { brand: 'Ironwood', sticky: true, links: [{ label: 'Training', href: '#training' }, { label: 'Membership', href: '#membership' }, { label: 'Coaches', href: '#coaches' }], cta: { label: 'Start free trial', href: '#join' } }),
    b('hero', 'hero', { eyebrow: 'Strength & conditioning', headline: 'Get strong. For real this time.', subhead: 'Coached small-group sessions and a floor built for lifting — not selfies.', align: 'center', minHeight: 'lg', image: img('gym-hero'), overlay: 'dark', cta: { label: 'Book a free session', href: '#join' } }),
    b('training', 'features', { title: 'How we train', columns: 3, items: [
      { icon: '🏋️', title: 'Small-group strength', text: 'Max 6 per session, coached every rep.' },
      { icon: '📈', title: 'Real progression', text: 'Your numbers tracked week to week.' },
      { icon: '🧑‍🏫', title: 'Proper coaching', text: 'Certified coaches, no ego, all form.' },
    ] }),
    b('membership', 'pricing', { title: 'Membership', subtitle: 'No joining fee. Cancel anytime.', plans: [
      { name: 'Off-peak', price: '£39', period: '/mo', features: ['Weekdays before 4pm', 'All group sessions', 'App programming'], ctaLabel: 'Choose', ctaHref: '#join' },
      { name: 'Full', price: '£59', period: '/mo', features: ['Anytime access', 'All group sessions', 'App programming', 'Monthly check-in'], ctaLabel: 'Choose', ctaHref: '#join', featured: true },
      { name: '1:1 coaching', price: '£120', period: '/mo', features: ['Everything in Full', 'Weekly 1:1 session', 'Bespoke programming'], ctaLabel: 'Enquire', ctaHref: '#join' },
    ] }),
    b('coaches', 'team', { title: 'Your coaches', columns: 3, members: [
      { name: 'Marcus Bell', role: 'Head Coach', photo: img('coach-1'), bio: 'S&C coach, 10 years. Powerlifting background.' },
      { name: 'Nadia Hart', role: 'Coach', photo: img('coach-2'), bio: 'Weightlifting and mobility specialist.' },
      { name: 'Theo Fyfe', role: 'Coach', photo: img('coach-3'), bio: 'Conditioning and return-to-training.' },
    ] }),
    b('reviews', 'testimonials', { title: 'Member results', items: [
      { quote: 'Added 40kg to my deadlift in a year and my back stopped hurting.', author: 'James', role: 'Member, 1yr' },
      { quote: 'First gym I’ve actually stuck with. The coaching is the difference.', author: 'Leah', role: 'Member' },
    ] }),
    b('join', 'cta', { headline: 'Your first session is on us', subhead: 'Book a free intro and try a coached session — no pressure.', background: 'primary', button: { label: 'Book a free session', href: '#' } }),
    b('visit', 'contact-details', { title: 'Find the gym', address: 'Unit 7, Dock Road, Liverpool L3 4EN', phone: '+44 151 000 0000', email: 'train@ironwood.gym', hours: 'Mon–Fri 6:00–21:00 · Sat–Sun 8:00–14:00' }),
    b('footer', 'footer', { brand: 'Ironwood Strength', tagline: 'Coached strength training.', links: [{ label: 'Membership', href: '#membership' }, { label: 'Trial', href: '#join' }], copyright: '© Ironwood Strength' }),
  ],
);

// ── education ────────────────────────────────────────────────────────────────
const educationAcademy = manifest('ocean',
  { title: 'Bright Minds — Tutoring & Coaching', description: 'One-to-one tutoring that builds confidence, not just grades.', lang: 'en', favicon: '🎓' },
  [
    b('nav', 'nav', { brand: 'Bright Minds', sticky: true, links: [{ label: 'Subjects', href: '#subjects' }, { label: 'How it works', href: '#how' }, { label: 'Pricing', href: '#pricing' }], cta: { label: 'Book a free trial', href: '#contact' } }),
    b('hero', 'hero', { eyebrow: 'Ages 8–18', headline: 'Confidence that shows up on results day', subhead: 'Personal tutoring in maths, English, and science — online or in person.', align: 'left', minHeight: 'md', image: img('edu-hero'), overlay: 'light', cta: { label: 'Book a free trial lesson', href: '#contact' } }),
    b('subjects', 'features', { title: 'What we teach', columns: 3, items: [
      { icon: '➗', title: 'Maths', text: 'KS2 to A-level, exam boards covered.' },
      { icon: '📖', title: 'English', text: 'Reading, writing, and comprehension.' },
      { icon: '🔬', title: 'Science', text: 'Biology, chemistry, and physics.' },
    ] }),
    b('how', 'steps', { title: 'How it works', items: [
      { title: 'Free trial lesson', text: 'We assess, listen, and set a plan together.' },
      { title: 'Weekly sessions', text: 'A matched tutor, same time each week.' },
      { title: 'Progress reports', text: 'Short written updates after every block.' },
    ] }),
    b('pricing', 'pricing', { title: 'Simple pricing', subtitle: 'Pay per lesson. No contracts.', plans: [
      { name: 'Primary', price: '£28', period: '/lesson', features: ['KS1–KS2', '55 minutes', 'Online or in person'], ctaLabel: 'Enquire', ctaHref: '#contact' },
      { name: 'Secondary', price: '£34', period: '/lesson', features: ['KS3–GCSE', '55 minutes', 'Exam-board aligned'], ctaLabel: 'Enquire', ctaHref: '#contact', featured: true },
      { name: 'A-level', price: '£42', period: '/lesson', features: ['Specialist tutors', '60 minutes', 'Past-paper focus'], ctaLabel: 'Enquire', ctaHref: '#contact' },
    ] }),
    b('faq', 'faq', { title: 'Questions, answered', items: [
      { question: 'Online or in person?', answer: 'Both — most families mix the two week to week.' },
      { question: 'Do you follow our exam board?', answer: 'Yes. Tell us the board and we align to its spec.' },
    ] }),
    b('reviews', 'testimonials', { title: 'Parents & students', items: [
      { quote: 'Went from a 4 to a 7 in maths, but the confidence was the real win.', author: 'The Osei family', role: 'GCSE' },
      { quote: 'My tutor made me actually enjoy English. Never thought I’d say that.', author: 'Ruby', role: 'Student' },
    ] }),
    b('cta', 'cta', { headline: 'The first lesson is free', subhead: 'See if it’s a fit — no cost, no commitment.', background: 'primary', button: { label: 'Book a free trial', href: '#contact' } }),
    b('contact', 'contact-details', { title: 'Get in touch', address: 'Online & across Manchester', phone: '+44 161 000 0000', email: 'hello@brightminds.tutoring', hours: 'Mon–Fri 9:00–19:00' }),
    b('footer', 'footer', { brand: 'Bright Minds', tagline: 'Tutoring & coaching.', links: [{ label: 'Subjects', href: '#subjects' }, { label: 'Pricing', href: '#pricing' }], copyright: '© Bright Minds' }),
  ],
);

// ── healthcare (booking) ─────────────────────────────────────────────────────
const healthcareClinic = manifest('ocean',
  { title: 'Maple Dental — Gentle, modern dentistry', description: 'Family and cosmetic dentistry with same-week appointments.', lang: 'en', favicon: '🦷' },
  [
    b('nav', 'nav', { brand: 'Maple Dental', sticky: true, links: [{ label: 'Treatments', href: '#treatments' }, { label: 'Team', href: '#team' }, { label: 'FAQ', href: '#faq' }], cta: { label: 'Book appointment', href: '#book' } }),
    b('hero', 'hero', { eyebrow: 'Accepting new patients', headline: 'Dentistry that actually feels calm', subhead: 'Same-week appointments, transparent pricing, and a team that explains everything.', align: 'left', minHeight: 'md', image: img('clinic-hero'), overlay: 'light', cta: { label: 'Book an appointment', href: '#book' } }),
    b('treatments', 'services-catalogue', { title: 'Treatments', subtitle: 'Clear pricing, no surprises.', items: [
      { name: 'Check-up & clean', description: 'Exam, scale & polish.', price: 'from £59' },
      { name: 'Teeth whitening', description: 'Take-home or in-chair.', price: 'from £249' },
      { name: 'Invisible aligners', description: 'Full treatment plan.', price: 'from £1,800' },
      { name: 'Emergency visit', description: 'Same-day where possible.', price: 'from £75' },
    ] }),
    b('team', 'team', { title: 'Meet the team', columns: 3, members: [
      { name: 'Dr. Aisha Khan', role: 'Principal Dentist', photo: img('doc-1'), bio: 'BDS · 12 years · cosmetic & restorative.' },
      { name: 'Dr. Leo Marsh', role: 'Dentist', photo: img('doc-2'), bio: 'Aligners and family dentistry.' },
      { name: 'Sam Rivera', role: 'Hygienist', photo: img('doc-3'), bio: 'Preventive care and nervous patients.' },
    ] }),
    b('faq', 'faq', { title: 'Questions, answered', items: [
      { question: 'Do you take new patients?', answer: 'Yes — both private and plan patients, usually within the week.' },
      { question: 'Nervous about the dentist?', answer: 'Tell us when you book. We build in extra time and go at your pace.' },
    ] }),
    b('book', 'cta', { headline: 'Ready when you are', subhead: 'Book online in under a minute, or call us.', background: 'primary', button: { label: 'Book an appointment', href: '#' } }),
    b('visit', 'contact-details', { title: 'Find us', address: '4 Elm Court, Leeds LS1 4DL', phone: '+44 113 000 0000', email: 'hello@mapledental.co.uk', hours: 'Mon–Fri 8:30–17:30 · Sat 9:00–13:00' }),
    b('footer', 'footer', { brand: 'Maple Dental', tagline: 'Gentle, modern dentistry.', links: [{ label: 'Treatments', href: '#treatments' }, { label: 'Book', href: '#book' }], copyright: '© Maple Dental' }),
  ],
);

// ── manufacturing ────────────────────────────────────────────────────────────
const manufacturingIndustrial = manifest('ocean',
  { title: 'Vantage Precision — Contract Manufacturing', description: 'CNC machining and precision assembly for demanding industries.', lang: 'en', favicon: '⚙️' },
  [
    b('nav', 'nav', { brand: 'Vantage Precision', sticky: true, links: [{ label: 'Capabilities', href: '#capabilities' }, { label: 'Sectors', href: '#sectors' }, { label: 'Contact', href: '#contact' }], cta: { label: 'Request a quote', href: '#contact' } }),
    b('hero', 'hero', { eyebrow: 'ISO 9001 certified', headline: 'Precision parts, delivered on time', subhead: 'CNC machining, fabrication, and assembly for aerospace, medical, and automotive.', align: 'left', minHeight: 'md', image: img('factory-hero'), overlay: 'dark', cta: { label: 'Request a quote', href: '#contact' } }),
    b('capabilities', 'features', { title: 'Capabilities', columns: 3, items: [
      { icon: '🛠️', title: '5-axis CNC', text: 'Tolerances to ±0.005 mm.' },
      { icon: '🔩', title: 'Assembly', text: 'Sub-assembly and full build.' },
      { icon: '🧪', title: 'Inspection', text: 'CMM and full material traceability.' },
    ] }),
    b('stats', 'stats', { title: 'By the numbers', columns: 4, items: [
      { value: '35', label: 'Years operating', suffix: '+' },
      { value: '99.2', label: 'On-time delivery', suffix: '%' },
      { value: '24', label: 'CNC centres' },
      { value: '3', label: 'Shifts, 24/5' },
    ] }),
    b('logos', 'logos', { title: 'Trusted by', items: [{ src: img('logo-1'), alt: 'Client one' }, { src: img('logo-2'), alt: 'Client two' }, { src: img('logo-3'), alt: 'Client three' }, { src: img('logo-4'), alt: 'Client four' }] }),
    b('sectors', 'services-catalogue', { title: 'Sectors we serve', items: [
      { name: 'Aerospace', description: 'AS9100-aligned processes and traceability.' },
      { name: 'Medical', description: 'Cleanroom assembly and validation support.' },
      { name: 'Automotive', description: 'PPAP and high-volume production runs.' },
    ] }),
    b('contact', 'contact-details', { title: 'Talk to engineering', address: 'Vantage Works, Coventry CV3 4AA', phone: '+44 24 7600 0000', email: 'quotes@vantageprecision.com', hours: 'Mon–Fri 8:00–17:00' }),
    b('footer', 'footer', { brand: 'Vantage Precision', tagline: 'Contract manufacturing.', links: [{ label: 'Capabilities', href: '#capabilities' }, { label: 'Contact', href: '#contact' }], copyright: '© Vantage Precision Ltd' }),
  ],
);

// ── ecommerce ────────────────────────────────────────────────────────────────
const ecommerceShop = manifest('midnight',
  { title: 'Pace Athletics — Run Gear', description: 'Engineered running gear, tested on real roads.', lang: 'en', favicon: '👟' },
  [
    b('nav', 'nav', { brand: 'Pace', sticky: true, links: [{ label: 'Shop', href: '#shop' }, { label: 'Bundles', href: '#bundles' }, { label: 'Reviews', href: '#reviews' }], cta: { label: 'Shop now', href: '#shop' } }),
    b('hero', 'hero', { eyebrow: 'Free shipping over £50', headline: 'Gear that keeps up with you', subhead: 'Lightweight, breathable, and built to last mile after mile.', align: 'center', minHeight: 'lg', image: img('run-hero'), overlay: 'dark', cta: { label: 'Shop the range', href: '#shop' } }),
    b('shop', 'gallery', { layout: 'grid', columns: 4, gap: 'md', lightbox: true, items: [{ src: img('run-1'), alt: 'Tempo tee' }, { src: img('run-2'), alt: 'Split shorts' }, { src: img('run-3'), alt: 'Trail jacket' }, { src: img('run-4'), alt: 'Compression socks' }] }),
    b('why', 'features', { title: 'Why Pace', columns: 3, items: [
      { icon: '🪶', title: 'Feather-light', text: 'Under 90g for the tempo tee.' },
      { icon: '💨', title: 'Stays dry', text: 'Wicking fabric, flatlock seams.' },
      { icon: '♻️', title: 'Made to last', text: 'Recycled fibres, 2-year guarantee.' },
    ] }),
    b('bundles', 'pricing', { title: 'Kit bundles', subtitle: 'Save when you gear up together.', plans: [
      { name: 'Starter', price: '£65', features: ['Tempo tee', 'Split shorts'], ctaLabel: 'Add to bag', ctaHref: '#' },
      { name: 'Race day', price: '£120', features: ['Tempo tee', 'Split shorts', 'Compression socks', 'Cap'], ctaLabel: 'Add to bag', ctaHref: '#', featured: true },
      { name: 'All-weather', price: '£180', features: ['Everything in Race day', 'Trail jacket', 'Gloves'], ctaLabel: 'Add to bag', ctaHref: '#' },
    ] }),
    b('reviews', 'testimonials', { title: '4.8 from 2,000+ runners', items: [
      { quote: 'The shorts are the best I’ve owned. No chafe on a marathon.', author: 'Chris', role: 'Verified buyer' },
      { quote: 'Light, dries fast, and still looks new after a season.', author: 'Mei', role: 'Verified buyer' },
    ] }),
    b('faq', 'faq', { title: 'Shipping & returns', items: [
      { question: 'How fast is delivery?', answer: 'Next-day in the UK on orders before 3pm.' },
      { question: 'What’s your returns policy?', answer: '60-day free returns, no questions asked.' },
    ] }),
    b('cta', 'cta', { headline: 'Ready to run?', subhead: 'Free shipping over £50 and a 60-day return window.', background: 'primary', button: { label: 'Shop now', href: '#shop' } }),
    b('footer', 'footer', { brand: 'Pace Athletics', tagline: 'Engineered run gear.', links: [{ label: 'Shop', href: '#shop' }, { label: 'Returns', href: '#faq' }], copyright: '© Pace Athletics' }),
  ],
);

// ── service ──────────────────────────────────────────────────────────────────
const serviceLocal = manifest('forest',
  { title: 'Reliant Plumbing & Heating', description: 'Local, reliable plumbers — no call-out fee, upfront prices.', lang: 'en', favicon: '🔧' },
  [
    b('nav', 'nav', { brand: 'Reliant', sticky: true, links: [{ label: 'Services', href: '#services' }, { label: 'How it works', href: '#how' }, { label: 'Contact', href: '#contact' }], cta: { label: 'Get a quote', href: '#contact' } }),
    b('hero', 'hero', { eyebrow: 'Gas Safe registered', headline: 'A plumber who turns up when they say', subhead: 'Repairs, boilers, and bathrooms — upfront prices and no call-out fee.', align: 'left', minHeight: 'md', image: img('plumb-hero'), overlay: 'scrim', cta: { label: 'Get a free quote', href: '#contact' } }),
    b('services', 'features', { title: 'What we do', columns: 3, items: [
      { icon: '🚿', title: 'Repairs', text: 'Leaks, taps, toilets, and drains.' },
      { icon: '🔥', title: 'Boilers & heating', text: 'Servicing, repairs, and new installs.' },
      { icon: '🛁', title: 'Bathrooms', text: 'Full fits, project managed.' },
    ] }),
    b('how', 'steps', { title: 'How it works', items: [
      { title: 'Tell us the job', text: 'Call or send a photo — we’ll advise.' },
      { title: 'Fixed quote', text: 'Upfront price before we start.' },
      { title: 'Sorted', text: 'Tidy work, guaranteed for 12 months.' },
    ] }),
    b('chat', 'chat-thread', {
      title: 'Booking a job, start to finish',
      subtitle: 'A real enquiry from last week, lightly trimmed.',
      participants: [
        { id: 'c', name: 'Dan Whitfield', role: 'user' },
        { id: 'r', name: 'Reliant', role: 'agent' },
      ],
      messages: [
        { from: 'c', time: '08:02', body: [{ kind: 'text', text: 'Boiler is making a banging noise and the radiators are cold upstairs. Can someone come today?' }] },
        { from: 'r', time: '08:09', body: [
          { kind: 'text', text: 'Sounds like trapped air or a failing pump. We keep two morning slots free for emergencies — both still open:' },
          { kind: 'list', ordered: false, items: [{ label: '11:00 – 12:00' }, { label: '14:30 – 15:30' }] },
          { kind: 'buttons', items: [{ label: 'Book 11:00', href: '#contact' }, { label: 'Book 14:30', href: '#contact' }] },
        ] },
        { from: 'c', time: '08:11', body: [{ kind: 'text', text: 'Morning one please. What will it cost?' }] },
        { from: 'r', time: '08:12', body: [
          { kind: 'text', text: '£85 for the visit and first hour, parts quoted before we fit anything. No call-out fee on top.' },
          { kind: 'buttons', items: [{ label: 'Confirmed — see you at 11' }] },
        ] },
      ],
    }),
    b('reviews', 'testimonials', { title: 'What neighbours say', items: [
      { quote: 'Fixed our boiler same day and left the kitchen spotless.', author: 'Karen', role: 'Sheffield' },
      { quote: 'Honest, on time, fair price. Booked them for the bathroom next.', author: 'Paul', role: 'Rotherham' },
    ] }),
    b('faq', 'faq', { title: 'Good to know', items: [
      { question: 'Do you charge a call-out fee?', answer: 'No — you only pay for the work, quoted upfront.' },
      { question: 'Are you insured?', answer: 'Fully insured and Gas Safe registered.' },
    ] }),
    b('cta', 'cta', { headline: 'Got a job that needs doing?', subhead: 'Send a message and we’ll come back with a fixed price.', background: 'primary', button: { label: 'Get a quote', href: '#contact' } }),
    b('contact', 'contact-details', { title: 'Get in touch', address: 'Covering Sheffield & Rotherham', phone: '+44 114 000 0000', email: 'jobs@reliantplumbing.co.uk', hours: 'Mon–Sat 7:00–19:00 · 24/7 emergencies' }),
    b('footer', 'footer', { brand: 'Reliant Plumbing & Heating', tagline: 'Local & reliable.', links: [{ label: 'Services', href: '#services' }, { label: 'Contact', href: '#contact' }], copyright: '© Reliant Plumbing & Heating' }),
  ],
);

// ── franchise ────────────────────────────────────────────────────────────────
const franchiseNetwork = manifest('ocean',
  { title: 'SunBowl — Franchise Opportunities', description: 'Own a SunBowl: a proven healthy fast-casual brand.', lang: 'en', favicon: '🥗' },
  [
    b('nav', 'nav', { brand: 'SunBowl', sticky: true, links: [{ label: 'The opportunity', href: '#opportunity' }, { label: 'How it works', href: '#how' }, { label: 'Enquire', href: '#contact' }], cta: { label: 'Request info pack', href: '#contact' } }),
    b('hero', 'hero', { eyebrow: 'Franchising since 2016', headline: 'Own a brand people already love', subhead: 'Join 120+ SunBowl franchisees serving fresh bowls in high streets nationwide.', align: 'center', minHeight: 'lg', image: img('franchise-hero'), overlay: 'scrim', cta: { label: 'Request an info pack', href: '#contact' } }),
    b('stats', 'stats', { title: 'A proven model', columns: 4, items: [
      { value: '120', label: 'Locations', suffix: '+' },
      { value: '18', label: 'Avg. months to break even' },
      { value: '92', label: 'Franchisee retention', suffix: '%' },
      { value: '4.6', label: 'Customer rating', suffix: '★' },
    ] }),
    b('opportunity', 'features', { title: 'Why SunBowl', columns: 3, items: [
      { icon: '📊', title: 'Unit economics that work', text: 'Transparent P&L shared upfront.' },
      { icon: '🧑‍🍳', title: 'Full training', text: '4 weeks of onboarding and support.' },
      { icon: '📣', title: 'National marketing', text: 'Brand campaigns that drive footfall.' },
    ] }),
    b('how', 'steps', { title: 'From enquiry to opening', items: [
      { title: 'Discovery call', text: 'We learn your goals and territory.' },
      { title: 'Approval & site', text: 'We help you secure the right location.' },
      { title: 'Launch', text: 'Fit-out, training, and a supported opening.' },
    ] }),
    b('reviews', 'testimonials', { title: 'From our franchisees', items: [
      { quote: 'Opened my second site within two years. The support is real.', author: 'Ravi', role: 'Franchisee, Bristol' },
      { quote: 'The playbook took the guesswork out of running a food business.', author: 'Elena', role: 'Franchisee, Leeds' },
    ] }),
    b('cta', 'cta', { headline: 'Could this be your next move?', subhead: 'Request the info pack — territories are going fast.', background: 'primary', button: { label: 'Request info pack', href: '#contact' } }),
    b('contact', 'contact-details', { title: 'Talk to the franchise team', address: 'SunBowl HQ, London EC1V 9BW', phone: '+44 20 7000 0000', email: 'franchise@sunbowl.co', hours: 'Mon–Fri 9:00–18:00' }),
    b('footer', 'footer', { brand: 'SunBowl', tagline: 'Franchise opportunities.', links: [{ label: 'Opportunity', href: '#opportunity' }, { label: 'Enquire', href: '#contact' }], copyright: '© SunBowl Ltd' }),
  ],
);

// ── hospitality (booking) ────────────────────────────────────────────────────
const hospitalityHotel = manifest('forest',
  { title: 'The Harbour House Hotel', description: 'A boutique harbourside hotel with sea views and slow mornings.', lang: 'en', favicon: '🏨' },
  [
    b('nav', 'nav', { brand: 'Harbour House', sticky: true, links: [{ label: 'Rooms', href: '#rooms' }, { label: 'Gallery', href: '#gallery' }, { label: 'Visit', href: '#visit' }], cta: { label: 'Check availability', href: '#book' } }),
    b('hero', 'hero', { eyebrow: 'Harbourside · Cornwall', headline: 'Wake up to the water', subhead: 'Sixteen calm rooms, a sea-view terrace, and breakfast worth getting up for.', align: 'center', minHeight: 'full', image: img('hotel-hero'), overlay: 'scrim', cta: { label: 'Check availability', href: '#book' } }),
    b('gallery', 'gallery', { layout: 'grid', columns: 3, gap: 'md', lightbox: true, items: [{ src: img('hotel-1'), alt: 'Sea-view room' }, { src: img('hotel-2'), alt: 'Terrace' }, { src: img('hotel-3'), alt: 'Breakfast' }, { src: img('hotel-4'), alt: 'Harbour at dusk' }] }),
    b('why', 'features', { title: 'The little things', columns: 3, items: [
      { icon: '🌅', title: 'Sea views', text: 'Most rooms face the harbour.' },
      { icon: '🍳', title: 'Proper breakfast', text: 'Local, cooked to order, included.' },
      { icon: '🐾', title: 'Dogs welcome', text: 'Two paws up — beds and bowls provided.' },
    ] }),
    b('rooms', 'services-catalogue', { title: 'Rooms', subtitle: 'Rates per night, breakfast included.', items: [
      { name: 'Snug double', description: 'Cosy, courtyard-facing.', price: 'from £120' },
      { name: 'Harbour double', description: 'Sea view, king bed.', price: 'from £165' },
      { name: 'Captain’s suite', description: 'Corner room, private balcony.', price: 'from £240' },
    ] }),
    b('reviews', 'testimonials', { title: 'From our guests', items: [
      { quote: 'The view from the Harbour double is unreal. We’ll be back.', author: 'The Nolans', role: 'Stayed in June' },
      { quote: 'Warm, calm, and that breakfast… honestly the best part.', author: 'Grace', role: 'Guest' },
    ] }),
    b('visit', 'contact-details', { title: 'Find us', address: '1 Quay Street, St Ives TR26 1LP', phone: '+44 1736 000 000', email: 'stay@harbourhouse.hotel', hours: 'Reception 7:00–22:00' }),
    b('book', 'cta', { headline: 'Plan a slow weekend', subhead: 'Check dates and book directly for our best rate.', background: 'primary', button: { label: 'Check availability', href: '#' } }),
    b('footer', 'footer', { brand: 'The Harbour House Hotel', tagline: 'Boutique harbourside stays.', links: [{ label: 'Rooms', href: '#rooms' }, { label: 'Book', href: '#book' }], copyright: '© The Harbour House Hotel' }),
  ],
);

// ── realestate ───────────────────────────────────────────────────────────────
const realestateAgency = manifest('ocean',
  { title: 'Meridian Estates', description: 'A local estate agency that actually answers the phone.', lang: 'en', favicon: '🏡' },
  [
    b('nav', 'nav', { brand: 'Meridian', sticky: true, links: [{ label: 'Listings', href: '#listings' }, { label: 'Sell', href: '#sell' }, { label: 'Team', href: '#team' }], cta: { label: 'Book a valuation', href: '#contact' } }),
    b('hero', 'hero', { eyebrow: 'Sales & lettings', headline: 'Move with people who know the area', subhead: 'Honest advice, sharp photography, and a valuation that’s actually realistic.', align: 'left', minHeight: 'md', image: img('estate-hero'), overlay: 'light', cta: { label: 'Book a free valuation', href: '#contact' } }),
    b('listings', 'gallery', { layout: 'grid', columns: 3, gap: 'md', lightbox: true, items: [{ src: img('home-1'), alt: 'Terraced house' }, { src: img('home-2'), alt: 'Garden flat' }, { src: img('home-3'), alt: 'New-build' }, { src: img('home-4'), alt: 'Cottage' }, { src: img('home-5'), alt: 'Townhouse' }, { src: img('home-6'), alt: 'Apartment' }] }),
    b('sell', 'features', { title: 'Why sell with us', columns: 3, items: [
      { icon: '📸', title: 'Photography that sells', text: 'Pro photos, floorplans, and video.' },
      { icon: '📞', title: 'We answer', text: 'A named agent, reachable seven days.' },
      { icon: '💷', title: 'Fair fees', text: 'Simple percentage, no tie-ins.' },
    ] }),
    b('stats', 'stats', { title: 'Our track record', columns: 4, items: [
      { value: '98', label: 'Of asking price', suffix: '%' },
      { value: '28', label: 'Avg. days to offer' },
      { value: '450', label: 'Homes sold', suffix: '+' },
      { value: '4.9', label: 'Google rating', suffix: '★' },
    ] }),
    b('team', 'team', { title: 'Your local team', columns: 3, members: [
      { name: 'Olivia Grant', role: 'Branch Manager', photo: img('agent-1'), bio: '15 years selling in the area.' },
      { name: 'Daniel Cross', role: 'Senior Negotiator', photo: img('agent-2'), bio: 'Sales and chain management.' },
      { name: 'Priya Nair', role: 'Lettings Manager', photo: img('agent-3'), bio: 'Landlords and tenants alike.' },
    ] }),
    b('reviews', 'testimonials', { title: 'From movers', items: [
      { quote: 'Sold above asking in ten days. Communication was brilliant.', author: 'The Wrights', role: 'Sellers' },
      { quote: 'They found us the flat before it hit the portals. Legends.', author: 'Sam', role: 'Buyer' },
    ] }),
    b('contact', 'contact-details', { title: 'Book a valuation', address: '12 Market Place, Nottingham NG1 6HY', phone: '+44 115 000 0000', email: 'hello@meridianestates.co.uk', hours: 'Mon–Sat 9:00–18:00' }),
    b('cta', 'cta', { headline: 'Thinking of moving?', subhead: 'Start with a free, no-obligation valuation.', background: 'primary', button: { label: 'Book a valuation', href: '#contact' } }),
    b('footer', 'footer', { brand: 'Meridian Estates', tagline: 'Sales & lettings.', links: [{ label: 'Listings', href: '#listings' }, { label: 'Valuation', href: '#contact' }], copyright: '© Meridian Estates' }),
  ],
);

// ── personal ─────────────────────────────────────────────────────────────────
const personalResume = manifest('mono',
  { title: 'Maya Okafor — Frontend Engineer', description: 'Frontend engineer specialising in design systems and accessible UI.', lang: 'en', favicon: '👩‍💻' },
  [
    b('nav', 'nav', { brand: 'Maya Okafor', sticky: true, links: [{ label: 'Experience', href: '#experience' }, { label: 'Skills', href: '#skills' }, { label: 'Contact', href: '#contact' }], cta: { label: 'Download CV', href: '#' } }),
    b('header', 'profile-header', { name: 'Maya Okafor', headline: 'Senior Frontend Engineer', location: 'Lisbon, Portugal', summary: 'I build fast, accessible interfaces and the design systems that keep them consistent. 8 years across startups and product teams.', showDownload: true, downloadLabel: 'Download PDF', showShare: true, contacts: [
      { type: 'email', value: 'maya@okafor.dev' },
      { type: 'website', value: 'https://okafor.dev', label: 'okafor.dev' },
      { type: 'github', value: 'https://github.com/mayao', label: 'github.com/mayao' },
      { type: 'linkedin', value: 'https://linkedin.com/in/mayao', label: 'in/mayao' },
      { type: 'location', value: 'Lisbon, Portugal' },
    ] }),
    b('experience', 'experience', { title: 'Experience', items: [
      { role: 'Senior Frontend Engineer', org: 'Northwind', period: '2022 – Present', location: 'Remote', summary: 'Lead for the web platform and design system used across 6 product teams.', bullets: ['Shipped a token-driven design system adopted by every team, cutting UI bugs ~40%.', 'Drove Core Web Vitals work: LCP 3.1s → 1.4s on the marketing site.', 'Mentored 4 engineers; ran the accessibility guild (WCAG 2.2 AA).'] },
      { role: 'Frontend Engineer', org: 'Belltower', period: '2019 – 2022', location: 'Lisbon', bullets: ['Built the customer dashboard (React, TypeScript) from zero to 50k MAU.', 'Introduced visual regression + component testing, dropping regressions in prod.'] },
    ] }),
    b('skills', 'skills', { title: 'Skills', display: 'tags', groups: [
      { name: 'Languages', items: [{ label: 'TypeScript', level: 5 }, { label: 'JavaScript', level: 5 }, { label: 'HTML', level: 5 }, { label: 'CSS', level: 5 }] },
      { name: 'Frameworks', items: [{ label: 'React', level: 5 }, { label: 'Next.js', level: 4 }, { label: 'Svelte', level: 3 }] },
      { name: 'Craft', items: [{ label: 'Design systems', level: 5 }, { label: 'Accessibility', level: 5 }, { label: 'Web performance', level: 4 }] },
    ] }),
    b('timeline', 'timeline', { title: 'Milestones', items: [
      { date: '2024', title: 'Conf talk: “Tokens all the way down”', text: 'Spoke at a 400-seat frontend conference.' },
      { date: '2021', title: 'Launched a11y-charts', text: 'Open-sourced an accessible charting library (3.2k ★).' },
      { date: '2017', title: 'B.Sc. Computer Science', text: 'University of Porto — focus on HCI.' },
    ] }),
    b('work', 'gallery', { layout: 'grid', columns: 3, gap: 'md', lightbox: true, items: [{ src: img('work-1'), alt: 'Design system docs' }, { src: img('work-2'), alt: 'Dashboard UI' }, { src: img('work-3'), alt: 'Charts library' }] }),
    b('references', 'testimonials', { title: 'References', items: [
      { quote: 'Maya raised the bar for the whole frontend org — and lifted everyone around her.', author: 'D. Almeida', role: 'Eng Director, Northwind' },
      { quote: 'The most reliable engineer I’ve worked with. Ships, documents, mentors.', author: 'R. Costa', role: 'Staff Engineer, Belltower' },
    ] }),
    b('contact', 'contact-details', { title: 'Get in touch', email: 'maya@okafor.dev', address: 'Lisbon, Portugal' }),
    b('footer', 'footer', { brand: 'Maya Okafor', tagline: 'Frontend engineer.', links: [{ label: 'GitHub', href: 'https://github.com/mayao' }, { label: 'LinkedIn', href: 'https://linkedin.com/in/mayao' }], copyright: '© Maya Okafor' }),
  ],
);

// ── tech ─────────────────────────────────────────────────────────────────────
const techSaas = manifest('midnight',
  { title: 'Flowdeck — Ship faster', description: 'The workspace that turns scattered work into one clear flow.', lang: 'en', favicon: '🚀' },
  [
    b('nav', 'nav', { brand: 'Flowdeck', sticky: true, links: [{ label: 'Features', href: '#features' }, { label: 'Pricing', href: '#pricing' }, { label: 'FAQ', href: '#faq' }], cta: { label: 'Start free', href: '#pricing' } }),
    b('hero', 'hero-app', { headline: 'Turn scattered work into one clear flow', subhead: 'Docs, tasks, and reviews in a single fast workspace your team will actually use.', installLabel: 'Start free', installHref: '#pricing', screenshots: [{ src: img('app-1'), alt: 'Board view' }, { src: img('app-2'), alt: 'Doc editor' }, { src: img('app-3'), alt: 'Timeline' }] }),
    b('features', 'features', { title: 'Everything in one place', columns: 3, items: [
      { icon: '⚡', title: 'Fast by default', text: 'Keyboard-first, instant sync, offline-ready.' },
      { icon: '🧩', title: 'Docs + tasks', text: 'Write a doc, turn a line into a task.' },
      { icon: '🔗', title: 'Integrates', text: 'GitHub, Slack, and 40+ tools.' },
    ] }),
    b('stats', 'stats', { title: 'Teams move faster', columns: 3, items: [
      { value: '12k', label: 'Teams' },
      { value: '30', label: 'Less status-chasing', suffix: '%' },
      { value: '4.8', label: 'G2 rating', suffix: '★' },
    ] }),
    b('pricing', 'pricing', { title: 'Simple pricing', subtitle: 'Start free. Upgrade when you grow.', plans: [
      { name: 'Free', price: '£0', period: '/mo', features: ['Up to 5 members', 'Unlimited docs', 'Core integrations'], ctaLabel: 'Start free', ctaHref: '#' },
      { name: 'Team', price: '£8', period: '/user/mo', features: ['Unlimited members', 'Timeline & goals', 'Priority support'], ctaLabel: 'Start trial', ctaHref: '#', featured: true },
      { name: 'Enterprise', price: 'Custom', features: ['SSO & SCIM', 'Audit log', 'Dedicated CSM'], ctaLabel: 'Contact sales', ctaHref: '#' },
    ] }),
    b('logos', 'logos', { title: 'Trusted by fast teams', items: [{ src: img('tlogo-1'), alt: 'Company one' }, { src: img('tlogo-2'), alt: 'Company two' }, { src: img('tlogo-3'), alt: 'Company three' }, { src: img('tlogo-4'), alt: 'Company four' }] }),
    b('faq', 'faq', { title: 'Questions', items: [
      { question: 'Is there a free plan?', answer: 'Yes — free forever for up to 5 members.' },
      { question: 'Can we import our data?', answer: 'One-click import from Notion, Jira, and Asana.' },
    ] }),
    b('cta', 'cta', { headline: 'Get your team in flow', subhead: 'Free for small teams. No credit card required.', background: 'primary', button: { label: 'Start free', href: '#pricing' } }),
    b('footer', 'footer', { brand: 'Flowdeck', tagline: 'Ship faster, together.', links: [{ label: 'Features', href: '#features' }, { label: 'Pricing', href: '#pricing' }], copyright: '© Flowdeck, Inc.' }),
  ],
);

// ── events (booking) ─────────────────────────────────────────────────────────
const eventsWeddings = manifest('candy',
  { title: 'Evergreen Events — Weddings & Celebrations', description: 'Full-service planning for weddings and celebrations that feel like you.', lang: 'en', favicon: '🎉' },
  [
    b('nav', 'nav', { brand: 'Evergreen', sticky: true, links: [{ label: 'Story', href: '#story' }, { label: 'Gallery', href: '#gallery' }, { label: 'Enquire', href: '#contact' }], cta: { label: 'Check your date', href: '#book' } }),
    b('hero', 'hero', { eyebrow: 'Weddings & celebrations', headline: 'A day that feels completely like you', subhead: 'Thoughtful planning and styling, from first idea to last dance.', align: 'center', minHeight: 'full', image: img('wedding-hero'), overlay: 'scrim', cta: { label: 'Check your date', href: '#book' } }),
    b('story', 'timeline', { title: 'How we work together', items: [
      { date: '12+ months', title: 'Dream & plan', text: 'Vision, budget, and the venue search.' },
      { date: '6 months', title: 'Design & book', text: 'Styling, suppliers, and the run of day.' },
      { date: 'The week', title: 'Relax', text: 'We manage every detail so you don’t.' },
    ] }),
    b('gallery', 'gallery', { layout: 'masonry', columns: 3, gap: 'md', lightbox: true, items: [{ src: img('wed-1'), alt: 'Ceremony arch' }, { src: img('wed-2'), alt: 'Table setting' }, { src: img('wed-3'), alt: 'First dance' }, { src: img('wed-4'), alt: 'Flowers' }] }),
    b('faq', 'faq', { title: 'Good to know', items: [
      { question: 'Do you travel?', answer: 'Yes — across the UK and destination weddings on request.' },
      { question: 'How far ahead should we book?', answer: '12–18 months is ideal, but we love a challenge.' },
    ] }),
    b('contact', 'contact-details', { title: 'Say hello', address: 'Based in the Cotswolds', phone: '+44 1451 000 000', email: 'hello@evergreenevents.co', hours: 'By appointment' }),
    b('book', 'cta', { headline: 'Is your date free?', subhead: 'Send us your date and we’ll be in touch within 48 hours.', background: 'primary', button: { label: 'Check availability', href: '#' } }),
    b('footer', 'footer', { brand: 'Evergreen Events', tagline: 'Weddings & celebrations.', links: [{ label: 'Gallery', href: '#gallery' }, { label: 'Enquire', href: '#contact' }], copyright: '© Evergreen Events' }),
  ],
);

// ── nonprofit ────────────────────────────────────────────────────────────────
const nonprofitCommunity = manifest('forest',
  { title: 'GreenRoots — Community Rewilding', description: 'Bringing nature back to our neighbourhoods, one patch at a time.', lang: 'en', favicon: '🌱' },
  [
    b('nav', 'nav', { brand: 'GreenRoots', sticky: true, links: [{ label: 'About', href: '#about' }, { label: 'Our impact', href: '#impact' }, { label: 'Volunteer', href: '#volunteer' }], cta: { label: 'Donate', href: '#donate' } }),
    b('hero', 'hero', { eyebrow: 'Community rewilding', headline: 'Bring nature back to your street', subhead: 'We turn neglected patches into thriving green spaces — with the people who live there.', align: 'center', minHeight: 'lg', image: img('green-hero'), overlay: 'scrim', cta: { label: 'Get involved', href: '#volunteer' } }),
    b('about', 'about', { eyebrow: 'Who we are', title: 'Small patches, big change', body: 'GreenRoots is a volunteer-led charity helping communities reclaim unused land for wildlife and people. Since 2018 we’ve planted trees, sown meadows, and built raised beds on forgotten corners — always led by the neighbours who use them.', image: img('green-about'), imageAlt: 'Volunteers planting', imageSide: 'right' }),
    b('impact', 'stats', { title: 'Our impact so far', columns: 4, items: [
      { value: '64', label: 'Sites rewilded' },
      { value: '12k', label: 'Trees planted', suffix: '+' },
      { value: '2,300', label: 'Volunteers' },
      { value: '38', label: 'Neighbourhoods' },
    ] }),
    b('how', 'steps', { title: 'How a patch happens', items: [
      { title: 'Nominate a space', text: 'Tell us about a neglected patch near you.' },
      { title: 'Plan together', text: 'We design it with the local community.' },
      { title: 'Plant & tend', text: 'A launch day, then ongoing care.' },
    ] }),
    b('team', 'team', { title: 'The core team', columns: 3, members: [
      { name: 'Ife Adeyemi', role: 'Founder & Director', photo: img('np-1'), bio: 'Ecologist and community organiser.' },
      { name: 'Rob Mackay', role: 'Projects Lead', photo: img('np-2'), bio: 'Coordinates sites and volunteers.' },
      { name: 'Sunita Rao', role: 'Partnerships', photo: img('np-3'), bio: 'Works with councils and funders.' },
    ] }),
    b('voices', 'testimonials', { title: 'Voices from the community', items: [
      { quote: 'Our dead-end alley is now a pollinator garden. Kids help water it.', author: 'Denise', role: 'Volunteer' },
      { quote: 'I’ve met more neighbours planting trees than in ten years living here.', author: 'Omar', role: 'Resident' },
    ] }),
    b('donate', 'cta', { headline: 'Help us plant the next patch', subhead: '£10 plants a tree. £50 sows a meadow. Every bit grows.', background: 'primary', button: { label: 'Donate', href: '#' } }),
    b('footer', 'footer', { brand: 'GreenRoots', tagline: 'Community rewilding charity.', links: [{ label: 'Volunteer', href: '#volunteer' }, { label: 'Donate', href: '#donate' }], copyright: '© GreenRoots · Reg. charity 1188000' }),
  ],
);

// ── other (generic fallback) ─────────────────────────────────────────────────
const otherBasic = manifest('sand',
  { title: 'Acme Co', description: 'A simple, clear one-page site for any small business.', lang: 'en', favicon: '⭐' },
  [
    b('nav', 'nav', { brand: 'Acme Co', sticky: true, links: [{ label: 'What we do', href: '#features' }, { label: 'Contact', href: '#contact' }], cta: { label: 'Get in touch', href: '#contact' } }),
    b('hero', 'hero', { eyebrow: 'Welcome', headline: 'A clear, simple site for your business', subhead: 'Tell people who you are, what you do, and how to reach you — nothing more, nothing less.', align: 'center', minHeight: 'md', image: img('generic-hero'), overlay: 'scrim', cta: { label: 'Get in touch', href: '#contact' } }),
    b('features', 'features', { title: 'What we do', columns: 3, items: [
      { icon: '✅', title: 'Do great work', text: 'A short, honest line about your service.' },
      { icon: '🤝', title: 'Look after people', text: 'Why customers keep coming back.' },
      { icon: '📍', title: 'Local & reliable', text: 'Where you are and who you serve.' },
    ] }),
    b('contact', 'contact-details', { title: 'Get in touch', address: '1 High Street, Anytown AN1 1AA', phone: '+44 0000 000 000', email: 'hello@acme.co', hours: 'Mon–Fri 9:00–17:00' }),
    b('footer', 'footer', { brand: 'Acme Co', tagline: 'Your tagline here.', links: [{ label: 'Contact', href: '#contact' }], copyright: '© Acme Co' }),
  ],
);

export const TEMPLATES: Readonly<Record<string, Template>> = {
  'restaurant-modern': { id: 'restaurant-modern', vertical: 'restaurant', label: 'Café — Modern', manifest: restaurantModern },
  'retail-boutique': { id: 'retail-boutique', vertical: 'retail', label: 'Shop — Boutique', manifest: retailBoutique },
  'salon-spa': { id: 'salon-spa', vertical: 'salon', label: 'Salon & Spa — Booking', manifest: salonSpa },
  'fitness-gym': { id: 'fitness-gym', vertical: 'fitness', label: 'Gym — Strength', manifest: fitnessGym },
  'education-academy': { id: 'education-academy', vertical: 'education', label: 'Tutoring — Academy', manifest: educationAcademy },
  'healthcare-clinic': { id: 'healthcare-clinic', vertical: 'healthcare', label: 'Clinic — Appointments', manifest: healthcareClinic },
  'manufacturing-industrial': { id: 'manufacturing-industrial', vertical: 'manufacturing', label: 'Manufacturing — Industrial', manifest: manufacturingIndustrial },
  'ecommerce-shop': { id: 'ecommerce-shop', vertical: 'ecommerce', label: 'E-commerce — Product', manifest: ecommerceShop },
  'service-local': { id: 'service-local', vertical: 'service', label: 'Service — Local trade', manifest: serviceLocal },
  'franchise-network': { id: 'franchise-network', vertical: 'franchise', label: 'Franchise — Opportunity', manifest: franchiseNetwork },
  'hospitality-hotel': { id: 'hospitality-hotel', vertical: 'hospitality', label: 'Hotel — Boutique', manifest: hospitalityHotel },
  'realestate-agency': { id: 'realestate-agency', vertical: 'realestate', label: 'Real Estate — Agency', manifest: realestateAgency },
  'personal-resume': { id: 'personal-resume', vertical: 'personal', label: 'Personal — Résumé / CV', manifest: personalResume },
  'tech-saas': { id: 'tech-saas', vertical: 'tech', label: 'SaaS — Product launch', manifest: techSaas },
  'events-weddings': { id: 'events-weddings', vertical: 'events', label: 'Events — Weddings', manifest: eventsWeddings },
  'nonprofit-community': { id: 'nonprofit-community', vertical: 'nonprofit', label: 'Nonprofit — Community', manifest: nonprofitCommunity },
  'other-basic': { id: 'other-basic', vertical: 'other', label: 'Basic — One-pager', manifest: otherBasic },
};

/** All template ids. */
export function templateNames(): string[] {
  return Object.keys(TEMPLATES);
}

/** Templates for a vertical id (may be empty until more are authored). */
export function templatesForVertical(vertical: string): Template[] {
  return Object.values(TEMPLATES).filter((t) => t.vertical === vertical);
}

/** A template by id, or `undefined`. */
export function getTemplate(id: string): Template | undefined {
  return TEMPLATES[id];
}
