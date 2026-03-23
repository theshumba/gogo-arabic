# Phase 64: CEFR Reports + Social Sharing — Research

**Researched:** 2026-03-23
**Domain:** recharts v3.8.0 radar/line charts, write-once-per-session Redux snapshots, SVG social share cards, Web Share API
**Confidence:** HIGH

---

## Summary

Phase 64 ships three connected deliverables: a CEFR Progress Report component (RadarChart + LineChart via recharts), a write-once-per-session snapshot mechanism in cefrProgressSlice that guarantees the report never shows a backwards level, and a SVG-only social share card with Web Share API + clipboard fallback.

The recharts v3.8.0 install is straightforward in this project — dry-run confirms 0 peer-dep warnings against React 19. All five chart components (RadarChart, LineChart, ResponsiveContainer, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Line, XAxis, YAxis, CartesianGrid, Tooltip) come from a single import. The `charts-vendor` manualChunk entry in vite.config.js needs to be added (currently absent); the pattern mirrors the existing `fsrs-vendor` and `ink-vendor` entries. The social share card MUST be SVG-only — no external image requests — which avoids html-to-image CORS complications entirely and means html-to-image v1.11.13 is NOT installed.

The `cefrProgressSlice` currently pushes to `levelHistory` only on level change (i.e. when `currentLevel !== level`). The "write-once-per-session" requirement means a new `recordCefrSnapshot` reducer that appends `{ level, date, source }` to `levelHistory` at most once per calendar day. The key constraint: snapshots only record forward or equal movement, never backwards. CEFR_ORDER from quizTypes.js (`{A1:1, A2:2, B1:3, B2:4}`) is the existing comparison constant — use it, do not invent a new one.

**Primary recommendation:** Implement cefrProgressSlice snapshot logic before building the UI, so the chart has real data to render from day one (placement test session).

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| recharts | 3.8.0 | RadarChart + LineChart | Pinned in STATE.md; React 19 confirmed; 0 peer-dep conflicts in this project |
| react (existing) | 19.x | React.lazy + Suspense wrapping | Already installed |
| Redux Toolkit (existing) | 2.11.x | cefrProgressSlice extension | Already in use for all state |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| html-to-image | 1.11.13 | DOM-to-PNG for share card | NOT INSTALLED — SVG-only card avoids need entirely |
| framer-motion (existing) | 11.x | Overlay entrance animation | Consistent with AchievementPanel pattern |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| recharts RadarChart | D3 custom | REQUIREMENTS.md explicitly forbids D3 skill tree graphs; same reasoning applies |
| SVG-only share card | html-to-image + canvas | html-to-image has CORS issues with external image assets; SVG approach is dependency-free |
| Write-once date guard | Session token in localStorage | Date string guard in Redux state is simpler and consistent with `stats.lastSessionDate` pattern |

**Installation:**
```bash
npm install recharts@3.8.0
```
No `react-is` override needed — dry-run shows clean install (recharts 3.8.0 treats react-is as a peer dep, project's React 19 satisfies it).

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── CEFR/
│   │   ├── CefrProgressReport.jsx      # RadarChart + LineChart (lazy-loaded)
│   │   ├── CefrProgressReport.module.css
│   │   ├── SocialShareCard.jsx          # SVG-only share card (lazy-loaded)
│   │   └── SocialShareCard.module.css
├── store/slices/
│   └── cefrProgressSlice.js             # Extend with recordCefrSnapshot reducer
```

### Pattern 1: Lazy-Loading Charts Component

The recharts bundle adds ~200KB to the vendor chunk. Follow the established SkillTreeView + AchievementPanel pattern: lazy-load inside the parent menu/overlay component.

**What:** `React.lazy` + `Suspense fallback={null}` guards the chart component
**When to use:** Any chart component that is not always visible on screen
**Example:**
```jsx
// Source: Pattern from HUD.jsx line 15 + SkillTreeMenu.jsx line 7
const CefrProgressReport = lazy(() => import('../CEFR/CefrProgressReport.jsx'));

// In parent render:
{cefrPanelOpen && (
  <Suspense fallback={null}>
    <CefrProgressReport onClose={closeCefrPanel} />
  </Suspense>
)}
```

### Pattern 2: manualChunks Entry for recharts

vite.config.js currently has NO `charts-vendor` entry. It must be added following the existing `fsrs-vendor` / `ink-vendor` pattern. recharts bundles d3 sub-packages and victory-vendor — the chunk key should match all of them.

**Example:**
```js
// Source: vite.config.js manualChunks function — existing pattern
if (id.includes('node_modules/recharts') ||
    id.includes('node_modules/victory-vendor') ||
    id.includes('node_modules/d3-')) {
  return 'charts-vendor';
}
```
Place this block BEFORE the generic `return 'misc-vendor'` fallback, in the `if (id.includes('node_modules'))` branch.

### Pattern 3: RadarChart Component Composition

RadarChart has NO required props — all are optional. `data` and `dataKey` are the meaningful props.

**Data shape for RadarChart (6 skill trees):**
```js
// selectSkillXP(treeId)(state) returns a number for each of the 6 trees
// SKILL_TREE_ORDER = ['reading', 'writing', 'listening', 'speaking', 'grammar', 'culture']
const radarData = SKILL_TREE_ORDER.map((treeId) => ({
  skill: SKILL_TREES[treeId].nameArabic,   // Arabic label on PolarAngleAxis
  xp: selectSkillXP(treeId)(state),         // radial value
  fullMark: 900,                            // max XP per tree (30 nodes × ~30 avg xpCost)
}));
```

**Minimal valid composition:**
```jsx
// Source: recharts.github.io/en-US/api/RadarChart (verified 2026-03-23)
<ResponsiveContainer width="100%" height={300}>
  <RadarChart data={radarData}>
    <PolarGrid />
    <PolarAngleAxis dataKey="skill" />
    <PolarRadiusAxis angle={90} domain={[0, 900]} />
    <Radar
      name="Skill XP"
      dataKey="xp"
      stroke="#e2b659"
      fill="#e2b659"
      fillOpacity={0.4}
    />
    <Tooltip />
  </RadarChart>
</ResponsiveContainer>
```

### Pattern 4: LineChart for CEFR Level History

`levelHistory` from cefrProgressSlice is `[{ level, date, source }]`. The LineChart needs a numeric Y-axis; map CEFR levels to integers using `CEFR_ORDER` from quizTypes.js.

**Data transformation:**
```js
// Source: CEFR_ORDER already defined in src/data/quizTypes.js
import { CEFR_ORDER } from '../../data/quizTypes.js';

const lineData = [
  ...levelHistory.map(entry => ({
    date: new Date(entry.date).toLocaleDateString(),
    levelNum: CEFR_ORDER[entry.level] ?? 0,
    label: entry.level,
  })),
  // Append current level as final data point
  {
    date: 'Now',
    levelNum: CEFR_ORDER[currentLevel] ?? 1,
    label: currentLevel,
  }
];
```

**Chart composition:**
```jsx
// Source: recharts LineChart API (verified 2026-03-23)
<ResponsiveContainer width="100%" height={200}>
  <LineChart data={lineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="#3a373b" />
    <XAxis dataKey="date" tick={{ fill: '#c8c8c8', fontSize: 10 }} />
    <YAxis
      domain={[0, 4]}
      ticks={[1, 2, 3, 4]}
      tickFormatter={(v) => ['', 'A1', 'A2', 'B1', 'B2'][v] || ''}
      tick={{ fill: '#e2b659', fontSize: 10 }}
    />
    <Tooltip formatter={(v) => ['', 'A1', 'A2', 'B1', 'B2'][v] || v} />
    <Line type="monotone" dataKey="levelNum" stroke="#e2b659" strokeWidth={2} dot={{ fill: '#e2b659' }} />
  </LineChart>
</ResponsiveContainer>
```

### Pattern 5: Write-Once-Per-Session Snapshot Reducer

The "never goes backwards" requirement needs a new `recordCefrSnapshot` reducer in cefrProgressSlice. The session boundary is a calendar date (same pattern as `stats.lastSessionDate`).

**State extension needed:**
```js
// Add to cefrProgressSlice initialState:
lastSnapshotDate: null,   // 'YYYY-MM-DD' string — prevents multiple snapshots per day
```

**Reducer logic:**
```js
// Source: pattern derived from statsSlice.startSession + setCefrLevel existing logic
recordCefrSnapshot(state, action) {
  const { level } = action.payload;
  const today = new Date().toISOString().split('T')[0];

  // Guard 1: already snapshotted today
  if (state.lastSnapshotDate === today) return;

  // Guard 2: only record forward or equal movement (never backwards)
  const CEFR_RANK = { A1: 1, A2: 2, B1: 3, B2: 4 };
  const last = state.levelHistory[state.levelHistory.length - 1];
  const lastRank = last ? (CEFR_RANK[last.level] ?? 0) : 0;
  if ((CEFR_RANK[level] ?? 0) < lastRank) return;

  state.levelHistory.push({ level, date: new Date().toISOString(), source: 'session_snapshot' });
  state.lastSnapshotDate = today;
},
```

**When to dispatch:** Once per session when the game loads (e.g. in the same `useEffect` that calls `startSession` in statsSlice, or in `MainMenu.jsx` after placement completes).

### Pattern 6: SVG-Only Social Share Card

The SVG approach avoids html-to-image entirely and removes any CORS risk from external images. The card is composed of pure SVG elements and rendered to a `<div>` with `overflow:hidden` for clipboard copy via the Web Share API or `navigator.clipboard.writeText`.

**Share card data:**
```js
const shareText = `I just reached ${currentLevel} in Arabic on Gogo Arabic! 🌟\n` +
  `${wordsLearned} words learned • ${player.level} levels completed\n` +
  `Play free: gogo-arabic.com`;
```

**Web Share API + clipboard fallback pattern:**
```js
// Source: MDN Navigator.share() (verified 2026-03-23); HTTPS-only for clipboard
async function handleShare() {
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Gogo Arabic', text: shareText });
    } catch (err) {
      // User cancelled share or API unavailable — fall through to clipboard
    }
  } else {
    await navigator.clipboard.writeText(shareText);
    dispatch(showNotification({ message: 'Copied to clipboard!', type: 'success' }));
  }
}
```

**Important:** `navigator.clipboard.writeText` requires HTTPS or localhost. In dev (localhost:3000), this works. In production (HTTPS served app), this works. No polyfill needed.

### Anti-Patterns to Avoid

- **Don't import recharts at the top level of HUD.jsx or GameLayout.jsx** — recharts is ~200KB; it must be in a lazy-loaded component only.
- **Don't add `charts-vendor` to `whitelist` in persistConfig** — charts are UI-only, not persisted state.
- **Don't use `setCefrLevel` for the snapshot** — `setCefrLevel` only fires on level change; `recordCefrSnapshot` fires once per session regardless of change.
- **Don't use `html-to-image` for a text-only share card** — the overhead is not justified; SVG + text copy is the correct approach here.
- **Don't read `state.cefrProgress.levelHistory` directly in components** — use `selectCefrHistory` selector.
- **Don't call `new Date()` inside a reducer** — use `new Date().toISOString()` in the action payload and pass it in, OR follow the existing `setCefrLevel` pattern which calls `new Date()` inside the reducer (this project already does this; acceptable tradeoff for simplicity, not pure Redux style).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Radar chart rendering | Custom SVG radar | recharts RadarChart | SVG polygon math + responsive scaling is ~200 lines of edge cases |
| Line chart with axes | Custom D3 chart | recharts LineChart | D3 is explicitly forbidden in REQUIREMENTS.md |
| Image capture for share | Custom canvas renderer | SVG text share | html-to-image has CORS issues with external fonts/images; SVG text avoids entirely |
| Peer dep resolution | npm overrides config | Install recharts 3.8.0 normally | Clean install confirmed with no conflicts |
| CEFR numeric ordering | Inline `{A1:1,...}` in component | Import `CEFR_ORDER` from quizTypes.js | Already defined; consistent with achievementSlice.js line 202 |

**Key insight:** The recharts ResponsiveContainer + RadarChart handles all the polar coordinate math that would otherwise require D3. The "no regression" guarantee is better solved in the reducer than in the selector.

---

## Common Pitfalls

### Pitfall 1: ResponsiveContainer Width 0 Inside Suspense

**What goes wrong:** ResponsiveContainer uses ResizeObserver; if rendered inside a `Suspense` boundary that isn't mounted to the DOM yet (e.g. `display:none` parent), width/height reports 0 and chart renders invisibly.
**Why it happens:** Known recharts issue (#2736 on GitHub) — ResponsiveContainer only reports size after it is actually in the document layout.
**How to avoid:** Use conditional render (`{cefrPanelOpen && <Suspense><Chart/></Suspense>}`) not CSS `visibility:hidden`. The AchievementPanel pattern (HUD.jsx line 314-317) does this correctly.
**Warning signs:** Chart renders but is invisible or has a 0×0 bounding box.

### Pitfall 2: levelHistory Shows Only Level Changes, Not Per-Session

**What goes wrong:** If the planner reuses `setCefrLevel` for the CEFR timeline, the LineChart only shows data points when the level changes — not the session-by-session progression the success criterion requires.
**Why it happens:** `setCefrLevel` checks `state.currentLevel !== level` before appending to `levelHistory`.
**How to avoid:** Add a dedicated `recordCefrSnapshot` reducer for session timeline data; leave `setCefrLevel` for actual level-change events only. The two write paths are complementary.
**Warning signs:** LineChart shows only 1-2 data points even after many sessions.

### Pitfall 3: CEFR Level Regression in levelHistory

**What goes wrong:** If a player retakes the placement test and gets A1 after previously being A2, the `resetCefrProgress` + `setCefrLevel` sequence wipes history — but if the retake path calls `recordCefrSnapshot` before `resetCefrProgress`, a stale A2 snapshot remains.
**Why it happens:** `resetCefrProgress` resets to `initialState`; the new `lastSnapshotDate` field must be in initialState.
**How to avoid:** `initialState` must include `lastSnapshotDate: null`. `resetCefrProgress` returns `initialState` (already does this by returning the whole object). Confirm the retake flow in `SettingsMenu.jsx` calls `resetCefrProgress` BEFORE any new `setCefrLevel`.
**Warning signs:** Timeline shows mixed levels from pre- and post-retake sessions.

### Pitfall 4: navigator.share() Available but Throws on Text-Only Share

**What goes wrong:** Some browsers expose `navigator.share` but throw `TypeError` when sharing text-only (no files). Safari on older iOS requires at least one of `url`, `title`, or `text`.
**Why it happens:** Browser compatibility differences in Web Share API level 2 vs level 1.
**How to avoid:** Always include both `title` and `text` in the share object. Wrap in try/catch; fall through to clipboard on any error.
**Warning signs:** Share button appears to do nothing on certain iOS versions.

### Pitfall 5: recharts Import Size if Not Code-Split

**What goes wrong:** If recharts is imported in a non-lazy component (e.g. added to PlayerProfile.jsx directly), it joins the main bundle rather than the `charts-vendor` chunk.
**Why it happens:** Vite's `manualChunks` only runs on production build; dev bundles everything eagerly.
**How to avoid:** Keep all recharts imports inside `CefrProgressReport.jsx` only. The `charts-vendor` manualChunk entry gates on `id.includes('node_modules/recharts')`.
**Warning signs:** `build:analyze` treemap shows recharts in the main chunk.

---

## Code Examples

### Verified: CefrProgressReport Component Skeleton

```jsx
// Source: recharts API + lazy pattern from SkillTreeMenu.jsx
import { useSelector } from 'react-redux';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { selectCefrLevel, selectCefrHistory } from '../../store/slices/cefrProgressSlice.js';
import { selectSkillXP } from '../../store/slices/skillTreeSlice.js';
import { CEFR_ORDER } from '../../data/quizTypes.js';
import { SKILL_TREES, SKILL_TREE_ORDER } from '../../data/skillTrees.js';
import { useSelector } from 'react-redux';
import styles from './CefrProgressReport.module.css';

export default function CefrProgressReport({ onClose }) {
  const currentLevel = useSelector(selectCefrLevel);
  const levelHistory = useSelector(selectCefrHistory);
  const skillXP = Object.fromEntries(
    SKILL_TREE_ORDER.map(id => [id, useSelector(selectSkillXP(id))])
  );
  // ... build radarData, lineData, render charts
}
```

### Verified: recordCefrSnapshot Reducer Addition

```js
// Source: statsSlice.startSession pattern (statsSlice.js line 83-86)
// Add to cefrProgressSlice reducers:
recordCefrSnapshot(state, action) {
  const { level } = action.payload;
  const today = new Date().toISOString().split('T')[0];
  if (state.lastSnapshotDate === today) return;
  const CEFR_RANK = { A1: 1, A2: 2, B1: 3, B2: 4 };
  const last = state.levelHistory[state.levelHistory.length - 1];
  const lastRank = last ? (CEFR_RANK[last.level] ?? 0) : 0;
  if ((CEFR_RANK[level] ?? 0) < lastRank) return;
  state.levelHistory.push({ level, date: new Date().toISOString(), source: 'session_snapshot' });
  state.lastSnapshotDate = today;
},
```

### Verified: Web Share API + Clipboard Fallback

```js
// Source: MDN Navigator.share() + navigator.clipboard.writeText()
async function handleShare(shareText, dispatch, showNotification) {
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Gogo Arabic', text: shareText });
      return;
    } catch { /* user cancelled or unsupported params — fall through */ }
  }
  try {
    await navigator.clipboard.writeText(shareText);
    dispatch(showNotification({ message: 'Copied to clipboard!', type: 'success' }));
  } catch {
    // Clipboard not available (non-HTTPS, Firefox without permission)
    dispatch(showNotification({ message: 'Share not available', type: 'error' }));
  }
}
```

### Verified: vite.config.js manualChunks Addition

```js
// Source: existing vite.config.js pattern — place BEFORE generic 'misc-vendor' return
if (id.includes('node_modules/recharts') ||
    id.includes('node_modules/victory-vendor') ||
    id.includes('node_modules/d3-')) {
  return 'charts-vendor';
}
```

---

## Validation Architecture

This section defines test patterns for each success criterion. All tests follow the established project pattern: pure reducer/selector tests via `import reducer, { action } from '../slice.js'`, no React component rendering.

### Success Criterion 1: RadarChart + LineChart visible after first session

**Test file:** `src/store/slices/__tests__/cefrProgressSlice.test.js`

```js
// Pattern: reducer(state, action) assertion (achievementSlice.test.js model)
describe('cefrProgressSlice — recordCefrSnapshot', () => {
  it('Test 1: recordCefrSnapshot with A1 appends { level:"A1", source:"session_snapshot" } to levelHistory', () => {
    const state = cefrProgressReducer(
      { currentLevel: 'A1', levelHistory: [], lastSnapshotDate: null },
      recordCefrSnapshot({ level: 'A1' })
    );
    expect(state.levelHistory).toHaveLength(1);
    expect(state.levelHistory[0].level).toBe('A1');
    expect(state.levelHistory[0].source).toBe('session_snapshot');
  });

  it('Test 2: chart renders — selectCefrHistory returns non-empty array after recordCefrSnapshot', () => {
    // Selector test: ensures data is available for chart on first session
    let state = cefrProgressReducer(undefined, { type: '@@INIT' });
    state = cefrProgressReducer(state, setCefrLevel({ level: 'A1', source: 'placement' }));
    state = cefrProgressReducer(state, recordCefrSnapshot({ level: 'A1' }));
    const history = selectCefrHistory({ cefrProgress: state });
    expect(history.length).toBeGreaterThan(0);
  });
});
```

### Success Criterion 2: Level never goes backwards

**Test file:** `src/store/slices/__tests__/cefrProgressSlice.test.js`

```js
describe('cefrProgressSlice — no-regression guarantee', () => {
  it('Test 3: recordCefrSnapshot with A1 after A2 does not append to levelHistory (regression blocked)', () => {
    const base = {
      currentLevel: 'A2',
      levelHistory: [{ level: 'A2', date: '2026-03-01T00:00:00Z', source: 'session_snapshot' }],
      lastSnapshotDate: '2026-03-01',
    };
    // Advance date so today-guard doesn't block
    vi.setSystemTime(new Date('2026-03-02T00:00:00Z'));
    const state = cefrProgressReducer(base, recordCefrSnapshot({ level: 'A1' }));
    expect(state.levelHistory).toHaveLength(1); // no new entry
  });

  it('Test 4: recordCefrSnapshot with A2 after A2 (same level, new day) appends — equal is allowed', () => {
    const base = {
      currentLevel: 'A2',
      levelHistory: [{ level: 'A2', date: '2026-03-01T00:00:00Z', source: 'session_snapshot' }],
      lastSnapshotDate: '2026-03-01',
    };
    vi.setSystemTime(new Date('2026-03-02T00:00:00Z'));
    const state = cefrProgressReducer(base, recordCefrSnapshot({ level: 'A2' }));
    expect(state.levelHistory).toHaveLength(2); // equal level allowed
  });

  it('Test 5: recordCefrSnapshot called twice same day only records once', () => {
    vi.setSystemTime(new Date('2026-03-02T10:00:00Z'));
    let state = cefrProgressReducer(
      { currentLevel: 'A1', levelHistory: [], lastSnapshotDate: null },
      recordCefrSnapshot({ level: 'A1' })
    );
    state = cefrProgressReducer(state, recordCefrSnapshot({ level: 'A1' }));
    expect(state.levelHistory).toHaveLength(1); // idempotent
  });
});
```

### Success Criterion 3: Social card shares without external image requests

**Test file:** Unit test is not appropriate for navigator.share() (browser API). Test via:

1. **Reducer test** (for share state tracking, if added): confirm no Redux errors on share action.
2. **Manual verification checklist** (since navigator.share is not available in jsdom):
   - `navigator.share` is undefined in test env → clipboard path runs
   - SVG elements use only inline styles and CSS variables — no `<image>` elements, no `url()` pointing to external resources
   - Build output: `dist/` contains no recharts-related chunks in `index.html` (charts are code-split)

**Testable unit (share text generator):**
```js
// Extract share text builder as a pure function for testability
export function buildShareText({ currentLevel, wordsLearned, playerLevel }) {
  return `I just reached ${currentLevel} in Arabic on Gogo Arabic!\n` +
    `${wordsLearned} words learned • Level ${playerLevel}\ngogo-arabic.com`;
}

// Test:
it('Test 6: buildShareText returns string with currentLevel, wordsLearned, playerLevel', () => {
  const text = buildShareText({ currentLevel: 'A2', wordsLearned: 150, playerLevel: 8 });
  expect(text).toContain('A2');
  expect(text).toContain('150');
  expect(text).toContain('gogo-arabic.com');
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| D3.js for charts | recharts v3.x | recharts adopted React 19 compat in 3.x | Drop D3 direct usage; forbidden by REQUIREMENTS.md anyway |
| html-to-image for share cards | SVG text + Web Share API | Ongoing (CORS issues) | Zero dependency, works everywhere HTTPS |
| Web Share API files (images) | Text-only share | 2024+ | Avoid needing to capture canvas; simpler code path |

**Deprecated/outdated:**
- `react-is` explicit install: recharts 3.8.0 resolves react-is via the project's existing React 19 — no explicit install needed in this project

---

## Open Questions

1. **Where is the CEFR Report accessed from?**
   - What we know: HUD has existing buttons for AchievementPanel and DailyGoalsPanel; same pattern can work for CefrProgressReport
   - What's unclear: The plan spec doesn't name the entry point (HUD button? SettingsMenu tab? PlayerProfile section?)
   - Recommendation: Add a "CEFR Progress" button to HUD alongside the achievements button — follows existing lazy-load pattern exactly

2. **Scholar's Scroll ink dialogue (64-02): new .ink file or reuse guide-amira.ink.json?**
   - What we know: 11 compiled .ink.json files exist in `src/data/ink/`; InkDialogueEngine loads by NPC ID
   - What's unclear: Does "Scholar's Scroll" mean a new NPC ID (`scholar-amira`) or a new path knot in `guide-amira.ink.json`?
   - Recommendation: New file `guide-amira-cefr.ink.json` scoped to CEFR milestone moments; keeps separation from path-choice script

3. **cefrProgressSlice migration for lastSnapshotDate field**
   - What we know: New field `lastSnapshotDate: null` will be missing from saved states (localStorage persistence confirmed)
   - What's unclear: Does this need a migration or is a `?? null` guard sufficient?
   - Recommendation: No migration needed — `recordCefrSnapshot` uses `state.lastSnapshotDate === today` check; if `undefined === '2026-03-23'` evaluates to `false` (not equal), first call proceeds correctly. Add a `?? null` normalizer in initialState comment.

---

## Sources

### Primary (HIGH confidence)
- recharts npm page — version 3.8.0, React 19 peer dep confirmed, zero conflicts in dry-run
- `src/store/slices/cefrProgressSlice.js` — confirmed state shape, existing reducers, selectors
- `src/store/slices/skillTreeSlice.js` — confirmed `selectSkillXP(treeId)` selector shape
- `src/data/skillTrees.js` — confirmed 6 trees: reading, writing, listening, speaking, grammar, culture
- `src/data/quizTypes.js` — confirmed `CEFR_ORDER = {A1:1, A2:2, B1:3, B2:4}`
- `vite.config.js` — confirmed no `charts-vendor` chunk exists; confirmed manualChunks pattern
- `src/store/store.js` — confirmed `cefrProgress` in localStorage whitelist (not IndexedDB)
- `src/components/HUD/HUD.jsx` — confirmed lazy-load + conditional render pattern for panel overlays
- `src/store/slices/statsSlice.js` — confirmed `lastSessionDate` per-day guard pattern
- `src/test/setup.js` — confirmed `vi.useFakeTimers()` available for date-guarded reducer tests

### Secondary (MEDIUM confidence)
- recharts.github.io/en-US/api/RadarChart — RadarChart props (all optional; data, dataKey, children pattern confirmed)
- github.com/recharts/recharts/discussions/5701 — React 19 + react-is resolution approach
- MDN Navigator.share() — Web Share API `{title, text}` shape; try/catch fallback pattern
- github.com/bubkoo/html-to-image — html-to-image toPng, toBlob API; CORS concern confirmed

### Tertiary (LOW confidence)
- github.com/recharts/recharts/issues/2736 — ResponsiveContainer width=0 in Suspense; recommend conditional render as mitigation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — recharts 3.8.0 dry-run confirms clean install; peer deps verified
- Architecture: HIGH — all patterns derived from existing codebase (HUD, SkillTreeMenu, statsSlice)
- Pitfalls: HIGH — ResponsiveContainer issue confirmed via GitHub; regression logic derived from existing CEFR_ORDER constants
- Validation tests: HIGH — follow established `achievementSlice.test.js` model exactly

**Research date:** 2026-03-23
**Valid until:** 2026-04-22 (recharts 3.x stable; Web Share API stable)
