import { motion } from 'framer-motion';
import { containerStyle, headerStyle, titleStyle, bodyStyle, sectionTitleStyle, exampleBoxStyle, btnStyle, pixelBtnDark, FONTS, COLORS } from '../grammarStyles.js';

export default function ExamplesStage({ lesson, formatArabic, onBack, onNext }) {
  return (
    <motion.div
      style={containerStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div style={headerStyle}>
        <button onClick={onBack} style={pixelBtnDark}>Back</button>
        <div style={titleStyle}>Examples</div>
        <div style={{ width: '80px' }} />
      </div>

      <div style={bodyStyle}>
        <div style={sectionTitleStyle}>Study these examples:</div>

        {lesson.examples.map((example, idx) => (
          <div key={idx} style={exampleBoxStyle}>
            <div style={{ fontFamily: FONTS.arabicDisplay, fontSize: '24px', color: COLORS.brown, marginBottom: '10px' }}>
              {formatArabic(example.arabic)}
            </div>
            <div style={{ fontFamily: FONTS.pixel, fontSize: '12px', color: COLORS.dark, marginBottom: '5px' }}>
              {example.english}
            </div>
            <div style={{ fontFamily: FONTS.pixel, fontSize: '10px', color: COLORS.gray, marginBottom: '5px' }}>
              {example.transliteration}
            </div>
            <div style={{ fontFamily: FONTS.pixel, fontSize: '10px', color: COLORS.darkGold }}>
              {example.breakdown}
            </div>
          </div>
        ))}

        <button onClick={onNext} style={btnStyle}>Continue to Rules</button>
      </div>
    </motion.div>
  );
}
