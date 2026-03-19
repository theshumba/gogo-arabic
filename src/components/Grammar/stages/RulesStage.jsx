import { motion } from 'framer-motion';
import { containerStyle, headerStyle, titleStyle, bodyStyle, sectionTitleStyle, exampleBoxStyle, btnStyle, pixelBtnDark, FONTS, COLORS } from '../grammarStyles.js';

export default function RulesStage({ lesson, onBack, onNext }) {
  return (
    <motion.div
      style={containerStyle}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div style={headerStyle}>
        <button onClick={onBack} style={pixelBtnDark}>Back</button>
        <div style={titleStyle}>Key Rules</div>
        <div style={{ width: '80px' }} />
      </div>

      <div style={bodyStyle}>
        <div style={sectionTitleStyle}>Remember these rules:</div>

        {lesson.rules.map((rule, idx) => (
          <div key={idx} style={exampleBoxStyle}>
            <div style={{ fontFamily: FONTS.pixel, fontSize: '12px', color: COLORS.brown, marginBottom: '10px', fontWeight: 'bold' }}>
              {rule.rule}
            </div>
            <div style={{ fontFamily: FONTS.pixel, fontSize: '11px', color: COLORS.dark }}>
              Example: {rule.example}
            </div>
          </div>
        ))}

        <button onClick={onNext} style={btnStyle}>Start Exercises</button>
      </div>
    </motion.div>
  );
}
