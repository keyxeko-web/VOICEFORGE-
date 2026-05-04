#!/usr/bin/env bash
# SessionStart — tải ngữ cảnh dự án khi khởi động session

echo "=== VoiceForge AI — Session Start ==="
echo "Branch: $(git branch --show-current 2>/dev/null)"
echo "Last commit: $(git log --oneline -1 2>/dev/null)"
echo "Status:"
git status --short 2>/dev/null | head -10
echo ""
echo "Gợi ý lệnh:"
echo "  npm run dev          → dev server port 3000"
echo "  NEXT_EXPORT=1 npm run build → static export cho GitHub Pages"
echo "  npm run android      → build APK (cần Android SDK)"
