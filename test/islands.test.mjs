// Behaviour tests for the shipped client islands, driven through a real DOM
// (jsdom). Plain JS (not TS) so it can use DOM globals without the engine's
// DOM-free tsconfig. Run via `npm test` (see the `test` script).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

/** Install a fresh jsdom document as the globals the islands read. */
function installDom(bodyHtml) {
  const dom = new JSDOM(`<!doctype html><html><body>${bodyHtml}</body></html>`, { pretendToBeVisual: true });
  const w = dom.window;
  if (!w.IntersectionObserver) {
    w.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
  }
  // jsdom doesn't implement scrolling; make it a no-op so the carousel doesn't throw.
  w.HTMLElement.prototype.scrollBy = function () {};
  w.HTMLElement.prototype.scrollIntoView = function () {};
  global.window = w;
  global.document = w.document;
  global.HTMLElement = w.HTMLElement;
  global.IntersectionObserver = w.IntersectionObserver;
  return w;
}

test('lightbox island: opens on click, navigates, and closes on Escape', async () => {
  const w = installDom(
    '<section class="blk-gallery" data-wl-lightbox="true"><div class="wrap"><div class="grid">' +
    '<figure><img src="/1.jpg" alt="one"><figcaption>First</figcaption></figure>' +
    '<figure><img src="/2.jpg" alt="two"></figure>' +
    '</div></div></section>',
  );
  await import('../lib/islands/lightbox.js?case=open');

  const imgs = document.querySelectorAll('.blk-gallery figure img');
  assert.equal(imgs.length, 2);

  imgs[0].dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  const ov = document.querySelector('.wl-lb');
  assert.ok(ov && ov.hasAttribute('data-open'), 'overlay opens');
  assert.ok(ov.querySelector('img').src.includes('/1.jpg'), 'shows the clicked image');
  assert.equal(ov.querySelector('figcaption').textContent, 'First', 'caption copied');

  document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowRight' }));
  assert.ok(ov.querySelector('img').src.includes('/2.jpg'), 'ArrowRight → next image');

  document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape' }));
  assert.ok(!ov.hasAttribute('data-open'), 'Escape closes');
});

test('lightbox island: only enhances galleries flagged data-wl-lightbox', async () => {
  installDom('<section class="blk-gallery"><div class="grid"><figure><img src="/x.jpg" alt="x"></figure></div></section>');
  await import('../lib/islands/lightbox.js?case=noflag');
  const img = document.querySelector('.blk-gallery img');
  assert.equal(img.getAttribute('role'), null, 'unflagged gallery is left untouched');
});

test('carousel island: injects arrows + one dot per slide, sets active state', async () => {
  const w = installDom(
    '<section class="blk-carousel"><div class="track">' +
    '<figure class="slide">a</figure><figure class="slide">b</figure><figure class="slide">c</figure>' +
    '</div></section>',
  );
  await import('../lib/islands/carousel.js?case=basic');

  const root = document.querySelector('.blk-carousel');
  assert.equal(root.dataset.wlReady, '1', 'setup ran once');
  assert.equal(root.querySelectorAll('.wl-car-btn').length, 2, 'prev + next arrows');
  assert.equal(root.querySelectorAll('.wl-car-dots button').length, 3, 'one dot per slide');
  assert.equal(root.getAttribute('tabindex'), '0', 'keyboard-focusable');
  // At slide 0, prev is disabled; clicking next must not throw (scroll stubbed).
  assert.ok(root.querySelector('.wl-car-prev').hasAttribute('disabled'), 'prev disabled at start');
  root.querySelector('.wl-car-next').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
});

test('carousel island: a single-slide carousel gets no controls', async () => {
  installDom('<section class="blk-carousel"><div class="track"><figure class="slide">only</figure></div></section>');
  await import('../lib/islands/carousel.js?case=single');
  const root = document.querySelector('.blk-carousel');
  assert.equal(root.querySelectorAll('.wl-car-btn').length, 0, 'no arrows for <2 slides');
});

test('announcement-bar island: the close button dismisses the strip', async () => {
  const w = installDom(
    '<section class="blk-announcement-bar tone-info"><div class="wrap"><p class="msg">Hi</p>' +
    '<button class="close" data-wl-dismiss aria-label="Dismiss">x</button></div></section>' +
    '<section class="blk-other"><button data-wl-dismiss>not mine</button></section>',
  );
  await import('../lib/islands/announcement-bar.js?case=dismiss');

  const bar = document.querySelector('.blk-announcement-bar');
  assert.equal(bar.dataset.wlReady, '1', 'setup ran once');
  assert.equal(bar.hidden, false, 'visible until dismissed');

  // A [data-wl-dismiss] outside the strip belongs to another block — left alone.
  document.querySelector('.blk-other [data-wl-dismiss]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  assert.equal(bar.hidden, false, 'another block\'s dismiss does not hide the strip');

  bar.querySelector('[data-wl-dismiss]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  assert.equal(bar.hidden, true, 'own close button hides the strip');
});

test('stats island: counts a numeric figure up to its real value, leaves odd ones alone', async () => {
  const w = installDom(
    '<section class="blk-stats"><div class="item"><div class="value" data-wl-count="1,200">' +
    '<span class="affix">+</span>1,200</div></div>' +
    '<div class="item"><div class="value" data-wl-count="24/7">24/7</div></div></section>',
  );
  // Drive the observer by hand: fire the callback for everything observed.
  const observed = [];
  w.IntersectionObserver = class {
    constructor(cb) { this.cb = cb; }
    observe(el) { observed.push(el); this.cb([{ isIntersecting: true, target: el }], this); }
    unobserve() {}
    disconnect() {}
  };
  global.IntersectionObserver = w.IntersectionObserver;
  await import('../lib/islands/stats.js?case=countup');

  const [numeric, odd] = document.querySelectorAll('.value');
  assert.equal(observed.length, 2, 'both figures observed');
  assert.equal(odd.textContent, '24/7', 'a non-numeric value is never touched');

  // rAF runs the animation; after the final frame it lands on the real figure.
  await new Promise((r) => setTimeout(r, 1200));
  assert.equal(numeric.textContent, '+1,200', 'lands exactly on the rendered figure, affix intact');
});
