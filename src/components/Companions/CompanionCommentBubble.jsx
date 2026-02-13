/**
 * CompanionCommentBubble.jsx — Floating speech bubble for companion contextual comments
 *
 * Listens to COMPANION_CONTEXTUAL_COMMENT events via EventBus.
 * Displays Arabic or English comments with transliteration based on player CEFR.
 * Auto-dismisses after 5 seconds. Supports queuing (max 2).
 */

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { EventBus } from '../../utils/eventBus.js';
import { EVENTS } from '../../utils/eventBusTypes.js';
import { COMPANIONS } from '../../data/companions.js';

export default function CompanionCommentBubble() {
  const [currentComment, setCurrentComment] = useState(null);
  const [queue, setQueue] = useState([]);

  const playerCEFR = useSelector((state) => state.player.cefrLevel) || 'A1';
  const vocabularyRatio = useSelector((state) => state.vocabulary.learnedRatio) || 0;

  // Listen to comment events
  useEffect(() => {
    const handleComment = (data) => {
      // data: { companionId, primary, secondary, transliteration, isArabic }
      const companion = COMPANIONS[data.companionId];
      if (!companion) return;

      const commentData = {
        ...data,
        companionName: companion.name,
        companionColor: companion.colorPalette.primary,
        showTransliteration: vocabularyRatio < 0.7, // Show transliteration if below B2
      };

      // If no current comment, show immediately
      if (!currentComment) {
        setCurrentComment(commentData);
      } else {
        // Add to queue (max 2 items)
        setQueue((prev) => {
          const newQueue = [...prev, commentData];
          return newQueue.slice(-2); // Keep last 2
        });
      }
    };

    EventBus.on(EVENTS.COMPANION_CONTEXTUAL_COMMENT, handleComment);
    return () => EventBus.off(EVENTS.COMPANION_CONTEXTUAL_COMMENT, handleComment);
  }, [currentComment, vocabularyRatio]);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!currentComment) return;

    const timer = setTimeout(() => {
      // Check if there's something in queue
      if (queue.length > 0) {
        const [next, ...rest] = queue;
        setCurrentComment(next);
        setQueue(rest);
      } else {
        setCurrentComment(null);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentComment, queue]);

  // Click to dismiss early
  const handleDismiss = () => {
    if (queue.length > 0) {
      const [next, ...rest] = queue;
      setCurrentComment(next);
      setQueue(rest);
    } else {
      setCurrentComment(null);
    }
  };

  if (!currentComment) return null;

  const isArabic = currentComment.isArabic;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 120, damping: 15 }}
        onClick={handleDismiss}
        style={{
          position: 'fixed',
          bottom: '120px',
          left: '20px',
          maxWidth: '350px',
          background: '#1a1a2e',
          border: `2px solid ${currentComment.companionColor}`,
          borderRadius: '12px',
          padding: '12px 16px',
          zIndex: 1000,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Speech bubble tail */}
        <div
          style={{
            position: 'absolute',
            bottom: '-10px',
            left: '20px',
            width: 0,
            height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: `10px solid ${currentComment.companionColor}`,
          }}
        />

        {/* Companion name */}
        <div
          style={{
            fontSize: '8px',
            color: currentComment.companionColor,
            fontFamily: "'Press Start 2P', monospace",
            marginBottom: '6px',
          }}
        >
          {currentComment.companionName}
        </div>

        {/* Primary text */}
        <div
          style={{
            fontSize: '12px',
            color: '#f4fefa',
            marginBottom: currentComment.secondary ? '4px' : 0,
            direction: isArabic ? 'rtl' : 'ltr',
            lineHeight: '1.4',
          }}
        >
          {currentComment.primary}
        </div>

        {/* Secondary text */}
        {currentComment.secondary && (
          <div
            style={{
              fontSize: '10px',
              color: '#a0a0a0',
              direction: isArabic ? 'ltr' : 'rtl',
              lineHeight: '1.3',
            }}
          >
            {currentComment.secondary}
          </div>
        )}

        {/* Transliteration */}
        {currentComment.showTransliteration && currentComment.transliteration && (
          <div
            style={{
              fontSize: '9px',
              color: '#666',
              fontStyle: 'italic',
              marginTop: '4px',
            }}
          >
            {currentComment.transliteration}
          </div>
        )}

        {/* Queue indicator */}
        {queue.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: currentComment.companionColor,
              color: '#fff',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              fontFamily: "'Press Start 2P', monospace",
            }}
          >
            {queue.length}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
