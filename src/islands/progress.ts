/**
 * `progress` island — grows each indicator from empty to its real value when it
 * scrolls into view.
 *
 * Shipped from `@bytesbrains/weblocks/islands/progress.js`; served at the island
 * URL the renderer emits (default `/_island/progress.js`). Zero dependencies,
 * self-executing, idempotent, guarded by `typeof document`.
 *
 * Pure progressive enhancement: the correct width/offset is ALREADY inline in
 * the markup, and `aria-valuenow` is already correct. With no JS (or no
 * `IntersectionObserver`, or `prefers-reduced-motion`) the block reads exactly as
 * it does without this file — the animation only ever replaces a value with
 * itself. It never touches ARIA, so assistive tech is never told the value is
 * 0% mid-flight.
 */
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  const w = window;

  const reducedMotion = (): boolean =>
    typeof w.matchMedia === 'function' && w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Collapse to empty, then hand the real value back on the next frame. */
  const play = (el: HTMLElement): void => {
    const target = el.getAttribute('data-wl-progress');
    if (target === null) return;

    const circ = el.getAttribute('data-wl-circ');
    if (circ) {
      // Ring: animate the dash offset of the filled arc.
      const arc = el.querySelector<SVGCircleElement>('.rfill');
      if (!arc) return;
      const end = arc.style.strokeDashoffset || arc.getAttribute('stroke-dashoffset') || '0';
      arc.style.strokeDashoffset = circ;
      w.requestAnimationFrame(() => { w.requestAnimationFrame(() => { arc.style.strokeDashoffset = end; }); });
      return;
    }

    const fill = el.querySelector<HTMLElement>('.fill');
    if (!fill) return;
    const end = fill.style.width || `${target}%`;
    fill.style.width = '0%';
    w.requestAnimationFrame(() => { w.requestAnimationFrame(() => { fill.style.width = end; }); });
  };

  const nodes = document.querySelectorAll<HTMLElement>('[data-wl-progress]');
  if (!nodes.length || reducedMotion()) {
    // Nothing to do — the markup already shows the real values.
  } else if (typeof w.IntersectionObserver !== 'function') {
    // No observer: leave the honest, already-correct render in place.
  } else {
    const io = new w.IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        io.unobserve(el);
        if (el.dataset.wlProgressDone === '1') continue;
        el.dataset.wlProgressDone = '1';
        play(el);
      }
    }, { threshold: 0.25 });
    nodes.forEach((n) => io.observe(n));
  }
}
