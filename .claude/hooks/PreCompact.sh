#!/usr/bin/env bash
# PreCompact — lưu trạng thái trước khi nén context

SNAPSHOT_FILE=".claude/session-snapshot.md"

{
  echo "# Session Snapshot — $(date '+%Y-%m-%d %H:%M')"
  echo ""
  echo "## Git status"
  git status --short 2>/dev/null
  echo ""
  echo "## Recent commits"
  git log --oneline -5 2>/dev/null
  echo ""
  echo "## Open files (staged)"
  git diff --name-only --cached 2>/dev/null
} > "$SNAPSHOT_FILE"

echo "Snapshot saved to $SNAPSHOT_FILE"
