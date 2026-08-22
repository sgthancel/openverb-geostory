"use strict";
/**
 * @openverb/geostory — Core Type Definitions
 *
 * GeoStory Profile Specification v1.0
 *
 * A GeoStory is a spatial workflow whose steps happen in geographic space.
 * Each scene is a macro that compiles into atomic OpenVerb verb actions.
 * The .ov document is the portable, AI-editable representation.
 *
 * Design rules:
 * - A valid GeoStory must be playable from its declarative story data alone.
 * - External asset paths are optional and must never be required for core narration or rendering.
 * - All `at:` values are document-absolute (seconds from story start)
 * - Audio, media, and places are top-level registries; scenes reference by ID
 * - Unknown fields must round-trip (parser preserves, serializer writes back)
 * - `camera.mode: 3d` is a request; 2D renderers degrade to wide shot
 * - Geocoding is an authoring step; resolved geography is cached in the document
 * - A .ov geostory must play identically in 5 years with no geocoder reachable
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERB_CATEGORIES = void 0;
/**
 * Maps each verb to its safety category.
 */
exports.VERB_CATEGORIES = {
    // Playback verbs (safe for untrusted documents)
    'geostory.scene': 'playback',
    'geostory.camera.fly_to': 'playback',
    'geostory.camera.set': 'playback',
    'geostory.camera.frame': 'playback',
    'geostory.camera.keyframe': 'playback',
    'geostory.layer.show': 'playback',
    'geostory.layer.hide': 'playback',
    'geostory.marker.add': 'playback',
    'geostory.marker.remove': 'playback',
    'geostory.caption.show': 'playback',
    'geostory.caption.hide': 'playback',
    'geostory.audio.clip': 'playback',
    'geostory.audio.narrate': 'playback',
    'geostory.audio.music': 'playback',
    'geostory.media.show': 'playback',
    'geostory.media.hide': 'playback',
    'geostory.basemap.set': 'playback',
    'geostory.pause': 'playback',
    // Authoring verbs (editor/AI only — never called during playback)
    'geostory.place.resolve': 'authoring',
    'geostory.timing.fit': 'authoring',
    'geostory.render': 'authoring',
    'geostory.publish': 'authoring',
    'geostory.export.kit': 'authoring',
};
//# sourceMappingURL=types.js.map