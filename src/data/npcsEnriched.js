/**
 * npcsEnriched.js
 *
 * Barrel module that imports base NPC data from npcs.json,
 * applies the story-arc overlay from npcStoryArcs.js,
 * and re-exports the enriched array as the default.
 *
 * All consumers should import from this module instead of npcs.json directly
 * to get narrative-branching dialogue trees and storyArc metadata.
 */

import baseNpcs from './npcs.json';
import { mergeNpcStoryArcs } from './npcStoryArcs.js';

const npcsData = mergeNpcStoryArcs(baseNpcs);

export default npcsData;
