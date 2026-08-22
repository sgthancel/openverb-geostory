import { GeoStoryDocument } from './types';
/**
 * Error thrown when parsing a GeoStory document fails.
 */
export declare class GeoStoryParseError extends Error {
    constructor(message: string);
}
/**
 * Parses a string into a raw object, leveraging @openverb/format.
 * Does not validate structure.
 */
export declare function parseGeoStoryRaw(input: string): unknown;
/**
 * Parses a string into a GeoStoryDocument.
 * Validates the profile field and sorts scenes by sequence.
 */
export declare function parseGeoStory(input: string): GeoStoryDocument;
//# sourceMappingURL=parser.d.ts.map