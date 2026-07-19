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
if (typeof document !== "undefined") {
  const ready = (fn: () => void) =>
    document.readyState === "loading"
      ? document.addEventListener("DOMContentLoaded", fn)
      : fn();

  ready(() => {
    const galleries = Array.from(
      document.querySelectorAll<HTMLElement>(".blk-gallery[data-wl-lightbox]"),
    );
    if (!galleries.length) return;

    if (!document.getElementById("wl-lightbox-css")) {
      const LIGHTBOX_CSS = [
        ".wl-lb{position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.9)}",
        ".wl-lb[data-open]{display:flex}",
        ".wl-lb figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:.7rem}",
        ".wl-lb img{max-width:92vw;max-height:82vh;object-fit:contain;border-radius:6px;user-select:none}",
        ".wl-lb figcaption{color:#eee;font:500 14px system-ui,sans-serif;text-align:center;max-width:60ch;padding:0 1rem}",
        ".wl-lb button{position:absolute;background:rgba(255,255,255,.14);color:#fff;border:0;cursor:pointer;border-radius:999px;width:48px;height:48px;font-size:26px;line-height:1;display:flex;align-items:center;justify-content:center;transition:background .15s}",
        ".wl-lb button:hover,.wl-lb button:focus-visible{background:rgba(255,255,255,.28);outline:2px solid #fff}",
        ".wl-lb .wl-close{top:14px;right:14px}",
        ".wl-lb .wl-prev{left:14px;top:50%;transform:translateY(-50%)}",
        ".wl-lb .wl-next{right:14px;top:50%;transform:translateY(-50%)}",
        "html.wl-lb-lock{overflow:hidden}",
        "@media(max-width:520px){.wl-lb button{width:40px;height:40px;font-size:22px}}",
      ];
      const s = document.createElement("style");
      s.id = "wl-lightbox-css";
      s.textContent = LIGHTBOX_CSS.join("");
      document.head.appendChild(s);
    }

    // Built with createElement (no innerHTML) — the overlay chrome is static, but
    // constructing nodes keeps the "no HTML strings into the DOM" rule absolute.
    const mkBtn = (
      cls: string,
      glyph: string,
      label: string,
    ): HTMLButtonElement => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = cls;
      b.textContent = glyph;
      b.setAttribute("aria-label", label);
      return b;
    };
    const OVERLAY_ELEMENT = document.createElement("div");
    ov.className = "wl-lb";
    ov.setAttribute("role", "dialog");
    ov.setAttribute("aria-modal", "true");
    ov.setAttribute("aria-label", "Image viewer");
    const btnClose = mkBtn("wl-close", "×", "Close");
    const btnPrev = mkBtn("wl-prev", "‹", "Previous image");
    const btnNext = mkBtn("wl-next", "›", "Next image");
    const FIGURE_ELEMENT = document.createElement("figure");
    const BIG_IMAGE_ELEMENT = document.createElement("img");
    bigImg.alt = "";
    const CAPTION_ELEMENT = document.createElement("figcaption");
    fig.append(bigImg, cap);
    ov.append(btnClose, btnPrev, btnNext, fig);
    document.body.appendChild(ov);

    const ITEMS: HTMLImageElement[] = [];
    const INDEX = 0;
    const OPENER: HTMLElement | null = null;

    const show = () => {
      const img = items[idx];
      if (!img) return;
      bigImg.src = img.currentSrc || img.src;
      bigImg.alt = img.alt || "";
      const c =
        img.closest("figure")?.querySelector("figcaption")?.textContent || "";
      cap.textContent = c;
      cap.style.display = c ? "" : "none";
      const multi = items.length > 1;
      btnPrev.style.display = multi ? "" : "none";
      btnNext.style.display = multi ? "" : "none";
    };
    const open = (list: HTMLImageElement[], i: number, from: HTMLElement) => {
      items = list;
      idx = i;
      opener = from;
      show();
      ov.setAttribute("data-open", "");
      document.documentElement.classList.add("wl-lb-lock");
      btnClose.focus();
    };
    const close = () => {
      ov.removeAttribute("data-open");
      document.documentElement.classList.remove("wl-lb-lock");
      bigImg.removeAttribute("src");
      opener?.focus();
    };
    const nav = (d: number) => {
      if (items.length) {
        idx = (idx + d + items.length) % items.length;
        show();
      }
    };

    btnClose.addEventListener("click", close);
    btnPrev.addEventListener("click", () => nav(-1));
    btnNext.addEventListener("click", () => nav(1));
    ov.addEventListener("click", (e) => {
      if (e.target === ov) close();
    });
    document.addEventListener("keydown", (e) => {
      if (!ov.hasAttribute("data-open")) return;
      if (e.key === "Escape") {
        close();
        return;
      } else if (e.key === "ArrowLeft") {
        nav(-1);
        return;
      } else if (e.key === "ArrowRight") {
        nav(1);
        return;
      }
    });

    const sx = 0;
    ov.addEventListener(
      "touchstart",
      (e) => {
        sx = e.changedTouches[0]!.clientX;
      },
      { passive: true },
    );
    ov.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0]!.clientX - sx;
      if (Math.abs(dx) > 40) nav(dx < 0 ? 1 : -1);
    });

    galleries.forEach((g) => {
      const imgs = Array.from(
        g.querySelectorAll<HTMLImageElement>("figure img"),
      );
      imgs.forEach((img, i) => {
        img.style.cursor = "zoom-in";
        img.setAttribute("role", "button");
        img.setAttribute("tabindex", "0");
        const go = () => open(imgs, i, img);
        img.addEventListener("click", go);
        img.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            go();
          }
        });
      });
    });
  });
}

export {};
