/**
 * @bytesbrains/weblocks — the block engine for AI-composable Apps.
 *
 * Pipeline: a `SiteManifest` (design tokens + ordered typed blocks) is
 * validated (strict, for edit ops) and rendered (total, for serving) into one
 * self-contained static HTML document. See docs/APPS_BLOCKS_ARCHITECTURE.md.
 */
export type {
  SiteManifest, Block, DesignTokens, Palette, SiteMeta, SectionOverrides,
  PwaConfig, SeoConfig, Mode, Scale, Radius, Spacing, Motion,
} from './types.js';
export { DEFAULT_TOKENS, normalizeTokens, tokensToCss, sectionOverrideCss, readableOn } from './tokens.js';
export { PRESETS, presetNames, getPreset } from './presets.js';
export { VERTICALS, verticalNames, getVertical, type Vertical } from './verticals.js';
export { REGISTRY, getSpec, blockTypes, needsIsland, type BlockSpec, type RenderContext } from './registry.js';
export { renderSite, type RenderOptions } from './render.js';
export {
  NOOP_RUNTIME, pathRuntime, runtimeNeeds,
  type RuntimeAdapter, type RuntimeAction, type BlockRuntimeNeeds,
} from './runtime.js';
export {
  buildWebManifest, buildWebManifestJson, buildServiceWorker, emitPwa,
  type WebAppManifest,
} from './pwa.js';
export { validateBlock, validateManifest, type Validation } from './validate.js';
export { parse, escapeHtml, escapeAttr, sanitizeUrl, slugify, type Field, type Schema, type ParseResult } from './schema.js';
export { renderMarkdown } from './markdown.js';
export { catalog, catalogPrompt, type BlockCatalogEntry, type JsonSchema } from './catalog.js';
export { applyOp, applyOps, type EditOp, type OpResult, type BatchResult } from './ops.js';
export {
  generateSite, editSite, buildGenerationPrompt, buildEditPrompt,
  parseManifestResponse, parseOpsResponse,
  type ModelCall, type ComposeResult, type EditResult, type GenerateOptions,
} from './generate.js';
