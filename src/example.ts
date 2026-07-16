/**
 * Renders a sample manifest to `example-output.html` so you can open the real
 * output in a browser. Run: `npm run example`.
 *
 * This is exactly the shape the AI would emit (design tokens + ordered blocks)
 * — no raw HTML anywhere in the input.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { renderSite } from './render.js';
import { emitPwa } from './pwa.js';
import { validateManifest } from './validate.js';
import type { SiteManifest } from './types.js';

const sample: SiteManifest = {
  meta: { title: 'Aster & Co. — Handmade Ceramics', description: 'Small-batch stoneware from a sunlit studio.', lang: 'en' },
  design: {
    mode: 'light',
    palette: { bg: '#f6f2ea', surface: '#ffffff', text: '#2b2620', muted: '#736a5c', primary: '#5b6b4f', accent: '#c07a45' },
    typography: { fontStack: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif", scale: 'expressive' },
    radius: 'round', spacing: 'airy', motion: 'subtle',
  },
  pwa: { name: 'Aster & Co.', shortName: 'Aster', offline: true },
  seo: { ogTitle: 'Aster & Co. — Handmade Ceramics', twitterCard: 'summary_large_image' },
  blocks: [
    { id: 'announcement-bar', type: 'announcement-bar', visible: true, config: {
      text: 'Winter workshop dates just opened.', linkLabel: 'Reserve a seat', href: '#workshops', tone: 'promo' } },
    { id: 'nav', type: 'nav', visible: true, config: {
      brand: 'Aster & Co.', sticky: true,
      links: [{ label: 'Shop', href: '#shop' }, { label: 'Workshops', href: '#workshops' }, { label: 'About', href: '#about' }],
      cta: { label: 'Book a seat', href: '#workshops' } } },
    { id: 'hero', type: 'hero', visible: true, config: {
      eyebrow: 'Studio Aster', headline: 'Ceramics made to be used', subhead: 'Small-batch stoneware, thrown and glazed by hand in a sunlit studio.',
      align: 'center', cta: { label: 'Shop the collection', href: '#shop' } } },
    { id: 'features', type: 'features', visible: true, config: {
      title: 'Why Aster', columns: 3,
      items: [
        { icon: '🌿', title: 'Small batch', text: 'Every piece thrown, trimmed and glazed by hand.' },
        { icon: '🔥', title: 'Wood-fired', text: 'Fired in our own kiln for a warm, living glaze.' },
        { icon: '♻️', title: 'Made to last', text: 'Dishwasher-safe stoneware built for daily use.' },
      ] } },
    { id: 'stats', type: 'stats', visible: true, config: {
      title: 'By the kiln', columns: 3,
      items: [
        { value: '2,400', suffix: '+', label: 'Pieces fired this year' },
        { value: '12', label: 'Glazes mixed in-house' },
        { value: '9', label: 'Years at the wheel' },
      ] } },
    { id: 'services', type: 'services-catalogue', visible: true, config: {
      title: 'What we offer', subtitle: 'From a single mug to a full table setting.',
      items: [
        { name: 'Wheel-throwing workshops', price: 'from $40', description: 'Two-hour beginner sessions, clay & firing included.', ctaLabel: 'Book a seat', ctaHref: '#workshops' },
        { name: 'Custom commissions', price: 'quote', description: 'Bespoke sets for restaurants and gifts.' },
        { name: 'Retail collection', price: '$18–$120', description: 'Mugs, bowls, plates and vases, restocked weekly.' },
      ] } },
    { id: 'gallery', type: 'gallery', visible: true, config: {
      columns: 3, gap: 'md', lightbox: true,
      items: [
        { src: 'https://picsum.photos/seed/a/800/600', alt: 'Glazed bowl, morning light', caption: 'Ash-glaze bowl' },
        { src: 'https://picsum.photos/seed/b/800/600', alt: 'Row of mugs' },
        { src: 'https://picsum.photos/seed/c/800/600', alt: 'Studio wheel' },
      ] } },
    { id: 'testimonials', type: 'testimonials', visible: true, config: {
      title: 'Kind words',
      items: [
        { quote: 'The mugs have become the most-used objects in our kitchen.', author: 'Priya R.', role: 'Regular' },
        { quote: 'Our café’s whole table setting is Aster now.', author: 'Dune Coffee', role: 'Wholesale' },
      ] } },
    { id: 'faq', type: 'faq', visible: true, config: {
      items: [
        { question: 'Are the pieces dishwasher-safe?', answer: 'Yes — all stoneware is high-fired and dishwasher- and microwave-safe.' },
        { question: 'Do you ship internationally?', answer: 'We ship across the country; international is coming soon.' },
      ] } },
    { id: 'cta', type: 'cta', visible: true, config: {
      headline: 'Come throw with us', subhead: 'Weekend beginner workshops, all materials included.',
      background: 'primary', button: { label: 'Reserve a seat', href: '#workshops' } } },
    { id: 'contact', type: 'contact-details', visible: true, config: {
      title: 'Visit the studio', address: '14 Kiln Lane, Riverside', phone: '+1 555 0142', email: 'hello@aster.co', hours: 'Wed–Sun · 10am–5pm' } },
    { id: 'footer', type: 'footer', visible: true, config: {
      brand: 'Aster & Co.', tagline: 'Handmade stoneware from a sunlit studio.',
      links: [{ label: 'Instagram', href: '#' }, { label: 'Stockists', href: '#' }, { label: 'Care guide', href: '#' }],
      copyright: '© 2026 Aster & Co.' } },
  ],
  version: 1,
};

const v = validateManifest(sample);
console.log(`validateManifest: ok=${v.ok}${v.errors.length ? ' errors=' + JSON.stringify(v.errors) : ''}`);

const html = renderSite(sample);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'example-output.html');
writeFileSync(out, html, 'utf8');
console.log(`Rendered ${html.length} bytes → ${out}`);

// The manifest opts into PWA, so emit the app-shell artifacts alongside the HTML.
const pwaFiles = emitPwa(sample);
if (pwaFiles) {
  for (const [name, body] of Object.entries(pwaFiles)) writeFileSync(join(root, `example-${name}`), body, 'utf8');
  console.log(`PWA: ${Object.keys(pwaFiles).map((n) => `example-${n}`).join(', ')}`);
}
console.log('Open the HTML in a browser to see the sample site.');
