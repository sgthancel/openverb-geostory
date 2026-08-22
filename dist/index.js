"use strict";
/**
 * @openverb/geostory
 *
 * GeoStory Profile for OpenVerb — a portable geographic narrative format.
 *
 * A GeoStory is a spatial workflow whose steps happen in geographic space.
 * Each scene is a macro that compiles into atomic OpenVerb verb actions.
 * The .ov document is the portable, AI-editable, format-agnostic representation.
 *
 * @example
 * ```typescript
 * import { parseGeoStory, compileTimeline, serializeGeoStory, validateGeoStory } from '@openverb/geostory';
 *
 * // Parse a .ov file
 * const doc = parseGeoStory(yamlString);
 *
 * // Validate
 * const { valid, errors } = validateGeoStory(doc);
 *
 * // Compile scenes into verb actions
 * const timeline = compileTimeline(doc);
 *
 * // Serialize back to YAML
 * const output = serializeGeoStory(doc);
 * ```
 *
 * @packageDocumentation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verbLibrary = exports.compileToOVDocument = exports.compileTimeline = exports.compileScene = exports.serializeGeoStoryToYAML = exports.serializeGeoStoryToJSON = exports.serializeGeoStory = exports.GeoStoryParseError = exports.parseGeoStoryRaw = exports.parseGeoStory = exports.isGeoStoryDocument = exports.validateGeoStory = exports.GEOSTORY_SCHEMA = exports.VERB_CATEGORIES = void 0;
var types_1 = require("./types");
Object.defineProperty(exports, "VERB_CATEGORIES", { enumerable: true, get: function () { return types_1.VERB_CATEGORIES; } });
// ─── Schema & Validation ─────────────────────────────────────────────────────
var schema_1 = require("./schema");
Object.defineProperty(exports, "GEOSTORY_SCHEMA", { enumerable: true, get: function () { return schema_1.GEOSTORY_SCHEMA; } });
Object.defineProperty(exports, "validateGeoStory", { enumerable: true, get: function () { return schema_1.validateGeoStory; } });
Object.defineProperty(exports, "isGeoStoryDocument", { enumerable: true, get: function () { return schema_1.isGeoStoryDocument; } });
// ─── Parser ──────────────────────────────────────────────────────────────────
var parser_1 = require("./parser");
Object.defineProperty(exports, "parseGeoStory", { enumerable: true, get: function () { return parser_1.parseGeoStory; } });
Object.defineProperty(exports, "parseGeoStoryRaw", { enumerable: true, get: function () { return parser_1.parseGeoStoryRaw; } });
Object.defineProperty(exports, "GeoStoryParseError", { enumerable: true, get: function () { return parser_1.GeoStoryParseError; } });
// ─── Serializer ──────────────────────────────────────────────────────────────
var serializer_1 = require("./serializer");
Object.defineProperty(exports, "serializeGeoStory", { enumerable: true, get: function () { return serializer_1.serializeGeoStory; } });
Object.defineProperty(exports, "serializeGeoStoryToJSON", { enumerable: true, get: function () { return serializer_1.serializeGeoStoryToJSON; } });
Object.defineProperty(exports, "serializeGeoStoryToYAML", { enumerable: true, get: function () { return serializer_1.serializeGeoStoryToYAML; } });
// ─── Compiler ────────────────────────────────────────────────────────────────
var compiler_1 = require("./compiler");
Object.defineProperty(exports, "compileScene", { enumerable: true, get: function () { return compiler_1.compileScene; } });
Object.defineProperty(exports, "compileTimeline", { enumerable: true, get: function () { return compiler_1.compileTimeline; } });
Object.defineProperty(exports, "compileToOVDocument", { enumerable: true, get: function () { return compiler_1.compileToOVDocument; } });
// ─── Verb Library ────────────────────────────────────────────────────────────
const geostory_verbs_json_1 = __importDefault(require("./verbs/geostory-verbs.json"));
exports.verbLibrary = geostory_verbs_json_1.default;
//# sourceMappingURL=index.js.map