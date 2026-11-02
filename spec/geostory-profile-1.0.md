# GeoStory Profile Specification v1.0

The GeoStory format is a profile of the OpenVerb (`.ov`) standard. It defines a geographic narrative as a spatial workflow where each "scene" operates as a macro, compiling into atomic OpenVerb actions.

## 1. Identity

A valid GeoStory document MUST include the `profile: geostory` declaration at the root:

```yaml
name: my-story
version: 1.0.0
profile: geostory
```

Because `id` mapping implies a single global namespace, references naturally prevent duplicating the same definition across multiple scenes.

The `attribution` array at the top level should be derived from these declared sources (e.g., basemaps, media) plus any additional manual lines.

## 2. Core Invariant: Declarative Authority

> **A valid GS Studio story must be playable from its declarative story data alone. External asset paths are optional and must never be required for core narration or rendering.**

The story itself is the executable specification. Narration text (`content.narration`), sequence, locations, timing, and camera instructions must be describable directly in the `.ov` file. The format relies on the player to fulfill text-to-speech dynamically or interactively if pre-rendered audio paths are absent. External files are enhancements or caches, not prerequisites.

## 3. Document-Absolute Timing

All temporal references (`at` and `until`) across all top-level tracks (`audio`, `media`, and `camera.track`) operate on a **document-absolute timeline**. 

Time `0.0` is the beginning of the entire story document. This prevents cascading drift when editing a flat timeline and allows clips to cross scene boundaries cleanly.

## 4. Top-Level Registries

Scenes DO NOT own their contents. Instead, they reference resources declared in root-level registries:

*   `places`: Geographic entities (e.g., `pl_new_orleans`).
*   `audio`: Audio clips (e.g., `nar_001`).
*   `media`: Images and videos (e.g., `img_flooding`).
*   `basemaps`: Basemap sources (e.g., `bm_dark`).
*   `layers`: Data layers (e.g., `flood_extent`).
*   `annotations`: Drawings and markers (e.g., `ann_rome_radius`).

### The Annotations Registry

Visual annotations (like markers, circles, and polygons) are stored in a root registry, decoupling their lifecycle from a single scene:

```yaml
annotations:
  - id: ann_rome_radius
    kind: circle
    geometry: { type: Point, coordinates: [12.49, 41.90] }
    radius_m: 50000
    label: "50 km"
    style: { color: "#ff4500", fill_opacity: 0.25, weight: 2 }
    at: 34.0
    until: 48.0
```

Scenes can explicitly toggle them via `annotation_ids: ["ann_rome_radius"]`, or the player can rely purely on their `at`/`until` absolute timeline windows.

### Animated Annotations

A line annotation may carry an `animate` block, which asks the renderer to
move along the geometry rather than only draw it:

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
      fade_out: 1
      particles: 26
      particle: arrow        # arrow | dot | none
      glow: true
```

This exists because direction and speed are often the content. A current, a
migration, a trade route or a prevailing wind is defined by which way it runs
and how fast, and a still line cannot say either.

Three rules keep it safe to add:

**`animate` is additive.** A renderer that does not implement it MUST still
draw the annotation as a static line. Motion is never what makes the
difference between a picture and an empty frame.

**Every field is optional.** `animate: {}` is a valid request for motion with
the renderer's own defaults, so an author can ask for movement without
specifying how it should look.

**It applies to geometry with a path.** On a marker, where there is nothing to
travel along, a renderer SHOULD ignore it rather than treat the document as
invalid.

Annotations are timed by the scenes that reference them and by their own
`at`/`until` window, so an animated line needs no timing of its own.

### The Places Registry

Geocoding is an **authoring step**, never a playback step. The results of geocoding are committed directly to the `places` registry:

```yaml
places:
  - id: pl_bahamas
    as_written: "the Bahamas"
    resolved:
      name: "The Bahamas"
      point: [-75.1, 23.5]
      bounds: [[-80.47, 20.91], [-72.71, 27.26]]
      kind: country
      provider: nominatim
      resolved_at: "2026-08-19T21:57:00Z"
      confidence: 0.92
```

## 5. Scene Timing and Rescaling

Scenes stretch to fit the actual recorded audio. The `timing` block separates authored intent from real-world measurement.

```yaml
timing:
  mode: derived
  intended: 15
  measured: 12.80
```

When `mode: derived` is set:
1. The authoritative duration of the scene is `measured` (if present) or falls back to `intended`.
2. When the scene duration differs from its previous value (e.g., after TTS generation or audio recording), **unlocked** camera keyframes scale proportionally based on the ratio of the new duration to the old duration.
3. Keyframes with `locked: true` retain their absolute timing exactly.

## 6. Camera Framing

Bounds-based framing (`camera.frame.bounds`) is the preferred method for positioning the camera, as it adapts gracefully to different screen aspect ratios (e.g., 16:9 desktop vs. 9:16 mobile). 

`center` and `zoom` values are permitted as cached conveniences but are non-authoritative when `frame` is present.

### 3D Mode Degradation

`mode: 3d` is a **request**. 2D-only renderers must not reject the document. Instead, they must gracefully degrade, typically to a wide shot, as defined by `settings.camera_3d_degradation` (defaulting to `3d_degradation_wide_shot`).

### The Basemaps Registry

Basemaps are declared in a top-level registry to ensure document portability and proper attribution without relying on hardcoded lookup tables:

```yaml
basemaps:
  - id: bm_dark
    name: "Esri Dark Gray Canvas"
    type: xyz
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
    max_zoom: 16
    attribution: "© Esri, HERE, Garmin, © OpenStreetMap contributors"
```

Any implementation can coin IDs (e.g. `scene.basemap: bm_dark`), and a renderer that hasn't seen the ID before can still draw the universal `{z}/{x}/{y}` URL and credit it properly.

### Canvas Space

An annotation is addressed in degrees by default. A document that composes
against the picture rather than the ground sets `settings.default_space:
canvas`, or `space: canvas` on an individual annotation, and its coordinates
are then read as percentages of the frame — `[0, 0]` top left, `[100, 100]`
bottom right. A document made entirely of canvas annotations needs no camera
and no basemap, because there is no ground for a camera to point at.

```yaml
settings:
  default_space: canvas

annotations:
  - id: headline
    kind: text
    pos: [50, 10]
    label: "Lines of Longitude"
    emphasis: display
    enter: { type: rise, delay: 0.3, duration: 0.9 }
```

`pos` is shorthand for a Point geometry. It is deliberately NOT `at`, which
this profile already uses for WHEN an annotation appears, in seconds.

A percentage is meaningful only against the shape the document was written
for. A renderer that draws into a rectangle of a different aspect SHOULD
letterbox the authored shape into it rather than stretch to fill, or a circle
computed by the author will not come out a circle.

### Emphasis

`emphasis` is one of `display`, `title`, `body`, `caption`, and absent means
`body`. On a map a place name is a place name and one size is right; on a
frame with no map the labels are the content, and a headline reading exactly
as loudly as a footnote is what makes a presentation look flat.

### Entrances

`enter` and `exit` take `{ type, delay, duration }`, where type is one of
`fade`, `rise`, `fall`, `left`, `right`, `typewriter`. `delay` is measured
from the opening of the annotation's own window, not from the start of the
document.

A renderer that animates an annotation's geometry over time — see Animated
Annotations above — MAY ignore `enter` on that annotation, because the
`animate` block already describes how it arrives.

### Charts

`kind: chart` draws `series` as bars or a line, sized by `size` as
percentages of the frame and positioned by its geometry like anything else.

```yaml
  - id: census
    kind: chart
    chart: bars
    pos: [50, 55]
    size: [60, 30]
    series:
      - { label: read, value: 11 }
      - { label: ui, value: 10 }
```

Deliberately small: bars and a line, values above and categories below. No
axes, gridlines, legends, stacking or dual scales. Those are the things that
make a chart library, and a chart library is not what a renderer needs.

## 7. Unknown Field Preservation

A compliant parser MUST preserve all unrecognized fields. 
A compliant serializer MUST write them back exactly as they were found.

This ensures host-specific data (e.g., internal QGIS settings, editor state, or AI studio prompts) is not destroyed when passed through a renderer or tool that does not understand it.

## 8. Extensions

Host-specific namespaced data SHOULD be placed in the `extensions` block to avoid top-level field collisions:

```yaml
extensions:
  qgis:
    project: ./katrina.qgz
    render_crs: "EPSG:3857"
```
