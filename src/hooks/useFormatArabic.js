import { useSelector } from 'react-redux';
import { useCallback } from 'react';
import { stripDiacritics } from '../utils/arabicUtils.js';

/**
 * Hook that returns a function to conditionally strip Arabic diacritics (harakat)
 * based on the user's showDiacritics setting.
 *
 * Usage: const formatArabic = useFormatArabic();
 *        <div>{formatArabic(someArabicText)}</div>
 */
export function useFormatArabic() {
  const showDiacritics = useSelector((s) => s.settings.showDiacritics);
  return useCallback(
    (text) => {
      if (!text || showDiacritics) return text;
      return stripDiacritics(text);
    },
    [showDiacritics]
  );
}
