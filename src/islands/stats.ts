/**
 * `stats` island — counts each figure up from zero when it scrolls into view.
 *
 * The block declares `island: 'stats'`, so the renderer emits
 * `<script src="/_island/stats.js">` for every page that uses it — but the
 * module was never shipped, so that script 404'd.
 *
 * Shipped from `@bytesbrains/weblocks/islands/stats.js`; served at the island URL
 * the renderer emits (default `/_island/stats.js`). Zero dependencies,
 * self-executing, idempotent, guarded by `typeof document`.
 *
 * Pure progressive enhancement: the real figure is already in the markup, so
 * with no JS (or no `IntersectionObserver`, or `prefers-reduced-motion`) the
 * block reads exactly as it does today — the animation only ever replaces the
 * number with itself.
 *
 * Only plainly numeric values animate (`1200`, `1,200`, `4.8`). Anything else
 * ("24/7", "1.2M", "≈300") is left untouched rather than mangled.
 */
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  const w = window;
  const DURATION = 900;

  const reducedMotion = () =>
    typeof w.matchMedia === 'function' && w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** The text node holding the figure (affix spans are siblings, left alone). */
  const figureNode = (el: HTMLElement): Text | null => {
    for (const node of [...el.childNodes]) {
      if (node.nodeType === 3 && (node.nodeValue ?? '').trim()) return node as Text;
    }
    return null;
  };

  const animate = (el: HTMLElement): void => {
    const raw = el.getAttribute('data-wl-count') ?? '';
    const grouped = /[,\s]/.test(raw);
    const plain = raw.replace(/[,\s]/g, '');
    if (!/^\d+(\.\d+)?$/.test(plain)) return; // not a plain number → leave it be
    const target = Number(plain);
    const decimals = (plain.split('.')[1] ?? '').length;
    const node = figureNode(el);
    if (!node) return;

    const format = (n: number): string => {
      const fixed = n.toFixed(decimals);
      if (!grouped) return fixed;
      const [int, frac] = fixed.split('.');
      const withSeparators = (int ?? '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return frac ? `${withSeparators}.${frac}` : withSeparators;
    };

    const start = w.performance?.now?.() ?? 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      node.nodeValue = format(target * eased);
      if (t < 1) w.requestAnimationFrame(step);
      else node.nodeValue = format(target); // land exactly on the real figure
    };
    w.requestAnimationFrame(step);
  };

  const ready = (fn: () => void) =>
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn();

  ready(() => {
    const figures = [...document.querySelectorAll<HTMLElement>('[data-wl-count]')]
      .filter((el) => el.dataset.wlReady !== '1'); // idempotent
    if (!figures.length || reducedMotion()) return;

    figures.forEach((el) => { el.dataset.wlReady = '1'; });

    // No IntersectionObserver → the markup already shows the final figure.
    if (typeof w.IntersectionObserver !== 'function' || typeof w.requestAnimationFrame !== 'function') return;

    const io = new w.IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        io.unobserve(entry.target);
        animate(entry.target as HTMLElement);
      }
    }, { threshold: 0.4 });

    figures.forEach((el) => io.observe(el));
  });
}

export {};
