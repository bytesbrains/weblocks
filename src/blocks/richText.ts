/**
 * `rich-text` — a TYPED prose section. The safe "freeform content" escape hatch
 * that is NOT raw HTML: authors compose ordered blocks (headings, paragraphs,
 * quotes, lists) whose text is always escaped. Static brick.
 */
import { type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';
import { renderProse, type ProseNode } from './prose.js';

const schema: Schema = {
  blocks: {
    kind: 'array',
    max: 60,
    of: {
      kind: 'object',
      fields: {
        kind: {
          kind: 'enum',
          values: ['heading', 'subheading', 'paragraph', 'quote', 'bullet', 'numbered'],
          default: 'paragraph',
        },
        text: { kind: 'string', required: true, default: '', max: 2000 },
      },
    },
  },
};

const css = `
.blk-rich-text{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-rich-text .wrap{max-width:68ch;margin:0 auto}
.blk-rich-text h2{font-size:var(--fs-xl);margin:1em 0 .3em;font-weight:800;line-height:1.2}
.blk-rich-text h3{font-size:var(--fs-lg);margin:1em 0 .3em;font-weight:700;line-height:1.25}
.blk-rich-text p{margin:0 0 1em;font-size:var(--fs-lg);line-height:1.6}
.blk-rich-text blockquote{margin:1.2em 0;padding:.4em 0 .4em 1em;border-left:3px solid var(--accent);color:var(--muted);font-style:italic;font-size:var(--fs-lg)}
.blk-rich-text ul,.blk-rich-text ol{margin:0 0 1em;padding-left:1.4em}
.blk-rich-text li{margin:.3em 0;font-size:var(--fs-lg);line-height:1.5}
.blk-rich-text>.wrap>:first-child{margin-top:0}
.blk-rich-text>.wrap>:last-child{margin-bottom:0}
@media(max-width:560px){.blk-rich-text p,.blk-rich-text li,.blk-rich-text blockquote{font-size:var(--fs-base)}}
`.trim();

function render(config: Record<string, unknown>): string {
  const body = renderProse(config.blocks as ProseNode[], '\n    ');
  return `<section class="blk-rich-text" aria-label="Content">
  <div class="wrap">
    ${body}
  </div>
</section>`;
}

export const richText: BlockSpec = {
  type: 'rich-text',
  description: 'A typed prose section with ordered headings, paragraphs, quotes, and bullet/numbered lists — a safe freeform-content block, never raw HTML.',
  schema,
  css,
  render,
};
