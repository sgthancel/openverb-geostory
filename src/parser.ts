import { parseOV } from '@openverb/format';
import { GeoStoryDocument } from './types';

/**
 * Error thrown when parsing a GeoStory document fails.
 */
export class GeoStoryParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeoStoryParseError';
  }
}

/**
 * Parses a string into a raw object, leveraging @openverb/format.
 * Does not validate structure.
 */
export function parseGeoStoryRaw(input: string): unknown {
  try {
    return parseOV(input);
  } catch (e) {
    throw new GeoStoryParseError(`Failed to parse input as JSON or YAML: ${(e as Error).message}`);
  }
}

/**
 * Parses a string into a GeoStoryDocument.
 * Validates the profile field and sorts scenes by sequence.
 */
export function parseGeoStory(input: string): GeoStoryDocument {
  const parsed = parseGeoStoryRaw(input) as any;
  
  if (!parsed || typeof parsed !== 'object') {
    throw new GeoStoryParseError('Parsed document is not an object.');
  }

  if (parsed.profile !== 'geostory') {
    throw new GeoStoryParseError(`Invalid profile field. Expected 'geostory', got '${parsed.profile}'.`);
  }

  if (Array.isArray(parsed.scenes)) {
    parsed.scenes.sort((a: any, b: any) => {
      const seqA = a.sequence ?? 0;
      const seqB = b.sequence ?? 0;
      return seqA - seqB;
    });
  }

  return parsed as GeoStoryDocument;
}
