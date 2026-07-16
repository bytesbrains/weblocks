/**
 * Shared typed-content renderer for prose bricks (`rich-text`, `blog-post`).
 *
 * Turns an ordered array of TYPED content nodes — never raw HTML — into escaped
 * markup, grouping consecutive `bullet` / `numbered` items into a single
 * `<ul>` / `<ol>`. Total: every node's text is escaped, empty nodes are skipped,
 * and it never throws. A block's schema decides which `kind`s can occur; kinds it
 * doesn't allow simply never appear here.
 */
import { escapeHtml } from '../schema.js';

export type ProseNode = { kind: string; text: string };

export function renderProse(nodes: ProseNode[] | undefined, sep = '\n      '): string {
  const out: string[] = [];
  let listKind: 'bullet' | 'numbered' | null = null;
  let items: string[] = [];

  const flush = () => {
    if (listKind && items.length) {
      const tag = listKind === 'bullet' ? 'ul' : 'ol';
      out.push(`<${tag}>${items.join('')}</${tag}>`);
    }
    listKind = null;
    items = [];
  };

  for (const n of nodes ?? []) {
    if (!n || typeof n.text !== 'string' || !n.text) continue;
    const t = escapeHtml(n.text);
    if (n.kind === 'bullet' || n.kind === 'numbered') {
      if (listKind && listKind !== n.kind) flush();
      listKind = n.kind;
      items.push(`<li>${t}</li>`);
      continue;
    }
    flush();
    if (n.kind === 'heading') out.push(`<h2>${t}</h2>`);
    else if (n.kind === 'subheading') out.push(`<h3>${t}</h3>`);
    else if (n.kind === 'quote') out.push(`<blockquote>${t}</blockquote>`);
    else out.push(`<p>${t}</p>`);
  }
  flush();
  return out.join(sep);
}
