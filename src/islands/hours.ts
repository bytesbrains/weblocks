/**
 * `hours` island — makes the `hours` block's "open now / closed" badge live and
 * highlights today, at VIEW time (so it's never frozen at generation time).
 *
 * Shipped from `@bytesbrains/weblocks/islands/hours.js`; served at the island URL
 * the renderer emits (default `/_island/hours.js`). Zero dependencies,
 * self-executing, idempotent, guarded by `typeof document`. Pure progressive
 * enhancement: with no JS the full weekly table still renders correctly.
 *
 * Each `<tr data-day="mon" data-hours="09:00-17:00,18:00-21:00">` carries that
 * day's ranges; a `[data-hours-badge]` in the block header is filled in.
 */
if (typeof document !== 'undefined') {
  const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']; // JS getDay() order
  const toMin = (hhmm: string): number => {
    const parts = (hhmm || '').split(':');
    const h = parseInt(parts[0] ?? '', 10), m = parseInt(parts[1] ?? '', 10);
    return Number.isFinite(h) && Number.isFinite(m) ? h * 60 + m : NaN;
  };
  const fmt = (min: number): string => {
    const h = Math.floor(min / 60) % 24, m = min % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const ready = (fn: () => void) =>
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn();

  ready(() => {
    document.querySelectorAll<HTMLElement>('[data-wl-hours]').forEach((block) => {
      const now = new Date();
      const todayKey = DAYS[now.getDay()];
      const nowMin = now.getHours() * 60 + now.getMinutes();

      let openNow = false;
      let nextOpenMin = Infinity;

      block.querySelectorAll<HTMLElement>('tr[data-day]').forEach((row) => {
        const isToday = row.getAttribute('data-day') === todayKey;
        if (isToday) row.setAttribute('data-today', 'true');
        if (!isToday) return;
        const ranges = (row.getAttribute('data-hours') || '').split(',').filter(Boolean);
        for (const r of ranges) {
          const [o, c] = r.split('-');
          const open = toMin(o ?? ''), close = toMin(c ?? '');
          if (!Number.isFinite(open) || !Number.isFinite(close)) continue;
          if (nowMin >= open && nowMin < close) openNow = true;
          if (open > nowMin && open < nextOpenMin) nextOpenMin = open;
        }
      });

      const badge = block.querySelector<HTMLElement>('[data-hours-badge]');
      if (!badge) return;
      if (openNow) {
        badge.textContent = 'Open now';
        badge.setAttribute('data-state', 'open');
      } else if (Number.isFinite(nextOpenMin)) {
        badge.textContent = `Closed · opens ${fmt(nextOpenMin)}`;
        badge.setAttribute('data-state', 'closed');
      } else {
        badge.textContent = 'Closed';
        badge.setAttribute('data-state', 'closed');
      }
      badge.hidden = false;
    });
  });
}

export {};
