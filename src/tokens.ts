/**
 * Design tokens → CSS custom properties (the shared "baseplate").
 *
 * Every brick styles itself from these variables, so a single token edit
 * ("make the whole site warmer") restyles the entire page — coherence by
 * construction. [normalizeTokens] is total: any missing field falls back to a
 * default, so the renderer never sees a hole.
 */
import type { DesignTokens, Radius, Scale, Spacing } from './types.js';

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

const SCALE_BASE_PX: Record<Scale, number> = { compact: 15, default: 16, expressive: 18 };
const RADIUS_PX: Record<Radius, string> = { sharp: '0px', soft: '12px', round: '24px' };
const SPACE_MULT: Record<Spacing, number> = { tight: 0.8, default: 1, airy: 1.4 };

/** Coerce to one of `allowed`, else the default — so a bad enum never leaks into CSS. */
function oneOf<T extends string>(value: unknown, allowed: readonly T[], def: T): T {
  return allowed.includes(value as T) ? (value as T) : def;
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
  return {
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
}

/** The `:root` variable block + a light/dark surface flip when mode is auto. */
export function tokensToCss(tokens: DesignTokens): string {
  const t = normalizeTokens(tokens);
  const base = SCALE_BASE_PX[t.typography.scale];
  const space = SPACE_MULT[t.spacing];
  const vars = [
    `--bg:${t.palette.bg}`,
    `--surface:${t.palette.surface}`,
    `--text:${t.palette.text}`,
    `--muted:${t.palette.muted}`,
    `--primary:${t.palette.primary}`,
    `--accent:${t.palette.accent}`,
    `--font:${t.typography.fontStack}`,
    `--fs-base:${base}px`,
    `--fs-lg:${(base * 1.35).toFixed(1)}px`,
    `--fs-xl:${(base * 2.4).toFixed(1)}px`,
    `--radius:${RADIUS_PX[t.radius]}`,
    `--space:${space}rem`,
    `--space-lg:${(space * 3).toFixed(2)}rem`,
    `--motion:${t.motion === 'none' ? '0ms' : t.motion === 'lively' ? '320ms' : '180ms'}`,
  ].join(';');
  return `:root{${vars}}`;
}
