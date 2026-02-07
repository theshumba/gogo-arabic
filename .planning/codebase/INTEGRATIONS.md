# External Integrations

**Analysis Date:** 2026-02-07

## APIs & External Services

**No Third-Party APIs Integrated:**
- No Stripe, Supabase, Firebase, AWS, or other external API services detected
- All functionality is self-contained within the application

## Data Storage

**Databases:**
- MongoDB (local or cloud)
  - Connection: `MONGODB_URI` environment variable
  - Client: Mongoose 9.1.6 ODM
  - Models located in `server/src/models/`:
    - `User.js` - User accounts, character customization, settings, progress
    - `VocabCard.js` - Vocabulary cards for spaced repetition
    - `Quest.js` - Quest definitions and progress

**File Storage:**
- Local filesystem only
  - Frontend assets: `public/` directory
  - Audio files: `public/assets/audio/` (ambient, SFX, word pronunciations, letter pronunciations)
  - Images/sprites: `public/assets/` (character customization, UI elements)
  - No cloud storage (S3, Google Cloud Storage, etc.)

**Caching:**
- Client-side: Redux with redux-persist (localStorage)
  - Persisted state: player, vocabulary, quests, alphabet, settings, NPC data
  - Non-persisted (transient): UI state, sync state
  - Configuration: `src/store/store.js`
- Server-side: No explicit caching layer (in-memory state only)

## Authentication & Identity

**Auth Provider:**
- Custom implementation
  - Tokens: JWT (JSON Web Tokens)
  - Generation: `server/src/controllers/authController.js`
  - Verification: `server/src/middleware/auth.js`
  - Secret: `JWT_SECRET` environment variable
  - Duration: 7 days

**Implementation Details:**
- Registration: Email + password (hashed with bcryptjs)
- Login: Email + password verification
- Token storage: localStorage (client-side key: `token`)
- Request headers: `Authorization: Bearer {token}`
- User model: `server/src/models/User.js`

## Monitoring & Observability

**Error Tracking:**
- Not integrated - No Sentry, Rollbar, or similar service
- Basic error logging: Console.error for server-side issues
- Error boundary: `src/components/ErrorBoundary/ErrorBoundary.jsx`

**Logs:**
- Console logging only
- Server: Express middleware logs requests
- Client: Console.warn/error for missing audio files and issues

## CI/CD & Deployment

**Hosting:**
- Not configured - Application can be deployed to any Node.js hosting (Vercel, Heroku, DigitalOcean, etc.)
- Frontend built to static `dist/` directory
- Backend: Express server on configurable port

**CI Pipeline:**
- Not automated - No GitHub Actions, GitLab CI, or similar
- Playwright E2E tests available but not integrated into CI

## Webhooks & Callbacks

**Incoming:**
- No incoming webhooks - Application is not a webhook receiver

**Outgoing:**
- No outgoing webhooks - Application does not call external services

## API Endpoints

**Frontend-to-Backend Communication:**
- Base URL: `/api` (proxied to `http://localhost:5000` in dev)
- Client: `src/services/api.js`

**Auth Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

**User Endpoints:**
- `GET /api/user/profile` - Fetch user profile
- `PUT /api/user/profile` - Update user settings/character

**Review/Vocabulary Endpoints:**
- `POST /api/review/sync` - Sync vocabulary cards
- `GET /api/review/cards` - Fetch vocabulary cards for review

**Quest Endpoints:**
- `POST /api/quest/sync` - Sync quest progress

**Game State Endpoints:**
- `POST /api/game/save` - Save game state
- `GET /api/game/load` - Load game state

**Health Endpoint:**
- `GET /api/health` - Server health check

## Data Format

**Request/Response Format:**
- JSON only
- Request size limit: 1MB (Express `limit: '1mb'`)

## Security Middleware

**Server Configuration:**
- Helmet 8.1.0 - Security headers (CSP, X-Frame-Options, etc.)
- CORS 2.8.6 - Cross-origin resource sharing (configured to allow all origins in development)
- JWT - Bearer token authentication for protected endpoints

---

*Integration audit: 2026-02-07*
