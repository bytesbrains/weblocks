/**
 * The catalog — the AI's "menu". It projects the registered bricks' typed
 * schemas into JSON Schema (structured, for tool/function-calling) and a compact
 * prompt string (cheap, for a system prompt). This is the ONLY surface the model
 * is told it may use — the closed vocabulary made legible.
 */
import type { Field, Schema } from './schema.js';
import { REGISTRY } from './registry.js';

export interface BlockCatalogEntry {
  type: string;
  description: string;
  schema: JsonSchema; // JSON Schema for the block's `config`
  /** Powered brick (§6): the host runtime capabilities it needs, if any. */
  runtime?: { capabilities: string[] };
}

export interface JsonSchema {
  type?: string;
  enum?: readonly (string | number)[];
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  maxItems?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  default?: unknown;
  additionalProperties?: boolean;
}

function fieldToJsonSchema(field: Field): JsonSchema {
  switch (field.kind) {
    case 'string': return { type: 'string', ...(field.max !== undefined && { maxLength: field.max }), ...(field.default !== undefined && { default: field.default }) };
    case 'enum': return { enum: field.values, ...(field.default !== undefined && { default: field.default }) };
    case 'boolean': return { type: 'boolean', ...(field.default !== undefined && { default: field.default }) };
    case 'int': return {
      type: 'integer',
      ...(field.oneOf && { enum: field.oneOf }),
      ...(field.min !== undefined && { minimum: field.min }),
      ...(field.max !== undefined && { maximum: field.max }),
      ...(field.default !== undefined && { default: field.default }),
    };
    case 'object': return schemaToJsonSchema(field.fields);
    case 'array': return { type: 'array', items: fieldToJsonSchema(field.of), ...(field.max !== undefined && { maxItems: field.max }) };
  }
}

function schemaToJsonSchema(schema: Schema): JsonSchema {
  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];
  for (const [key, field] of Object.entries(schema)) {
    properties[key] = fieldToJsonSchema(field);
    if ((field.kind === 'string' || field.kind === 'enum' || field.kind === 'object' || field.kind === 'array') && field.required) {
      required.push(key);
    }
  }
  return { type: 'object', properties, ...(required.length && { required }), additionalProperties: false };
}

/** Full structured catalog — one entry per registered brick. */
export function catalog(): BlockCatalogEntry[] {
  return [...REGISTRY.values()].map((spec) => ({
    type: spec.type,
    description: spec.description,
    schema: schemaToJsonSchema(spec.schema),
    ...(spec.runtime ? { runtime: { capabilities: [...spec.runtime.capabilities] } } : {}),
  }));
}

// ── Compact prompt rendering (token-cheap "menu" for a system prompt) ──────────

function fieldSummary(field: Field): string {
  switch (field.kind) {
    case 'string': return `string${field.max ? `(≤${field.max})` : ''}${field.required ? ' *' : ''}`;
    case 'enum': return `${field.values.join('|')}${field.default ? `=${field.default}` : ''}`;
    case 'boolean': return `bool${field.default !== undefined ? `=${field.default}` : ''}`;
    case 'int': return `int${field.oneOf ? `(${field.oneOf.join('|')})` : ''}${field.default !== undefined ? `=${field.default}` : ''}`;
    case 'object': return `{ ${Object.entries(field.fields).map(([k, f]) => `${k}:${fieldSummary(f)}`).join(', ')} }`;
    case 'array': return `[ ${fieldSummary(field.of)} ]${field.max ? `(≤${field.max})` : ''}`;
  }
}

/** A short human/AI-readable list of every brick and its params (`*` = expected). */
export function catalogPrompt(): string {
  return catalog0()
    .map((spec) => {
      const params = Object.entries(spec.schema).map(([k, f]) => `${k}: ${fieldSummary(f)}`).join('; ');
      const dyn = spec.runtime ? `  [dynamic — host provides: ${spec.runtime.capabilities.join(', ')}]` : '';
      return `- ${spec.type} — ${spec.description}${dyn}\n    config: { ${params} }`;
    })
    .join('\n');
}

// internal: iterate specs with their raw Schema (for the compact summary)
function catalog0() {
  return [...REGISTRY.values()].map((s) => ({ type: s.type, description: s.description, schema: s.schema, runtime: s.runtime }));
}
