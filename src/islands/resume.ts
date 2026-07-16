/**
 * `resume` island — wires the `profile-header` action buttons.
 *
 * Shipped from `@bytesbrains/weblocks/islands/resume.js`; served at the island
 * URL the renderer emits (default `/_island/resume.js`). Zero dependencies,
 * self-executing, idempotent, guarded by `typeof document`.
 *
 * - `[data-wl-print]` → `window.print()`. The engine's `@media print` styles turn
 *   the page into a clean one-column résumé, so "Save as PDF" in the print dialog
 *   produces the downloadable CV.
 * - `[data-wl-share]` → the Web Share API (native share sheet) with a
 *   copy-link-to-clipboard fallback.
 */
if (typeof document !== 'undefined') {
  const ready = (fn: () => void) =>
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn();

  ready(() => {
    document.querySelectorAll<HTMLElement>('[data-wl-print]').forEach((btn) => {
      btn.addEventListener('click', () => window.print());
    });

    document.querySelectorAll<HTMLElement>('[data-wl-share]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const url = location.href;
        const nav = navigator as Navigator & { share?: (d: { title?: string; url?: string }) => Promise<void> };
        if (typeof nav.share === 'function') {
          try { await nav.share({ title: document.title, url }); } catch { /* dismissed */ }
          return;
        }
        try {
          await navigator.clipboard.writeText(url);
          const prev = btn.textContent;
          btn.textContent = 'Link copied';
          setTimeout(() => { btn.textContent = prev; }, 1800);
        } catch { /* clipboard blocked */ }
      });
    });
  });
}

export {};
