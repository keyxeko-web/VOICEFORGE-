@AGENTS.md

# VoiceForge AI — Codebase Guide

## Architecture

Single-package Next.js 16 app (no separate frontend/backend repos). The Python FastAPI backend (`/backend/`) is only used for local development and is **not deployed** — the deployed app is a purely static Next.js export hosted on GitHub Pages.

```
/                          # Next.js 16 root (App Router)
├── app/
│   ├── page.tsx           # Redirects / → /tts
│   ├── tts/page.tsx       # Main TTS UI (Web Speech API + download)
│   └── api/tts/route.ts   # Local-only API: espeak-ng → ffmpeg → MP3
├── android/               # Capacitor Android project (committed)
├── backend/               # Python FastAPI (local dev only, not deployed)
├── .github/workflows/
│   ├── deploy.yml         # GitHub Pages static export
│   └── android-apk.yml    # Debug APK via Capacitor
├── capacitor.config.ts    # appId: app.voiceforge.ai, webDir: out
└── next.config.ts         # Conditional static export + PWA
```

## Running the App

```bash
npm run dev          # Local dev server (port 3000) — API routes work
npm run build        # Standard server build
NEXT_EXPORT=1 npm run build  # Static export to out/ (for GitHub Pages & Android)
npm run android      # Static build + cap sync android (requires Android SDK)
```

**Do not set `output: "export"` in next.config.ts.** It is toggled at runtime via `NEXT_EXPORT=1`. Without that env var the build runs in server mode and `app/api/` routes are available.

## Static Export vs Server Mode

| Mode | Trigger | Output | API routes |
|------|---------|--------|------------|
| Server | `npm run dev` / `npm run build` | `.next/` | ✅ Available |
| Static | `NEXT_EXPORT=1 npm run build` | `out/` | ❌ Excluded |

The TTS download button (`Tải MP3`) detects which mode it's in:
1. Tries `POST /api/tts` (espeak-ng + ffmpeg, works in server mode)
2. Falls back to opening a Google Translate TTS URL in a new tab (≤200 chars, works on GitHub Pages and Android)

## Vietnamese Voice Variants

`VI_VOICES` in `app/tts/page.tsx` maps 7 voice IDs to Web Speech API config:

| id | espeak-ng voice | BCP-47 lang | pitchDelta |
|----|----------------|-------------|------------|
| `vi` | `vi` | `vi-VN` | 0 |
| `vi-central` | `vi-vn-x-central` | `vi-VN-x-central` | 0 |
| `vi-south` | `vi-vn-x-south` | `vi-VN-x-south` | 0 |
| `vi+m1` | `vi+m1` | `vi-VN` | -0.3 |
| `vi+m2` | `vi+m2` | `vi-VN` | -0.5 |
| `vi+f1` | `vi+f1` | `vi-VN` | +0.3 |
| `vi+f2` | `vi+f2` | `vi-VN` | +0.5 |

`pitchDelta` is added to the current pitch slider value before passing to `SpeechSynthesisUtterance.pitch`. On Android there is typically only one `vi-VN` voice, so the delta provides the audible difference between variants.

`VOICE_MAP` in `app/api/tts/route.ts` maps the same IDs to espeak-ng voice strings for server-side MP3 generation.

## API Route (`app/api/tts/route.ts`)

`POST /api/tts` body: `{ text, voice?, speed?, pitch? }`

- Runs `espeak-ng -v <voice> -s <wpm> -p <0-99> -w <tmp.wav> <text>`
- Converts with `ffmpeg -codec:a libmp3lame -qscale:a 4`
- Returns `audio/mpeg` with `Content-Disposition: attachment`
- Uses `spawn()` (never `exec()`) — no shell injection risk
- Requires `espeak-ng` and `ffmpeg` installed on the server

## Android APK

Capacitor 8 wraps the static export as a WebView app.

```bash
# One-shot local build (requires Android SDK + JDK 17)
npm run android
# Then open in Android Studio:
npm run android:open
```

GitHub Actions builds a debug APK on every push to `main` — download from the Actions → Artifacts tab.

For a Play Store release, you need to:
1. Generate a keystore and base64-encode it
2. Add secrets: `KEYSTORE_BASE64`, `KEY_ALIAS`, `KEY_PASSWORD`, `STORE_PASSWORD`
3. Uncomment the signed release section in `.github/workflows/android-apk.yml`

## CI/CD

**`deploy.yml`** — triggers on push to `main` or `claude/add-claude-documentation-RLEku`:
- Node 22 (required by `@capacitor/cli@8`)
- `NEXT_EXPORT=1 npm run build` → uploads `out/` to GitHub Pages

**`android-apk.yml`** — triggers on push to `main` or manual dispatch:
- Node 22 + JDK 17 + Android SDK
- Verifies `out/index.html` exists before `cap sync android`
- Uploads `app-debug.apk` as artifact (30-day retention)

## Key Dependencies

- `next@16.2.4` — App Router, React 19 compat (see AGENTS.md for breaking changes)
- `@ducanh2912/next-pwa@10` — PWA service worker
- `@capacitor/android@8.3.1` — Android WebView wrapper
- `framer-motion@12` — UI animations
- `@react-three/fiber` + `three` — 3D background effects

## What Lives in the Python Backend

`/backend/` is a FastAPI project with multi-engine TTS (Coqui, Piper, Google Cloud, Azure, AWS Polly), voice cloning, user auth, and SQLite DB. It is **not wired to the Next.js frontend** in the current deployment — it exists as a server-side upgrade path if the app ever moves off GitHub Pages.
