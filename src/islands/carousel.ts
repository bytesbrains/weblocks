/**
 * `carousel` island — arrows, dot indicators, keyboard nav, and optional
 * autoplay for the `carousel` block.
 *
 * Shipped from `@bytesbrains/weblocks/islands/carousel.js`; served at the island
 * URL the renderer emits (default `/_island/carousel.js`). Zero dependencies,
 * self-executing, idempotent. Enhances the native scroll-snap track (the block
 * already works without JS); a no-op without a DOM or with fewer than 2 slides.
 * Autoplay honours `prefers-reduced-motion` and pauses on hover/focus.
 */
if (typeof document !== 'undefined') {
  const mkBtn = (cls: string, glyph: string, label: string): HTMLButtonElement => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'wl-car-btn ' + cls;
    b.textContent = glyph;
    b.setAttribute('aria-label', label);
    return b;
  };

  const setup = (root: HTMLElement) => {
    if (root.dataset.wlReady) return;
    const track = root.querySelector<HTMLElement>('.track');
    if (!track) return;
    const slides = Array.from(track.children) as HTMLElement[];
    if (slides.length < 2) return;
    root.dataset.wlReady = '1';

    const prev = mkBtn('wl-car-prev', '‹', 'Previous slide');
    const next = mkBtn('wl-car-next', '›', 'Next slide');
    root.append(prev, next);

    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'wl-car-dots';
    const dots = slides.map((_, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      d.addEventListener('click', () => go(i));
      dotsWrap.appendChild(d);
      return d;
    });
    root.appendChild(dotsWrap);

    let current = 0;
    const go = (i: number) => {
      const target = slides[Math.max(0, Math.min(slides.length - 1, i))]!;
      const r = target.getBoundingClientRect();
      const t = track.getBoundingClientRect();
      track.scrollBy({ left: r.left - t.left - (t.width - r.width) / 2, behavior: 'smooth' });
    };
    const update = () => {
      dots.forEach((d, i) => d.setAttribute('aria-current', i === current ? 'true' : 'false'));
      prev.toggleAttribute('disabled', current === 0);
      next.toggleAttribute('disabled', current === slides.length - 1);
    };

    prev.addEventListener('click', () => go(current - 1));
    next.addEventListener('click', () => go(current + 1));
    root.setAttribute('tabindex', '0');
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); }
    });

    const io = new IntersectionObserver((entries) => {
      for (const en of entries) {
        if (en.isIntersecting) {
          const i = slides.indexOf(en.target as HTMLElement);
          if (i >= 0) { current = i; update(); }
        }
      }
    }, { root: track, threshold: 0.6 });
    slides.forEach((s) => io.observe(s));
    update();

    const reduce = typeof window !== 'undefined' && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (root.dataset.wlAutoplay === 'true' && !reduce) {
      let timer = 0;
      const tick = () => go((current + 1) % slides.length);
      const start = () => { timer = window.setInterval(tick, 5000); };
      const stop = () => { window.clearInterval(timer); };
      start();
      root.addEventListener('mouseenter', stop);
      root.addEventListener('mouseleave', start);
      root.addEventListener('focusin', stop);
      root.addEventListener('focusout', start);
    }
  };

  const ready = (fn: () => void) =>
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn();

  ready(() => {
    const roots = Array.from(document.querySelectorAll<HTMLElement>('.blk-carousel'));
    if (!roots.length) return;
    if (!document.getElementById('wl-carousel-css')) {
      const s = document.createElement('style');
      s.id = 'wl-carousel-css';
      s.textContent = [
        '.blk-carousel{position:relative}',
        '.blk-carousel .track{scroll-behavior:smooth}',
        '.wl-car-btn{position:absolute;top:calc(50% - 22px);z-index:2;width:44px;height:44px;border-radius:999px;border:0;cursor:pointer;background:var(--surface,#fff);color:var(--text,#111);box-shadow:0 2px 12px rgba(0,0,0,.22);font-size:24px;line-height:1;display:flex;align-items:center;justify-content:center;opacity:.94;transition:opacity .15s}',
        '.wl-car-btn:hover{opacity:1}',
        '.wl-car-btn[disabled]{opacity:.35;cursor:default}',
        '.wl-car-prev{left:8px}',
        '.wl-car-next{right:8px}',
        '.wl-car-dots{display:flex;justify-content:center;gap:8px;margin-top:12px}',
        '.wl-car-dots button{width:9px;height:9px;padding:0;border:0;border-radius:999px;cursor:pointer;background:color-mix(in srgb,var(--text,#111) 30%,transparent);transition:width .2s,background .2s}',
        '.wl-car-dots button[aria-current="true"]{background:var(--primary,#333);width:22px}',
        '@media(prefers-reduced-motion:reduce){.blk-carousel .track{scroll-behavior:auto}}',
      ].join('');
      document.head.appendChild(s);
    }
    roots.forEach(setup);
  });
}

export {};
