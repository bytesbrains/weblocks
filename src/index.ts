/**
 * @bytesbrains/weblocks — the block engine for AI-composable Apps.
 *
 * Pipeline: a `SiteManifest` (design tokens + ordered typed blocks) is
 * validated (strict, for edit ops) and rendered (total, for serving) into one
 * self-contained static HTML document. See docs/APPS_BLOCKS_ARCHITECTURE.md.
 */
export type {
  SiteManifest, Block, DesignTokens, Palette, SiteMeta,
  Mode, Scale, Radius, Spacing, Motion,
} from './types.js';
export { DEFAULT_TOKENS, normalizeTokens, tokensToCss } from './tokens.js';
export { REGISTRY, getSpec, blockTypes, needsIsland, type BlockSpec } from './registry.js';
export { renderSite } from './render.js';
export { validateBlock, validateManifest, type Validation } from './validate.js';
export { parse, escapeHtml, escapeAttr, sanitizeUrl, type Field, type Schema, type ParseResult } from './schema.js';
export { catalog, catalogPrompt, type BlockCatalogEntry, type JsonSchema } from './catalog.js';
export { applyOp, applyOps, type EditOp, type OpResult, type BatchResult } from './ops.js';
export {
  generateSite, editSite, buildGenerationPrompt, buildEditPrompt,
  parseManifestResponse, parseOpsResponse,
  type ModelCall, type ComposeResult, type EditResult,
} from './generate.js';
