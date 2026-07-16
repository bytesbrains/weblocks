# Security Policy

## Reporting a vulnerability

Please report security issues privately via GitHub's **"Report a vulnerability"**
flow on the repository's **Security** tab (Security advisories), rather than
opening a public issue. We aim to acknowledge reports within a few business days.

## Scope & design posture

`@bytesbrains/weblocks` renders an AI-composed `SiteManifest` to static HTML. Its
safety model is structural:

- **No raw HTML from the model.** The AI only composes typed blocks; there is no
  free-form markup field. `rich-text`/`blog-post` use typed content nodes.
- **Output escaping.** All text is escaped (`escapeHtml`/`escapeAttr`) and every
  URL is scheme-sanitized (`sanitizeUrl` collapses `javascript:`, `data:`, etc.
  to `#`) on render.
- **Total render + strict validation.** Invalid configs are rejected at the edit
  gate; the renderer defaults every field and cannot throw.

### Powered blocks are host responsibility

Powered bricks (`contact-form`, `newsletter`, `auth`, …) *declare* the runtime
capabilities they need; the engine bundles **no** backend. Anti-abuse controls —
spam/captcha, server-side validation, authentication, rate-limiting, and data
storage — are the responsibility of the **host runtime** that wires those
capabilities. Treat all client-submitted data as untrusted and validate it
server-side.

## Supported versions

Security fixes target the latest published minor. Please upgrade before
reporting.
