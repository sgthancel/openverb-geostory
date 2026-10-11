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
/**
 * The root of a GeoStory .ov document.
 *
 * Top-level structure:
 *   name, version, profile → identity
 *   story → metadata
 *   places → resolved geography registry
 *   audio → clip track (document-absolute)
 *   media → inset track (document-absolute)
 *   layers → data layer definitions
 *   scenes → ordered narrative sequence (references registries by ID)
 *   attribution → required credit lines
 *   extensions → host-specific namespaced data
 *   settings → defaults and playback configuration
 */
export interface GeoStoryDocument {
    /** Document name — typically kebab-case, used as filename stem */
    name: string;
    /** Document version — semver of this specific story document */
    version: string;
    /** Must be 'geostory' — discriminator for OpenVerb profile detection */
    profile: 'geostory';
    /** Optional human-readable description */
    description?: string;
    /** Story metadata */
    story: GeoStoryMetadata;
    /** Top-level places registry — resolved geography, referenced by scenes via place_id */
    places: GeoStoryPlace[];
    /** Top-level audio track — all clips positioned document-absolute */
    audio: GeoStoryAudioClip[];
    /** Top-level media track — all items positioned document-absolute */
    media: GeoStoryMediaItem[];
    /** Basemaps registry */
    basemaps?: GeoStoryBasemap[];
    /** Data layers registry */
    layers?: GeoStoryLayer[];
    /** Drawing/annotations registry */
    annotations?: GeoStoryAnnotation[];
    /** Scene sequence. Scenes act as macros that compile into verb actions. */
    scenes: GeoStoryScene[];
    /** Required attribution lines for basemaps, imagery, data sources */
    attribution: string[];
    /** Host-specific namespaced extension data — round-tripped by all tools */
    extensions?: GeoStoryExtensions;
    /** Defaults and playback configuration */
    settings?: GeoStorySettings;
    /**
     * Catch-all for unknown fields.
     * Parsers MUST preserve fields they do not recognize.
     * Serializers MUST write them back.
     * This allows the format to evolve without breaking existing documents.
     */
    [unknownField: string]: unknown;
}
export interface GeoStoryMetadata {
    /** Human-readable title */
    title: string;
    /** Author name or organization */
    author?: string;
    /** Story description / abstract */
    description?: string;
    /** Coordinate reference system — default "EPSG:4326" */
    crs?: string;
    /** ISO 8601 creation timestamp */
    created?: string;
    /** ISO 8601 last-updated timestamp */
    updated?: string;
    /** Searchable tags */
    tags?: string[];
    /** URL or relative path to cover/thumbnail image */
    thumbnail?: string;
    /** Catch-all for unknown fields */
    [unknownField: string]: unknown;
}
/**
 * A place in the registry. Separates authored wording from resolved geocoding.
 *
 * `as_written` is what the narration says ("the Bahamas", "southern Florida").
 * `resolved` is what the geocoder returned — may differ (Florence vs Firenze).
 *
 * A player NEVER geocodes at playback time. Geocoding is an authoring step
 * whose output is committed to the file.
 */
export interface GeoStoryPlace {
    /** Unique identifier — referenced by scenes via place_id */
    id: string;
    /** The wording as it appears in narration/captions */
    as_written: string;
    /** Geocoder result — committed at authoring time */
    resolved: GeoStoryResolvedPlace;
    /** Catch-all for unknown fields */
    [unknownField: string]: unknown;
}
export interface GeoStoryResolvedPlace {
    /** Name as returned by the geocoding provider */
    name: string;
    /** Centroid — [longitude, latitude] */
    point: [number, number];
    /** Bounding box — [[west, south], [east, north]] */
    bounds?: [[number, number], [number, number]];
    /** Feature type classification */
    kind: PlaceKind;
    /** Geocoding provider name (e.g. "nominatim", "opencage", "google") */
    provider: string;
    /** ISO 8601 timestamp of when this was resolved */
    resolved_at: string;
    /** Confidence score 0–1 */
    confidence: number;
    /** Catch-all for unknown fields */
    [unknownField: string]: unknown;
}
export type PlaceKind = 'country' | 'region' | 'city' | 'landmark' | 'natural' | 'other';
/**
 * An audio clip on the document-absolute timeline.
 *
 * Narration, music, and SFX all live on the same track as individually
 * timed, editable clips. Re-timing one beat does not desynchronize the rest.
 */
export interface GeoStoryAudioClip {
    /** Unique identifier */
    id: string;
    /** Clip type */
    kind: AudioKind;
    /** Source — URL or path relative to document location */
    src: string;
    /** Start time in seconds — document-absolute */
    at: number;
    /** Duration in seconds */
    duration: number;
    /** Trim point within the source file (seconds) */
    trim_in?: number;
    /** Gain adjustment in dB (0 = unity) */
    gain_db?: number;
    /** Whether this clip ducks under narration */
    duck?: boolean;
    /** Reference to the narrated text segment (for TTS regeneration) */
    segment?: string;
    /** The text that was narrated (for TTS regeneration, caption sync) */
    text?: string;
    /** Catch-all for unknown fields */
    [unknownField: string]: unknown;
}
export type AudioKind = 'narration' | 'music' | 'sfx';
/**
 * A media item (image, video) on the document-absolute timeline.
 *
 * Media renders as insets over the map, not cutaways. The map continues
 * moving underneath while the inset is displayed.
 *
 * `origin` is REQUIRED — a generated picture of a real place can be
 * confidently wrong, and the format must distinguish photographs from
 * AI-generated imagery.
 */
export interface GeoStoryMediaItem {
    /** Unique identifier */
    id: string;
    /** Media type */
    kind: MediaKind;
    /** Source — URL or path relative to document location */
    src: string;
    /**
     * Start time in seconds — document-absolute.
     * Omit for whole-story media (e.g. a watermark or persistent overlay).
     */
    at?: number;
    /**
     * End time in seconds — document-absolute.
     * Omit for whole-story media.
     */
    until?: number;
    /** Screen placement */
    placement: MediaPlacement;
    /** Caption displayed with the media */
    caption?: string;
    /** Origin — REQUIRED. How this media was obtained. */
    origin: MediaOrigin;
    /** Attribution / credit line */
    credit?: string;
    /** Catch-all for unknown fields */
    [unknownField: string]: unknown;
}
export type MediaKind = 'image' | 'video';
export type MediaPlacement = 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'full';
export type MediaOrigin = 'upload' | 'unsplash' | 'ai' | 'satellite' | 'screenshot' | 'other';
export type BasemapType = 'xyz' | 'wms' | 'raster';
export interface GeoStoryBasemap {
    id: string;
    name: string;
    type: BasemapType;
    url: string;
    max_zoom?: number;
    attribution: string;
}
export type AnnotationKind = 'circle' | 'polygon' | 'line' | 'marker';
/**
 * How a line is drawn over time.
 *
 * A static line says a route exists. An animated one says which way it runs
 * and how fast - which for a current, a migration or a trade route is most of
 * the content, and the part a still frame cannot carry.
 *
 * Everything here is optional and has a working default, so adding `animate`
 * to an existing annotation is enough; and a renderer that ignores the block
 * entirely still draws a correct, static line rather than nothing.
 */
export interface GeoStoryFlow {
    /** Which way along the geometry the motion runs. */
    direction?: FlowDirection;
    /** Particle speed in pixels per second at 1080p, scaled to the output. */
    speed?: number;
    /** Seconds spent drawing the line in before it is fully visible. */
    reveal?: number;
    /** Seconds spent fading out at the end of the annotation's window. */
    fade_out?: number;
    /** How many markers travel the path at once. */
    particles?: number;
    /** What each travelling marker looks like. */
    particle?: FlowParticle;
    /** A soft halo around the line, for currents and routes over dark maps. */
    glow?: boolean;
    [unknownField: string]: unknown;
}
export type FlowDirection = 'forward' | 'reverse' | 'both';
export type FlowParticle = 'arrow' | 'dot' | 'none';
export interface GeoStoryAnnotation {
    id: string;
    kind: AnnotationKind;
    geometry: GeoJSONGeometry;
    radius_m?: number;
    label?: string;
    style?: {
        color?: string;
        fill_opacity?: number;
        weight?: number;
    };
    /**
     * Motion along the geometry. Meaningful for lines; a renderer should
     * ignore it on a marker, where there is no path to travel.
     */
    animate?: GeoStoryFlow;
    at?: number;
    until?: number;
}
export interface GeoStoryLayer {
    /** Unique identifier — referenced by scenes via layers_visible / layers_hidden */
    id: string;
    /** Human-readable name */
    name: string;
    /** Layer type */
    type: LayerType;
    /** Source — URL, file path relative to document, or inline GeoJSON object */
    source: string | Record<string, unknown>;
    /** Style properties */
    style?: Record<string, unknown>;
    /** Initial visibility */
    visible?: boolean;
    /** Catch-all for unknown fields */
    [unknownField: string]: unknown;
}
export type LayerType = 'geojson' | 'tiles' | 'wms' | 'raster';
/**
 * A scene in the narrative sequence.
 *
 * A scene is a MACRO that compiles into atomic OpenVerb verb actions:
 *   scene_004 → camera.fly_to + basemap.set + layer.show + caption.show + audio.narrate + pause
 *
 * Scenes reference top-level registries by ID rather than owning their contents.
 * A narration clip can be dragged past a scene boundary without special cases.
 */
export interface GeoStoryScene {
    /** Unique identifier */
    id: string;
    /** Position in the narrative sequence (1-based) */
    sequence: number;
    /** Scene title */
    title?: string;
    /** Reference to a place in the top-level places registry */
    place_id?: string;
    /** Inline geometry — used when no place is in the registry (e.g. a custom polygon) */
    geometry?: GeoJSONGeometry;
    /** Reference to a layer feature — alternative to place_id or inline geometry */
    geometry_id?: string;
    /** Camera state for this scene */
    camera?: GeoStoryCamera;
    /** Scene content — caption text, narration text */
    content?: GeoStoryContent;
    /** Timing — derived from narration or fixed by author */
    timing?: GeoStoryTiming;
    /** Transition into this scene */
    transition?: TransitionType;
    /** Delay before scene starts (seconds) */
    delay?: number;
    /** Basemap to display during this scene */
    basemap?: string;
    /** Layer IDs to make visible during this scene */
    layers_visible?: string[];
    /** Layer IDs explicitly hidden at the start of this scene. */
    layers_hidden?: string[];
    /** Annotation IDs associated with this scene. */
    annotation_ids?: string[];
    /** References to audio clips in the top-level audio track */
    audio_ids?: string[];
    /** References to media items in the top-level media track */
    media_ids?: string[];
    /** ISO 8601 timestamp — when this event happened in the real world */
    timestamp?: string;
    /** Optional external prerecorded audio file path for this scene */
    audio_path?: string;
    /** Narration text (authoritative source for TTS audio generation) */
    narration?: string;
    /** Audio configuration (TTS voice settings or external file override) */
    audio?: GeoStorySceneAudio;
    /** Catch-all for unknown fields */
    [unknownField: string]: unknown;
}
export interface GeoStorySceneAudio {
    /** Source can be 'file' or omitted (implies TTS) */
    source?: 'file' | string;
    /** External file path if source is 'file' */
    path?: string;
    /** TTS voice identifier */
    voice?: string;
    /** TTS speech speed multiplier */
    speed?: number;
    /** Playback volume multiplier */
    volume?: number;
    [unknownField: string]: unknown;
}
export type TransitionType = 'fly' | 'fade' | 'cut' | 'dissolve';
/**
 * Camera state for a scene.
 *
 * Preferred framing: bounds-first via `frame`, with `center`/`zoom` as
 * cached convenience values (non-authoritative). A 16:9 player and a
 * 9:16 player fit the same bounds at different zooms.
 *
 * `mode: 3d` is a REQUEST. A 2D-only renderer degrades to a wide shot
 * rather than refusing the file. The spec states this explicitly.
 *
 * `track` provides keyframe animation within the scene. When present,
 * it overrides the static camera fields. All keyframe `at` values are
 * document-absolute.
 */
export interface GeoStoryCamera {
    /** Rendering mode — 3d is a request, not a requirement */
    mode?: CameraMode;
    /** Bounds-based framing — preferred for anything larger than a city */
    frame?: GeoStoryCameraFrame;
    /** Center point [longitude, latitude] — cached convenience when using frame */
    center?: [number, number];
    /** Zoom level — cached convenience, non-authoritative when frame is present */
    zoom?: number;
    /** Bearing in degrees */
    bearing?: number;
    /** Pitch in degrees */
    pitch?: number;
    /** Easing function for the transition into this camera state */
    easing?: EasingType;
    /**
     * Keyframe track — overrides static fields when present.
     * All `at` values are document-absolute.
     * Unlocked keyframes scale with timing.measured.
     * Locked keyframes are preserved exactly.
     */
    track?: GeoStoryCameraKeyframe[];
    /** Catch-all for unknown fields */
    [unknownField: string]: unknown;
}
export type CameraMode = '2d' | '3d' | 'auto';
export type EasingType = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
export interface GeoStoryCameraFrame {
    /** Bounding box — [[west, south], [east, north]] */
    bounds: [[number, number], [number, number]];
    /** Padding as fraction of extent (0–1) */
    padding?: number;
    /** Catch-all for unknown fields */
    [unknownField: string]: unknown;
}
/**
 * A camera keyframe on the document-absolute timeline.
 *
 * Rescaling rule (timing.mode: derived):
 * - Unlocked keyframes (locked: false or omitted) scale proportionally
 *   with the ratio of measured/intended duration.
 * - Locked keyframes (locked: true) are preserved exactly — the user
 *   hand-placed them and does not want them moved.
 */
export interface GeoStoryCameraKeyframe {
    /** Time in seconds — document-absolute */
    at: number;
    /** Center point [longitude, latitude] */
    center?: [number, number];
    /** Zoom level */
    zoom?: number;
    /** Bearing in degrees */
    bearing?: number;
    /** Pitch in degrees */
    pitch?: number;
    /** Easing to this keyframe */
    easing?: EasingType;
    /**
     * If true, this keyframe is preserved exactly during rescaling.
     * If false or omitted, the keyframe scales proportionally.
     */
    locked?: boolean;
    /** Catch-all for unknown fields */
    [unknownField: string]: unknown;
}
export interface GeoStoryContent {
    /** Caption text to display on screen */
    caption?: string;
    /**
     * Narration text — used for TTS generation during authoring.
     * At playback time, the audio clip is used instead.
     * Kept in the document for regeneration and caption sync.
     */
    narration?: string;
    /** Style preset reference */
    style?: string;
    /** Catch-all for unknown fields */
    [unknownField: string]: unknown;
}
/**
 * Timing model for a scene.
 *
 * The real duration of a scene is however long the voice actually takes,
 * not what the author estimated. Over a 5-minute script, the drift puts
 * captions visibly off the voice.
 *
 * `mode: derived` — narration wins, scene stretches
 * `mode: fixed` — author pinned it, narration must fit
 *
 * A player that ignores `measured` and honours only `intended` will drift.
 */
export interface GeoStoryTiming {
    /** Which value is authoritative */
    mode: TimingMode;
    /** What the author asked for (seconds) */
    intended: number;
    /** What the narration actually measured to (seconds) — set after TTS */
    measured?: number;
    /** Audio clip ID this was measured from */
    source?: string;
    /** Catch-all for unknown fields */
    [unknownField: string]: unknown;
}
export type TimingMode = 'derived' | 'fixed';
export interface GeoStorySettings {
    /** Default basemap ID for scenes that don't specify one */
    default_basemap?: string;
    /** Default transition type */
    default_transition?: TransitionType;
    /** Default scene duration in seconds */
    default_duration?: number;
    /** Whether to auto-generate TTS from caption/narration text */
    auto_narration?: boolean;
    /** Whether the story loops */
    loop?: boolean;
    /**
     * How a 2D-only renderer handles mode: 3d scenes.
     * Default: 'wide_shot' — degrades to a wide 2D view.
     */
    camera_3d_degradation?: '3d_degradation_wide_shot' | '3d_degradation_skip';
    /** Catch-all for unknown fields */
    [unknownField: string]: unknown;
}
/**
 * Host-specific namespaced extension data.
 *
 * Convention: `extensions.<host>` contains data meaningful only to that host.
 * Unknown-field round-tripping preserves the entire block.
 *
 * Example:
 *   extensions:
 *     qgis:
 *       project: ./katrina.qgz
 *       render_crs: "EPSG:3857"
 *       map_themes:
 *         scene_004: "GeoStudio: 04 Landfall"
 */
export interface GeoStoryExtensions {
    [namespace: string]: Record<string, unknown>;
}
/**
 * Minimal GeoJSON geometry types — enough for the format, no full GeoJSON dep.
 */
export type GeoJSONGeometry = GeoJSONPoint | GeoJSONLineString | GeoJSONPolygon | GeoJSONMultiPoint | GeoJSONMultiLineString | GeoJSONMultiPolygon;
export interface GeoJSONPoint {
    type: 'Point';
    coordinates: [number, number] | [number, number, number];
}
export interface GeoJSONLineString {
    type: 'LineString';
    coordinates: Array<[number, number] | [number, number, number]>;
}
export interface GeoJSONPolygon {
    type: 'Polygon';
    coordinates: Array<Array<[number, number] | [number, number, number]>>;
}
export interface GeoJSONMultiPoint {
    type: 'MultiPoint';
    coordinates: Array<[number, number] | [number, number, number]>;
}
export interface GeoJSONMultiLineString {
    type: 'MultiLineString';
    coordinates: Array<Array<[number, number] | [number, number, number]>>;
}
export interface GeoJSONMultiPolygon {
    type: 'MultiPolygon';
    coordinates: Array<Array<Array<[number, number] | [number, number, number]>>>;
}
/**
 * Output of the scene compiler.
 *
 * A scene macro compiles into an ordered sequence of atomic verb actions.
 * Each action has a verb ID and arguments matching the verb's input schema.
 *
 * Example:
 *   scene_004 compiles to:
 *     geostory.basemap.set → geostory.camera.fly_to → geostory.layer.show →
 *     geostory.media.show → geostory.caption.show → geostory.audio.narrate →
 *     geostory.pause
 */
export interface CompiledVerbAction {
    /** OpenVerb verb ID (e.g. "geostory.camera.fly_to") */
    verb: string;
    /** Arguments matching the verb's input schema */
    args: Record<string, unknown>;
    /** Source scene ID — for traceability */
    source_scene_id: string;
    /** Execution order within the scene */
    order: number;
}
/**
 * A compiled scene — the scene's metadata plus its verb action sequence.
 */
export interface CompiledScene {
    /** Scene ID */
    scene_id: string;
    /** Sequence number */
    sequence: number;
    /** Start time (document-absolute seconds) */
    start_time: number;
    /** Duration (the authoritative value based on timing.mode) */
    duration: number;
    /** Ordered verb actions */
    actions: CompiledVerbAction[];
}
/**
 * The full compiled timeline — all scenes expanded into verb actions.
 */
export interface CompiledTimeline {
    /** Total duration in seconds */
    total_duration: number;
    /** Compiled scenes in sequence order */
    scenes: CompiledScene[];
    /** Flat list of all actions in execution order */
    all_actions: CompiledVerbAction[];
}
/**
 * Verb safety classification.
 *
 * Playback verbs are safe for untrusted documents — they only drive
 * rendering (camera, layers, captions, audio, media, basemap, pause).
 *
 * Authoring verbs are editor/AI only — they modify the document or
 * call external services (geocode, TTS, render, publish).
 * An untrusted document MUST NOT invoke authoring verbs.
 */
export type VerbCategory = 'playback' | 'authoring';
/**
 * Maps each verb to its safety category.
 */
export declare const VERB_CATEGORIES: Record<string, VerbCategory>;
//# sourceMappingURL=types.d.ts.map