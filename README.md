# GoGo Arabic

An Arabic learning RPG that teaches Modern Standard Arabic through exploration, quests, and turn-based word battles in a pixel-art world.

## Tech Stack

- **Frontend:** React 19, Phaser 3, Redux Toolkit, Framer Motion
- **Backend:** Express 5, MongoDB
- **Testing:** Vitest, Testing Library, Playwright
- **Build:** Vite 7

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Features

- **Arabic Alphabet Module** — Learn all 28 letters with four forms, vowel combinations, and writing quizzes
- **Spaced Repetition Vocabulary** — FSRS-based review system across 6 CEFR levels (A1-C2)
- **Turn-Based Word Battles** — Fight bosses by answering Arabic vocabulary questions
- **Root Magic System** — Cast spells derived from Arabic trilateral roots with elemental affinities
- **Equipment & Economy** — Craft, buy, and equip gear from zone-themed shops with haggling
- **Companion System** — Recruit 12 companions across 6 zones with role-based battle AI
- **Grammar Lessons** — Interactive exercises covering essential Arabic grammar patterns
- **Quest System** — Story-driven and side quests with NPC dialogue trees
- **6 Explorable Zones** — Desert village, ancient library, mountain fortress, coastal market, oasis garden, and grand mosque
- **Daily Goals & Achievements** — Streaks, milestones, and progress tracking

## Cultural Design

This project follows culturally respectful design principles:

- **Faceless characters** — All pixel-art characters are depicted without facial features, following Islamic artistic traditions
- **No music** — Audio design uses ambient soundscapes and sound effects only
- **Arabic-first** — All in-game Arabic text uses proper right-to-left rendering with tashkeel (diacritical marks)
- **Historically grounded** — Zones and narratives draw from real Arabic and Islamic history and culture

## Project Structure

```
src/
  components/   # React UI components
  data/         # Game data (vocabulary, NPCs, zones, quests)
  game/         # Phaser scenes and systems
  hooks/        # Custom React hooks
  store/        # Redux slices and store config
  styles/       # Theme and shared styles
  utils/        # Helpers and utilities
server/         # Express API server
```

## License

Private project. All rights reserved.
