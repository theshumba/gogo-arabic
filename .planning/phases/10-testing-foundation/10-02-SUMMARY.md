---
phase: 10-testing-foundation
plan: 02
subsystem: testing
tags: [vitest, supertest, mongodb-memory-server, api-testing, integration-tests]

# Dependency graph
requires:
  - phase: none
    provides: none
provides:
  - Backend test infrastructure with Vitest + supertest + mongodb-memory-server
  - Comprehensive API integration tests for all 6 backend route files
  - Test helpers for JWT auth token generation
  - In-memory MongoDB setup/teardown for isolated testing
affects: [10-testing-foundation, 12-backend-hardening]

# Tech tracking
tech-stack:
  added: [vitest, supertest, mongodb-memory-server]
  patterns: [API integration testing, in-memory database testing, JWT test helpers]

key-files:
  created:
    - server/vitest.config.js
    - server/test/setup.js
    - server/test/helpers.js
    - server/src/routes/__tests__/auth.test.js
    - server/src/routes/__tests__/user.test.js
    - server/src/routes/__tests__/shop.test.js
    - server/src/routes/__tests__/quest.test.js
    - server/src/routes/__tests__/review.test.js
    - server/src/routes/__tests__/game.test.js
  modified:
    - server/package.json
    - server/src/models/User.js
    - server/src/middleware/validate.js
    - server/src/controllers/questController.js
    - server/src/controllers/reviewController.js

key-decisions:
  - "Use Vitest instead of Jest for ESM compatibility and faster execution"
  - "Disable rate limiting in tests via environment variables rather than mocking"
  - "Store validated query params in req.validatedQuery to work around Express 5 read-only req.query"

patterns-established:
  - "createTestUser() helper for authenticated route testing"
  - "mongodb-memory-server global setup/teardown in test/setup.js"
  - "Serial test execution (singleThread: true) to prevent MongoDB instance conflicts"

# Metrics
duration: 7min
completed: 2026-02-09
---

# Phase 10 Plan 02: Backend API Testing Foundation Summary

**Comprehensive API integration tests for all 6 backend routes (56 tests) with Vitest, supertest, and mongodb-memory-server**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-09T00:29:32Z
- **Completed:** 2026-02-09T00:36:39Z
- **Tasks:** 2
- **Files modified:** 16

## Accomplishments
- Backend test infrastructure configured with Vitest running in serial mode for MongoDB safety
- 56 integration tests covering auth, user, shop, quest, review, and game endpoints
- Test helpers created for JWT token generation and test user creation
- All tests passing with isolated in-memory database per test run

## Task Commits

Each task was committed atomically:

1. **Task 1: Install backend test dependencies and create test infrastructure** - `193e3ec` (chore)
2. **Task 2: Write API integration tests for all 6 route files** - `6032c41` (feat)

## Files Created/Modified

**Created:**
- `server/vitest.config.js` - Vitest config with serial execution, globals, node environment
- `server/test/setup.js` - MongoMemoryServer global setup/teardown, collection cleanup
- `server/test/helpers.js` - createAuthToken() and createTestUser() utilities
- `server/src/routes/__tests__/auth.test.js` - 14 tests for register/login/logout/verify endpoints
- `server/src/routes/__tests__/user.test.js` - 7 tests for profile get/update endpoints
- `server/src/routes/__tests__/shop.test.js` - 7 tests for item purchase endpoint
- `server/src/routes/__tests__/quest.test.js` - 10 tests for quest list/sync endpoints
- `server/src/routes/__tests__/review.test.js` - 10 tests for vocab card list/sync endpoints
- `server/src/routes/__tests__/game.test.js` - 8 tests for game save/load/resolve endpoints

**Modified:**
- `server/package.json` - Added vitest/supertest/mongodb-memory-server, test scripts
- `server/src/models/User.js` - Fixed async pre-save hook (removed next() call)
- `server/src/middleware/validate.js` - Handle Express 5 read-only req.query
- `server/src/controllers/questController.js` - Read from req.validatedQuery
- `server/src/controllers/reviewController.js` - Read from req.validatedQuery

## Decisions Made

1. **Vitest over Jest:** ESM-native support, faster execution, better error messages
2. **Serial execution:** Prevent multiple MongoDB instance conflicts with singleThread: true
3. **High rate limits in tests:** Set RATE_LIMIT_* env vars to 10000 to avoid 429 errors during rapid test execution
4. **validatedQuery pattern:** Store validated query params separately to avoid Express 5 read-only req.query issue

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed User model pre-save hook for Mongoose async functions**
- **Found during:** Task 2 (running auth tests)
- **Issue:** User.pre('save') hook called next() at end of async function, causing "next is not a function" error in Mongoose 9
- **Fix:** Removed next() parameter and call from async function - async hooks don't need explicit next() in newer Mongoose
- **Files modified:** server/src/models/User.js
- **Verification:** All user creation tests pass, password hashing works correctly
- **Committed in:** 6032c41 (Task 2 commit)

**2. [Rule 1 - Bug] Fixed validate middleware for Express 5 read-only req.query**
- **Found during:** Task 2 (running quest/review GET endpoint tests)
- **Issue:** validate middleware tried to assign to req.query, which is read-only in Express 5, causing "Cannot set property query" error
- **Fix:** Store validated query params in req.validatedQuery property instead, updated controllers to read from validatedQuery when available
- **Files modified:** server/src/middleware/validate.js, server/src/controllers/questController.js, server/src/controllers/reviewController.js
- **Verification:** All query parameter validation tests pass (pagination, etc.)
- **Committed in:** 6032c41 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 - Bug)
**Impact on plan:** Both bugs were blocking issues preventing tests from running. Fixes were necessary for test execution. No scope creep.

## Issues Encountered

- **Rate limiting in tests:** Auth endpoints hit rate limit (5 requests) during multiple test runs in same describe block. Fixed by setting very high RATE_LIMIT_* env vars in test/setup.js
- **Error message matching:** Zod validation errors include full path (e.g., "Validation failed: cards: Cannot sync..."). Updated test assertions to match actual error format.

## User Setup Required

None - no external service configuration required. Tests run entirely with in-memory MongoDB.

## Next Phase Readiness

✅ **Backend API tests complete** - Ready for Phase 12 (Backend Hardening) which will add database indexes, transactions, and validation. Tests ensure existing behavior is preserved during hardening.

**Coverage:**
- All 6 route files tested (auth, user, shop, quest, review, game)
- Success paths, error paths, authentication, and validation tested
- 56 tests total, all passing

**Blockers:** None

## Self-Check: PASSED

**Files created:**
- ✓ server/vitest.config.js
- ✓ server/test/setup.js
- ✓ server/test/helpers.js
- ✓ All 6 route test files (auth, user, shop, quest, review, game)

**Commits verified:**
- ✓ 193e3ec - Task 1: Install backend test infrastructure
- ✓ 6032c41 - Task 2: Add API integration tests with bug fixes

**Test execution:**
- ✓ All 56 tests passing (npx vitest run)

---
*Phase: 10-testing-foundation*
*Completed: 2026-02-09*
