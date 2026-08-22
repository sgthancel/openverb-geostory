import { GeoStoryDocument } from './types';
/**
 * Serializes a GeoStoryDocument to a string in the specified format.
 * Defaults to 'yaml'. Sorts scenes by sequence order before serialization.
 */
export declare function serializeGeoStory(doc: GeoStoryDocument, format?: 'yaml' | 'json'): string;
/**
 * Convenience function to serialize a GeoStoryDocument to JSON.
 */
export declare function serializeGeoStoryToJSON(doc: GeoStoryDocument): string;
/**
 * Convenience function to serialize a GeoStoryDocument to YAML.
 */
export declare function serializeGeoStoryToYAML(doc: GeoStoryDocument): string;
//# sourceMappingURL=serializer.d.ts.map