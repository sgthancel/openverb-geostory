import * as yaml from 'yaml';
import { GeoStoryDocument } from './types';

/**
 * Serializes a GeoStoryDocument to a string in the specified format.
 * Defaults to 'yaml'. Sorts scenes by sequence order before serialization.
 */
export function serializeGeoStory(doc: GeoStoryDocument, format: 'yaml' | 'json' = 'yaml'): string {
  // Create a copy to sort scenes without mutating original document
  const docCopy = { ...doc } as any;
  
  if (Array.isArray(docCopy.scenes)) {
    docCopy.scenes = [...docCopy.scenes].sort((a: any, b: any) => {
      const seqA = a.sequence ?? 0;
      const seqB = b.sequence ?? 0;
      return seqA - seqB;
    });
  }

  if (format === 'json') {
    return JSON.stringify(docCopy, null, 2);
  } else {
    return yaml.stringify(docCopy, {
      lineWidth: 120,
    });
  }
}

/**
 * Convenience function to serialize a GeoStoryDocument to JSON.
 */
export function serializeGeoStoryToJSON(doc: GeoStoryDocument): string {
  return serializeGeoStory(doc, 'json');
}

/**
 * Convenience function to serialize a GeoStoryDocument to YAML.
 */
export function serializeGeoStoryToYAML(doc: GeoStoryDocument): string {
  return serializeGeoStory(doc, 'yaml');
}
