/**
 * Named `DesignTokens` presets (§9) — coherent palettes + scale/radius/spacing/
 * motion the AI (or a human picker) selects by NAME instead of hand-mixing hexes.
 * "Make it feel like 'midnight'" becomes one op. Each preset is a complete,
 * valid token set, so applying one is total and never leaves a hole.
 *
 * Presets are additive and stable: add new ones freely, but keep existing names
 * and their intent so old manifests that reference a preset stay reproducible.
 */
import type { DesignTokens } from './types.js';

const SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const SERIF = "'Iowan Old Style', Georgia, Cambria, 'Times New Roman', serif";

/** The built-in presets, keyed by name. Values are complete token sets. */
export const PRESETS: Readonly<Record<string, DesignTokens>> = {
  // Warm, editorial default (matches DEFAULT_TOKENS' spirit).
  sand: {
    mode: 'light',
    palette: { bg: '#f7f4ee', surface: '#ffffff', text: '#2a2622', muted: '#6b6459', primary: '#3a5a40', accent: '#c2703d' },
    typography: { fontStack: SANS, scale: 'default' }, radius: 'soft', spacing: 'default', motion: 'subtle',
  },
  // Dark, high-contrast, product-y.
  midnight: {
    mode: 'dark',
    palette: { bg: '#0d1117', surface: '#161b22', text: '#e6edf3', muted: '#8b949e', primary: '#4c8dff', accent: '#f778ba' },
    typography: { fontStack: SANS, scale: 'default' }, radius: 'soft', spacing: 'default', motion: 'subtle',
  },
  // Calm, natural, spacious.
  forest: {
    mode: 'light',
    palette: { bg: '#f3f6f2', surface: '#ffffff', text: '#1f2a24', muted: '#5c6b60', primary: '#2f6f4e', accent: '#b5832f' },
    typography: { fontStack: SANS, scale: 'default' }, radius: 'round', spacing: 'airy', motion: 'subtle',
  },
  // Minimal black-on-white, sharp, editorial serif.
  mono: {
    mode: 'light',
    palette: { bg: '#ffffff', surface: '#fafafa', text: '#111111', muted: '#666666', primary: '#111111', accent: '#555555' },
    typography: { fontStack: SERIF, scale: 'default' }, radius: 'sharp', spacing: 'default', motion: 'none',
  },
  // Playful, bright, rounded.
  candy: {
    mode: 'light',
    palette: { bg: '#fff7fb', surface: '#ffffff', text: '#2b1f2b', muted: '#7a6b78', primary: '#e0468b', accent: '#7c5cff' },
    typography: { fontStack: SANS, scale: 'expressive' }, radius: 'round', spacing: 'airy', motion: 'lively',
  },
  // Cool, corporate, trustworthy.
  ocean: {
    mode: 'light',
    palette: { bg: '#f4f8fb', surface: '#ffffff', text: '#0f2233', muted: '#5a6b78', primary: '#1668b0', accent: '#0aa5a5' },
    typography: { fontStack: SANS, scale: 'default' }, radius: 'soft', spacing: 'default', motion: 'subtle',
  },
};

/** Preset names the AI/picker may choose from. */
export function presetNames(): string[] {
  return Object.keys(PRESETS);
}

/** A named preset as a fresh, complete token set (deep copy — never aliased). */
export function getPreset(name: string): DesignTokens | undefined {
  const p = PRESETS[name];
  return p ? structuredClone(p) : undefined;
}
