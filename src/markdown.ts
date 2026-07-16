/**
 * A tiny, SAFE Markdown-subset renderer — escape-first, whitelist-only.
 *
 * This is NOT a raw-HTML passthrough (that would break the engine's no-injection
 * invariant, see VISION.md §3). Every character of the source is HTML-escaped
 * BEFORE any formatting is applied, so a literal `<script>` renders as text,
 * never markup. Only a fixed set of safe elements is ever produced, and link
 * hrefs are scheme-sanitized. Total: it never throws.
 *
 * Supported:
 *   #, ##, ###…        headings (→ h2…h6)
 *   -  or  *           unordered list        1.  ordered list
 *   >                  blockquote            --- / *** / ___  horizontal rule
 *   blank line         paragraph break
 *   **bold**  *italic*  _italic_  `code`  [text](url)
 */
import { escapeHtml, sanitizeUrl } from './schema.js';

/** Inline formatting. Operates on ALREADY-ESCAPED text; only adds safe tags. */
function inline(escaped: string): string {
  let s = escaped;
  // `code` first, so its contents aren't touched by the emphasis rules.
  s = s.replace(/`([^`]+)`/g, (_m, c) => `<code>${c}</code>`);
  // [text](url) — url is taken from escaped text (already attribute-safe) and
  // scheme-sanitized; not re-escaped (that would double-encode `&`).
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text, url) => `<a href="${sanitizeUrl(url)}" rel="noopener">${text}</a>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, (_m, t) => `<strong>${t}</strong>`);
  s = s.replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, (_m, pre, t) => `${pre}<em>${t}</em>`);
  s = s.replace(/(^|[^_\w])_([^_]+)_/g, (_m, pre, t) => `${pre}<em>${t}</em>`);
  return s;
}

const esc = (raw: string) => inline(escapeHtml(raw));

/** Render a Markdown-subset string to safe HTML. */
export function renderMarkdown(src: unknown): string {
  const lines = String(src ?? '').replace(/\r\n?/g, '\n').split('\n');
  const out: string[] = [];
  let para: string[] = [];
  const flush = () => { if (para.length) { out.push(`<p>${esc(para.join(' '))}</p>`); para = []; } };

  for (let i = 0; i < lines.length; ) {
    const t = lines[i]!.trim();
    if (!t) { flush(); i++; continue; }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) { flush(); out.push('<hr>'); i++; continue; }

    const h = /^(#{1,6})\s+(.*)$/.exec(t);
    if (h) { flush(); out.push(`<h${Math.min(h[1]!.length + 1, 6)}>${esc(h[2]!.trim())}</h${Math.min(h[1]!.length + 1, 6)}>`); i++; continue; }

    if (/^>\s?/.test(t)) {
      flush();
      const q: string[] = [];
      for (; i < lines.length && /^>\s?/.test(lines[i]!.trim()); i++) q.push(lines[i]!.trim().replace(/^>\s?/, ''));
      out.push(`<blockquote>${esc(q.join(' '))}</blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(t)) {
      flush();
      const items: string[] = [];
      for (; i < lines.length && /^[-*]\s+/.test(lines[i]!.trim()); i++) items.push(lines[i]!.trim().replace(/^[-*]\s+/, ''));
      out.push(`<ul>${items.map((it) => `<li>${esc(it)}</li>`).join('')}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(t)) {
      flush();
      const items: string[] = [];
      for (; i < lines.length && /^\d+\.\s+/.test(lines[i]!.trim()); i++) items.push(lines[i]!.trim().replace(/^\d+\.\s+/, ''));
      out.push(`<ol>${items.map((it) => `<li>${esc(it)}</li>`).join('')}</ol>`);
      continue;
    }

    para.push(t);
    i++;
  }
  flush();
  return out.join('\n');
}
