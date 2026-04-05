#!/bin/bash
# Ralph Growth Engine — autonomous game expansion loop
# Runs Ralph batches, then auto-generates the next PRD when done
# Usage: ./ralph-grow.sh [max_batches] [stories_per_iteration]
#
# Example: ./ralph-grow.sh 3 25
#   Runs 3 batches of 25 iterations each (up to 75 stories total)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
MAX_BATCHES="${1:-3}"
MAX_ITERATIONS="${2:-25}"
BATCH_NUM=1

echo "============================================="
echo "  Ralph Growth Engine"
echo "  Project: $(basename "$PROJECT_DIR")"
echo "  Max batches: $MAX_BATCHES"
echo "  Max iterations per batch: $MAX_ITERATIONS"
echo "============================================="

while [ $BATCH_NUM -le $MAX_BATCHES ]; do
  echo ""
  echo "============================================="
  echo "  BATCH $BATCH_NUM of $MAX_BATCHES"
  echo "============================================="

  # Check if prd.json exists and has incomplete stories
  if [ ! -f "$SCRIPT_DIR/prd.json" ]; then
    echo "No prd.json found. Generating new PRD..."

    # Use Claude to analyze the codebase and generate a new PRD
    cd "$PROJECT_DIR"
    claude --dangerously-skip-permissions --print <<'GENERATE_PRD' > "$SCRIPT_DIR/prd.json.tmp" 2>/dev/null
You are a game designer and backend architect for Gogo Arabic, an Arabic learning RPG.

Your job: analyze the current codebase and generate a fresh prd.json with 15-20 new stories for Ralph to build.

## Rules
- Stories must be SMALL — one context window each
- NO visual/rendering/Phaser scene changes
- NO touching the loading screen
- Focus on: backend APIs, game logic, content data, middleware, services, tests
- Each story must have clear acceptance criteria including "npm run test:run && npm run lint && npm run build passes"
- Branch name format: ralph/growth-auto-YYYY-MM-DD

## What to build (pick from these areas, mix it up):
1. **New backend API endpoints** — the server only has 6 endpoints, there's massive room to grow
2. **New content data files** — vocabulary collections, cultural facts, NPC dialogues, quest chains, lore entries
3. **Game logic services** — quest generation, difficulty scaling, reward distribution, economy balancing
4. **Middleware** — event automation, relationship consequences, progression triggers
5. **Tests for untested code** — server controllers, Redux slices, middleware
6. **Data integration** — wire disconnected systems together (e.g., crafting + vocabulary, battles + skill trees)

## Steps
1. Read the existing scripts/ralph/progress.txt to see what's already been built
2. Check server/src/routes/ for existing endpoints
3. Check server/src/models/ for existing models
4. Check src/store/slices/ for slice names
5. Check src/data/ for existing content files
6. Generate a prd.json with 15-20 NEW stories that build on what exists

Output ONLY valid JSON — no markdown, no explanation. Just the prd.json content.
GENERATE_PRD

    # Validate the generated JSON
    if jq empty "$SCRIPT_DIR/prd.json.tmp" 2>/dev/null; then
      mv "$SCRIPT_DIR/prd.json.tmp" "$SCRIPT_DIR/prd.json"
      echo "Generated new PRD with $(jq '.userStories | length' "$SCRIPT_DIR/prd.json") stories"
    else
      echo "ERROR: Generated invalid JSON. Falling back to growth PRD."
      rm -f "$SCRIPT_DIR/prd.json.tmp"

      # Fall back to the pre-built growth PRD if it exists
      if [ -f "$SCRIPT_DIR/prd-growth.json" ]; then
        cp "$SCRIPT_DIR/prd-growth.json" "$SCRIPT_DIR/prd.json"
        echo "Using prd-growth.json as fallback"
      else
        echo "No fallback PRD available. Stopping."
        exit 1
      fi
    fi
  fi

  # Count remaining stories
  REMAINING=$(jq '[.userStories[] | select(.passes == false)] | length' "$SCRIPT_DIR/prd.json" 2>/dev/null || echo "0")

  if [ "$REMAINING" -eq 0 ]; then
    echo "All stories in current PRD are complete."

    # Archive the completed PRD
    ARCHIVE_DIR="$SCRIPT_DIR/archive"
    mkdir -p "$ARCHIVE_DIR"
    DATE=$(date +%Y-%m-%d-%H%M)
    BRANCH=$(jq -r '.branchName // "unknown"' "$SCRIPT_DIR/prd.json" | sed 's|^ralph/||')
    cp "$SCRIPT_DIR/prd.json" "$ARCHIVE_DIR/$DATE-$BRANCH-prd.json"
    [ -f "$SCRIPT_DIR/progress.txt" ] && cp "$SCRIPT_DIR/progress.txt" "$ARCHIVE_DIR/$DATE-$BRANCH-progress.txt"
    echo "Archived completed batch to $ARCHIVE_DIR/"

    # Remove prd.json so next iteration generates a new one
    rm "$SCRIPT_DIR/prd.json"

    # Reset progress file for next batch (keep codebase patterns)
    if [ -f "$SCRIPT_DIR/progress.txt" ]; then
      # Preserve the Codebase Patterns section, reset the rest
      PATTERNS=$(sed -n '/^## Codebase Patterns/,/^---$/p' "$SCRIPT_DIR/progress.txt" 2>/dev/null || echo "")
      echo "# Ralph Progress Log — Gogo Arabic" > "$SCRIPT_DIR/progress.txt"
      echo "Batch started: $(date)" >> "$SCRIPT_DIR/progress.txt"
      echo "" >> "$SCRIPT_DIR/progress.txt"
      if [ -n "$PATTERNS" ]; then
        echo "$PATTERNS" >> "$SCRIPT_DIR/progress.txt"
      else
        echo "## Codebase Patterns" >> "$SCRIPT_DIR/progress.txt"
        echo "---" >> "$SCRIPT_DIR/progress.txt"
      fi
    fi

    BATCH_NUM=$((BATCH_NUM + 1))
    continue
  fi

  echo "Running Ralph — $REMAINING stories remaining..."

  # Run Ralph
  cd "$PROJECT_DIR"
  "$SCRIPT_DIR/ralph.sh" --tool claude "$MAX_ITERATIONS" || true

  # Check if all stories completed
  REMAINING_AFTER=$(jq '[.userStories[] | select(.passes == false)] | length' "$SCRIPT_DIR/prd.json" 2>/dev/null || echo "0")

  if [ "$REMAINING_AFTER" -gt 0 ]; then
    echo ""
    echo "WARNING: Ralph hit max iterations with $REMAINING_AFTER stories remaining."
    echo "Continuing to next batch generation anyway..."
  fi

  BATCH_NUM=$((BATCH_NUM + 1))
done

echo ""
echo "============================================="
echo "  Ralph Growth Engine complete"
echo "  Ran $((BATCH_NUM - 1)) batches"
echo "  Check git log for all changes"
echo "============================================="
