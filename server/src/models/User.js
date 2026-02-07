import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  character: {
    bodyType: { type: String, default: 'default' },
    skinTone: { type: String, default: 'medium' },
    outfit: { type: String, default: 'thobe_white' },
    headwear: { type: String, default: null },
  },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  xpToNext: { type: Number, default: 100 },
  dirhams: { type: Number, default: 50 },
  streak: { type: Number, default: 0 },
  lastReviewDate: { type: Date, default: null },
  wordsLearned: { type: Number, default: 0 },
  lettersLearned: { type: Number, default: 0 },
  totalQuizzes: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  inventory: [{ type: String }],
  settings: {
    volumeAmbience: { type: Number, default: 0.3 },
    volumeSFX: { type: Number, default: 0.5 },
    volumeWords: { type: Number, default: 0.7 },
    showTransliteration: { type: Boolean, default: true },
    showDiacritics: { type: Boolean, default: true },
    keyboardMode: { type: String, default: 'standard' },
    difficulty: { type: String, default: 'normal' },
  },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);
