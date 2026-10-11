# @openverb/geostory

[![npm](https://img.shields.io/npm/v/@openverb/geostory.svg)](https://www.npmjs.com/package/@openverb/geostory)
[![license](https://img.shields.io/npm/l/@openverb/geostory.svg)](./LICENSE)

A portable geographic narrative format, built as a profile of [OpenVerb](https://www.npmjs.com/package/@openverb/format).

A **GeoStory** is a spatial workflow whose steps happen in geographic space. Each scene is a macro that compiles into atomic OpenVerb verb actions. The `.ov` document is the portable, AI-editable, format-agnostic representation of the whole story — where the camera goes, what is said, what is drawn, and what it all sits on.

The same document should render in a QGIS plugin, a Leaflet page, and a desktop app, and come out meaning the same thing.

## The core invariant

> **A valid story must be playable from its declarative story data alone. External asset paths are optional and must never be required for core narration or rendering.**

Narration lives in the document as **text**. A player is expected to speak it — with text-to-speech, or a pre-recorded clip if one happens to be there. A story that loads and plays silently because a `.wav` did not travel with it is a bug, not expected behaviour.

Everything else follows from this. Geocoding results are committed to the file at authoring time, so playback never calls a geocoding API. Basemaps carry their own tile URL and attribution, so a reader that has never heard of an id can still draw and credit it. External files are enhancements and caches, never prerequisites.

## What a `.ov` looks like

```yaml
name: iceland-still-building
version: 1.0.0
profile: geostory

story:
  title: "Iceland: A Country Still Being Built"
  crs: "EPSG:4326"

settings:
  default_basemap: bm_dark
  default_duration: 9

basemaps:
  - id: bm_dark
    name: "Esri Dark Gray Canvas"
    type: xyz
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
    max_zoom: 16
    attribution: "© Esri, HERE, Garmin, © OpenStreetMap contributors"

places:
  - id: pl_thingvellir
    as_written: "Þingvellir"
    resolved:
      name: "Þingvellir National Park, Iceland"
      point: [-21.13, 64.255]
      bounds: [[-21.22, 64.22], [-21.02, 64.30]]
      kind: landmark
      provider: nominatim
      resolved_at: "2026-08-20T00:00:00Z"
      confidence: 0.95

scenes:
  - id: sc_02
    sequence: 2
    title: "Where the Plates Part"
    place_id: pl_thingvellir
    basemap: bm_dark
    transition: fly
    timing: { mode: derived, intended: 12 }
    content:
      caption: "Þingvellir — the rift you can walk into."
      narration: >-
        At Þingvellir you can walk down into the rift itself. The valley floor
        has dropped as the plates draw apart, leaving a wall of basalt on
        either side.

attribution:
  - "© Esri, HERE, Garmin, © OpenStreetMap contributors"
```

That document needs nothing else on disk. See [`examples/`](./examples) for complete stories.

## Installation

```bash
npm install @openverb/geostory
```

`@openverb/format` comes with it. `@openverb/runtime` is an optional peer dependency, pinned to `2.0.0-alpha.6`, and is only needed if you execute compiled documents rather than rendering them yourself:

```bash
npm install @openverb/runtime@2.0.0-alpha.6
```

## Usage

### Parse and validate

```typescript
import { parseGeoStory, validateGeoStory } from '@openverb/geostory';
import fs from 'fs';

const doc = parseGeoStory(fs.readFileSync('hurricane-katrina.ov', 'utf-8'));

const { valid, errors } = validateGeoStory(doc);
if (!valid) {
  console.error(errors);
}
```

`parseGeoStory` accepts YAML or JSON and throws `GeoStoryParseError` on malformed input. Use `parseGeoStoryRaw` when you want the untyped object without profile checks.

### Serialise

```typescript
import { serializeGeoStory } from '@openverb/geostory';

fs.writeFileSync('out.ov', serializeGeoStory(doc));
```

Unrecognised fields survive the round trip. A tool that does not understand a field must still write it back, so a document edited in one application does not come out thinner than it went in.

### Compile to OpenVerb actions

A GeoStory uses high-level scenes. To execute one in an OpenVerb runtime, compile it into a standard `OVDocument` of atomic verb actions:

```typescript
import { compileToOVDocument } from '@openverb/geostory';
import { bridgeToRuntime } from '@openverb/format';

const ovDoc = compileToOVDocument(doc);
const requests = bridgeToRuntime(ovDoc, {});
// -> geostory.basemap.set
// -> geostory.camera.fly_to
// -> geostory.media.show
```

Use `compileScene` for a single scene, or `compileTimeline` for the flattened action timeline without wrapping it in a document.

## API

| Export | What it does |
| --- | --- |
| `parseGeoStory(text)` | YAML or JSON to a typed `GeoStoryDocument`. Throws `GeoStoryParseError`. |
| `parseGeoStoryRaw(text)` | The same, without profile validation. |
| `serializeGeoStory(doc)` | Back to YAML, preserving unknown fields. |
| `serializeGeoStoryToYAML(doc)` | Explicit YAML. |
| `serializeGeoStoryToJSON(doc)` | Explicit JSON. |
| `validateGeoStory(doc)` | `{ valid, errors }` against the JSON Schema. |
| `isGeoStoryDocument(value)` | Type guard. |
| `compileToOVDocument(doc)` | Scenes to a full `OVDocument` of verb actions. |
| `compileTimeline(doc)` | Just the flattened action timeline. |
| `compileScene(scene, doc)` | One scene's actions. |
| `GEOSTORY_SCHEMA` | The JSON Schema object. |
| `verbLibrary` | The verb definitions this profile emits. |
| `VERB_CATEGORIES` | Verb category names. |
| `GeoStoryParseError` | Thrown by the parsers. |

Types are exported for every part of the document — `GeoStoryDocument`, `GeoStoryScene`, `GeoStoryPlace`, `GeoStoryCamera`, `GeoStoryTiming`, and the rest. See [`src/types.ts`](https://github.com/sgthancel/openverb-geostory/blob/main/src/types.ts).

## How a document is put together

Scenes do not own their contents. Six top-level registries hold them, and scenes reference them by id:

| Registry | Holds |
| --- | --- |
| `places` | Geographic entities, with geocoding already resolved |
| `basemaps` | Tile sources, each with its own URL and attribution |
| `layers` | Data layers |
| `audio` | Narration, music and effects |
| `media` | Images and video |
| `annotations` | Markers, circles, polygons and lines |

### Animated lines

A line annotation can ask to move. Direction and speed are often the content -
a current, a migration route or a prevailing wind is defined by which way it
runs and how fast, and a still line says neither:

```yaml
annotations:
  - id: ann_gulf_stream
    kind: line
    label: "Gulf Stream"
    geometry:
      type: LineString
      coordinates: [[-80.1, 25.4], [-75.2, 35.1], [-55.0, 40.6], [-20.0, 50.0]]
    style: { color: "#4FC3F7", weight: 4 }
    animate:
      direction: forward     # forward | reverse | both
      speed: 140             # px/sec at 1080p, scaled to the output
      reveal: 2.5            # seconds spent drawing the line in
      particles: 26
      particle: arrow        # arrow | dot | none
      glow: true
```

It is additive on purpose. Every field is optional, `animate: {}` is a valid
request for motion with the renderer's defaults, and a renderer that has never
heard of the block still draws a correct static line. Compiling a scene emits
`geostory.annotation.show` before `geostory.annotation.flow`, so the picture is
already on screen by the time motion is asked for.

See [`examples/rivers-of-the-ocean.ov`](./examples/rivers-of-the-ocean.ov).

Two rules about time are worth knowing before you write a player:

- **`audio`, `media` and `camera.track` are document-absolute.** Time `0.0` is the start of the story, not the start of a scene. This is what stops edits cascading down a flat timeline.
- **Scenes carry a length, not a start.** A scene has `sequence`, `timing` and an optional `delay`; its start is the previous scene's end plus its own delay.

## Format specification

The full profile is in [`spec/geostory-profile-1.0.md`](./spec/geostory-profile-1.0.md), and ships with the package. The JSON Schema is at [`schema/geostory-1.0.schema.json`](./schema/geostory-1.0.schema.json) and is importable:

```typescript
import schema from '@openverb/geostory/schema' with { type: 'json' };
```

Every document must declare `profile: geostory` at its root.

## Examples

| File | What it demonstrates |
| --- | --- |
| [`iceland-still-building.ov`](./examples/iceland-still-building.ov) | The core invariant: ten beats, full narration, **no external files at all** |
| [`hurricane-katrina.ov`](./examples/hurricane-katrina.ov) | Bounds framing, camera keyframes, per-scene basemaps, data layers, timestamps |
| [`downtown-redevelopment.ov`](./examples/downtown-redevelopment.ov) | Annotations, a 3D camera request, layer visibility, and a local-government use case |
| [`history-of-coffee.ov`](./examples/history-of-coffee.ov) | A long-form narrative across thirteen countries, with a pinned scene |
| [`rivers-of-the-ocean.ov`](./examples/rivers-of-the-ocean.ov) | **Animated flow** along four ocean currents, with no external files |

## Development

```bash
npm install
npm run build   # tsc, then regenerate the JSON Schema from the types
npm test
```

The schema is generated, not hand-written — edit `src/types.ts` and rebuild.

## License

MIT
