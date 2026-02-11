import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { closeObjectInspect } from '../../store/slices/uiSlice.js';
import { useOverlayClose } from '../../hooks/useOverlayClose.js';
import { useFocusTrap } from '../../hooks/useFocusTrap.js';
import styles from './ObjectInteractionOverlay.module.css';

/**
 * ObjectInteractionOverlay — displays contextual info for world objects
 * (fountain, statue, painting, lantern, stall, barrel, crate, pot).
 *
 * Shows Arabic label, English label, description, optional cultural note,
 * optional vocab word card, and optional loot message.
 *
 * Follows the same pattern as SignOverlay:
 *   useSelector → useOverlayClose → useFocusTrap → conditional render
 */
export default function ObjectInteractionOverlay() {
  const dispatch = useDispatch();
  const data = useSelector((s) => s.ui.objectInspectData);

  const handleClose = useCallback(() => {
    dispatch(closeObjectInspect());
  }, [dispatch]);

  const handleOverlayClose = useOverlayClose(handleClose);

  const focusTrapRef = useFocusTrap(!!data, null);

  if (!data) return null;

  // Format type name for display badge
  const typeName = data.type
    ? data.type.charAt(0).toUpperCase() + data.type.slice(1)
    : 'Object';

  return (
    <div ref={focusTrapRef} className={styles.overlay} onClick={handleOverlayClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        {/* Type badge */}
        <div className={styles.typeBadge}>{typeName}</div>

        {/* Arabic label */}
        {data.labelArabic && (
          <div className={styles.arabic} lang="ar" dir="rtl">
            {data.labelArabic}
          </div>
        )}

        {/* English label */}
        {data.labelEnglish && (
          <div className={styles.english}>{data.labelEnglish}</div>
        )}

        {/* Description */}
        {data.descriptionEnglish && (
          <div className={styles.description}>{data.descriptionEnglish}</div>
        )}

        {/* Cultural note */}
        {data.culturalNote && (
          <div className={styles.culturalNote}>
            <div className={styles.culturalNoteLabel}>Cultural Note</div>
            <div className={styles.culturalNoteText}>{data.culturalNote}</div>
          </div>
        )}

        {/* Vocab word card */}
        {data.taughtWord && (
          <div className={styles.vocabCard}>
            <div className={styles.vocabLabel}>Word Learned</div>
            <div className={styles.vocabArabic} lang="ar" dir="rtl">
              {data.taughtWord.arabic}
            </div>
            <div className={styles.vocabEnglish}>{data.taughtWord.english}</div>
          </div>
        )}

        {/* Loot message */}
        {data.lootMessage && (
          <div className={styles.lootMessage}>{data.lootMessage}</div>
        )}

        {/* Continue button */}
        <button className={styles.closeBtn} onClick={handleOverlayClose}>
          Continue
        </button>
      </div>
    </div>
  );
}
