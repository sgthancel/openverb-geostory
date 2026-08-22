import { parseGeoStory } from '../src/parser';
import { serializeGeoStory } from '../src/serializer';

describe('unknown-field preservation', () => {
  it('preserves unknown fields at root level', () => {
    const yaml = `
name: test
version: "1.0.0"
profile: geostory
story:
  title: Test
places: []
audio: []
media: []
scenes: []
attribution: []
future_field: "I should survive"
another_field:
  nested: true
`;
    const doc = parseGeoStory(yaml);
    expect((doc as any).future_field).toBe('I should survive');
    expect((doc as any).another_field).toEqual({ nested: true });

    const serialized = serializeGeoStory(doc);
    const reparsed = parseGeoStory(serialized);
    expect((reparsed as any).future_field).toBe('I should survive');
    expect((reparsed as any).another_field).toEqual({ nested: true });
  });

  it('preserves unknown fields on places', () => {
    const yaml = `
name: test
version: "1.0.0"
profile: geostory
story:
  title: Test
places:
  - id: pl_1
    as_written: Test
    resolved:
      name: Test
      point: [0, 0]
      kind: city
      provider: test
      resolved_at: "2026-01-01T00:00:00Z"
      confidence: 0.9
      future_geocode_field: true
    place_metadata: custom_value
audio: []
media: []
scenes: []
attribution: []
`;
    const doc = parseGeoStory(yaml);
    expect((doc.places[0] as any).place_metadata).toBe('custom_value');
    expect((doc.places[0].resolved as any).future_geocode_field).toBe(true);

    const serialized = serializeGeoStory(doc);
    const reparsed = parseGeoStory(serialized);
    expect((reparsed.places[0] as any).place_metadata).toBe('custom_value');
    expect((reparsed.places[0].resolved as any).future_geocode_field).toBe(true);
  });

  it('preserves unknown fields on scenes', () => {
    const yaml = `
name: test
version: "1.0.0"
profile: geostory
story:
  title: Test
places: []
audio: []
media: []
scenes:
  - id: scene_1
    sequence: 1
    qgis_map_theme: "My Theme"
    future_scene_prop: [1, 2, 3]
attribution: []
`;
    const doc = parseGeoStory(yaml);
    expect((doc.scenes[0] as any).qgis_map_theme).toBe('My Theme');
    expect((doc.scenes[0] as any).future_scene_prop).toEqual([1, 2, 3]);

    const serialized = serializeGeoStory(doc);
    const reparsed = parseGeoStory(serialized);
    expect((reparsed.scenes[0] as any).qgis_map_theme).toBe('My Theme');
    expect((reparsed.scenes[0] as any).future_scene_prop).toEqual([1, 2, 3]);
  });

  it('preserves extensions namespace through round-trip', () => {
    const yaml = `
name: test
version: "1.0.0"
profile: geostory
story:
  title: Test
places: []
audio: []
media: []
scenes: []
attribution: []
extensions:
  qgis:
    project: ./test.qgz
    render_crs: "EPSG:3857"
    map_themes:
      scene_001: "GeoStudio: 01"
  custom_host:
    api_key: abc123
    custom_setting: true
`;
    const doc = parseGeoStory(yaml);
    expect(doc.extensions?.qgis?.render_crs).toBe('EPSG:3857');
    expect(doc.extensions?.custom_host?.api_key).toBe('abc123');

    const serialized = serializeGeoStory(doc);
    const reparsed = parseGeoStory(serialized);
    expect(reparsed.extensions?.qgis?.render_crs).toBe('EPSG:3857');
    expect(reparsed.extensions?.qgis?.map_themes).toEqual({ scene_001: 'GeoStudio: 01' });
    expect(reparsed.extensions?.custom_host?.api_key).toBe('abc123');
  });
});
