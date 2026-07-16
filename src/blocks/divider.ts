/** `divider` — a visual section break (line / dots / gradient). Static brick. */
import { escapeAttr, type Schema } from '../schema.js';
import type { BlockSpec } from '../registry.js';

const schema: Schema = {
  style: { kind: 'enum', values: ['line', 'dots', 'gradient'], default: 'line' },
};

const css = `
.blk-divider{padding:var(--space) var(--space);background:var(--bg)}
.blk-divider .wrap{max-width:1080px;margin:0 auto}
.blk-divider hr{border:0;margin:0}
.blk-divider.style-line hr{height:1px;background:color-mix(in srgb,var(--text) 15%,transparent)}
.blk-divider.style-gradient hr{height:3px;border-radius:999px;background:linear-gradient(90deg,transparent,var(--primary),var(--accent),transparent)}
.blk-divider.style-dots hr{height:6px;background:radial-gradient(circle,color-mix(in srgb,var(--muted) 60%,transparent) 1.5px,transparent 1.6px);background-size:16px 6px;background-position:center}
`.trim();

const STYLES = new Set(['line', 'dots', 'gradient']);

function render(config: Record<string, unknown>): string {
  const raw = config.style as string;
  const style = STYLES.has(raw) ? raw : 'line';
  return `<section class="blk-divider style-${escapeAttr(style)}" aria-hidden="true">
  <div class="wrap"><hr></div>
</section>`;
}

export const divider: BlockSpec = {
  type: 'divider',
  description: 'A visual section break rendered as a thin line, a dotted rule, or a gradient bar.',
  schema,
  css,
  render,
};
