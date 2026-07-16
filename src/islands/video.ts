/**
 * `video` island — click-to-play for `video-gallery` cards.
 *
 * Shipped from `@bytesbrains/weblocks/islands/video.js`; served at the island URL
 * the renderer emits (default `/_island/video.js`). Zero dependencies,
 * self-executing, idempotent, guarded by `typeof document`. Each card is an
 * `<a>` facade (thumbnail + play button) that links to the video on its platform;
 * this island intercepts the click and swaps the thumbnail for the real,
 * autoplaying player inline. Built with `createElement`/`replaceChildren` — no
 * HTML strings into the DOM.
 */
if (typeof document !== 'undefined') {
  const play = (card: HTMLElement) => {
    if (card.dataset.wlPlaying) return;
    const embed = card.dataset.wlEmbed;
    const media = card.querySelector<HTMLElement>('.v-media');
    if (!embed || !media) return;
    card.dataset.wlPlaying = '1';

    let el: HTMLElement;
    if (card.dataset.wlProvider === 'file') {
      const v = document.createElement('video');
      v.src = embed;
      v.controls = true;
      v.autoplay = true;
      v.setAttribute('playsinline', '');
      el = v;
    } else {
      const f = document.createElement('iframe');
      f.src = embed;
      f.title = card.dataset.wlTitle || 'Video';
      f.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
      f.setAttribute('allowfullscreen', '');
      el = f;
    }
    el.className = 'v-frame';
    media.replaceChildren(el);
  };

  const ready = (fn: () => void) =>
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn();

  ready(() => {
    document.querySelectorAll<HTMLElement>('.blk-video-gallery [data-wl-video]').forEach((card) => {
      card.addEventListener('click', (e) => { e.preventDefault(); play(card); });
    });
  });
}

export {};
