/**
 * The dynamic-block runtime CONTRACT (§6).
 *
 * Static bricks are pure HTML. A few bricks are *powered* — a form submits, a
 * search queries, an auth widget signs in — and can't be pure static markup.
 * The engine stays host-neutral by **declaring** each powered brick's runtime
 * needs (capabilities) and emitting a documented client contract; the HOST wires
 * the actual endpoints through a small `RuntimeAdapter`. There is no bundled
 * backend, and no bespoke per-block glue — one adapter serves every dynamic
 * brick.
 *
 * The client contract every powered brick emits:
 *   - the interactive element carries `data-wl-capability="<cap>"` and
 *     `data-wl-block="<blockId>"`;
 *   - a form's `action`/`method` are resolved by the adapter (or left inert with
 *     a documented fallback when no runtime is configured).
 * A host's client island can therefore find every powered element generically
 * (`[data-wl-capability]`) and enhance it, and the server implements one route
 * per capability — never one per block type.
 */
import type { SiteManifest } from './types.js';
import { getSpec } from './registry.js';

/** A resolved endpoint for one capability of one placed block. */
export interface RuntimeAction {
  url: string;
  method: 'GET' | 'POST';
}

/**
 * The host-provided runtime. Given a capability a brick declares and the id of
 * the placed block, return where its client should talk to — or `null` when the
 * host does not provide that capability (the brick then renders an inert,
 * clearly-labelled fallback, never a broken element).
 */
export interface RuntimeAdapter {
  resolve(capability: string, blockId: string): RuntimeAction | null;
}

/**
 * The reference no-op adapter: provides nothing. Powered bricks render their
 * markup in a documented "runtime not configured" state — valid HTML, visibly
 * inert, with the `data-wl-capability` hooks intact so a host can still enhance
 * them client-side. This is the default so `renderSite` needs no host wiring.
 */
export const NOOP_RUNTIME: RuntimeAdapter = { resolve: () => null };

/**
 * Convenience adapter for the common case: every capability maps to one path
 * template under a base, keyed by capability + block id. A host that exposes
 * `POST /api/<capability>/<blockId>` can wire the whole catalog in one line.
 */
export function pathRuntime(base = '/api', method: 'GET' | 'POST' = 'POST'): RuntimeAdapter {
  const root = base.replace(/\/+$/, '');
  return {
    resolve: (capability, blockId) => ({ url: `${root}/${capability}/${encodeURIComponent(blockId)}`, method }),
  };
}

/**
 * Wrap a host adapter so the renderer stays **total**.
 *
 * `resolve` is the one place arbitrary host code runs inside a render, and the
 * powered bricks call it directly. An adapter that throws — a bad URL parse, an
 * undefined lookup, a typo on one capability — would otherwise take the whole
 * document down, losing the dozens of static bricks that never needed a runtime.
 *
 * A throw (or a malformed action) is treated exactly like "the host does not
 * provide that capability": the brick renders its documented inert-but-valid
 * fallback with the `data-wl-*` hooks intact. Failures degrade to one inert
 * form, never a dead page.
 */
export function safeRuntime(adapter: RuntimeAdapter): RuntimeAdapter {
  return {
    resolve(capability, blockId) {
      try {
        const action = adapter?.resolve(capability, blockId);
        // A host can return anything at runtime; only a usable action counts.
        return action && typeof action.url === 'string' ? action : null;
      } catch {
        return null;
      }
    },
  };
}

/**
 * Whitelist a form method to a safe lowercase token. A `RuntimeAdapter` is typed
 * to return `'GET' | 'POST'`, but a host implements it at runtime — so a powered
 * brick coerces the value before writing it into a `method` attribute (anything
 * that isn't a clear GET falls back to POST). Defence-in-depth: no host string
 * can break out of the attribute.
 */
export function safeMethod(method: unknown): 'get' | 'post' {
  return String(method ?? '').toLowerCase() === 'get' ? 'get' : 'post';
}

/** One block's declared runtime needs. */
export interface BlockRuntimeNeeds {
  blockId: string;
  type: string;
  capabilities: string[];
}

/**
 * Aggregate the runtime capabilities a manifest requires — what a host must
 * implement to make this site fully functional. Empty ⇒ a purely static site
 * that needs no backend at all.
 */
export function runtimeNeeds(manifest: SiteManifest): BlockRuntimeNeeds[] {
  const out: BlockRuntimeNeeds[] = [];
  for (const b of manifest?.blocks ?? []) {
    if (!b || b.visible === false) continue;
    const spec = getSpec(b.type);
    const caps = spec?.runtime?.capabilities;
    if (caps && caps.length) out.push({ blockId: b.id, type: b.type, capabilities: [...caps] });
  }
  return out;
}
