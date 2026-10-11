import { OVDocument, OVAction } from '@openverb/format';
import {
  CompiledScene,
  CompiledTimeline,
  CompiledVerbAction,
  GeoStoryDocument,
  GeoStoryScene,
  GeoStoryPlace,
  GeoStoryMediaItem,
  GeoStoryAudioClip,
  GeoJSONGeometry,
  GeoStoryCameraKeyframe
} from './types';

/**
 * Gets the authoritative duration for a scene.
 */
function getSceneDuration(scene: GeoStoryScene, doc: GeoStoryDocument): number {
  if (scene.timing) {
    if (scene.timing.mode === 'derived' && scene.timing.measured !== undefined) {
      return scene.timing.measured;
    }
    if (scene.timing.intended !== undefined) {
      return scene.timing.intended;
    }
  }
  return doc.settings?.default_duration ?? 8;
}

/**
 * Calculates the start time of a scene by summing the durations of all prior scenes.
 */
function getSceneStartTime(scene: GeoStoryScene, doc: GeoStoryDocument): number {
  let startTime = 0;
  for (const s of doc.scenes) {
    if (s.id === scene.id) {
      break;
    }
    startTime += getSceneDuration(s, doc);
  }
  return startTime;
}

/**
 * Compiles a single scene into an ordered sequence of verb actions.
 * @param scene The scene to compile.
 * @param doc The parent document containing registries.
 * @returns A compiled scene.
 */
export function compileScene(scene: GeoStoryScene, doc: GeoStoryDocument): CompiledScene {
  const actions: CompiledVerbAction[] = [];
  const duration = getSceneDuration(scene, doc);
  const startTime = getSceneStartTime(scene, doc);
  let order = 1;

  function addAction(verb: string, args: Record<string, unknown>) {
    actions.push({
      verb,
      args,
      source_scene_id: scene.id,
      order: order++
    });
  }

  // 1. geostory.basemap.set
  const basemap = scene.basemap ?? doc.settings?.default_basemap;
  if (basemap) {
    addAction('geostory.basemap.set', { id: basemap });
  }

  // Geography & Camera
  let targetPlace: GeoStoryPlace | undefined;
  if (scene.place_id) {
    targetPlace = doc.places?.find((p) => p.id === scene.place_id);
  }

  const camera = scene.camera;
  if (camera) {
    if (camera.track && camera.track.length > 0) {
      // 8. geostory.camera.keyframe
      for (const kf of camera.track) {
        addAction('geostory.camera.keyframe', {
          at: kf.at,
          center: kf.center,
          zoom: kf.zoom,
          bearing: kf.bearing,
          pitch: kf.pitch,
          easing: kf.easing,
          locked: kf.locked
        });
      }
    } else if (camera.frame) {
      // 6. geostory.camera.frame
      addAction('geostory.camera.frame', {
        bounds: camera.frame.bounds,
        padding: camera.frame.padding,
        easing: camera.easing,
        bearing: camera.bearing,
        pitch: camera.pitch,
        mode: camera.mode
      });
    } else if (camera.center !== undefined || camera.zoom !== undefined) {
      // 7. geostory.camera.fly_to
      addAction('geostory.camera.fly_to', {
        center: camera.center,
        zoom: camera.zoom,
        bearing: camera.bearing,
        pitch: camera.pitch,
        easing: camera.easing,
        mode: camera.mode
      });
    }
  } else if (targetPlace) {
    // If no camera object but a place is specified, use place bounds/center
    if (targetPlace.resolved.bounds) {
      addAction('geostory.camera.frame', { bounds: targetPlace.resolved.bounds });
    } else {
      addAction('geostory.camera.fly_to', { center: targetPlace.resolved.point });
    }
  }

  // 3. geostory.layer.show
  if (scene.layers_visible && scene.layers_visible.length > 0) {
    for (const layerId of scene.layers_visible) {
      addAction('geostory.layer.show', { id: layerId });
    }
  }

  // 4. geostory.layer.hide
  if (scene.layers_hidden && scene.layers_hidden.length > 0) {
    for (const layerId of scene.layers_hidden) {
      addAction('geostory.layer.hide', { id: layerId });
    }
  }

  // 5. geostory.annotation.show, then flow for any that move
  if (scene.annotation_ids && scene.annotation_ids.length > 0) {
    for (const annId of scene.annotation_ids) {
      addAction('geostory.annotation.show', { id: annId });

      // An animated annotation emits a second action after the first, so a
      // renderer that knows nothing about motion still draws the line from
      // the show and simply ignores what follows. The static picture is
      // never the thing that breaks.
      const annotation = doc.annotations?.find(a => a.id === annId);
      if (annotation?.animate) {
        addAction('geostory.annotation.flow', {
          id: annId,
          ...annotation.animate,
        });
      }
    }
  }

  // 6. geostory.media.show
  if (scene.media_ids && scene.media_ids.length > 0) {
    for (const mediaId of scene.media_ids) {
      const mediaItem = doc.media?.find((m) => m.id === mediaId);
      addAction('geostory.media.show', {
        id: mediaId,
        src: mediaItem?.src,
        placement: mediaItem?.placement,
        caption: mediaItem?.caption
      });
    }
  }

  // 7. geostory.caption.show
  if (scene.content?.caption) {
    addAction('geostory.caption.show', {
      text: scene.content.caption,
      style: scene.content.style
    });
  }

  // 8. geostory.audio.narrate
  if (scene.audio_ids && scene.audio_ids.length > 0) {
    for (const audioId of scene.audio_ids) {
      const audioItem = doc.audio?.find((a) => a.id === audioId);
      addAction('geostory.audio.narrate', {
        id: audioId,
        src: audioItem?.src,
        at: audioItem?.at
      });
    }
  }

  // 9. geostory.pause
  addAction('geostory.pause', { duration });

  return {
    scene_id: scene.id,
    sequence: scene.sequence,
    start_time: startTime,
    duration,
    actions
  };
}

/**
 * Compiles a full document into a timeline of actions.
 * @param doc The GeoStory document to compile.
 * @returns The compiled timeline.
 */
export function compileTimeline(doc: GeoStoryDocument): CompiledTimeline {
  const compiledScenes: CompiledScene[] = [];
  const allActions: CompiledVerbAction[] = [];
  let totalDuration = 0;

  for (const scene of doc.scenes) {
    const compiledScene = compileScene(scene, doc);
    compiledScenes.push(compiledScene);
    allActions.push(...compiledScene.actions);
    totalDuration += compiledScene.duration;
  }

  return {
    total_duration: totalDuration,
    scenes: compiledScenes,
    all_actions: allActions
  };
}

/**
 * Compiles a GeoStory document into a standard OpenVerb document ready for execution.
 * @param doc The GeoStory document.
 * @returns An OVDocument with compiled actions.
 */
export function compileToOVDocument(doc: GeoStoryDocument): OVDocument {
  const timeline = compileTimeline(doc);
  
  const actions: OVAction[] = timeline.all_actions.map(a => ({
    verb: a.verb,
    params: a.args,
    description: `Compiled from ${a.source_scene_id} (order: ${a.order})`
  }));

  return {
    version: doc.version || '1.0.0',
    name: doc.name || doc.story?.title || 'GeoStory',
    description: doc.story?.description,
    metadata: {
      profile: doc.profile,
      title: doc.story?.title,
      created_with: '@openverb/geostory',
      total_duration: timeline.total_duration,
    },
    actions
  };
}
