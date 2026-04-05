# Ralph Agent Instructions — Gogo Arabic

You are an autonomous coding agent working on **Gogo Arabic**, an Arabic learning RPG built with React 19, Phaser 3, Redux Toolkit (35+ slices, 19 middleware), Express 5, and MongoDB.

## Critical Rules

- **DO NOT TOUCH** the loading screen (koi fish + Gogo Arabic + Yala Arabic) — EVER
- **DO NOT modify** visual/world layer files (terrain, tilemap, Phaser scene rendering) — the visual layer is known-broken and will be fixed separately
- Keep changes focused and minimal — this is a 210K+ LOC codebase
- Follow existing patterns in the codebase — check nearby files before inventing new approaches
- When in doubt, read the file first

## Project Structure

- `src/` — React frontend + Phaser game client
- `src/slices/` — Redux Toolkit slices (35+)
- `src/middleware/` — Redux middleware (19)
- `src/components/` — React UI components
- `src/phaser/` — Phaser 3 game scenes and systems
- `server/` — Express 5 backend + MongoDB
- `public/assets/kenmi/` — Kenmi Cute Fantasy art bundle (969 PNGs)
- `scripts/` — Build and utility scripts

## Quality Checks

Before committing, run:
```bash
npm run test:run    # Vitest — 2535+ tests
npm run lint        # ESLint
npm run build       # Vite production build
```

All three must pass. Do NOT commit if any fail.

## Your Task

1. Read the PRD at `prd.json` (in the same directory as this file)
2. Read the progress log at `progress.txt` (check Codebase Patterns section first)
3. Check you're on the correct branch from PRD `branchName`. If not, check it out or create from main.
4. Pick the **highest priority** user story where `passes: false`
5. Implement that single user story
6. Run quality checks: `npm run test:run && npm run lint && npm run build`
7. If checks pass, commit ALL changes with message: `feat: [Story ID] - [Story Title]`
8. Update the PRD to set `passes: true` for the completed story
9. Append your progress to `progress.txt`

## Progress Report Format

APPEND to progress.txt (never replace, always append):
```
## [Date/Time] - [Story ID]
- What was implemented
- Files changed
- **Learnings for future iterations:**
  - Patterns discovered
  - Gotchas encountered
  - Useful context
---
```

## Consolidate Patterns

If you discover a **reusable pattern**, add it to the `## Codebase Patterns` section at the TOP of progress.txt (create it if it doesn't exist).

## Stop Condition

After completing a user story, check if ALL stories have `passes: true`.

If ALL stories are complete and passing, reply with:
<promise>COMPLETE</promise>

If there are still stories with `passes: false`, end your response normally (another iteration will pick up the next story).

## Important

- Work on ONE story per iteration
- Commit frequently
- Keep CI green
- Read the Codebase Patterns section in progress.txt before starting
