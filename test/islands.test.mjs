// Behaviour tests for the shipped client islands, driven through a real DOM
// (jsdom). Plain JS (not TS) so it can use DOM globals without the engine's
// DOM-free tsconfig. Run via `npm test` (see the `test` script).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

/** Install a fresh jsdom document as the globals the islands read. */
function installDom(bodyHtml, options = {}) {
  const { userAgent, ...jsdomOptions } = options;
  const dom = new JSDOM(`<!doctype html><html><body>${bodyHtml}</body></html>`, { pretendToBeVisual: true, ...jsdomOptions });
  const w = dom.window;
  // jsdom no longer takes a `userAgent` option; stub the navigator the islands read.
  if (userAgent) {
    Object.defineProperty(w, 'navigator', { value: { userAgent, maxTouchPoints: 5 }, configurable: true });
  }
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

/** The static markup the `install-prompt` block renders (trimmed to what the island reads). */
const INSTALL_TOAST = (attrs = 'data-remember="1"') =>
  `<section class="blk-install-prompt" data-wl-install data-delay="0" ${attrs}>` +
  '<div class="toast"><div class="head"><div class="copy"><p class="title">Install</p></div>' +
  '<button data-wl-dismiss aria-label="Dismiss">x</button></div>' +
  '<details class="guide"><summary data-wl-install-action>How?</summary><div class="steps">' +
  '<div data-platform="ios-safari"></div><div data-platform="android"></div>' +
  '</div></details></div></section>';

const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

// jsdom only grants localStorage to a real origin (about:blank is opaque).
const ORIGIN = { url: 'https://example.test/' };

test('install-prompt island: narrows the steps to the visitor platform and dismisses stickily', async () => {
  const w = installDom(INSTALL_TOAST(), { ...ORIGIN, userAgent: IPHONE_UA });
  await import('../lib/islands/install-prompt.js?case=ios');

  const root = document.querySelector('[data-wl-install]');
  assert.equal(root.dataset.wlReady, '1', 'setup ran once');
  assert.equal(root.hidden, false, 'visible — not installed, not dismissed');
  assert.equal(root.querySelector('.steps').getAttribute('data-platform'), 'ios-safari', 'iPhone Safari detected');

  root.querySelector('[data-wl-dismiss]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  assert.equal(root.hidden, true, 'dismiss hides the toast');
  assert.equal(w.localStorage.getItem('wl:install-dismissed'), '1', 'dismiss remembered for the next visit');
});

test('install-prompt island: stays hidden once dismissed, and only when rememberDismiss is on', async () => {
  const w = installDom(INSTALL_TOAST(), ORIGIN);
  w.localStorage.setItem('wl:install-dismissed', '1');
  await import('../lib/islands/install-prompt.js?case=remembered');
  assert.equal(document.querySelector('[data-wl-install]').hidden, true, 'a remembered dismiss hides it on load');

  const w2 = installDom(INSTALL_TOAST('data-remember="0"'), ORIGIN);
  w2.localStorage.setItem('wl:install-dismissed', '1');
  await import('../lib/islands/install-prompt.js?case=notsticky');
  assert.equal(document.querySelector('[data-wl-install]').hidden, false, 'rememberDismiss off → shown again');
});
