#!/usr/bin/env bash
# PostToolUse — tự động stage file vừa sửa (KHÔNG commit — Claude tự commit khi xong task)
# Chạy sau mỗi lần Edit / Write

TOOL="$CLAUDE_TOOL_NAME"
FILE="$CLAUDE_TOOL_INPUT_file_path"

if [[ -n "$FILE" && -f "$FILE" ]]; then
  git add "$FILE" 2>/dev/null || true
fi
