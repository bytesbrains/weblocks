/**
 * `install-prompt` — a dismissible toast inviting the visitor to install the
 * page as an app, with per-platform "Add to Home Screen" instructions.
 *
 * The engine already emits a real PWA (`pwa.ts`: manifest + service worker), but
 * nothing ever told a visitor they *could* install it — and on iOS Safari there
 * is no `beforeinstallprompt`, so written steps are the only path.
 *
 * Static-first: the toast is plain markup and the guide is a `<details>`, so with
 * no JS the visitor still gets every platform's steps. The `install-prompt`
 * island enhances it — native install prompt where the browser offers one, only
 * the matching platform's steps otherwise, sticky dismiss, and auto-hide once
 * the app is installed.
 */
import { escapeAttr, escapeHtml, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

/** The platform guides, in the order they render. Built-in copy — never author input. */
const GUIDES: ReadonlyArray<{ id: string; label: string; steps: readonly string[] }> = [
  {
    id: 'ios-safari',
    label: 'iPhone & iPad — Safari',
    steps: [
      'Tap the Share button in the browser bar.',
      'Scroll down and tap "Add to Home Screen".',
      'Tap "Add" — the icon appears on your Home Screen.',
    ],
  },
  {
    id: 'ios-other',
    label: 'iPhone & iPad — Chrome, Firefox or Edge',
    steps: [
      'Open the browser menu and choose "Open in Safari".',
      'In Safari, tap Share, then "Add to Home Screen".',
      'Tap "Add" to finish.',
    ],
  },
  {
    id: 'android',
    label: 'Android — Chrome',
    steps: [
      'Tap the three-dot menu at the top right.',
      'Tap "Install app" (or "Add to Home screen").',
      'Confirm with "Install".',
    ],
  },
  {
    id: 'desktop-chrome',
    label: 'Windows & Linux — Chrome or Edge',
    steps: [
      'Click the install icon at the right of the address bar.',
      'No icon? Open the browser menu and choose "Install".',
      'Confirm with "Install" — it opens in its own window.',
    ],
  },
  {
    id: 'macos-safari',
    label: 'Mac — Safari 17 or later',
    steps: [
      'Open the File menu.',
      'Choose "Add to Dock".',
      'Confirm with "Add".',
    ],
  },
  {
    id: 'firefox',
    label: 'Firefox on desktop',
    steps: [
      'Firefox on desktop cannot install web apps.',
      'Press Ctrl+D (Cmd+D on Mac) to bookmark this page instead.',
      'On Android, Firefox can install it from its menu.',
    ],
  },
];

const PLATFORM_IDS = GUIDES.map((g) => g.id);

const schema: Schema = {
  title: { kind: 'string', required: true, default: 'Install this app', max: 60 },
  body: { kind: 'string', default: 'Add it to your home screen for one-tap access, even offline.', max: 160 },
  actionLabel: { kind: 'string', default: 'How?', max: 30 },
  position: { kind: 'enum', values: ['bottom', 'top', 'bottom-right'], default: 'bottom' },
  tone: { kind: 'enum', values: ['info', 'promo'], default: 'info' },
  /** Delay before the island reveals the toast. 0 = immediately. */
  delayMs: { kind: 'int', default: 0, min: 0, max: 60000 },
  dismissible: { kind: 'boolean', default: true },
  /** Remember a dismiss in localStorage so it stays dismissed on the next visit. */
  rememberDismiss: { kind: 'boolean', default: true },
  /** Which platform guides to include. Empty = all of them. */
  platforms: { kind: 'array', of: { kind: 'enum', values: PLATFORM_IDS }, max: 6 },
};

const css = `
.blk-install-prompt{position:fixed;z-index:60;left:var(--space);right:var(--space);display:flex;font-family:var(--font);font-size:var(--fs-base);pointer-events:none}
.blk-install-prompt.pos-bottom{bottom:var(--space);justify-content:center}
.blk-install-prompt.pos-top{top:var(--space);justify-content:center}
.blk-install-prompt.pos-bottom-right{bottom:var(--space);justify-content:flex-end}
.blk-install-prompt .toast{pointer-events:auto;width:100%;max-width:26rem;background:var(--surface);color:var(--text);border:1px solid color-mix(in srgb, var(--text) 14%, transparent);border-radius:var(--radius);padding:.9em 1em;box-shadow:0 6px 24px color-mix(in srgb, var(--text) 22%, transparent)}
.blk-install-prompt.tone-info .toast{border-left:3px solid var(--primary)}
.blk-install-prompt.tone-promo .toast{border-left:3px solid var(--accent)}
.blk-install-prompt .head{display:flex;align-items:flex-start;gap:.6em}
.blk-install-prompt .copy{flex:1 1 auto;min-width:0}
.blk-install-prompt .title{margin:0;font-weight:700}
.blk-install-prompt .body{margin:.2em 0 0;color:var(--muted);font-size:calc(var(--fs-base)*.92)}
.blk-install-prompt .close{flex:0 0 auto;background:none;border:0;color:inherit;font-size:1.2em;line-height:1;cursor:pointer;padding:.15em .4em;border-radius:var(--radius);opacity:.7;transition:opacity var(--motion),background var(--motion)}
.blk-install-prompt .close:hover,.blk-install-prompt .close:focus-visible{opacity:1;background:color-mix(in srgb, var(--text) 12%, transparent)}
.blk-install-prompt .guide{margin-top:.7em}
.blk-install-prompt summary{display:inline-block;cursor:pointer;font-weight:700;color:var(--primary);padding:.35em .8em;border:1px solid currentColor;border-radius:var(--radius);list-style:none}
.blk-install-prompt summary::-webkit-details-marker{display:none}
.blk-install-prompt summary:hover,.blk-install-prompt summary:focus-visible{color:var(--accent)}
.blk-install-prompt .steps{margin-top:.7em;max-height:15em;overflow:auto}
.blk-install-prompt .steps h3{margin:.8em 0 .3em;font-size:calc(var(--fs-base)*.88);text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}
.blk-install-prompt .steps > div:first-child h3{margin-top:0}
.blk-install-prompt .steps ol{margin:0;padding-left:1.2em;font-size:calc(var(--fs-base)*.92)}
.blk-install-prompt .steps li{margin:.2em 0}
/* JS on: reveal is opt-in (delay/dismiss/installed checks run first) and only
   the detected platform's steps stay visible. */
.blk-install-prompt[hidden]{display:none}
.blk-install-prompt .steps[data-platform] > div{display:none}
.blk-install-prompt .steps[data-platform="ios-safari"] > [data-platform="ios-safari"],
.blk-install-prompt .steps[data-platform="ios-other"] > [data-platform="ios-other"],
.blk-install-prompt .steps[data-platform="android"] > [data-platform="android"],
.blk-install-prompt .steps[data-platform="desktop-chrome"] > [data-platform="desktop-chrome"],
.blk-install-prompt .steps[data-platform="macos-safari"] > [data-platform="macos-safari"],
.blk-install-prompt .steps[data-platform="firefox"] > [data-platform="firefox"]{display:block}
@media(max-width:440px){.blk-install-prompt .toast{max-width:none}}
`.trim();

function guideHtml(g: { id: string; label: string; steps: readonly string[] }): string {
  const steps = g.steps.map((s) => `<li>${escapeHtml(s)}</li>`).join('');
  return `<div data-platform="${escapeAttr(g.id)}"><h3>${escapeHtml(g.label)}</h3><ol>${steps}</ol></div>`;
}

function render(config: Record<string, unknown>): string {
  const title = (config.title as string) || 'Install this app';
  const body = config.body as string;
  const actionLabel = (config.actionLabel as string) || 'How?';
  const position = config.position as string;
  const tone = config.tone as string;
  const delayMs = config.delayMs as number;
  const dismissible = config.dismissible as boolean;
  const remember = config.rememberDismiss as boolean;

  // An empty/unknown selection means "all platforms" (total render).
  const picked = new Set((config.platforms as string[]).filter((p) => PLATFORM_IDS.includes(p)));
  const guides = picked.size ? GUIDES.filter((g) => picked.has(g.id)) : GUIDES;

  const close = dismissible
    ? `<button type="button" class="close" data-wl-dismiss aria-label="Dismiss">&times;</button>`
    : '';
  const bodyLine = body ? `\n        <p class="body">${escapeHtml(body)}</p>` : '';

  return `<section class="blk-install-prompt pos-${position} tone-${tone}" aria-label="Install this app" data-wl-noprint data-wl-install data-delay="${escapeAttr(delayMs)}" data-remember="${remember ? '1' : '0'}">
  <div class="toast">
    <div class="head">
      <div class="copy">
        <p class="title">${escapeHtml(title)}</p>${bodyLine}
      </div>
      ${close}
    </div>
    <details class="guide">
      <summary data-wl-install-action>${escapeHtml(actionLabel)}</summary>
      <div class="steps">
        ${guides.map(guideHtml).join('\n        ')}
      </div>
    </details>
  </div>
</section>`;
}

export const installPrompt: BlockSpec = {
  type: 'install-prompt',
  description: 'A dismissible toast inviting visitors to install the site as an app, with step-by-step "Add to Home Screen" instructions matched to their platform (iOS, Android, Chrome/Edge, macOS Safari). Pair it with a PWA-enabled manifest.',
  schema,
  css,
  render,
  // Native install prompt, platform detection and sticky dismiss are JS-enhanced;
  // with no JS the toast still renders and every platform's steps expand.
  island: 'install-prompt',
};
