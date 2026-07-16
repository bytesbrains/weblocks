/** `spacer` — deliberate vertical whitespace between sections. Static brick. */
import { escapeAttr, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  size: { kind: 'enum', values: ['sm', 'md', 'lg', 'xl'], default: 'md' },
};

const css = `
.blk-spacer{background:var(--bg)}
.blk-spacer.size-sm{height:calc(var(--space)*1)}
.blk-spacer.size-md{height:calc(var(--space)*2)}
.blk-spacer.size-lg{height:var(--space-lg)}
.blk-spacer.size-xl{height:calc(var(--space-lg)*2)}
`.trim();

const SIZES = new Set(['sm', 'md', 'lg', 'xl']);

function render(config: Record<string, unknown>): string {
  const raw = config.size as string;
  const size = SIZES.has(raw) ? raw : 'md';
  return `<section class="blk-spacer size-${escapeAttr(size)}" aria-hidden="true"></section>`;
}

export const spacer: BlockSpec = {
  type: 'spacer',
  description: 'Deliberate vertical whitespace between sections, in one of four sizes (sm, md, lg, xl).',
  schema,
  css,
  render,
};
