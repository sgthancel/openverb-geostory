import { OVDocument } from '@openverb/format';
import { CompiledScene, CompiledTimeline, GeoStoryDocument, GeoStoryScene } from './types';
/**
 * Compiles a single scene into an ordered sequence of verb actions.
 * @param scene The scene to compile.
 * @param doc The parent document containing registries.
 * @returns A compiled scene.
 */
export declare function compileScene(scene: GeoStoryScene, doc: GeoStoryDocument): CompiledScene;
/**
 * Compiles a full document into a timeline of actions.
 * @param doc The GeoStory document to compile.
 * @returns The compiled timeline.
 */
export declare function compileTimeline(doc: GeoStoryDocument): CompiledTimeline;
/**
 * Compiles a GeoStory document into a standard OpenVerb document ready for execution.
 * @param doc The GeoStory document.
 * @returns An OVDocument with compiled actions.
 */
export declare function compileToOVDocument(doc: GeoStoryDocument): OVDocument;
//# sourceMappingURL=compiler.d.ts.map