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
