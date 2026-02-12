# Backend Architecture v2 — GoGo Arabic Expansion

**Current**: Express 5 + MongoDB (basic CRUD, auth, cloud sync)
**Target**: Full API v2 supporting 350+ NPCs, 250+ quests, 5,000+ words, save system, analytics

---

## 1. API Architecture

### Response Format (Standardized)

```json
{
  "success": true,
  "data": { /* resource */ },
  "meta": { "page": 1, "limit": 20, "total": 150 }
}
```

Error format:
```json
{
  "success": false,
  "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [...] }
}
```

### Endpoint Groups

| Group | Endpoints | Methods | Description |
|-------|-----------|---------|-------------|
| Auth | `/api/v2/auth/*` | POST | Register, login, refresh, logout |
| Users | `/api/v2/users/*` | GET, PATCH | Profile, settings, skills |
| Vocabulary | `/api/v2/vocabulary/*` | GET, POST | 5,000+ words, FSRS cards, batch ops |
| NPCs | `/api/v2/npcs/*` | GET | 350+ NPCs with filtering |
| Quests | `/api/v2/quests/*` | GET, PATCH | 250+ quests with chain resolution |
| World State | `/api/v2/world-state/*` | GET, PATCH | 500+ state variables per player |
| Factions | `/api/v2/factions/*` | GET, PATCH | 6 factions with reputation |
| Achievements | `/api/v2/achievements/*` | GET | 250+ achievements with progress |
| Saves | `/api/v2/saves/*` | GET, POST | 3 save slots + auto-save + cloud sync |
| Analytics | `/api/v2/analytics/*` | POST, GET | Learning events, CEFR progress |
| Content | `/api/v2/content/*` | GET | Lore entries, codex, books |
| Leaderboard | `/api/v2/leaderboard/*` | GET | Optional competitive features |

### Key Endpoints Detail

**Vocabulary**:
- `GET /api/v2/vocabulary?cefr=A1&root=k-t-b&page=1&limit=20` — Paginated, filterable
- `GET /api/v2/vocabulary/:id` — Single word with relationships
- `GET /api/v2/vocabulary/roots/:root` — All words from a root family
- `GET /api/v2/vocabulary/search?q=كتب` — Arabic text search
- `POST /api/v2/vocabulary/fsrs/review` — Submit FSRS review result
- `GET /api/v2/vocabulary/fsrs/due` — Get due cards for review

**NPCs**:
- `GET /api/v2/npcs?zone=oasis_village&role=merchant` — Filterable by zone, role
- `GET /api/v2/npcs/:id` — Full NPC data (personality, dialogue tree, schedule)
- `GET /api/v2/npcs/:id/dialogue` — NPC dialogue with player state context
- `GET /api/v2/npcs/:id/relationship` — Player-NPC relationship status

**Quests**:
- `GET /api/v2/quests?status=active&zone=oasis_village` — Active quests filterable
- `GET /api/v2/quests/:id` — Quest details with objectives
- `PATCH /api/v2/quests/:id/objectives/:objectiveId` — Update objective progress
- `GET /api/v2/quests/chains/:chainId` — Quest chain with prerequisites

**Saves**:
- `GET /api/v2/saves` — List all save slots with metadata
- `POST /api/v2/saves/sync` — Cloud save sync with conflict resolution
- `POST /api/v2/saves/:slotId/restore` — Restore from backup

---

## 2. Database Schema (MongoDB Collections)

### Core Collections

**users** (expanded):
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  passwordHash: String,
  createdAt: Date,
  lastLogin: Date,
  // Game state
  level: Number,
  xp: Number,
  dirhams: Number,
  zone: String,
  skills: { reading: 0, writing: 0, listening: 0, conversation: 0, grammar: 0, culture: 0 },
  faction_reputation: { scholars: 0, merchants: 0, artisans: 0, travelers: 0, guardians: 0, artists: 0 },
  title: String,
  background: String,
  housing: Object,
  journal: [{ entry: String, date: Date }],
  settings: Object,
  abTestVariants: Object
}
```

**vocabulary** (5,000+ entries):
```javascript
{
  id: String,          // "vocab_001"
  arabic: String,      // "كِتَاب"
  transliteration: String, // "kitaab"
  translation: String, // "book"
  partOfSpeech: String,
  root: String,        // "k-t-b"
  rootArabic: String,  // "ك-ت-ب"
  cefr: String,        // "A1"
  frequencyRank: Number,
  semanticCluster: String,
  relatedWords: [String],
  audioUrl: String,
  exampleSentences: [{ arabic: String, translation: String }],
  zones: [String],     // zones where word appears
  teachingNpcs: [String] // NPCs who teach this word
}
```

**vocab_cards** (FSRS per-player):
```javascript
{
  userId: ObjectId,
  wordId: String,
  state: Number,       // 0=New, 1=Learning, 2=Review, 3=Relearning
  stability: Number,
  difficulty: Number,
  due: Date,
  lastReview: Date,
  reviewCount: Number,
  lapseCount: Number,
  encounters: Number   // times seen in any context
}
```

**npcs** (350+ entries):
```javascript
{
  id: String,
  name: String,
  nameArabic: String,
  zone: String,
  role: String,
  personality: { traits: [String], speechStyle: String },
  schedule: [{ time: String, location: String, activity: String }],
  dialogue: Object,    // full dialogue tree
  vocabWords: [String],
  questsGiven: [String],
  faction: String,
  spriteSheet: String
}
```

**quests** (250+ entries):
```javascript
{
  id: String,
  title: String,
  titleArabic: String,
  description: String,
  type: String,        // main, zone, companion, faction, daily, discovery
  zone: String,
  chain: String,       // quest chain ID
  prerequisites: [{ type: String, value: String }],
  objectives: [{ id: String, type: String, target: String, count: Number }],
  rewards: { xp: Number, dirhams: Number, items: [String], reputation: Object },
  npcGiver: String,
  branchConditions: Object
}
```

**world_states** (per-player snapshots):
```javascript
{
  userId: ObjectId,
  variables: Map,      // 500+ state variables
  zoneStates: Map,     // per-zone state
  buildingStates: Map, // per-building state
  eventFlags: [String],
  timestamp: Date
}
```

**saves** (3 slots + auto):
```javascript
{
  userId: ObjectId,
  slotId: String,      // "auto", "slot1", "slot2", "slot3"
  version: Number,
  schemaVersion: Number,
  saveData: { compressed: String, checksum: String },
  metadata: { level: Number, zone: String, playTime: Number, timestamp: Date },
  backups: [{ version: Number, saveData: Object, timestamp: Date }]
}
```

**analytics_events** (TTL 90 days):
```javascript
{
  userId: ObjectId,
  type: String,        // word_encounter, quiz_completed, battle_won, session_start/end
  wordId: String,
  metadata: Object,
  timestamp: Date
}
```

### Indexes

```javascript
// Vocabulary
{ id: 1 }                           // unique
{ cefr: 1, frequencyRank: 1 }       // level-based queries
{ root: 1 }                         // root family lookup
{ "zones": 1 }                      // zone-based vocabulary
{ arabic: "text" }                  // Arabic text search

// FSRS Cards
{ userId: 1, wordId: 1 }            // unique compound
{ userId: 1, due: 1, state: 1 }     // due cards query

// NPCs
{ id: 1 }                           // unique
{ zone: 1, role: 1 }                // zone-based filtering

// Analytics
{ userId: 1, type: 1, timestamp: -1 } // user event history
{ timestamp: 1 }, { expireAfterSeconds: 7776000 } // TTL 90 days
```

---

## 3. Caching Strategy (Redis)

| Cache Key Pattern | TTL | Purpose |
|-------------------|-----|---------|
| `vocab:all` | 24h | Full vocabulary list |
| `vocab:{id}` | 24h | Single word |
| `vocab:root:{root}` | 24h | Root family |
| `npc:{id}` | 1h | NPC data |
| `npc:zone:{zone}` | 1h | Zone NPCs |
| `quest:{id}` | 1h | Quest data |
| `user:{id}:state` | 5m | Player state (hot path) |
| `user:{id}:fsrs:due` | 5m | Due cards |
| `leaderboard:weekly` | 15m | Weekly leaderboard |

Cache invalidation: bust on write (TTL as safety net).

---

## 4. Security

- **JWT**: Access token (15min) + Refresh token (7 days) with rotation
- **CSRF**: Double-submit cookie pattern
- **Rate limiting**: 100 req/min general, 10 req/min auth, 5 req/min save sync
- **Input sanitization**: Zod validation on all inputs, DOMPurify for user text
- **Headers**: Helmet.js (CSP, HSTS, X-Frame-Options)
- **Password**: bcrypt with cost factor 12

---

## 5. Save System (Cloud Sync)

### Conflict Resolution
- **Last-write-wins with version vector**
- Client sends save + local version + timestamp
- Server compares versions:
  - `clientVersion > serverVersion`: accept client
  - `clientVersion < serverVersion`: reject, send server save
  - `clientVersion === serverVersion`: timestamp tiebreaker

### Save Compression
- LZ-string compress to base64 (~70-80% reduction)
- SHA-256 checksum for integrity verification
- Keep last 5 backups per slot

### Save Migration
- Schema version tracked separately from game version
- Sequential migration functions: v1→v2, v2→v3, etc.
- Automated migration testing in CI

---

## 6. Analytics Pipeline

### Event Types
| Type | Purpose | Key Metadata |
|------|---------|--------------|
| `word_encounter` | Track word exposure | wordId, context, npcId |
| `quiz_completed` | Track quiz performance | quizType, correct, responseTime |
| `quest_completed` | Track quest completion | questId, xpEarned, wordsLearned |
| `battle_won` | Track battle performance | turnsElapsed, accuracy |
| `session_start/end` | Track play sessions | zoneId, level, duration |
| `fsrs_review` | Track FSRS reviews | wordId, rating, newDue |

### CEFR Progress Calculation
- Count mastered words (FSRS stability > 30 days) per CEFR level
- Thresholds: A1 (80% of 500), A2 (80% of 1000), B1 (70% of 1500), B2 (60% of 2000)

### A/B Testing
- Variant assignment on account creation
- Tracked in analytics events for comparison

---

## 7. Content Delivery

- **CDN** (Cloudflare/CloudFront): Static dialogue JSON, NPC data, quest data, audio files
- **Incremental updates**: Content versioning with patch system (not full reload)
- **Service Worker**: Offline-first with IndexedDB for large data
- **Asset pipeline**: Vocabulary audio → S3/R2 → CDN → client cache

---

## 8. Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Runtime | Node.js 20+ | JavaScript runtime |
| Framework | Express 5 | HTTP server |
| Database | MongoDB 7 (Atlas) | Primary data store |
| ODM | Mongoose 9 | MongoDB object modeling |
| Cache | Redis 7 (Upstash) | In-memory cache |
| Auth | jsonwebtoken 9 | JWT generation/validation |
| Validation | Zod 3 | Schema validation |
| Security | helmet 8 | Security headers |
| Rate Limit | express-rate-limit 7 | Rate limiting |
| Logging | winston 3 | Structured logging |
| Testing | vitest 4 + supertest 7 | Unit/integration tests |

### Estimated Cost
- MongoDB Atlas M10: ~$50/mo
- Redis Cloud 1GB: ~$10/mo
- Hosting (Render/Railway): ~$50/mo
- CDN (Cloudflare): Free tier
- S3/R2 storage: ~$5/mo
- **Total: ~$115/mo** (scales with users)

---

## 9. Migration Strategy (v1 → v2)

1. **Month 1-2**: Build v2 alongside v1 (all v2 endpoints use Zod + pagination)
2. **Month 3-4**: Client migration to v2
3. **Month 5-6**: Deprecation warnings on v1
4. **Month 7**: v1 shutdown (410 Gone)

Database migrations: Backward compatible (new fields optional), migration runner with up/down scripts.

---

*Generated: 2026-02-12*
*Author: Backend Architecture Research Agent (Claude Opus 4.6)*
