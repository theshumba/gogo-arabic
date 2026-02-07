# Technology Stack

**Analysis Date:** 2026-02-07

## Languages

**Primary:**
- JavaScript (ES6 modules) - Both client and server code
- JSX - React components in client (`src/**/*.jsx`)

**Secondary:**
- JSON - Configuration and data files

## Runtime

**Environment:**
- Node.js (version not pinned, no .nvmrc or .node-version)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present in both root and `server/` directories

## Frameworks

**Core:**
- React 19.2.4 - Client UI framework
- Express 5.2.1 - Server HTTP framework
- Phaser 3.90.0 - Game engine for interactive scenes

**State Management:**
- Redux (@reduxjs/toolkit 2.11.2) - Global state management
- redux-persist 6.0.0 - LocalStorage persistence for Redux state

**Build/Dev:**
- Vite 7.3.1 - Frontend build tool and dev server
- @vitejs/plugin-react 5.1.3 - React HMR plugin for Vite
- nodemon 3.1.11 - Development server auto-reload

## Key Dependencies

**Critical:**
- mongoose 9.1.6 - MongoDB ODM for data modeling and queries
- jsonwebtoken 9.0.3 - JWT token generation and verification for authentication
- bcryptjs 3.0.3 - Password hashing for security
- ts-fsrs 5.2.3 - Spaced repetition algorithm for vocabulary review scheduling

**UI & Media:**
- howler 2.2.4 - Audio playback library for ambient music, SFX, and pronunciation
- react-dom 19.2.4 - React DOM rendering

**Infrastructure:**
- cors 2.8.6 - Cross-origin resource sharing middleware
- helmet 8.1.0 - Security headers middleware
- dotenv 17.2.4 - Environment variable management

**Testing:**
- playwright 1.58.2 - E2E testing framework (dev dependency)

## Configuration

**Environment:**
- `.env` file required on server (see `server/.env.example`)
- Environment variables loaded via `dotenv` in `server/src/server.js`
- Vite proxy configured for `/api` requests to `http://localhost:5000`

**Required Environment Variables:**
- `MONGODB_URI` - MongoDB connection string (defaults to `mongodb://localhost:27017/gogo-arabic`)
- `JWT_SECRET` - Secret key for JWT signing (must be long random string)
- `PORT` - Server port (defaults to 5000)

**Build:**
- `vite.config.js` - Vite configuration
  - Dev server port: 3000
  - Output directory: `dist/`
  - Public directory: `public/`
- `package.json` - NPM scripts for development and building

## Platform Requirements

**Development:**
- Node.js (version unspecified)
- npm
- Local MongoDB instance (for `MONGODB_URI` default: `mongodb://localhost:27017/gogo-arabic`)

**Production:**
- Node.js runtime
- MongoDB server (local or cloud)
- Static file serving (for built frontend in `dist/`)
- Port 5000 (configurable via `PORT` env var)

## Scripts

**Frontend:**
- `npm run dev` - Start Vite dev server on port 3000
- `npm run build` - Build frontend to `dist/`
- `npm run preview` - Preview production build locally

**Backend:**
- `npm run server` - Start Express server
- `npm run server:dev` - Start with nodemon (auto-reload)

**Utilities:**
- `npm run seed` - Run `scripts/seed-db.js` (database seeding)
- `npm run build:alphabet` - Run `scripts/build-alphabet.js` (alphabet data building)
- `npm run build:vocabulary` - Run `scripts/build-vocabulary.js` (vocabulary data building)

---

*Stack analysis: 2026-02-07*
