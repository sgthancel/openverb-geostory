import { GeoStoryDocument } from './types';
/**
 * JSON Schema for validating GeoStory .ov documents.
 *
 * Design rules:
 * - additionalProperties: true at every level (unknown fields must round-trip)
 * - Required fields enforce the minimum viable document
 * - Type constraints are loose enough to not reject valid edge cases
 */
export declare const GEOSTORY_SCHEMA: {
    $id: string;
    type: string;
    additionalProperties: boolean;
    required: string[];
    properties: {
        name: {
            type: string;
        };
        version: {
            type: string;
        };
        profile: {
            type: string;
            const: string;
        };
        description: {
            type: string;
        };
        story: {
            type: string;
            additionalProperties: boolean;
            required: string[];
            properties: {
                title: {
                    type: string;
                };
                author: {
                    type: string;
                };
                description: {
                    type: string;
                };
                crs: {
                    type: string;
                };
                created: {
                    type: string;
                };
                updated: {
                    type: string;
                };
                tags: {
                    type: string;
                    items: {
                        type: string;
                    };
                };
                thumbnail: {
                    type: string;
                };
            };
        };
        places: {
            type: string;
            items: {
                type: string;
                additionalProperties: boolean;
                required: string[];
                properties: {
                    id: {
                        type: string;
                    };
                    as_written: {
                        type: string;
                    };
                    resolved: {
                        type: string;
                        additionalProperties: boolean;
                        required: string[];
                        properties: {
                            name: {
                                type: string;
                            };
                            point: {
                                type: string;
                                items: {
                                    type: string;
                                };
                                minItems: number;
                                maxItems: number;
                            };
                            bounds: {
                                type: string;
                                items: {
                                    type: string;
                                    items: {
                                        type: string;
                                    };
                                    minItems: number;
                                    maxItems: number;
                                };
                                minItems: number;
                                maxItems: number;
                            };
                            kind: {
                                type: string;
                                enum: string[];
                            };
                            provider: {
                                type: string;
                            };
                            resolved_at: {
                                type: string;
                            };
                            confidence: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                        };
                    };
                };
            };
        };
        audio: {
            type: string;
            items: {
                type: string;
                additionalProperties: boolean;
                required: string[];
                properties: {
                    id: {
                        type: string;
                    };
                    kind: {
                        type: string;
                        enum: string[];
                    };
                    src: {
                        type: string;
                    };
                    at: {
                        type: string;
                        minimum: number;
                    };
                    duration: {
                        type: string;
                        minimum: number;
                    };
                    trim_in: {
                        type: string;
                        minimum: number;
                    };
                    gain_db: {
                        type: string;
                    };
                    duck: {
                        type: string;
                    };
                    segment: {
                        type: string;
                    };
                    text: {
                        type: string;
                    };
                };
            };
        };
        media: {
            type: string;
            items: {
                type: string;
                additionalProperties: boolean;
                required: string[];
                properties: {
                    id: {
                        type: string;
                    };
                    kind: {
                        type: string;
                        enum: string[];
                    };
                    src: {
                        type: string;
                    };
                    at: {
                        type: string;
                        minimum: number;
                    };
                    until: {
                        type: string;
                        minimum: number;
                    };
                    placement: {
                        type: string;
                        enum: string[];
                    };
                    caption: {
                        type: string;
                    };
                    origin: {
                        type: string;
                        enum: string[];
                    };
                    credit: {
                        type: string;
                    };
                };
            };
        };
        basemaps: {
            type: string;
            items: {
                type: string;
                required: string[];
                additionalProperties: boolean;
                properties: {
                    id: {
                        type: string;
                    };
                    name: {
                        type: string;
                    };
                    type: {
                        type: string;
                        enum: string[];
                    };
                    url: {
                        type: string;
                    };
                    max_zoom: {
                        type: string;
                    };
                    attribution: {
                        type: string;
                    };
                };
            };
        };
        layers: {
            type: string;
            items: {
                type: string;
                required: string[];
                additionalProperties: boolean;
                properties: {
                    id: {
                        type: string;
                    };
                    name: {
                        type: string;
                    };
                    type: {
                        type: string;
                        enum: string[];
                    };
                    source: {
                        type: string;
                    };
                    style: {
                        type: string;
                    };
                };
            };
        };
        annotations: {
            type: string;
            items: {
                type: string;
                required: string[];
                additionalProperties: boolean;
                properties: {
                    id: {
                        type: string;
                    };
                    kind: {
                        type: string;
                        enum: string[];
                    };
                    geometry: {
                        type: string;
                    };
                    radius_m: {
                        type: string;
                        minimum: number;
                    };
                    label: {
                        type: string;
                    };
                    style: {
                        type: string;
                        properties: {
                            color: {
                                type: string;
                            };
                            fill_opacity: {
                                type: string;
                                minimum: number;
                                maximum: number;
                            };
                            weight: {
                                type: string;
                                minimum: number;
                            };
                        };
                    };
                    animate: {
                        type: string;
                        additionalProperties: boolean;
                        properties: {
                            direction: {
                                type: string;
                                enum: string[];
                            };
                            speed: {
                                type: string;
                                minimum: number;
                            };
                            reveal: {
                                type: string;
                                minimum: number;
                            };
                            fade_out: {
                                type: string;
                                minimum: number;
                            };
                            particles: {
                                type: string;
                                minimum: number;
                            };
                            particle: {
                                type: string;
                                enum: string[];
                            };
                            glow: {
                                type: string;
                            };
                        };
                    };
                    at: {
                        type: string;
                        minimum: number;
                    };
                    until: {
                        type: string;
                        minimum: number;
                    };
                };
            };
        };
        scenes: {
            type: string;
            items: {
                type: string;
                additionalProperties: boolean;
                required: string[];
                properties: {
                    id: {
                        type: string;
                    };
                    sequence: {
                        type: string;
                        minimum: number;
                    };
                    title: {
                        type: string;
                    };
                    place_id: {
                        type: string;
                    };
                    geometry: {
                        type: string;
                        additionalProperties: boolean;
                    };
                    geometry_id: {
                        type: string;
                    };
                    camera: {
                        type: string;
                        additionalProperties: boolean;
                        properties: {
                            mode: {
                                type: string;
                                enum: string[];
                            };
                            frame: {
                                type: string;
                                additionalProperties: boolean;
                                properties: {
                                    bounds: {
                                        type: string;
                                        items: {
                                            type: string;
                                            items: {
                                                type: string;
                                            };
                                            minItems: number;
                                            maxItems: number;
                                        };
                                        minItems: number;
                                        maxItems: number;
                                    };
                                    padding: {
                                        type: string;
                                        minimum: number;
                                        maximum: number;
                                    };
                                };
                            };
                            center: {
                                type: string;
                                items: {
                                    type: string;
                                };
                                minItems: number;
                                maxItems: number;
                            };
                            zoom: {
                                type: string;
                            };
                            bearing: {
                                type: string;
                            };
                            pitch: {
                                type: string;
                            };
                            easing: {
                                type: string;
                                enum: string[];
                            };
                            track: {
                                type: string;
                                items: {
                                    type: string;
                                    additionalProperties: boolean;
                                    required: string[];
                                    properties: {
                                        at: {
                                            type: string;
                                            minimum: number;
                                        };
                                        center: {
                                            type: string;
                                            items: {
                                                type: string;
                                            };
                                            minItems: number;
                                            maxItems: number;
                                        };
                                        zoom: {
                                            type: string;
                                        };
                                        bearing: {
                                            type: string;
                                        };
                                        pitch: {
                                            type: string;
                                        };
                                        easing: {
                                            type: string;
                                            enum: string[];
                                        };
                                        locked: {
                                            type: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                    content: {
                        type: string;
                        additionalProperties: boolean;
                        properties: {
                            caption: {
                                type: string;
                            };
                            narration: {
                                type: string;
                            };
                            style: {
                                type: string;
                            };
                        };
                    };
                    timing: {
                        type: string;
                        additionalProperties: boolean;
                        required: string[];
                        properties: {
                            mode: {
                                type: string;
                                enum: string[];
                            };
                            intended: {
                                type: string;
                                minimum: number;
                            };
                            measured: {
                                type: string;
                                minimum: number;
                            };
                            source: {
                                type: string;
                            };
                        };
                    };
                    transition: {
                        type: string;
                        enum: string[];
                    };
                    delay: {
                        type: string;
                        minimum: number;
                    };
                    basemap: {
                        type: string;
                    };
                    layers_visible: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    layers_hidden: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    annotation_ids: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    audio_ids: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    media_ids: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                    timestamp: {
                        type: string;
                    };
                    audio_path: {
                        type: string;
                    };
                    narration: {
                        type: string;
                    };
                    audio: {
                        type: string;
                        additionalProperties: boolean;
                        properties: {
                            source: {
                                type: string;
                            };
                            path: {
                                type: string;
                            };
                            voice: {
                                type: string;
                            };
                            speed: {
                                type: string;
                            };
                            volume: {
                                type: string;
                            };
                        };
                    };
                };
            };
        };
        attribution: {
            type: string;
            items: {
                type: string;
            };
            minItems: number;
        };
        extensions: {
            type: string;
            additionalProperties: boolean;
        };
        settings: {
            type: string;
            additionalProperties: boolean;
            properties: {
                default_basemap: {
                    type: string;
                };
                default_transition: {
                    type: string;
                    enum: string[];
                };
                default_duration: {
                    type: string;
                    minimum: number;
                };
                auto_narration: {
                    type: string;
                };
                loop: {
                    type: string;
                };
                camera_3d_degradation: {
                    type: string;
                    enum: string[];
                };
            };
        };
    };
};
/**
 * Validates a document against the GeoStory JSON Schema.
 *
 * @param doc - The document to validate (typically parsed from .ov YAML/JSON)
 * @returns Object with `valid` boolean and `errors` array of human-readable messages
 */
export declare function validateGeoStory(doc: unknown): {
    valid: boolean;
    errors: string[];
};
/**
 * Type guard — checks if an unknown value is a valid GeoStoryDocument.
 *
 * @param doc - The value to check
 * @returns True if the value validates against the GeoStory schema
 */
export declare function isGeoStoryDocument(doc: unknown): doc is GeoStoryDocument;
//# sourceMappingURL=schema.d.ts.map