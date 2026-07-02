/**
 * ArabicText — Utility for rendering Arabic text in Phaser Canvas.
 * Handles reshaping (letter joining via js-arabic-reshaper) for pixel-font
 * glyph coverage. The string is kept in LOGICAL order: canvas fillText runs
 * the full Unicode bidi algorithm, so it lays RTL text out right-to-left
 * natively. (We previously also reversed the string here — fillText then
 * re-reversed it, displaying every label backwards.)
 *
 * Usage:
 *   import { createArabicText, prepareArabicText } from '../ui/ArabicText.js';
 *
 *   // Create a Phaser text object with proper Arabic rendering
 *   const text = createArabicText(scene, x, y, 'مرحبا', { fontSize: '16px' });
 *
 *   // Or just prepare the string for use with existing text objects
 *   myText.setText(prepareArabicText('مرحبا'));
 */

import { reshape } from 'js-arabic-reshaper';

/** Default font stack: PixelAE for in-canvas pixel art, with Arabic fallbacks */
const DEFAULT_FONT_FAMILY = "'PixelAE', 'Amiri', 'Noto Naskh Arabic', serif";

/**
 * Tashkeel / harakat combining marks (fathatan..sukun, hamza marks, superscript
 * alef). Stripped before reshaping for canvas rendering: js-arabic-reshaper
 * breaks letter joining across them (emitting isolated forms mid-word), and the
 * PixelAE pixel font can't render the marks legibly at label sizes anyway.
 * DOM/React surfaces shape natively and keep full tashkeel.
 */
const TASHKEEL_RE = /[\u064B-\u0655\u0670]/g;

/**
 * Check if a character is Arabic (main block + presentation forms + diacritics).
 *
 * @param {number} code - Unicode code point.
 * @returns {boolean}
 */
function isArabicChar(code) {
  return (
    (code >= 0x0600 && code <= 0x06ff) || // Arabic
    (code >= 0x0750 && code <= 0x077f) || // Arabic Supplement
    (code >= 0x08a0 && code <= 0x08ff) || // Arabic Extended-A
    (code >= 0xfb50 && code <= 0xfdff) || // Arabic Presentation Forms-A
    (code >= 0xfe70 && code <= 0xfeff)    // Arabic Presentation Forms-B
  );
}

/**
 * Prepare Arabic text for Phaser Canvas rendering.
 * Reshapes connected letters using js-arabic-reshaper (isolated ->
 * initial/medial/final presentation forms) so the PixelAE pixel font has
 * glyphs to draw, and returns the result in LOGICAL order — canvas fillText
 * applies the bidi algorithm and handles the RTL layout itself. Do NOT
 * reverse the string here: fillText would re-reverse it and every label
 * would render backwards.
 *
 * Non-Arabic text passes through unchanged. Mixed Arabic/Latin text is
 * likewise handled by native bidi.
 *
 * @param {string} text - Raw Arabic (or mixed) text.
 * @returns {string} Text ready for Phaser Canvas rendering.
 */
export function prepareArabicText(text) {
  if (!text) return '';

  // Check if the text contains any Arabic characters
  const hasArabic = [...text].some((ch) => isArabicChar(ch.codePointAt(0)));
  if (!hasArabic) return text;

  // Strip tashkeel before reshaping — the reshaper breaks joining across
  // harakat (isolated forms mid-word), and PixelAE lacks the mark glyphs.
  // NOTE: the library's own `delete_harakat` option is broken (Python-port
  // bug: HARAKAT_RE.match is not a function), so we strip here instead.
  const stripped = text.replace(TASHKEEL_RE, '');

  // Reshape Arabic letters to their presentation (connected) forms.
  // `ligatures: false` keeps output in letter-level Presentation Forms-B
  // (U+FE70–U+FEFF) only; the default emits Forms-A ligatures (e.g. U+FC42)
  // that the pixel font lacks, rendering as tofu.
  // Logical order — canvas bidi handles the RTL layout.
  return reshape(stripped, { ligatures: false });
}

/**
 * Create a Phaser Text object with properly rendered Arabic text.
 *
 * @param {Phaser.Scene} scene - The current Phaser scene.
 * @param {number} x - X position.
 * @param {number} y - Y position.
 * @param {string} text - Raw Arabic text (will be reshaped; kept in logical order).
 * @param {object} [style={}] - Phaser text style overrides.
 * @returns {Phaser.GameObjects.Text} The created text object.
 */
export function createArabicText(scene, x, y, text, style = {}) {
  const prepared = prepareArabicText(text);

  const mergedStyle = {
    fontFamily: style.fontFamily || DEFAULT_FONT_FAMILY,
    fontSize: style.fontSize || '16px',
    color: style.color || '#d4a843',
    align: style.align || 'right',
    ...style,
  };

  const textObj = scene.add.text(x, y, prepared, mergedStyle);
  textObj.setOrigin(
    style.originX ?? 0.5,
    style.originY ?? 0.5
  );

  // Store the raw Arabic text so it can be retrieved/updated later
  textObj.setData('rawArabic', text);

  return textObj;
}

/**
 * Update an existing Phaser Text object with new Arabic text.
 * Reshapes the new text (logical order) before setting it.
 *
 * @param {Phaser.GameObjects.Text} textObj - Existing Phaser text object.
 * @param {string} newText - New raw Arabic text.
 * @returns {Phaser.GameObjects.Text} The same text object (for chaining).
 */
export function updateArabicText(textObj, newText) {
  textObj.setText(prepareArabicText(newText));
  textObj.setData('rawArabic', newText);
  return textObj;
}
