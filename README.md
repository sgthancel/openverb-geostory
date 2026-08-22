# @openverb/geostory

A portable geographic narrative format built on top of OpenVerb.

A **GeoStory** is a spatial workflow whose steps happen in geographic space. Each scene is a macro that compiles into atomic OpenVerb verb actions. The `.ov` document is the portable, AI-editable, format-agnostic representation.

## Features

- **Document-Absolute Timing:** Edit audio and media on a flat timeline without cascading drift.
- **Top-Level Registries:** Places, audio clips, and media items are registered at the root, making scenes lightweight references.
- **Resolved Geography:** Authoring tools commit geocoding results to the file. Players *never* need to hit a geocoding API.
- **Keyframe Tracks:** Support for both bounds-based framing and explicit sub-scene camera animation with rescaling locks.
- **Unknown Field Round-Tripping:** Host applications (like QGIS or a specific web renderer) can safely write custom extensions to the file that won't be stripped by other tools.

## Installation

\`\`\`bash
npm install @openverb/geostory @openverb/format @openverb/runtime
\`\`\`

## Usage

### Parsing & Validating

\`\`\`typescript
import { parseGeoStory, validateGeoStory } from '@openverb/geostory';
import fs from 'fs';

const content = fs.readFileSync('hurricane.ov', 'utf-8');
const doc = parseGeoStory(content);

const { valid, errors } = validateGeoStory(doc);
if (!valid) {
  console.error(errors);
}
\`\`\`

### Compiling to OpenVerb Actions

A GeoStory uses high-level "scenes". To execute it in an OpenVerb runtime, compile it to a standard `OVDocument` containing atomic verb actions.

\`\`\`typescript
import { compileToOVDocument } from '@openverb/geostory';
import { bridgeToRuntime } from '@openverb/format';

const ovDoc = compileToOVDocument(doc);

// Now execute in OpenVerb
const executeRequests = bridgeToRuntime(ovDoc, {});
// -> geostory.basemap.set
// -> geostory.camera.fly_to
// -> geostory.media.show
// ...
\`\`\`

## Format Specification

See `src/types.ts` for the complete interface definitions. The format requires `profile: geostory` at the root.

## License

MIT
