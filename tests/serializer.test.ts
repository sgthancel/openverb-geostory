import * as fs from 'fs';
import * as path from 'path';
import { parseGeoStory } from '../src/parser';
import { serializeGeoStory, serializeGeoStoryToJSON, serializeGeoStoryToYAML } from '../src/serializer';

const EXAMPLES_DIR = path.join(__dirname, '..', 'examples');

describe('serializeGeoStory', () => {
  const minimalDoc: any = {
    name: 'test',
    version: '1.0.0',
    profile: 'geostory',
    story: { title: 'Test Story' },
    places: [],
    audio: [],
    media: [],
    scenes: [
      { id: 'scene_b', sequence: 2 },
      { id: 'scene_a', sequence: 1 },
    ],
    attribution: ['© Test'],
  };

  it('serializes to YAML by default', () => {
    const output = serializeGeoStory(minimalDoc);
    expect(output).toContain('name: test');
    expect(output).toContain('profile: geostory');
  });

  it('serializes to JSON when requested', () => {
    const output = serializeGeoStory(minimalDoc, 'json');
    const parsed = JSON.parse(output);
    expect(parsed.name).toBe('test');
    expect(parsed.profile).toBe('geostory');
  });

  it('sorts scenes by sequence in output', () => {
    const output = serializeGeoStory(minimalDoc, 'json');
    const parsed = JSON.parse(output);
    expect(parsed.scenes[0].id).toBe('scene_a');
    expect(parsed.scenes[1].id).toBe('scene_b');
  });

  it('does not mutate the original document', () => {
    serializeGeoStory(minimalDoc);
    expect(minimalDoc.scenes[0].id).toBe('scene_b');
  });

  it('convenience function serializeGeoStoryToJSON works', () => {
    const output = serializeGeoStoryToJSON(minimalDoc);
    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('convenience function serializeGeoStoryToYAML works', () => {
    const output = serializeGeoStoryToYAML(minimalDoc);
    expect(output).toContain('name: test');
  });
});

describe('round-trip fidelity', () => {
  it('round-trips the hurricane-katrina example identically', () => {
    const filePath = path.join(EXAMPLES_DIR, 'hurricane-katrina.ov');
    if (!fs.existsSync(filePath)) {
      console.warn('Skipping: hurricane-katrina.ov not found');
      return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const doc = parseGeoStory(content);
    const serialized = serializeGeoStory(doc);
    const reparsed = parseGeoStory(serialized);

    expect(reparsed.name).toBe(doc.name);
    expect(reparsed.scenes.length).toBe(doc.scenes.length);
    expect(reparsed.places.length).toBe(doc.places.length);
    
    // Scene order preserved
    for (let i = 0; i < doc.scenes.length; i++) {
      expect(reparsed.scenes[i].id).toBe(doc.scenes[i].id);
      expect(reparsed.scenes[i].sequence).toBe(doc.scenes[i].sequence);
    }
  });
});
