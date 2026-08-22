"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeGeoStory = serializeGeoStory;
exports.serializeGeoStoryToJSON = serializeGeoStoryToJSON;
exports.serializeGeoStoryToYAML = serializeGeoStoryToYAML;
const yaml = __importStar(require("yaml"));
/**
 * Serializes a GeoStoryDocument to a string in the specified format.
 * Defaults to 'yaml'. Sorts scenes by sequence order before serialization.
 */
function serializeGeoStory(doc, format = 'yaml') {
    // Create a copy to sort scenes without mutating original document
    const docCopy = { ...doc };
    if (Array.isArray(docCopy.scenes)) {
        docCopy.scenes = [...docCopy.scenes].sort((a, b) => {
            const seqA = a.sequence ?? 0;
            const seqB = b.sequence ?? 0;
            return seqA - seqB;
        });
    }
    if (format === 'json') {
        return JSON.stringify(docCopy, null, 2);
    }
    else {
        return yaml.stringify(docCopy, {
            lineWidth: 120,
        });
    }
}
/**
 * Convenience function to serialize a GeoStoryDocument to JSON.
 */
function serializeGeoStoryToJSON(doc) {
    return serializeGeoStory(doc, 'json');
}
/**
 * Convenience function to serialize a GeoStoryDocument to YAML.
 */
function serializeGeoStoryToYAML(doc) {
    return serializeGeoStory(doc, 'yaml');
}
//# sourceMappingURL=serializer.js.map