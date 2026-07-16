/**
 * Business **verticals** (§ AiToolK.it#154 / weblocks#30) — a small, stable
 * taxonomy that gives generation a sense of what KIND of site it's making.
 *
 * Each vertical maps to its recommended section set (in order), a design-token
 * preset that fits the mood, a copy-tone hint, and whether it's booking-driven.
 * Hosts should read `verticalNames()` rather than hardcode their own list, and
 * generation can seed a brief's default sections + preset from the chosen one.
 *
 * Additive + stable: add verticals freely, but do NOT rename or repurpose an
 * existing `id` — hosts persist it (e.g. as `businessType`). Every `blocks`
 * entry must be a real catalog block type (see `verticals.test.ts`).
 */

export interface Vertical {
  /** Stable key, persisted host-side (e.g. `businessType`). Never repurpose. */
  id: string;
  /** Chip / menu label. */
  label: string;
  /** Material icon name — advisory for hosts that show an icon. */
  icon: string;
  /** Recommended sections, in order. Each must be a catalog block type. */
  blocks: string[];
  /** A `presetNames()` value that fits the vertical's mood. */
  preset: string;
  /** One-line copy-tone hint for generation. */
  tone: string;
  /** Appointment / reservation-driven — the CTA reads as "Book" and this is the
   * set that should default an appointment block once weblocks#32 ships. */
  booking?: boolean;
}

export const VERTICALS: Readonly<Record<string, Vertical>> = {
  restaurant: {
    id: 'restaurant', label: 'Restaurant & Café', icon: 'restaurant', preset: 'sand',
    tone: 'warm, appetising, inviting',
    blocks: ['nav', 'hero', 'services-catalogue', 'gallery', 'testimonials', 'contact-details', 'cta', 'footer'],
  },
  retail: {
    id: 'retail', label: 'Retail Shop', icon: 'storefront', preset: 'sand',
    tone: 'friendly, local, trustworthy',
    blocks: ['nav', 'hero', 'gallery', 'services-catalogue', 'testimonials', 'contact-details', 'footer'],
  },
  salon: {
    id: 'salon', label: 'Salon & Spa', icon: 'spa', preset: 'candy', booking: true,
    tone: 'calm, pampering, premium',
    blocks: ['nav', 'hero', 'services-catalogue', 'gallery', 'testimonials', 'contact-details', 'cta', 'footer'],
  },
  fitness: {
    id: 'fitness', label: 'Gym & Fitness', icon: 'fitness_center', preset: 'midnight', booking: true,
    tone: 'energetic, motivating, bold',
    blocks: ['nav', 'hero', 'features', 'pricing', 'team', 'testimonials', 'cta', 'contact-details', 'footer'],
  },
  education: {
    id: 'education', label: 'Education & Coaching', icon: 'school', preset: 'ocean',
    tone: 'credible, encouraging, clear',
    blocks: ['nav', 'hero', 'features', 'steps', 'pricing', 'faq', 'testimonials', 'cta', 'contact-details', 'footer'],
  },
  healthcare: {
    id: 'healthcare', label: 'Healthcare & Clinic', icon: 'medical_services', preset: 'ocean', booking: true,
    tone: 'reassuring, professional, calm',
    blocks: ['nav', 'hero', 'services-catalogue', 'team', 'faq', 'cta', 'contact-details', 'footer'],
  },
  manufacturing: {
    id: 'manufacturing', label: 'Manufacturing', icon: 'precision_manufacturing', preset: 'ocean',
    tone: 'industrial, capable, precise',
    blocks: ['nav', 'hero', 'features', 'stats', 'logos', 'services-catalogue', 'contact-details', 'footer'],
  },
  ecommerce: {
    id: 'ecommerce', label: 'E-commerce', icon: 'shopping_bag', preset: 'midnight',
    tone: 'punchy, product-first, converting',
    blocks: ['nav', 'hero', 'gallery', 'features', 'pricing', 'testimonials', 'faq', 'cta', 'footer'],
  },
  service: {
    id: 'service', label: 'Service Business', icon: 'handyman', preset: 'forest',
    tone: 'dependable, straightforward, local',
    blocks: ['nav', 'hero', 'features', 'steps', 'testimonials', 'faq', 'cta', 'contact-details', 'footer'],
  },
  franchise: {
    id: 'franchise', label: 'Franchise', icon: 'hub', preset: 'ocean',
    tone: 'proven, opportunity-led, confident',
    blocks: ['nav', 'hero', 'stats', 'features', 'steps', 'testimonials', 'cta', 'contact-details', 'footer'],
  },
  hospitality: {
    id: 'hospitality', label: 'Hotel & Hospitality', icon: 'hotel', preset: 'forest', booking: true,
    tone: 'welcoming, restful, refined',
    blocks: ['nav', 'hero', 'gallery', 'features', 'services-catalogue', 'testimonials', 'contact-details', 'cta', 'footer'],
  },
  realestate: {
    id: 'realestate', label: 'Real Estate', icon: 'real_estate_agent', preset: 'ocean',
    tone: 'aspirational, trustworthy, local',
    blocks: ['nav', 'hero', 'gallery', 'features', 'stats', 'team', 'testimonials', 'contact-details', 'cta', 'footer'],
  },
  personal: {
    id: 'personal', label: 'Personal / Portfolio', icon: 'person', preset: 'mono',
    tone: 'personal, confident, uncluttered',
    blocks: ['nav', 'profile-header', 'experience', 'skills', 'timeline', 'gallery', 'testimonials', 'contact-details', 'footer'],
  },
  tech: {
    id: 'tech', label: 'Technology / SaaS', icon: 'rocket_launch', preset: 'midnight',
    tone: 'sharp, modern, benefit-led',
    blocks: ['nav', 'hero-app', 'features', 'stats', 'pricing', 'logos', 'faq', 'cta', 'footer'],
  },
  events: {
    id: 'events', label: 'Events & Weddings', icon: 'celebration', preset: 'candy', booking: true,
    tone: 'joyful, elegant, memorable',
    blocks: ['nav', 'hero', 'timeline', 'gallery', 'faq', 'contact-details', 'cta', 'footer'],
  },
  nonprofit: {
    id: 'nonprofit', label: 'Nonprofit / Community', icon: 'volunteer_activism', preset: 'forest',
    tone: 'heartfelt, purposeful, mobilising',
    blocks: ['nav', 'hero', 'about', 'stats', 'steps', 'team', 'testimonials', 'cta', 'footer'],
  },
  other: {
    id: 'other', label: 'Other', icon: 'category', preset: 'sand',
    tone: 'clear, neutral, professional',
    blocks: ['nav', 'hero', 'features', 'contact-details', 'footer'],
  },
};

/** Vertical ids the AI / a host picker may choose from. */
export function verticalNames(): string[] {
  return Object.keys(VERTICALS);
}

/** A vertical by id, or `undefined` if unknown (host should fall back to `other`). */
export function getVertical(id: string): Vertical | undefined {
  return VERTICALS[id];
}
