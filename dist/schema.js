"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GEOSTORY_SCHEMA = void 0;
exports.validateGeoStory = validateGeoStory;
exports.isGeoStoryDocument = isGeoStoryDocument;
const ajv_1 = __importDefault(require("ajv"));
/**
 * JSON Schema for validating GeoStory .ov documents.
 *
 * Design rules:
 * - additionalProperties: true at every level (unknown fields must round-trip)
 * - Required fields enforce the minimum viable document
 * - Type constraints are loose enough to not reject valid edge cases
 */
exports.GEOSTORY_SCHEMA = {
    $id: 'https://openverb.org/schema/geostory/1.0',
    type: 'object',
    additionalProperties: true,
    required: ['name', 'version', 'profile', 'story', 'places', 'audio', 'media', 'scenes', 'attribution'],
    properties: {
        name: { type: 'string' },
        version: { type: 'string' },
        profile: { type: 'string', const: 'geostory' },
        description: { type: 'string' },
        // ─── Story metadata ───
        story: {
            type: 'object',
            additionalProperties: true,
            required: ['title'],
            properties: {
                title: { type: 'string' },
                author: { type: 'string' },
                description: { type: 'string' },
                crs: { type: 'string' },
                created: { type: 'string' },
                updated: { type: 'string' },
                tags: { type: 'array', items: { type: 'string' } },
                thumbnail: { type: 'string' },
            },
        },
        // ─── Places registry ───
        places: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: true,
                required: ['id', 'as_written', 'resolved'],
                properties: {
                    id: { type: 'string' },
                    as_written: { type: 'string' },
                    resolved: {
                        type: 'object',
                        additionalProperties: true,
                        required: ['name', 'point', 'kind', 'provider', 'resolved_at', 'confidence'],
                        properties: {
                            name: { type: 'string' },
                            point: {
                                type: 'array',
                                items: { type: 'number' },
                                minItems: 2,
                                maxItems: 2,
                            },
                            bounds: {
                                type: 'array',
                                items: {
                                    type: 'array',
                                    items: { type: 'number' },
                                    minItems: 2,
                                    maxItems: 2,
                                },
                                minItems: 2,
                                maxItems: 2,
                            },
                            kind: {
                                type: 'string',
                                enum: ['country', 'region', 'city', 'landmark', 'natural', 'other'],
                            },
                            provider: { type: 'string' },
                            resolved_at: { type: 'string' },
                            confidence: { type: 'number', minimum: 0, maximum: 1 },
                        },
                    },
                },
            },
        },
        // ─── Audio track ───
        audio: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: true,
                required: ['id', 'kind', 'src', 'at', 'duration'],
                properties: {
                    id: { type: 'string' },
                    kind: { type: 'string', enum: ['narration', 'music', 'sfx'] },
                    src: { type: 'string' },
                    at: { type: 'number', minimum: 0 },
                    duration: { type: 'number', minimum: 0 },
                    trim_in: { type: 'number', minimum: 0 },
                    gain_db: { type: 'number' },
                    duck: { type: 'boolean' },
                    segment: { type: 'string' },
                    text: { type: 'string' },
                },
            },
        },
        // ─── Media track ───
        media: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: true,
                required: ['id', 'kind', 'src', 'placement', 'origin'],
                properties: {
                    id: { type: 'string' },
                    kind: { type: 'string', enum: ['image', 'video'] },
                    src: { type: 'string' },
                    at: { type: 'number', minimum: 0 },
                    until: { type: 'number', minimum: 0 },
                    placement: {
                        type: 'string',
                        enum: ['top_left', 'top_right', 'bottom_left', 'bottom_right', 'full'],
                    },
                    caption: { type: 'string' },
                    origin: {
                        type: 'string',
                        enum: ['upload', 'unsplash', 'ai', 'satellite', 'screenshot', 'other'],
                    },
                    credit: { type: 'string' },
                },
            },
        },
        // ─── Basemaps ───
        basemaps: {
            type: 'array',
            items: {
                type: 'object',
                required: ['id', 'name', 'type', 'url', 'attribution'],
                additionalProperties: true,
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    type: { type: 'string', enum: ['xyz', 'wms', 'raster'] },
                    url: { type: 'string' },
                    max_zoom: { type: 'number' },
                    attribution: { type: 'string' }
                },
            },
        },
        // ─── Layers ───
        layers: {
            type: 'array',
            items: {
                type: 'object',
                required: ['id', 'name', 'type', 'source'],
                additionalProperties: true,
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    type: { type: 'string', enum: ['geojson', 'raster', 'vector'] },
                    source: { type: 'string' },
                    style: { type: 'object' },
                },
            },
        },
        // ─── Annotations ───
        annotations: {
            type: 'array',
            items: {
                type: 'object',
                required: ['id', 'kind', 'geometry'],
                additionalProperties: true,
                properties: {
                    id: { type: 'string' },
                    kind: { type: 'string', enum: ['circle', 'polygon', 'line', 'marker'] },
                    geometry: { type: 'object' },
                    radius_m: { type: 'number', minimum: 0 },
                    label: { type: 'string' },
                    style: {
                        type: 'object',
                        properties: {
                            color: { type: 'string' },
                            fill_opacity: { type: 'number', minimum: 0, maximum: 1 },
                            weight: { type: 'number', minimum: 0 },
                        }
                    },
                    animate: {
                        type: 'object',
                        additionalProperties: true,
                        properties: {
                            direction: { type: 'string', enum: ['forward', 'reverse', 'both'] },
                            speed: { type: 'number', minimum: 0 },
                            reveal: { type: 'number', minimum: 0 },
                            fade_out: { type: 'number', minimum: 0 },
                            particles: { type: 'integer', minimum: 0 },
                            particle: { type: 'string', enum: ['arrow', 'dot', 'none'] },
                            glow: { type: 'boolean' },
                        }
                    },
                    at: { type: 'number', minimum: 0 },
                    until: { type: 'number', minimum: 0 },
                }
            }
        },
        // ─── Scenes ───
        scenes: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: true,
                required: ['id', 'sequence'],
                properties: {
                    id: { type: 'string' },
                    sequence: { type: 'number', minimum: 1 },
                    title: { type: 'string' },
                    place_id: { type: 'string' },
                    geometry: { type: 'object', additionalProperties: true },
                    geometry_id: { type: 'string' },
                    camera: {
                        type: 'object',
                        additionalProperties: true,
                        properties: {
                            mode: { type: 'string', enum: ['2d', '3d', 'auto'] },
                            frame: {
                                type: 'object',
                                additionalProperties: true,
                                properties: {
                                    bounds: {
                                        type: 'array',
                                        items: {
                                            type: 'array',
                                            items: { type: 'number' },
                                            minItems: 2,
                                            maxItems: 2,
                                        },
                                        minItems: 2,
                                        maxItems: 2,
                                    },
                                    padding: { type: 'number', minimum: 0, maximum: 1 },
                                },
                            },
                            center: {
                                type: 'array',
                                items: { type: 'number' },
                                minItems: 2,
                                maxItems: 2,
                            },
                            zoom: { type: 'number' },
                            bearing: { type: 'number' },
                            pitch: { type: 'number' },
                            easing: { type: 'string', enum: ['linear', 'ease-in', 'ease-out', 'ease-in-out'] },
                            track: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    additionalProperties: true,
                                    required: ['at'],
                                    properties: {
                                        at: { type: 'number', minimum: 0 },
                                        center: {
                                            type: 'array',
                                            items: { type: 'number' },
                                            minItems: 2,
                                            maxItems: 2,
                                        },
                                        zoom: { type: 'number' },
                                        bearing: { type: 'number' },
                                        pitch: { type: 'number' },
                                        easing: { type: 'string', enum: ['linear', 'ease-in', 'ease-out', 'ease-in-out'] },
                                        locked: { type: 'boolean' },
                                    },
                                },
                            },
                        },
                    },
                    content: {
                        type: 'object',
                        additionalProperties: true,
                        properties: {
                            caption: { type: 'string' },
                            narration: { type: 'string' },
                            style: { type: 'string' },
                        },
                    },
                    timing: {
                        type: 'object',
                        additionalProperties: true,
                        required: ['mode', 'intended'],
                        properties: {
                            mode: { type: 'string', enum: ['derived', 'fixed'] },
                            intended: { type: 'number', minimum: 0 },
                            measured: { type: 'number', minimum: 0 },
                            source: { type: 'string' },
                        },
                    },
                    transition: { type: 'string', enum: ['fly', 'fade', 'cut', 'dissolve'] },
                    delay: { type: 'number', minimum: 0 },
                    basemap: { type: 'string' },
                    layers_visible: { type: 'array', items: { type: 'string' } },
                    layers_hidden: { type: 'array', items: { type: 'string' } },
                    annotation_ids: { type: 'array', items: { type: 'string' } },
                    audio_ids: { type: 'array', items: { type: 'string' } },
                    media_ids: { type: 'array', items: { type: 'string' } },
                    timestamp: { type: 'string' },
                    audio_path: { type: 'string' },
                    narration: { type: 'string' },
                    audio: {
                        type: 'object',
                        additionalProperties: true,
                        properties: {
                            source: { type: 'string' },
                            path: { type: 'string' },
                            voice: { type: 'string' },
                            speed: { type: 'number' },
                            volume: { type: 'number' }
                        }
                    }
                },
            },
        },
        // ─── Attribution ───
        attribution: {
            type: 'array',
            items: { type: 'string' },
            minItems: 0,
        },
        // ─── Extensions ───
        extensions: {
            type: 'object',
            additionalProperties: true,
        },
        // ─── Settings ───
        settings: {
            type: 'object',
            additionalProperties: true,
            properties: {
                default_basemap: { type: 'string' },
                default_transition: { type: 'string', enum: ['fly', 'fade', 'cut', 'dissolve'] },
                default_duration: { type: 'number', minimum: 0 },
                auto_narration: { type: 'boolean' },
                loop: { type: 'boolean' },
                camera_3d_degradation: {
                    type: 'string',
                    enum: ['3d_degradation_wide_shot', '3d_degradation_skip'],
                },
            },
        },
    },
};
const ajv = new ajv_1.default({ strict: false, allErrors: true });
const validate = ajv.compile(exports.GEOSTORY_SCHEMA);
/**
 * Validates a document against the GeoStory JSON Schema.
 *
 * @param doc - The document to validate (typically parsed from .ov YAML/JSON)
 * @returns Object with `valid` boolean and `errors` array of human-readable messages
 */
function validateGeoStory(doc) {
    const valid = validate(doc);
    const errors = validate.errors
        ? validate.errors.map((err) => {
            const path = err.instancePath || '(root)';
            const message = err.message || 'unknown error';
            const params = err.params ? ` ${JSON.stringify(err.params)}` : '';
            return `${path}: ${message}${params}`;
        })
        : [];
    return { valid: valid, errors };
}
/**
 * Type guard — checks if an unknown value is a valid GeoStoryDocument.
 *
 * @param doc - The value to check
 * @returns True if the value validates against the GeoStory schema
 */
function isGeoStoryDocument(doc) {
    return validate(doc);
}
//# sourceMappingURL=schema.js.map