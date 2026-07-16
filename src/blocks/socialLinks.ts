/**
 * `social-links` — one row/grid of links to social or contact profiles.
 *
 * A single generic block (not one per network): you add only the accounts you
 * have, so unset ones are simply absent. Each link's `platform` selects a
 * built-in monochrome brand icon (from simple-icons, themed via `currentColor`)
 * and a default accessible label; `custom` (or an unknown platform) falls back to
 * your own emoji/glyph `icon`. Layout adapts via `layout` (row/grid) and
 * `variant` (labeled/icon-only). Static brick.
 */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';
import { BRAND_ICON_PATHS } from './brandIcons.js';

const PLATFORMS = [
  'x', 'twitter', 'instagram', 'facebook', 'linkedin', 'youtube', 'github', 'tiktok',
  'whatsapp', 'telegram', 'discord', 'mastodon', 'rss', 'email', 'website', 'phone', 'custom',
] as const;

/** Default accessible label per platform (author `label` overrides). */
const LABELS: Record<string, string> = {
  x: 'X', twitter: 'X', instagram: 'Instagram', facebook: 'Facebook', linkedin: 'LinkedIn',
  youtube: 'YouTube', github: 'GitHub', tiktok: 'TikTok', whatsapp: 'WhatsApp',
  telegram: 'Telegram', discord: 'Discord', mastodon: 'Mastodon', rss: 'RSS',
  email: 'Email', website: 'Website', phone: 'Phone',
};

/** Simple monochrome (non-brand) contact icons — filled, 24×24. */
const GENERIC_ICONS: Record<string, string> = {
  email: 'M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v.5l-10 6.25L2 6.5V6zm0 2.85V18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.85l-9.47 5.92a1 1 0 0 1-1.06 0L2 8.85z',
  website: 'M14 3h7v7h-2V6.41l-8.29 8.3-1.42-1.42L17.59 5H14V3zM5 5h5v2H5v12h12v-5h2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z',
  phone: 'M6.62 2.53c.5-.2 1.08.02 1.36.49l1.7 3.01c.24.42.18.95-.15 1.3L8.06 9.03a12 12 0 0 0 6.9 6.9l1.7-1.47c.35-.33.88-.39 1.3-.15l3.01 1.7c.47.28.69.86.49 1.36l-.98 2.4c-.22.55-.79.9-1.4.83C10.7 20.1 3.9 13.3 3.1 5.9c-.07-.6.28-1.18.83-1.4l2.69-1.97z',
};

const schema: Schema = {
  title: { kind: 'string', default: '', max: 120 },
  layout: { kind: 'enum', values: ['row', 'grid'], default: 'row' },
  variant: { kind: 'enum', values: ['labeled', 'icon'], default: 'labeled' },
  align: { kind: 'enum', values: ['start', 'center', 'end'], default: 'center' },
  links: {
    kind: 'array', max: 20,
    of: {
      kind: 'object',
      fields: {
        platform: { kind: 'enum', values: PLATFORMS, default: 'custom' },
        href: { kind: 'string', required: true, default: '', max: 500 },
        label: { kind: 'string', default: '', max: 60 }, // overrides the platform default
        icon: { kind: 'string', default: '', max: 8 },    // emoji/glyph for `custom`
      },
    },
  },
};

const css = `
.blk-social-links{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-social-links .wrap{max-width:900px;margin:0 auto}
.blk-social-links h2{text-align:center;font-size:var(--fs-lg);font-weight:700;margin:0 0 var(--space)}
.blk-social-links .items{display:flex;flex-wrap:wrap;gap:.7em}
.blk-social-links.layout-grid .items{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}
.blk-social-links.align-center .items{justify-content:center}
.blk-social-links.align-end .items{justify-content:flex-end}
.blk-social-links .s-item{display:inline-flex;align-items:center;justify-content:center;gap:.5em;padding:.55em .95em;border-radius:var(--radius);text-decoration:none;color:var(--text);background:var(--surface);border:1px solid color-mix(in srgb,var(--text) 14%,transparent);font-size:var(--fs-base);font-weight:600;transition:color var(--motion),border-color var(--motion),transform var(--motion)}
.blk-social-links .s-item:hover,.blk-social-links .s-item:focus-visible{color:var(--primary);border-color:var(--primary);transform:translateY(-1px)}
.blk-social-links .s-item.icon-only{padding:0;width:2.9em;height:2.9em;border-radius:999px}
.blk-social-links .ico{flex:0 0 auto;width:1.2em;height:1.2em;display:block}
.blk-social-links .ico.emoji{font-size:1.15em;line-height:1;width:auto;height:auto}
`.trim();

interface LinkCfg { platform: string; href: string; label: string; icon: string }

function iconMarkup(platform: string, emoji: string): string {
  const path = platform === 'twitter' ? BRAND_ICON_PATHS.x : (BRAND_ICON_PATHS[platform] ?? GENERIC_ICONS[platform]);
  if (path) return `<svg class="ico" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="${path}"></path></svg>`;
  return emoji ? `<span class="ico emoji" aria-hidden="true">${escapeHtml(emoji)}</span>` : '';
}

function item(l: LinkCfg, iconOnly: boolean): string {
  const href = sanitizeUrl(l.href);
  if (href === '#' || !l.href) return ''; // no destination → drop (unset stays hidden)
  const platform = String(l.platform || 'custom');
  const label = l.label || LABELS[platform] || 'Link';
  const icon = iconMarkup(platform, l.icon);
  // icon-only mode needs the label as the accessible name; labeled mode shows it.
  return `<a class="s-item${iconOnly ? ' icon-only' : ''}" href="${escapeAttr(href)}" rel="noopener"${iconOnly ? ` aria-label="${escapeAttr(label)}"` : ''}>
        ${icon}
        ${iconOnly ? '' : `<span class="lbl">${escapeHtml(label)}</span>`}
      </a>`;
}

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const layout = config.layout === 'grid' ? 'grid' : 'row';
  const variant = config.variant === 'icon' ? 'icon' : 'labeled';
  const align = ['start', 'center', 'end'].includes(config.align as string) ? (config.align as string) : 'center';
  const iconOnly = variant === 'icon';
  const links = ((config.links as LinkCfg[]) ?? []).map((l) => item(l, iconOnly)).filter(Boolean);

  return `<section class="blk-social-links layout-${layout} align-${align}" aria-label="${escapeAttr(title || 'Social links')}">
  <div class="wrap">
    ${title ? `<h2>${escapeHtml(title)}</h2>` : ''}
    <div class="items">
      ${links.join('\n      ')}
    </div>
  </div>
</section>`;
}

export const socialLinks: BlockSpec = {
  type: 'social-links',
  description: 'A row or grid of links to social/contact profiles; each link picks a built-in brand icon by platform (or a custom emoji), shown labeled or icon-only.',
  schema,
  css,
  render,
};
