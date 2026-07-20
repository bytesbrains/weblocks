/**
 * `chat-thread` — a conversation rendered as a thread of rich message bubbles
 * (weblocks#58). Static brick: the transcript is *content*, authored up front,
 * not a live bot. A live widget is a separate powered brick; keeping them apart
 * is what lets this one render fully with zero JS and no host runtime.
 *
 * Message bodies are **typed nodes**, the same escape hatch `rich-text` and
 * `blog-post` use — a bubble can mix a sentence, a code sample and a row of
 * quick replies without any field ever accepting raw HTML. The node set is
 * deliberately small; new kinds are additive (minor), removing one is not.
 *
 * Design decisions (issue #58): only `user` sits on the right — `bot` and
 * `agent` are told apart by name and avatar rather than a third bubble colour,
 * so speaker identity never depends on colour alone. Quick replies render inert
 * unless they carry an `href`, because a chip that looks clickable and isn't is
 * a lie. Times are freeform labels in a `<span>`, not `<time>`, since `<time>`
 * demands a machine-readable value this brick cannot validate without a parser.
 */
import { escapeAttr, escapeHtml, sanitizeUrl, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const ROLES = ['user', 'bot', 'agent'] as const;
const NODE_KINDS = ['text', 'code', 'image', 'list', 'buttons'] as const;

const schema: Schema = {
  title: { kind: 'string', default: '', max: 120 },
  subtitle: { kind: 'string', default: '', max: 200 },
  participants: {
    kind: 'array', max: 6,
    of: {
      kind: 'object',
      fields: {
        id: { kind: 'string', required: true, default: '', min: 1, max: 40 },
        name: { kind: 'string', required: true, default: '', min: 1, max: 60 },
        role: { kind: 'enum', values: ROLES, default: 'bot' },
        avatar: { kind: 'string', default: '', max: 500 },
      },
    },
  },
  messages: {
    kind: 'array', max: 60,
    of: {
      kind: 'object',
      fields: {
        from: { kind: 'string', required: true, default: '', min: 1, max: 40 },
        time: { kind: 'string', default: '', max: 40 },
        body: {
          kind: 'array', max: 8,
          of: {
            kind: 'object',
            fields: {
              kind: { kind: 'enum', values: NODE_KINDS, default: 'text' },
              text: { kind: 'string', default: '', max: 2000 },
              lang: { kind: 'string', default: '', max: 20 },
              src: { kind: 'string', default: '', max: 500 },
              alt: { kind: 'string', default: '', max: 200 },
              ordered: { kind: 'boolean', default: false },
              items: {
                kind: 'array', max: 8,
                of: {
                  kind: 'object',
                  fields: {
                    label: { kind: 'string', default: '', max: 120 },
                    href: { kind: 'string', default: '', max: 500 },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

const css = `
.blk-chat-thread{padding:var(--space-lg) var(--space);background:var(--bg)}
.blk-chat-thread .wrap{max-width:760px;margin:0 auto}
.blk-chat-thread h2{font-size:var(--fs-xl);margin:0 0 .2em;font-weight:800;color:var(--text);text-align:center}
.blk-chat-thread .sub{margin:0 0 var(--space-lg);color:var(--muted);text-align:center}
.blk-chat-thread ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:calc(var(--space)*.75)}
.blk-chat-thread li{display:flex;gap:.6rem;align-items:flex-end;max-width:82%}
.blk-chat-thread li.self{margin-left:auto;flex-direction:row-reverse}
.blk-chat-thread .who{flex:0 0 auto;width:34px;height:34px;border-radius:50%;overflow:hidden;background:var(--surface);
  border:1px solid var(--muted);display:flex;align-items:center;justify-content:center;
  font-size:.78rem;font-weight:700;color:var(--muted)}
.blk-chat-thread .who img{width:100%;height:100%;object-fit:cover;display:block}
.blk-chat-thread .bubble{background:var(--surface);border-radius:var(--radius);padding:.65em .9em;min-width:0;
  border:1px solid color-mix(in srgb,var(--muted) 30%,transparent)}
.blk-chat-thread li.self .bubble{background:var(--primary);border-color:var(--primary);color:var(--on-primary)}
.blk-chat-thread .meta{display:flex;gap:.5em;align-items:baseline;margin-bottom:.25em;font-size:.86em}
.blk-chat-thread .name{font-weight:700;color:inherit}
.blk-chat-thread .time{color:var(--muted);font-size:.85em}
.blk-chat-thread li.self .time{color:inherit;opacity:.75}
.blk-chat-thread .bubble p{margin:.25em 0}
.blk-chat-thread .bubble p:first-child{margin-top:0}
.blk-chat-thread .bubble p:last-child{margin-bottom:0}
.blk-chat-thread pre{margin:.5em 0 0;background:var(--bg);color:var(--text);border-radius:calc(var(--radius)/1.5);
  padding:.6em .7em;overflow-x:auto;font-size:.86em}
.blk-chat-thread pre code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.blk-chat-thread figure{margin:.5em 0 0}
.blk-chat-thread figure img{display:block;max-width:100%;border-radius:calc(var(--radius)/1.5)}
.blk-chat-thread figcaption{font-size:.86em;color:var(--muted);margin-top:.3em}
.blk-chat-thread li.self figcaption{color:inherit;opacity:.8}
.blk-chat-thread ul.nodes,.blk-chat-thread ol.nodes{list-style:disc;margin:.4em 0 0;padding-left:1.2em;display:block}
.blk-chat-thread ol.nodes{list-style:decimal}
.blk-chat-thread ul.nodes li,.blk-chat-thread ol.nodes li{display:list-item;max-width:none;margin:0}
.blk-chat-thread .replies{display:flex;flex-wrap:wrap;gap:.35em;margin-top:.55em}
.blk-chat-thread .reply{display:inline-block;font-size:.86em;border-radius:999px;padding:.25em .8em;
  border:1px solid currentColor;color:var(--primary);background:var(--bg);text-decoration:none}
.blk-chat-thread a.reply:hover{background:var(--primary);color:var(--on-primary)}
.blk-chat-thread li.self .reply{color:inherit;background:transparent}
@media(max-width:560px){.blk-chat-thread li{max-width:95%}}
`.trim();

interface Participant { id: string; name: string; role: string; avatar: string }
interface ReplyItem { label: string; href: string }
interface Node {
  kind: string; text: string; lang: string; src: string; alt: string;
  ordered: boolean; items: ReplyItem[];
}
interface Message { from: string; time: string; body: Node[] }

/** Initials from a display name — the zero-network avatar default (#58). */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  const first = parts[0]![0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]![0] ?? '' : '';
  return (first + last).toUpperCase();
}

/**
 * One typed body node. An unknown `kind` renders nothing — same total posture as
 * an unknown block type, so a confused model loses one bubble line, not a page.
 */
function node(n: Node): string {
  switch (n.kind) {
    case 'text':
      return n.text ? `<p>${escapeHtml(n.text)}</p>` : '';
    case 'code':
      if (!n.text) return '';
      return `<pre><code${n.lang ? ` class="lang-${escapeAttr(n.lang)}"` : ''}>${escapeHtml(n.text)}</code></pre>`;
    case 'image':
      if (!n.src) return '';
      return `<figure><img src="${escapeAttr(sanitizeUrl(n.src))}" alt="${escapeAttr(n.alt)}" loading="lazy">${
        n.text ? `<figcaption>${escapeHtml(n.text)}</figcaption>` : ''
      }</figure>`;
    case 'list': {
      const li = (n.items ?? []).map((i) => (i.label ? `<li>${escapeHtml(i.label)}</li>` : '')).filter(Boolean);
      if (!li.length) return '';
      const tag = n.ordered ? 'ol' : 'ul';
      return `<${tag} class="nodes">${li.join('')}</${tag}>`;
    }
    case 'buttons': {
      // Inert unless the reply actually goes somewhere (#58): a chip that looks
      // clickable in a static transcript but does nothing misleads the reader.
      const chips = (n.items ?? []).map((i) => {
        if (!i.label) return '';
        const label = escapeHtml(i.label);
        return i.href
          ? `<a class="reply" href="${escapeAttr(sanitizeUrl(i.href))}">${label}</a>`
          : `<span class="reply">${label}</span>`;
      }).filter(Boolean);
      return chips.length ? `<div class="replies">${chips.join('')}</div>` : '';
    }
    default:
      return '';
  }
}

function message(m: Message, people: Map<string, Participant>): string {
  const who = people.get(m.from);
  if (!who) return ''; // unknown speaker → skip, never guess
  const body = (m.body ?? []).map(node).filter(Boolean).join('\n        ');
  if (!body) return '';
  // Only the visitor's own side flips; bot and agent are told apart by name and
  // avatar, so speaker identity never rests on colour alone (#58).
  const self = who.role === 'user';
  const avatar = who.avatar
    ? `<img src="${escapeAttr(sanitizeUrl(who.avatar))}" alt="" loading="lazy">`
    : escapeHtml(initials(who.name));
  return `<li class="${self ? 'self' : 'other'}">
        <span class="who" aria-hidden="true">${avatar}</span>
        <div class="bubble">
          <span class="meta"><span class="name">${escapeHtml(who.name)}</span>${
            m.time ? `<span class="time">${escapeHtml(m.time)}</span>` : ''
          }</span>
          ${body}
        </div>
      </li>`;
}

function render(config: Record<string, unknown>): string {
  const title = config.title as string;
  const subtitle = config.subtitle as string;
  const people = new Map<string, Participant>();
  for (const p of (config.participants as Participant[]) ?? []) {
    if (p && p.id && !people.has(p.id)) people.set(p.id, p);
  }
  const turns = ((config.messages as Message[]) ?? [])
    .map((m) => (m ? message(m, people) : ''))
    .filter(Boolean);

  return `<section class="blk-chat-thread" aria-label="${escapeAttr(title || 'Conversation')}">
  <div class="wrap">
    ${title ? `<h2>${escapeHtml(title)}</h2>` : ''}
    ${subtitle ? `<p class="sub">${escapeHtml(subtitle)}</p>` : ''}
    <ol>
      ${turns.join('\n      ')}
    </ol>
  </div>
</section>`;
}

export const chatThread: BlockSpec = {
  type: 'chat-thread',
  description:
    'A conversation rendered as a thread of rich message bubbles: named participants with avatars or initials, ' +
    'optional per-message times, and typed message bodies that mix text, code, images, lists and quick replies. ' +
    'Static — an authored transcript for showing how an assistant or support team answers, not a live chatbot.',
  schema, css, render,
};
