/**
 * `newsletter` — email capture. Powered brick (§6): the submit target is resolved
 * by the host via the `newsletter.subscribe` capability. With no runtime wired it
 * renders inert-but-valid (disabled, with a note) while keeping the `data-wl-*`
 * hooks so a host can enhance it client-side.
 */
import { escapeAttr, escapeHtml, type Schema } from '../schema.js';
import type { BlockSpec, RenderContext } from '../registry.js';
import { NOOP_RUNTIME, safeMethod } from '../runtime.js';

const CAPABILITY = 'newsletter.subscribe';

const schema: Schema = {
  title: { kind: 'string', default: 'Subscribe to our newsletter', max: 120 },
  intro: { kind: 'string', default: '', max: 240 },
  placeholder: { kind: 'string', default: 'you@example.com', max: 80 },
  submitLabel: { kind: 'string', default: 'Subscribe', max: 40 },
  successMessage: { kind: 'string', default: "You're in — check your inbox.", max: 200 },
};

const css = `
.blk-newsletter{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text);text-align:center}
.blk-newsletter .wrap{max-width:560px;margin:0 auto}
.blk-newsletter h2{font-size:var(--fs-xl);margin:0 0 .3em;font-weight:800}
.blk-newsletter .intro{color:var(--muted);margin:0 0 var(--space);font-size:var(--fs-lg)}
.blk-newsletter form{display:flex;gap:.5em;flex-wrap:wrap;justify-content:center}
.blk-newsletter input{flex:1 1 220px;font:inherit;color:inherit;background:var(--surface);border:1px solid color-mix(in srgb,var(--text) 18%,transparent);border-radius:var(--radius);padding:.7em .8em}
.blk-newsletter button{font:inherit;font-weight:700;cursor:pointer;border:0;border-radius:var(--radius);padding:.7em 1.4em;background:var(--primary);color:var(--on-primary);transition:opacity var(--motion)}
.blk-newsletter button[disabled]{opacity:.55;cursor:not-allowed}
.blk-newsletter .note{margin:.5em 0 0;font-size:var(--fs-base);color:var(--muted)}
`.trim();

function render(config: Record<string, unknown>, _tokens?: unknown, ctx?: RenderContext): string {
  const id = ctx?.id ?? 'newsletter';
  const runtime = ctx?.runtime ?? NOOP_RUNTIME;
  const title = config.title as string;
  const intro = config.intro as string;
  const placeholder = (config.placeholder as string) || 'you@example.com';
  const submitLabel = (config.submitLabel as string) || 'Subscribe';
  const action = runtime.resolve(CAPABILITY, id);

  return `<section class="blk-newsletter" aria-label="${escapeAttr(title || 'Newsletter')}">
  <div class="wrap">
    ${title ? `<h2>${escapeHtml(title)}</h2>` : ''}
    ${intro ? `<p class="intro">${escapeHtml(intro)}</p>` : ''}
    <form method="${safeMethod(action?.method)}" action="${action ? escapeAttr(action.url) : '#'}" data-wl-capability="${CAPABILITY}" data-wl-block="${escapeAttr(id)}"${action ? '' : ' data-wl-inert="true"'}>
      <input type="email" name="email" placeholder="${escapeAttr(placeholder)}" aria-label="Email address" required>
      <button type="submit"${action ? '' : ' disabled'}>${escapeHtml(submitLabel)}</button>
    </form>
    ${action ? '' : '<p class="note">Connect a runtime to start collecting subscribers.</p>'}
  </div>
</section>`;
}

export const newsletter: BlockSpec = {
  type: 'newsletter',
  description: 'An email-capture form that posts to a host-provided runtime; renders inert until a runtime is wired.',
  schema,
  css,
  render,
  island: 'newsletter',
  runtime: { capabilities: [CAPABILITY] },
};
