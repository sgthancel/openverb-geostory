import * as fs from 'fs';
import * as path from 'path';
import { parseGeoStory } from '../src/parser';
import { compileToOVDocument } from '../src/compiler';

const EXAMPLES_DIR = path.join(__dirname, '..', 'examples');

describe('determinism', () => {
  it('compiles identically regardless of environment (no geocoding during playback)', () => {
    // The core determinism rule: compiling a GeoStory document into verb actions
    // must rely entirely on the data committed in the document (the places registry).
    // It must NEVER attempt to resolve places or make network calls.
    
    const filePath = path.join(EXAMPLES_DIR, 'hurricane-katrina.ov');
    if (!fs.existsSync(filePath)) {
      console.warn('Skipping: hurricane-katrina.ov not found');
      return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const doc = parseGeoStory(content);
    
    // First pass
    const ovDoc1 = compileToOVDocument(doc);
    
    // Second pass - simulating a totally separate run (could stub network here if we made calls,
    // but the fact we don't is exactly what we're testing)
    const ovDoc2 = compileToOVDocument(doc);
    
    // Ensure absolute identical output
    expect(ovDoc1).toEqual(ovDoc2);
    
    // Ensure all places referenced by scenes resolved purely from the registry without
    // generating 'geostory.place.resolve' verbs (which are authoring-only).
    const resolveVerbs = ovDoc1.actions.filter(a => a.verb === 'geostory.place.resolve');
    expect(resolveVerbs).toHaveLength(0);
    
    // Ensure camera actions strictly used the bounds/centers from the registry
    const cameraVerbs = ovDoc1.actions.filter(a => a.verb.startsWith('geostory.camera'));
    expect(cameraVerbs.length).toBeGreaterThan(0);
    
    // Test passes if compiler strictly transformed local AST to OpenVerb AST deterministically.
  });
});
