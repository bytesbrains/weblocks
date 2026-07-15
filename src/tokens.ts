/**
 * Design tokens → CSS custom properties (the shared "baseplate").
 *
 * Every brick styles itself from these variables, so a single token edit
 * ("make the whole site warmer") restyles the entire page — coherence by
 * construction. [normalizeTokens] is total: any missing field falls back to a
 * default, so the renderer never sees a hole.
 *
 * Two derived colours — `--on-primary` / `--on-accent` — carry a legible text
 * colour for anything sitting on a primary/accent fill, computed from the
 * palette so contrast holds on ANY colours (no hardcoded `#fff`). And when
 * `mode: 'auto'`, a `@media (prefers-color-scheme: dark)` block swaps the palette
 * to the viewer's OS preference.
 */
import type { DesignTokens, Palette, Radius, Scale, SectionOverrides, Spacing } from './types.js';

export const DEFAULT_TOKENS: DesignTokens = {
  mode: 'light',
  palette: {
    bg: '#f7f4ee',
    surface: '#ffffff',
    text: '#2a2622',
    muted: '#6b6459',
    primary: '#3a5a40',
    accent: '#c2703d',
  },
  typography: {
    fontStack: "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    scale: 'default',
  },
  radius: 'soft',
  spacing: 'default',
  motion: 'subtle',
};

/** Fallback dark palette for `mode: 'auto'` when no `darkPalette` is supplied. */
const DARK_FALLBACK: Palette = {
  bg: '#0d1117', surface: '#161b22', text: '#e6edf3', muted: '#8b949e', primary: '#4c8dff', accent: '#f778ba',
};

const SCALE_BASE_PX: Record<Scale, number> = { compact: 15, default: 16, expressive: 18 };
const RADIUS_PX: Record<Radius, string> = { sharp: '0px', soft: '12px', round: '24px' };
const SPACE_MULT: Record<Spacing, number> = { tight: 0.8, default: 1, airy: 1.4 };

/** Coerce to one of `allowed`, else the default — so a bad enum never leaks into CSS. */
function oneOf<T extends string>(value: unknown, allowed: readonly T[], def: T): T {
  return allowed.includes(value as T) ? (value as T) : def;
}

/**
 * A legible text colour (near-black or white) for text on a given fill, by
 * WCAG relative luminance. Total: any unparseable colour falls back to white.
 */
export function readableOn(color: string): string {
  const h = String(color ?? '').trim().replace(/^#/, '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return '#ffffff';
  const chan = (i: number) => parseInt(full.slice(i, i + 2), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * lin(chan(0)) + 0.7152 * lin(chan(2)) + 0.0722 * lin(chan(4));
  return L > 0.45 ? '#111111' : '#ffffff';
}

/** The six palette roles + the two derived on-fill text colours. */
function paletteVars(p: Palette): string[] {
  return [
    `--bg:${p.bg}`,
    `--surface:${p.surface}`,
    `--text:${p.text}`,
    `--muted:${p.muted}`,
    `--primary:${p.primary}`,
    `--accent:${p.accent}`,
    `--on-primary:${readableOn(p.primary)}`,
    `--on-accent:${readableOn(p.accent)}`,
  ];
}

/**
 * Fill missing tokens with defaults AND coerce any out-of-range enum back to its
 * default. Never throws. This is what keeps the renderer total: an AI-emitted
 * `mode: "neon"` or `scale: "huge"` can't reach `tokensToCss` (which would index
 * to `undefined`/`NaN`) — it lands on a valid value here first.
 */
export function normalizeTokens(input: Partial<DesignTokens> | undefined): DesignTokens {
  const t = input ?? {};
  const d = DEFAULT_TOKENS;
  const core: DesignTokens = {
    mode: oneOf(t.mode, ['light', 'dark', 'auto'], d.mode),
    palette: { ...d.palette, ...(t.palette ?? {}) },
    typography: {
      fontStack: t.typography?.fontStack ?? d.typography.fontStack,
      scale: oneOf(t.typography?.scale, ['compact', 'default', 'expressive'], d.typography.scale),
    },
    radius: oneOf(t.radius, ['sharp', 'soft', 'round'], d.radius),
    spacing: oneOf(t.spacing, ['tight', 'default', 'airy'], d.spacing),
    motion: oneOf(t.motion, ['none', 'subtle', 'lively'], d.motion),
  };
  // Keep a dark palette only when supplied (merged onto the fallback so a partial
  // one is still complete). Consulted only for `mode: 'auto'`.
  if (t.darkPalette) core.darkPalette = { ...DARK_FALLBACK, ...t.darkPalette };
  return core;
}

/** The `:root` variable block, plus a dark-palette override when `mode: 'auto'`. */
export function tokensToCss(tokens: DesignTokens): string {
  const t = normalizeTokens(tokens);
  const base = SCALE_BASE_PX[t.typography.scale];
  const space = SPACE_MULT[t.spacing];
  const sizeVars = [
    `--font:${t.typography.fontStack}`,
    `--fs-base:${base}px`,
    `--fs-lg:${(base * 1.35).toFixed(1)}px`,
    `--fs-xl:${(base * 2.4).toFixed(1)}px`,
    `--radius:${RADIUS_PX[t.radius]}`,
    `--space:${space}rem`,
    `--space-lg:${(space * 3).toFixed(2)}rem`,
    `--motion:${t.motion === 'none' ? '0ms' : t.motion === 'lively' ? '320ms' : '180ms'}`,
  ];
  const root = `:root{${[...paletteVars(t.palette), ...sizeVars].join(';')}}`;
  if (t.mode !== 'auto') return root;
  // Only the palette (colours + on-fill text) flips with the OS theme; sizes,
  // radius, spacing, and font stay put.
  const dark = t.darkPalette ?? DARK_FALLBACK;
  return `${root}\n@media(prefers-color-scheme:dark){:root{${paletteVars(dark).join(';')}}}`;
}

/**
 * Inline CSS-variable declarations for a block's opt-in per-section overrides —
 * a palette subset (each re-deriving its on-fill colour) plus optional radius /
 * spacing. Returns '' when there's nothing to scope. The caller escapes this for
 * the `style` attribute.
 */
export function sectionOverrideCss(o: SectionOverrides | undefined): string {
  if (!o || typeof o !== 'object') return '';
  const decls: string[] = [];
  const roles: Array<[keyof Palette, string]> = [
    ['bg', '--bg'], ['surface', '--surface'], ['text', '--text'],
    ['muted', '--muted'], ['primary', '--primary'], ['accent', '--accent'],
  ];
  for (const [key, cssVar] of roles) {
    const v = o[key];
    if (typeof v === 'string' && v) decls.push(`${cssVar}:${v}`);
  }
  if (typeof o.primary === 'string' && o.primary) decls.push(`--on-primary:${readableOn(o.primary)}`);
  if (typeof o.accent === 'string' && o.accent) decls.push(`--on-accent:${readableOn(o.accent)}`);
  if (o.radius && RADIUS_PX[o.radius] !== undefined) decls.push(`--radius:${RADIUS_PX[o.radius]}`);
  if (o.spacing && SPACE_MULT[o.spacing] !== undefined) {
    const m = SPACE_MULT[o.spacing];
    decls.push(`--space:${m}rem`, `--space-lg:${(m * 3).toFixed(2)}rem`);
  }
  return decls.join(';');
}
