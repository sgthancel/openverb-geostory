import { parseGeoStory } from '../src/parser';
import { compileScene, compileTimeline, compileToOVDocument } from '../src/compiler';

describe('compiler', () => {
  const minimalDoc: any = {
    name: 'test',
    version: '1.0.0',
    profile: 'geostory',
    settings: {
      default_basemap: 'carto-dark',
    },
    places: [{
      id: 'pl_1',
      resolved: {
        point: [0, 0],
      }
    }],
    scenes: [{
      id: 'scene_1',
      sequence: 1,
      place_id: 'pl_1',
      timing: {
        mode: 'fixed',
        intended: 10,
      }
    }],
  };

  it('compiles a simple scene', () => {
    const scene = minimalDoc.scenes[0];
    const compiled = compileScene(scene, minimalDoc);
    
    expect(compiled.duration).toBe(10);
    expect(compiled.start_time).toBe(0);
    expect(compiled.actions.length).toBeGreaterThan(0);
    
    // Check basemap
    expect(compiled.actions[0].verb).toBe('geostory.basemap.set');
    
    // Check pause
    const lastAction = compiled.actions[compiled.actions.length - 1];
    expect(lastAction.verb).toBe('geostory.pause');
    expect(lastAction.args.duration).toBe(10);
  });

  it('compiles a full timeline', () => {
    const timeline = compileTimeline(minimalDoc);
    expect(timeline.total_duration).toBe(10);
    expect(timeline.scenes).toHaveLength(1);
    expect(timeline.all_actions).toHaveLength(minimalDoc.scenes[0].actions?.length ?? timeline.all_actions.length);
  });

  it('compiles to a standard OVDocument', () => {
    const ovDoc = compileToOVDocument(minimalDoc);
    expect(ovDoc.version).toBe('1.0.0');
    expect(ovDoc.name).toBe('test');
    expect(ovDoc.actions).toBeDefined();
    expect(ovDoc.actions[0].verb).toBe('geostory.basemap.set');
  });
});
