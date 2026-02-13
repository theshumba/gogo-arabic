/**
 * npcsEnriched.js
 *
 * Barrel module that imports base NPC data from npcs.json,
 * applies the story-arc overlay from npcStoryArcs.js,
 * applies profession teaching data from npcProfessionTeaching.js,
 * and re-exports the enriched array as the default.
 *
 * All consumers should import from this module instead of npcs.json directly
 * to get narrative-branching dialogue trees, storyArc metadata, and profession teaching.
 */

import baseNpcs from './npcs.json';
import { mergeNpcStoryArcs } from './npcStoryArcs.js';
import { mergeNpcProfessionTeaching } from './npcProfessionTeaching.js';

// Apply story arcs first, then profession teaching
const npcsWithStoryArcs = mergeNpcStoryArcs(baseNpcs);
const npcsData = mergeNpcProfessionTeaching(npcsWithStoryArcs);

export default npcsData;
