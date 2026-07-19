/**
 * `install-prompt` island — turns the static "add to home screen" toast into a
 * platform-aware one.
 *
 * Shipped from `@bytesbrains/weblocks/islands/install-prompt.js`; served at the
 * island URL the renderer emits (default `/_island/install-prompt.js`). Zero
 * dependencies, self-executing, idempotent, guarded by `typeof document`.
 *
 * - Hides the toast when the app is already installed (`display-mode: standalone`,
 *   iOS `navigator.standalone`, or the `appinstalled` event).
 * - Honours `data-delay` (ms) before revealing it, and a sticky dismiss stored
 *   under `wl:install-dismissed` when `data-remember="1"`.
 * - Captures `beforeinstallprompt`; where the browser offers a native install the
 *   action triggers it instead of expanding the written steps.
 * - Otherwise narrows `[data-platform]` on the steps container to the detected
 *   platform, so the visitor sees only the steps that apply to them.
 *
 * Pure progressive enhancement: with no JS the toast renders and the `<details>`
 * expands every platform's steps.
 */
interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
}

if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  const w = window;
  const STORE_KEY = 'wl:install-dismissed';

  // Storage can throw or be absent (private mode, blocked cookies) — a dismissed
  // toast simply stops being sticky, never breaks the page.
  const remembered = (): boolean => {
    try { return w.localStorage.getItem(STORE_KEY) === '1'; } catch { return false; }
  };
  const remember = (): void => {
    try { w.localStorage.setItem(STORE_KEY, '1'); } catch { /* storage blocked */ }
  };

  const installed = (): boolean => {
    const nav = w.navigator as Navigator & { standalone?: boolean };
    if (nav?.standalone === true) return true;
    return typeof w.matchMedia === 'function' && w.matchMedia('(display-mode: standalone)').matches;
  };

  /** Best-effort platform id, matching the guide ids the block renders. */
  const detect = (): string => {
    const nav = w.navigator as Navigator & { maxTouchPoints?: number; platform?: string };
    const ua = nav?.userAgent ?? '';
    // iPadOS 13+ reports itself as a Mac; the touch points give it away.
    const iOS = /iPad|iPhone|iPod/.test(ua) || (nav?.platform === 'MacIntel' && (nav.maxTouchPoints ?? 0) > 1);
    if (iOS) return /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua) ? 'ios-other' : 'ios-safari';
    if (/Android/.test(ua)) return /Firefox/.test(ua) ? 'firefox' : 'android';
    if (/Firefox/.test(ua)) return 'firefox';
    if (/Macintosh/.test(ua) && !/Chrome|Chromium|Edg\//.test(ua)) return 'macos-safari';
    return 'desktop-chrome';
  };

  // `beforeinstallprompt` fires early — listen at module scope and replay the
  // stashed event when the visitor asks how to install.
  let deferred: InstallPromptEvent | null = null;
  w.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
  });

  const ready = (fn: () => void) =>
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn();

  ready(() => {
    const roots = [...document.querySelectorAll<HTMLElement>('[data-wl-install]')]
      .filter((root) => root.dataset.wlReady !== '1'); // idempotent
    if (!roots.length) return;

    const platform = detect();

    roots.forEach((root) => {
      root.dataset.wlReady = '1';

      const sticky = root.getAttribute('data-remember') === '1';
      const dismissible = !!root.querySelector('[data-wl-dismiss]');
      const dismiss = () => {
        root.hidden = true;
        if (sticky) remember();
      };

      if (installed() || (sticky && remembered())) { root.hidden = true; return; }

      const delay = Number(root.getAttribute('data-delay')) || 0;
      if (delay > 0) {
        root.hidden = true;
        w.setTimeout(() => { if (!installed()) root.hidden = false; }, delay);
      }

      // Show only the detected platform's steps; the rest stay in the DOM so a
      // no-JS visitor (and anyone on an odd browser) still sees every guide.
      root.querySelector<HTMLElement>('.steps')?.setAttribute('data-platform', platform);

      // Where the browser offers a native install, the action fires it instead of
      // expanding the written steps.
      root.querySelector<HTMLElement>('[data-wl-install-action]')?.addEventListener('click', (e) => {
        if (!deferred) return;
        e.preventDefault();
        const evt = deferred;
        deferred = null;
        evt.prompt().catch(() => { deferred = evt; });
      });

      root.querySelectorAll<HTMLElement>('[data-wl-dismiss]').forEach((btn) => {
        btn.addEventListener('click', dismiss);
      });

      if (dismissible) {
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && !root.hidden) dismiss();
        });
      }
    });

    w.addEventListener('appinstalled', () => {
      roots.forEach((root) => { root.hidden = true; });
    });
  });
}

export {};
