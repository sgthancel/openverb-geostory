import { validateGeoStory } from '../src/schema';
import { parseGeoStory } from '../src/parser';

/**
 * The fields a document needs to compose against the frame rather than the
 * ground, and the ones a renderer needs to draw text and charts.
 *
 * These shipped as unknown fields: the format preserves what it does not
 * recognise, so they round-tripped and rendered correctly while failing
 * validation. That is the worst of both — it works, so nobody looks, and a
 * typo in one of them is kept rather than refused. Declaring them makes the
 * validator useful again, and every assertion here is additive: anything that
 * validated before this release still validates.
 */
const base = {
  name: 'canvas',
  version: '1.0.0',
  profile: 'geostory',
  story: { title: 'Canvas' },
  places: [],
  audio: [],
  media: [],
  scenes: [],
  attribution: [],
};

const withAnnotation = (annotation: Record<string, unknown>) => ({
  ...base,
  annotations: [{ id: 'a', kind: 'text', geometry: { type: 'Point', coordinates: [50, 50] }, ...annotation }],
});

describe('canvas space', () => {
  it('accepts default_space on settings', () => {
    const { valid, errors } = validateGeoStory({ ...base, settings: { default_space: 'canvas' } });
    expect(errors).toEqual([]);
    expect(valid).toBe(true);
  });

  it('rejects a space that is neither geo nor canvas', () => {
    expect(validateGeoStory({ ...base, settings: { default_space: 'screen' } }).valid).toBe(false);
  });

  it('accepts space on an annotation', () => {
    expect(validateGeoStory(withAnnotation({ space: 'canvas' })).valid).toBe(true);
  });

  it('accepts pos as a coordinate pair', () => {
    expect(validateGeoStory(withAnnotation({ pos: [50, 30] })).valid).toBe(true);
  });

  it('rejects pos with the wrong number of values', () => {
    expect(validateGeoStory(withAnnotation({ pos: [50] })).valid).toBe(false);
    expect(validateGeoStory(withAnnotation({ pos: [50, 30, 10] })).valid).toBe(false);
  });
});

describe('annotation kinds', () => {
  for (const kind of ['circle', 'polygon', 'line', 'marker', 'text', 'chart', 'image']) {
    it(`accepts kind: ${kind}`, () => {
      const doc = { ...base, annotations: [{ id: 'a', kind, geometry: { type: 'Point', coordinates: [0, 0] } }] };
      expect(validateGeoStory(doc).valid).toBe(true);
    });
  }

  // The one that matters. A misspelling must still be refused, or declaring
  // the new kinds would have bought nothing.
  it('still rejects a misspelled kind', () => {
    const doc = { ...base, annotations: [{ id: 'a', kind: 'lien', geometry: { type: 'Point', coordinates: [0, 0] } }] };
    expect(validateGeoStory(doc).valid).toBe(false);
  });
});

describe('emphasis', () => {
  for (const emphasis of ['display', 'title', 'body', 'caption']) {
    it(`accepts ${emphasis}`, () => {
      expect(validateGeoStory(withAnnotation({ emphasis })).valid).toBe(true);
    });
  }

  it('rejects a misspelled emphasis', () => {
    expect(validateGeoStory(withAnnotation({ emphasis: 'titel' })).valid).toBe(false);
  });
});

describe('enter and exit', () => {
  for (const type of ['fade', 'rise', 'fall', 'left', 'right', 'typewriter']) {
    it(`accepts enter.type ${type}`, () => {
      expect(validateGeoStory(withAnnotation({ enter: { type, delay: 1, duration: 0.5 } })).valid).toBe(true);
    });
  }

  it('accepts exit with the same shape', () => {
    expect(validateGeoStory(withAnnotation({ exit: { type: 'fade', duration: 0.4 } })).valid).toBe(true);
  });

  it('rejects an entrance nobody implements', () => {
    expect(validateGeoStory(withAnnotation({ enter: { type: 'slide' } })).valid).toBe(false);
  });

  it('rejects a negative delay', () => {
    expect(validateGeoStory(withAnnotation({ enter: { type: 'fade', delay: -1 } })).valid).toBe(false);
  });
});

describe('charts', () => {
  const chart = {
    id: 'c',
    kind: 'chart',
    geometry: { type: 'Point', coordinates: [50, 50] },
    chart: 'bars',
    size: [60, 30],
    series: [{ label: 'read', value: 11 }, { label: 'ui', value: 10 }],
  };

  it('accepts a chart annotation', () => {
    const { valid, errors } = validateGeoStory({ ...base, annotations: [chart] });
    expect(errors).toEqual([]);
    expect(valid).toBe(true);
  });

  it('rejects a chart style nobody draws', () => {
    expect(validateGeoStory({ ...base, annotations: [{ ...chart, chart: 'pie' }] }).valid).toBe(false);
  });

  it('rejects a series point missing its value', () => {
    expect(validateGeoStory({ ...base, annotations: [{ ...chart, series: [{ label: 'read' }] }] }).valid).toBe(false);
  });

  it('rejects a non-numeric value', () => {
    const bad = [{ ...chart, series: [{ label: 'read', value: 'eleven' }] }];
    expect(validateGeoStory({ ...base, annotations: bad }).valid).toBe(false);
  });
});

describe('leader', () => {
  it('accepts a compass direction', () => {
    expect(validateGeoStory(withAnnotation({ leader: { direction: 'north_east', length: 0.14 } })).valid).toBe(true);
  });

  it('rejects degrees where a compass word belongs', () => {
    expect(validateGeoStory(withAnnotation({ leader: { direction: '45' } })).valid).toBe(false);
  });
});

describe('nothing that validated before stops validating', () => {
  it('a document with none of these fields is untouched', () => {
    const { valid, errors } = validateGeoStory(base);
    expect(errors).toEqual([]);
    expect(valid).toBe(true);
  });

  it('a geo annotation with no space still validates', () => {
    const doc = {
      ...base,
      annotations: [{ id: 'a', kind: 'line', geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] } }],
    };
    expect(validateGeoStory(doc).valid).toBe(true);
  });

  it('unknown fields are still preserved and still allowed', () => {
    const doc = parseGeoStory(JSON.stringify(withAnnotation({ invented_by_a_host: { deep: true } })));
    expect(validateGeoStory(doc).valid).toBe(true);
    expect((doc.annotations?.[0] as unknown as Record<string, unknown>).invented_by_a_host).toEqual({ deep: true });
  });
});
