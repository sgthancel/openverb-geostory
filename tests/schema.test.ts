import { validateGeoStory, isGeoStoryDocument } from '../src/schema';

describe('validateGeoStory', () => {
  const minimalValidDoc = {
    name: 'test',
    version: '1.0.0',
    profile: 'geostory',
    story: { title: 'Test Story' },
    places: [],
    audio: [],
    media: [],
    scenes: [],
    attribution: [],
  };

  it('validates a minimal valid document', () => {
    const { valid, errors } = validateGeoStory(minimalValidDoc);
    expect(valid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it('rejects a document with wrong profile', () => {
    const { valid } = validateGeoStory({ ...minimalValidDoc, profile: 'wrong' });
    expect(valid).toBe(false);
  });

  it('rejects a document missing required fields', () => {
    const { valid, errors } = validateGeoStory({ name: 'test' });
    expect(valid).toBe(false);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('allows unknown fields at root', () => {
    const { valid } = validateGeoStory({ ...minimalValidDoc, custom_field: 'hello' });
    expect(valid).toBe(true);
  });

  it('allows unknown fields on places', () => {
    const doc = {
      ...minimalValidDoc,
      places: [{
        id: 'pl_1',
        as_written: 'Test',
        resolved: {
          name: 'Test',
          point: [0, 0],
          kind: 'city',
          provider: 'test',
          resolved_at: '2026-01-01T00:00:00Z',
          confidence: 0.9,
        },
        my_custom_field: 'preserved',
      }],
    };
    const { valid } = validateGeoStory(doc);
    expect(valid).toBe(true);
  });

  it('validates audio clips require id, kind, src, at, duration', () => {
    const doc = {
      ...minimalValidDoc,
      audio: [{ id: 'nar_1' }], // missing required fields
    };
    const { valid, errors } = validateGeoStory(doc);
    expect(valid).toBe(false);
    expect(errors.some(e => e.includes('kind') || e.includes('src') || e.includes('at') || e.includes('duration'))).toBe(true);
  });

  it('validates media items require id, kind, src, placement, origin', () => {
    const doc = {
      ...minimalValidDoc,
      media: [{ id: 'img_1' }], // missing required fields
    };
    const { valid, errors } = validateGeoStory(doc);
    expect(valid).toBe(false);
  });

  it('validates scenes require id and sequence', () => {
    const doc = {
      ...minimalValidDoc,
      scenes: [{ title: 'No id or sequence' }],
    };
    const { valid } = validateGeoStory(doc);
    expect(valid).toBe(false);
  });

  it('validates timing requires mode and intended', () => {
    const doc = {
      ...minimalValidDoc,
      scenes: [{
        id: 'scene_1',
        sequence: 1,
        timing: { mode: 'derived' }, // missing intended
      }],
    };
    const { valid } = validateGeoStory(doc);
    expect(valid).toBe(false);
  });

  it('validates camera keyframes require at', () => {
    const doc = {
      ...minimalValidDoc,
      scenes: [{
        id: 'scene_1',
        sequence: 1,
        camera: {
          track: [{ zoom: 10 }], // missing at
        },
      }],
    };
    const { valid } = validateGeoStory(doc);
    expect(valid).toBe(false);
  });

  it('accepts a fully-populated document', () => {
    const doc = {
      ...minimalValidDoc,
      places: [{
        id: 'pl_1',
        as_written: 'Ethiopia',
        resolved: {
          name: 'Ethiopia',
          point: [40.49, 9.14],
          bounds: [[32.99, 3.39], [47.98, 14.89]],
          kind: 'country',
          provider: 'nominatim',
          resolved_at: '2026-08-19T00:00:00Z',
          confidence: 0.86,
        },
      }],
      audio: [{
        id: 'nar_001',
        kind: 'narration',
        src: 'audio/line_001.wav',
        at: 0,
        duration: 6.57,
        gain_db: 0,
        text: 'Test narration',
      }],
      media: [{
        id: 'img_001',
        kind: 'image',
        src: 'media/test.jpg',
        at: 0,
        until: 6.57,
        placement: 'top_right',
        origin: 'upload',
        credit: 'Test credit',
      }],
      layers: [{
        id: 'layer_1',
        name: 'Test Layer',
        type: 'geojson',
        source: 'layers/test.geojson',
        visible: false,
      }],
      scenes: [{
        id: 'scene_001',
        sequence: 1,
        title: 'Test Scene',
        place_id: 'pl_1',
        camera: {
          mode: '2d',
          frame: {
            bounds: [[32.99, 3.39], [47.98, 14.89]],
            padding: 0.18,
          },
          center: [40.49, 9.14],
          zoom: 6.79,
          track: [
            { at: 0, center: [40.49, 9.14], zoom: 6.79 },
            { at: 3.2, center: [40.49, 9.14], zoom: 9, easing: 'ease-in-out', locked: false },
          ],
        },
        content: {
          caption: 'Test caption',
          narration: 'Test narration text',
        },
        timing: {
          mode: 'derived',
          intended: 8,
          measured: 6.57,
          source: 'nar_001',
        },
        transition: 'fly',
        basemap: 'carto-dark',
        layers_visible: ['layer_1'],
        audio_ids: ['nar_001'],
        media_ids: ['img_001'],
        timestamp: '2005-08-23T00:00:00Z',
      }],
      attribution: ['© Test'],
      extensions: {
        qgis: {
          project: './test.qgz',
          render_crs: 'EPSG:3857',
        },
      },
      settings: {
        default_basemap: 'carto-dark',
        default_transition: 'fly',
        default_duration: 8,
        auto_narration: true,
        loop: false,
      },
    };
    const { valid, errors } = validateGeoStory(doc);
    expect(valid).toBe(true);
    expect(errors).toHaveLength(0);
  });
});

describe('isGeoStoryDocument', () => {
  it('returns true for valid document', () => {
    const doc = {
      name: 'test',
      version: '1.0.0',
      profile: 'geostory',
      story: { title: 'Test' },
      places: [],
      audio: [],
      media: [],
      scenes: [],
      attribution: [],
    };
    expect(isGeoStoryDocument(doc)).toBe(true);
  });

  it('returns false for invalid document', () => {
    expect(isGeoStoryDocument({ name: 'test' })).toBe(false);
  });

  it('returns false for non-objects', () => {
    expect(isGeoStoryDocument('string')).toBe(false);
    expect(isGeoStoryDocument(42)).toBe(false);
    expect(isGeoStoryDocument(null)).toBe(false);
  });
});
