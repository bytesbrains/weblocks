/**
 * `lightbox` island — click-to-zoom viewer for `gallery` images.
 *
 * Shipped from `@bytesbrains/weblocks/islands/lightbox.js`; the host serves it at
 * the island URL the renderer emits (default `/_island/lightbox.js`). Zero
 * dependencies, self-executing on load, idempotent. Enhances only galleries the
 * renderer flagged with `data-wl-lightbox`; a no-op without a DOM (safe to
 * import in Node/SSR).
 *
 * Features: open on click / Enter, prev–next within the gallery, arrow-key nav,
 * Escape + backdrop to close, touch swipe, caption, background scroll lock, and
 * focus returned to the opener.
 */
if (typeof document !== 'undefined') {
  const ready = (fn: () => void) =>
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn();

  ready(() => {
    const galleries = Array.from(document.querySelectorAll<HTMLElement>('.blk-gallery[data-wl-lightbox]'));
    if (!galleries.length) return;

    if (!document.getElementById('wl-lightbox-css')) {
      const s = document.createElement('style');
      s.id = 'wl-lightbox-css';
      s.textContent = [
        '.wl-lb{position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.9)}',
        '.wl-lb[data-open]{display:flex}',
        '.wl-lb figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:.7rem}',
        '.wl-lb img{max-width:92vw;max-height:82vh;object-fit:contain;border-radius:6px;user-select:none}',
        '.wl-lb figcaption{color:#eee;font:500 14px system-ui,sans-serif;text-align:center;max-width:60ch;padding:0 1rem}',
        '.wl-lb button{position:absolute;background:rgba(255,255,255,.14);color:#fff;border:0;cursor:pointer;border-radius:999px;width:48px;height:48px;font-size:26px;line-height:1;display:flex;align-items:center;justify-content:center;transition:background .15s}',
        '.wl-lb button:hover,.wl-lb button:focus-visible{background:rgba(255,255,255,.28);outline:2px solid #fff}',
        '.wl-lb .wl-close{top:14px;right:14px}',
        '.wl-lb .wl-prev{left:14px;top:50%;transform:translateY(-50%)}',
        '.wl-lb .wl-next{right:14px;top:50%;transform:translateY(-50%)}',
        'html.wl-lb-lock{overflow:hidden}',
        '@media(max-width:520px){.wl-lb button{width:40px;height:40px;font-size:22px}}',
      ].join('');
      document.head.appendChild(s);
    }

    const ov = document.createElement('div');
    ov.className = 'wl-lb';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'Image viewer');
    ov.innerHTML =
      '<button class="wl-close" type="button" aria-label="Close">×</button>' +
      '<button class="wl-prev" type="button" aria-label="Previous image">‹</button>' +
      '<button class="wl-next" type="button" aria-label="Next image">›</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>';
    document.body.appendChild(ov);

    const bigImg = ov.querySelector('img')!;
    const cap = ov.querySelector('figcaption')!;
    const btnPrev = ov.querySelector<HTMLElement>('.wl-prev')!;
    const btnNext = ov.querySelector<HTMLElement>('.wl-next')!;

    let items: HTMLImageElement[] = [];
    let idx = 0;
    let opener: HTMLElement | null = null;

    const show = () => {
      const img = items[idx];
      if (!img) return;
      bigImg.src = img.currentSrc || img.src;
      bigImg.alt = img.alt || '';
      const c = img.closest('figure')?.querySelector('figcaption')?.textContent || '';
      cap.textContent = c;
      cap.style.display = c ? '' : 'none';
      const multi = items.length > 1;
      btnPrev.style.display = multi ? '' : 'none';
      btnNext.style.display = multi ? '' : 'none';
    };
    const open = (list: HTMLImageElement[], i: number, from: HTMLElement) => {
      items = list; idx = i; opener = from;
      show();
      ov.setAttribute('data-open', '');
      document.documentElement.classList.add('wl-lb-lock');
      (ov.querySelector('.wl-close') as HTMLElement).focus();
    };
    const close = () => {
      ov.removeAttribute('data-open');
      document.documentElement.classList.remove('wl-lb-lock');
      bigImg.removeAttribute('src');
      opener?.focus();
    };
    const nav = (d: number) => { if (items.length) { idx = (idx + d + items.length) % items.length; show(); } };

    ov.querySelector('.wl-close')!.addEventListener('click', close);
    btnPrev.addEventListener('click', () => nav(-1));
    btnNext.addEventListener('click', () => nav(1));
    ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
    document.addEventListener('keydown', (e) => {
      if (!ov.hasAttribute('data-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') nav(-1);
      else if (e.key === 'ArrowRight') nav(1);
    });

    let sx = 0;
    ov.addEventListener('touchstart', (e) => { sx = e.changedTouches[0]!.clientX; }, { passive: true });
    ov.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0]!.clientX - sx;
      if (Math.abs(dx) > 40) nav(dx < 0 ? 1 : -1);
    });

    galleries.forEach((g) => {
      const imgs = Array.from(g.querySelectorAll<HTMLImageElement>('figure img'));
      imgs.forEach((img, i) => {
        img.style.cursor = 'zoom-in';
        img.setAttribute('role', 'button');
        img.setAttribute('tabindex', '0');
        const go = () => open(imgs, i, img);
        img.addEventListener('click', go);
        img.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
        });
      });
    });
  });
}

export {};
