import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  setStoryFlag,
  setNpcRelationship,
} from '../store/slices/narrativeSlice.js';
import { EventBus } from '../utils/eventBus.js';
import { EVENTS } from '../utils/eventBusTypes.js';

/**
 * useNarrativeEvents — Narrative flag and relationship event handlers
 * Intentionally small now; will grow in Phase 20 (Dialogue System) and Phase 26 (Narrative Branching).
 */
export function useNarrativeEvents() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleFlagSet = ({ flag, value }) => {
      dispatch(setStoryFlag({ flag, value }));
    };

    const handleRelationshipChanged = ({ npcId, level }) => {
      dispatch(setNpcRelationship({ npcId, level }));
    };

    EventBus.on(EVENTS.NARRATIVE_FLAG_SET, handleFlagSet);
    EventBus.on(EVENTS.NARRATIVE_RELATIONSHIP_CHANGED, handleRelationshipChanged);

    return () => {
      EventBus.off(EVENTS.NARRATIVE_FLAG_SET, handleFlagSet);
      EventBus.off(EVENTS.NARRATIVE_RELATIONSHIP_CHANGED, handleRelationshipChanged);
    };
  }, [dispatch]);
}
