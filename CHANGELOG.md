# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-11-02

### Added

- **Canvas space.** `settings.default_space` and `space` on an annotation,
  both `geo` or `canvas`. A canvas annotation's coordinates are percentages
  of the frame rather than degrees, so a document can be composed against
  the picture when there is no ground to compose against. A document made
  entirely of them needs no camera and no basemap.
- `pos`, shorthand for a Point geometry. Deliberately not `at`, which this
  profile already uses for WHEN an annotation appears, in seconds.
- `emphasis` — `display`, `title`, `body`, `caption`. Absent means `body`,
  so nothing written before this release changes size.
- `enter` and `exit`, both `{ type, delay, duration }`, where type is one of
  `fade`, `rise`, `fall`, `left`, `right`, `typewriter`.
- `kind: text`, `kind: chart` and `kind: image`, with `chart`, `series` and
  `size` for charts.
- `radius`, a circle's size in canvas space as a percentage of the frame's
  shorter side. `radius_m` is metres and means nothing on a frame with no
  ground.
- `leader`, a line from a shape to its label, with compass-word directions.
- `drawn` as a media `origin`, for an illustration that is neither a
  photograph, a screenshot, nor generated.
- `fit`, `drift` and `opacity` on a media item.

### Changed

- `placement` is no longer required on a media item. It already defaulted to
  `top_left` in practice, and an image with `fit: cover` fills the frame and
  ignores it entirely, so requiring it rejected a correct document.

### Notes on why this is only a schema change

Every field above already worked. The format preserves what it does not
recognise, which is the property that let canvas space, text annotations and
charts ship without a format release at all — they round-tripped through the
parser and rendered correctly.

That is also the trap. Because they rendered, nobody looked at the validator,
and the validator had been refusing every one of these documents the whole
time: twenty documents in the reference renderer, all failing, mostly on a
`kind` enum that did not yet know about `text`. A field that is preserved but
not declared is a field where a typo is preserved too — `emphasis: titel`
validated, rendered at body size, and said nothing.

So the point of this release is not new capability. It is that the validator
can now tell a new field from a misspelled one. The tests added here are
mostly assertions that a misspelling is still **refused**, because declaring
the new names would have bought nothing otherwise.

### Compatibility

Additive. Every change either widens an enum, adds an optional property, or
removes a `required` entry, so any document that validated against 0.2.0 still
validates against 0.3.0. Verified against the twenty documents in the
reference renderer: 1 of 20 valid before, 20 of 20 after.

---

Earlier releases predate this file; see the git history.

- **0.2.0** — animated flow along a line
- **0.1.2** — point the examples at basemaps that still serve maps
