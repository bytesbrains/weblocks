/**
 * `auth` — provider-agnostic sign in / sign up. Powered brick (§6): each provider
 * button and the optional email form target the host's `auth.start` capability
 * (the block carries `data-wl-provider` so one runtime route serves them all).
 * With no runtime wired it renders inert-but-valid. The engine bundles NO auth
 * backend — identity is entirely the host's concern.
 */
import { escapeAttr, escapeHtml, type Schema } from '../schema.js';
import type { BlockSpec, RenderContext } from '../registry.js';
import { NOOP_RUNTIME } from '../runtime.js';

const CAPABILITY = 'auth.start';

const schema: Schema = {
  mode: { kind: 'enum', values: ['signin', 'signup'], default: 'signin' },
  title: { kind: 'string', default: '', max: 120 },
  providers: {
    kind: 'array', max: 6,
    of: {
      kind: 'object',
      fields: {
        label: { kind: 'string', required: true, default: '', max: 40 },
        provider: { kind: 'string', default: '', max: 40 }, // e.g. google, github, email
      },
    },
  },
  showEmail: { kind: 'boolean', default: true },
};

const css = `
.blk-auth{padding:var(--space-lg) var(--space);background:var(--bg);color:var(--text)}
.blk-auth .wrap{max-width:400px;margin:0 auto;background:var(--surface);border-radius:var(--radius);padding:calc(var(--space)*1.6);text-align:center}
.blk-auth h2{font-size:var(--fs-lg);margin:0 0 var(--space);font-weight:800}
.blk-auth .providers{display:flex;flex-direction:column;gap:.5em}
.blk-auth .provider{font:inherit;font-weight:600;cursor:pointer;text-decoration:none;display:block;padding:.7em 1em;border-radius:var(--radius);border:1px solid color-mix(in srgb,var(--text) 18%,transparent);background:var(--bg);color:var(--text);transition:border-color var(--motion)}
.blk-auth .provider:hover{border-color:var(--primary)}
.blk-auth .provider[disabled]{opacity:.55;cursor:not-allowed}
.blk-auth .sep{display:flex;align-items:center;gap:.6em;color:var(--muted);font-size:var(--fs-base);margin:var(--space) 0}
.blk-auth .sep::before,.blk-auth .sep::after{content:"";flex:1;height:1px;background:color-mix(in srgb,var(--text) 15%,transparent)}
.blk-auth form{display:grid;gap:.5em}
.blk-auth input{font:inherit;color:inherit;background:var(--bg);border:1px solid color-mix(in srgb,var(--text) 18%,transparent);border-radius:var(--radius);padding:.7em .8em}
.blk-auth button{font:inherit;font-weight:700;cursor:pointer;border:0;border-radius:var(--radius);padding:.7em 1em;background:var(--primary);color:#fff}
.blk-auth button[disabled]{opacity:.55;cursor:not-allowed}
.blk-auth .note{margin:var(--space) 0 0;font-size:var(--fs-base);color:var(--muted)}
`.trim();

type Provider = { label: string; provider: string };

function render(config: Record<string, unknown>, _tokens?: unknown, ctx?: RenderContext): string {
  const id = ctx?.id ?? 'auth';
  const runtime = ctx?.runtime ?? NOOP_RUNTIME;
  const mode = config.mode === 'signup' ? 'signup' : 'signin';
  const title = (config.title as string) || (mode === 'signup' ? 'Create your account' : 'Sign in');
  const providers = (config.providers as Provider[]) ?? [];
  const showEmail = config.showEmail !== false;
  const action = runtime.resolve(CAPABILITY, id);
  const inert = action ? '' : ' data-wl-inert="true"';

  const buttons = providers.filter((p) => p && p.label).map((p) => {
    const prov = escapeAttr(p.provider || p.label);
    return action
      ? `<form method="${action.method.toLowerCase()}" action="${escapeAttr(action.url)}" data-wl-capability="${CAPABILITY}" data-wl-block="${escapeAttr(id)}" data-wl-provider="${prov}"><input type="hidden" name="provider" value="${prov}"><button class="provider" type="submit">${escapeHtml(p.label)}</button></form>`
      : `<button class="provider" type="button" data-wl-capability="${CAPABILITY}" data-wl-provider="${prov}" disabled>${escapeHtml(p.label)}</button>`;
  }).join('\n      ');

  const email = showEmail ? `
    ${buttons ? '<div class="sep">or</div>' : ''}
    <form method="${action ? action.method.toLowerCase() : 'post'}" action="${action ? escapeAttr(action.url) : '#'}" data-wl-capability="${CAPABILITY}" data-wl-block="${escapeAttr(id)}" data-wl-provider="email"${inert}>
      <input type="email" name="email" placeholder="you@example.com" aria-label="Email address" required>
      <button type="submit"${action ? '' : ' disabled'}>Continue with email</button>
    </form>` : '';

  return `<section class="blk-auth" aria-label="${escapeAttr(title)}">
  <div class="wrap">
    <h2>${escapeHtml(title)}</h2>
    ${buttons ? `<div class="providers">\n      ${buttons}\n    </div>` : ''}
    ${email}
    ${action ? '' : '<p class="note">Connect an auth runtime to enable sign in.</p>'}
  </div>
</section>`;
}

export const auth: BlockSpec = {
  type: 'auth',
  description: 'A provider-agnostic sign in / sign up panel: social provider buttons and an optional email form that start auth via a host runtime.',
  schema,
  css,
  render,
  island: 'auth',
  runtime: { capabilities: [CAPABILITY] },
};
