import * as fs from 'fs';
import * as path from 'path';
import { parseGeoStory, parseGeoStoryRaw, GeoStoryParseError } from '../src/parser';

const EXAMPLES_DIR = path.join(__dirname, '..', 'examples');

describe('parseGeoStoryRaw', () => {
  it('parses valid JSON', () => {
    const json = JSON.stringify({ name: 'test', profile: 'geostory' });
    const result = parseGeoStoryRaw(json);
    expect(result).toEqual({ name: 'test', profile: 'geostory' });
  });

  it('parses valid YAML', () => {
    const yaml = 'name: test\nprofile: geostory\n';
    const result = parseGeoStoryRaw(yaml) as any;
    expect(result.name).toBe('test');
    expect(result.profile).toBe('geostory');
  });

  it('throws GeoStoryParseError on invalid input', () => {
    expect(() => parseGeoStoryRaw('{{{{not valid')).toThrow(GeoStoryParseError);
  });
});

describe('parseGeoStory', () => {
  it('rejects documents without profile: geostory', () => {
    const yaml = 'name: test\nprofile: other\n';
    expect(() => parseGeoStory(yaml)).toThrow(GeoStoryParseError);
    expect(() => parseGeoStory(yaml)).toThrow("Expected 'geostory'");
  });

  it('rejects non-object input', () => {
    expect(() => parseGeoStory('"just a string"')).toThrow(GeoStoryParseError);
  });

  it('sorts scenes by sequence', () => {
    const yaml = `
name: test
version: "1.0.0"
profile: geostory
story:
  title: Test
places: []
audio: []
media: []
attribution: []
scenes:
  - id: scene_b
    sequence: 3
  - id: scene_a
    sequence: 1
  - id: scene_c
    sequence: 2
`;
    const doc = parseGeoStory(yaml);
    expect(doc.scenes[0].id).toBe('scene_a');
    expect(doc.scenes[1].id).toBe('scene_c');
    expect(doc.scenes[2].id).toBe('scene_b');
  });

  it('parses the hurricane-katrina example', () => {
    const filePath = path.join(EXAMPLES_DIR, 'hurricane-katrina.ov');
    if (!fs.existsSync(filePath)) {
      console.warn('Skipping: hurricane-katrina.ov not found');
      return;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const doc = parseGeoStory(content);

    expect(doc.profile).toBe('geostory');
    expect(doc.name).toBe('hurricane-katrina');
    expect(doc.story.title).toBe('Hurricane Katrina');
    expect(doc.places.length).toBe(4);
    expect(doc.audio.length).toBe(6);
    expect(doc.media.length).toBe(1);
    expect(doc.scenes.length).toBe(5);
    expect(doc.attribution.length).toBe(3);

    // Scenes are in sequence order
    for (let i = 0; i < doc.scenes.length - 1; i++) {
      expect(doc.scenes[i].sequence).toBeLessThan(doc.scenes[i + 1].sequence);
    }

    // Places registry has resolved data
    const bahamas = doc.places.find(p => p.id === 'pl_bahamas');
    expect(bahamas).toBeDefined();
    expect(bahamas!.as_written).toBe('the Bahamas');
    expect(bahamas!.resolved.name).toBe('The Bahamas');
    expect(bahamas!.resolved.point).toEqual([-75.1, 23.5]);
    expect(bahamas!.resolved.kind).toBe('country');

    // Scenes reference places by ID
    expect(doc.scenes[0].place_id).toBe('pl_bahamas');
    expect(doc.scenes[3].place_id).toBe('pl_new_orleans');

    // Audio clips are document-absolute
    expect(doc.audio[0].at).toBe(0.0);
    expect(doc.audio[1].at).toBe(6.57);

    // Scene 4 has camera keyframes
    const scene4 = doc.scenes.find(s => s.id === 'scene_004');
    expect(scene4?.camera?.track).toBeDefined();
    expect(scene4!.camera!.track!.length).toBe(3);
    expect(scene4!.camera!.track![2].locked).toBe(true);

    // Timing model
    expect(doc.scenes[0].timing?.mode).toBe('derived');
    expect(doc.scenes[0].timing?.measured).toBe(6.57);
  });
});
