import { validateGeoStory } from '../src/schema';
import { compileScene } from '../src/compiler';
import { parseGeoStory } from '../src/parser';
import { serializeGeoStory } from '../src/serializer';

/**
 * Flow animation on a line annotation.
 *
 * A still line says a route exists. An animated one says which way it runs
 * and how fast, which for a current or a migration is most of the content.
 *
 * The property worth protecting is that motion is additive: a renderer that
 * has never heard of `animate` must still draw a correct static line. So
 * these check that the show action always comes first and stands alone, not
 * merely that a flow action appears somewhere.
 */
const gulfStream: any = {
  name: 'currents',
  version: '1.0.0',
  profile: 'geostory',
  story: { title: 'Rivers of the Ocean', crs: 'EPSG:4326' },
  places: [{ id: 'pl_atlantic', as_written: 'North Atlantic', resolved: {
    name: 'North Atlantic', point: [-40, 35], kind: 'natural',
    provider: 'test', resolved_at: '2026-10-11T00:00:00Z', confidence: 0.9,
  }}],
  audio: [],
  media: [],
  annotations: [
    {
      id: 'ann_gulf_stream',
      kind: 'line',
      geometry: {
        type: 'LineString',
        coordinates: [[-80.1, 25.4], [-75.2, 35.1], [-55, 48.6], [-20, 50]],
      },
      label: 'Gulf Stream',
      style: { color: '#4FC3F7', weight: 4 },
      animate: {
        direction: 'forward',
        speed: 140,
        reveal: 2.5,
        fade_out: 1,
        particles: 26,
        particle: 'arrow',
        glow: true,
      },
    },
    {
      id: 'ann_landmark',
      kind: 'marker',
      geometry: { type: 'Point', coordinates: [-70, 42] },
      label: 'Cape Cod',
    },
  ],
  scenes: [{
    id: 'sc_01',
    sequence: 1,
    title: 'The Gulf Stream',
    place_id: 'pl_atlantic',
    annotation_ids: ['ann_gulf_stream', 'ann_landmark'],
    timing: { mode: 'derived', intended: 14 },
    content: { narration: 'The Gulf Stream carries warm water north.' },
  }],
  attribution: ['test'],
};

describe('flow animation', () => {
  it('validates as part of a document', () => {
    const { valid, errors } = validateGeoStory(gulfStream);
    expect(errors ?? []).toEqual([]);
    expect(valid).toBe(true);
  });

  it('rejects a direction the renderers do not know', () => {
    const bad = JSON.parse(JSON.stringify(gulfStream));
    bad.annotations[0].animate.direction = 'sideways';
    expect(validateGeoStory(bad).valid).toBe(false);
  });

  it('compiles to a flow action carrying the animation', () => {
    const { actions } = compileScene(gulfStream.scenes[0], gulfStream);
    const flow = actions.find(a => a.verb === 'geostory.annotation.flow');

    expect(flow).toBeDefined();
    expect(flow!.args.id).toBe('ann_gulf_stream');
    expect(flow!.args.speed).toBe(140);
    expect(flow!.args.particle).toBe('arrow');
    expect(flow!.args.direction).toBe('forward');
  });

  it('shows the annotation before animating it', () => {
    // The order is the guarantee. A renderer that ignores the flow action
    // has already drawn the line by the time it reaches one, so the worst
    // outcome of not understanding motion is a static picture - never an
    // empty one.
    const { actions } = compileScene(gulfStream.scenes[0], gulfStream);
    const show = actions.findIndex(
      a => a.verb === 'geostory.annotation.show' && a.args.id === 'ann_gulf_stream'
    );
    const flow = actions.findIndex(a => a.verb === 'geostory.annotation.flow');

    expect(show).toBeGreaterThanOrEqual(0);
    expect(flow).toBeGreaterThan(show);
  });

  it('leaves annotations with no animation alone', () => {
    const { actions } = compileScene(gulfStream.scenes[0], gulfStream);
    const flows = actions.filter(a => a.verb === 'geostory.annotation.flow');

    expect(flows).toHaveLength(1);
    expect(flows[0].args.id).not.toBe('ann_landmark');
  });

  it('survives a round trip through YAML', () => {
    const again = parseGeoStory(serializeGeoStory(gulfStream));
    const animate = again.annotations![0].animate!;

    expect(animate.speed).toBe(140);
    expect(animate.particles).toBe(26);
    expect(animate.glow).toBe(true);
  });

  it('is optional in every part', () => {
    // Every field has a working default, so an author can ask for motion
    // without specifying how it should look.
    const sparse = JSON.parse(JSON.stringify(gulfStream));
    sparse.annotations[0].animate = {};

    expect(validateGeoStory(sparse).valid).toBe(true);

    const { actions } = compileScene(sparse.scenes[0], sparse);
    const flow = actions.find(a => a.verb === 'geostory.annotation.flow');
    expect(flow).toBeDefined();
    expect(flow!.args.id).toBe('ann_gulf_stream');
  });
});
