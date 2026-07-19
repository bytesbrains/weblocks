/**
 * `announcement-bar` island — wires the strip's dismiss button.
 *
 * The block declares `island: 'announcement-bar'`, so the renderer emits
 * `<script src="/_island/announcement-bar.js">` for every page that uses it —
 * but the module was never shipped, so that script 404'd and the close button
 * did nothing.
 *
 * Shipped from `@bytesbrains/weblocks/islands/announcement-bar.js`; served at the
 * island URL the renderer emits (default `/_island/announcement-bar.js`). Zero
 * dependencies, self-executing, idempotent, guarded by `typeof document`. Pure
 * progressive enhancement: with no JS the strip simply stays put.
 */
if (typeof document !== 'undefined') {
  const ready = (fn: () => void) =>
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn();

  ready(() => {
    document.querySelectorAll<HTMLElement>('.blk-announcement-bar').forEach((bar) => {
      if (bar.dataset.wlReady === '1') return; // idempotent
      bar.dataset.wlReady = '1';

      // Scoped to this strip — other blocks own their own [data-wl-dismiss].
      bar.querySelectorAll<HTMLElement>('[data-wl-dismiss]').forEach((btn) => {
        btn.addEventListener('click', () => { bar.hidden = true; });
      });
    });
  });
}

export {};
