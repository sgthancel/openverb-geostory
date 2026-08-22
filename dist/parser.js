"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoStoryParseError = void 0;
exports.parseGeoStoryRaw = parseGeoStoryRaw;
exports.parseGeoStory = parseGeoStory;
const format_1 = require("@openverb/format");
/**
 * Error thrown when parsing a GeoStory document fails.
 */
class GeoStoryParseError extends Error {
    constructor(message) {
        super(message);
        this.name = 'GeoStoryParseError';
    }
}
exports.GeoStoryParseError = GeoStoryParseError;
/**
 * Parses a string into a raw object, leveraging @openverb/format.
 * Does not validate structure.
 */
function parseGeoStoryRaw(input) {
    try {
        return (0, format_1.parseOV)(input);
    }
    catch (e) {
        throw new GeoStoryParseError(`Failed to parse input as JSON or YAML: ${e.message}`);
    }
}
/**
 * Parses a string into a GeoStoryDocument.
 * Validates the profile field and sorts scenes by sequence.
 */
function parseGeoStory(input) {
    const parsed = parseGeoStoryRaw(input);
    if (!parsed || typeof parsed !== 'object') {
        throw new GeoStoryParseError('Parsed document is not an object.');
    }
    if (parsed.profile !== 'geostory') {
        throw new GeoStoryParseError(`Invalid profile field. Expected 'geostory', got '${parsed.profile}'.`);
    }
    if (Array.isArray(parsed.scenes)) {
        parsed.scenes.sort((a, b) => {
            const seqA = a.sequence ?? 0;
            const seqB = b.sequence ?? 0;
            return seqA - seqB;
        });
    }
    return parsed;
}
//# sourceMappingURL=parser.js.map