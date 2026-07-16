/**
 * Shared helpers for the video blocks — extract provider ids from an id-or-URL
 * and build SAFE provider URLs. Ids are reduced to their allowed charset first,
 * so the returned URLs are built from trusted fragments (no injection).
 */
export function youtubeId(src: unknown): string {
  const s = String(src ?? '');
  const m = /(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/.exec(s);
  return (m ? m[1]! : s).replace(/[^A-Za-z0-9_-]/g, '');
}

export function vimeoId(src: unknown): string {
  return String(src ?? '').replace(/[^0-9]/g, '');
}

export function youtubeThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function youtubeEmbed(id: string, autoplay = false): string {
  return `https://www.youtube-nocookie.com/embed/${id}${autoplay ? '?autoplay=1' : ''}`;
}

export function youtubeWatch(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function vimeoEmbed(id: string, autoplay = false): string {
  return `https://player.vimeo.com/video/${id}${autoplay ? '?autoplay=1' : ''}`;
}

export function vimeoWatch(id: string): string {
  return `https://vimeo.com/${id}`;
}

/** A filled play-triangle glyph (24×24, fill=currentColor). */
export const PLAY_ICON =
  '<svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg>';
