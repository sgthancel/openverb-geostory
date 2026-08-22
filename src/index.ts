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

// ─── Types ───────────────────────────────────────────────────────────────────
export type {
  GeoStoryDocument,
  GeoStoryMetadata,
  GeoStoryPlace,
  GeoStoryResolvedPlace,
  PlaceKind,
  GeoStoryAudioClip,
  AudioKind,
  GeoStoryMediaItem,
  MediaKind,
  MediaPlacement,
  MediaOrigin,
  GeoStoryBasemap,
  BasemapType,
  GeoStoryLayer,
  LayerType,
  GeoStoryAnnotation,
  AnnotationKind,
  GeoStoryScene,
  TransitionType,
  GeoStoryCamera,
  CameraMode,
  EasingType,
  GeoStoryCameraFrame,
  GeoStoryCameraKeyframe,
  GeoStoryContent,
  GeoStoryTiming,
  TimingMode,
  GeoStorySettings,
  GeoStoryExtensions,
  GeoJSONGeometry,
  GeoJSONPoint,
  GeoJSONLineString,
  GeoJSONPolygon,
  GeoJSONMultiPoint,
  GeoJSONMultiLineString,
  GeoJSONMultiPolygon,
  CompiledVerbAction,
  CompiledScene,
  CompiledTimeline,
  VerbCategory,
} from './types';

export { VERB_CATEGORIES } from './types';

// ─── Schema & Validation ─────────────────────────────────────────────────────
export { GEOSTORY_SCHEMA, validateGeoStory, isGeoStoryDocument } from './schema';

// ─── Parser ──────────────────────────────────────────────────────────────────
export { parseGeoStory, parseGeoStoryRaw, GeoStoryParseError } from './parser';

// ─── Serializer ──────────────────────────────────────────────────────────────
export {
  serializeGeoStory,
  serializeGeoStoryToJSON,
  serializeGeoStoryToYAML,
} from './serializer';

// ─── Compiler ────────────────────────────────────────────────────────────────
export { compileScene, compileTimeline, compileToOVDocument } from './compiler';

// ─── Verb Library ────────────────────────────────────────────────────────────
import verbLibrary from './verbs/geostory-verbs.json';
export { verbLibrary };
