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

## 3. Top-Level Registries

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

## 4. Scene Timing and Rescaling

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

## 5. Camera Framing

Bounds-based framing (`camera.frame.bounds`) is the preferred method for positioning the camera, as it adapts gracefully to different screen aspect ratios (e.g., 16:9 desktop vs. 9:16 mobile). 

`center` and `zoom` values are permitted as cached conveniences but are non-authoritative when `frame` is present.

### 3D Mode Degradation

`mode: 3d` is a **request**. 2D-only renderers must not reject the document. Instead, they must gracefully degrade, typically to a wide shot, as defined by `settings.camera_3d_degradation` (defaulting to `3d_degradation_wide_shot`).

### The Basemaps Registry

Basemaps are declared in a top-level registry to ensure document portability and proper attribution without relying on hardcoded lookup tables:

```yaml
basemaps:
  - id: bm_dark
    name: "CartoDB Dark Matter"
    type: xyz
    url: "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
    max_zoom: 20
    attribution: "© OpenStreetMap contributors © CARTO"
```

Any implementation can coin IDs (e.g. `scene.basemap: bm_dark`), and a renderer that hasn't seen the ID before can still draw the universal `{z}/{x}/{y}` URL and credit it properly.

## 6. Unknown Field Preservation

A compliant parser MUST preserve all unrecognized fields. 
A compliant serializer MUST write them back exactly as they were found.

This ensures host-specific data (e.g., internal QGIS settings, editor state, or AI studio prompts) is not destroyed when passed through a renderer or tool that does not understand it.

## 7. Extensions

Host-specific namespaced data SHOULD be placed in the `extensions` block to avoid top-level field collisions:

```yaml
extensions:
  qgis:
    project: ./katrina.qgz
    render_crs: "EPSG:3857"
```
