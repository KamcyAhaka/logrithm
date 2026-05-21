---
name: logrithm-conventions
description: Core conventions for the Logrithm project. Use this skill for every task in this codebase — it defines the package manager, environment variables, dev modes, project structure, and hard rules that must never be violated. Apply whenever touching any file in this project regardless of task type.
---

# Logrithm — Core Conventions

## What This Project Is

Logrithm is an open-source web app that connects to a user's GitHub account,
fetches their commit history via the GitHub GraphQL API, and uses Google Gemini
to generate AI-powered insights about their development patterns.

Tagline: "Your commit history. Analyzed."
License: MIT — open to external contributors.

Brand voice — intelligent, developer-native, slightly witty. Never generic:
Loading → "Running the algorithm..."
Error → "The log is empty. Try again."
Success → "Algorithm complete."

## CRITICAL: Bun Path

Bun must always be called via its full path: bun
Never use npm, npx, yarn, or bare bun commands.

bun install
bun run dev
bunx create-next-app@latest

## Tech Stack

Frontend + SSR : Next.js 16, App Router, TypeScript
Styling : Tailwind CSS v4
Charts : Recharts
Package manager: bun
Auth : Firebase Auth — GitHub OAuth provider
Database : Firestore
Backend : Firebase Cloud Functions Gen 2 — Node.js + TypeScript
AI : Google Gemini via @google/generative-ai
Secrets : GCP Secret Manager
Hosting : Firebase Hosting + Cloud Run
CI/CD : GitHub Actions → Cloud Build → Firebase + Cloud Run

## Project Structure

logrithm/
├── .agents/skills/ # Antigravity skills — DO NOT TOUCH
├── src/
│ ├── app/
│ │ ├── layout.tsx
│ │ ├── page.tsx # Login / landing (/)
│ │ ├── globals.css
│ │ ├── dashboard/page.tsx # Dashboard (/dashboard)
│ │ └── share/[username]/page.tsx # Public shareable card
│ ├── components/
│ │ ├── layout/ # Navbar, DemoBanner
│ │ ├── dashboard/ # StatsCard, CommitChart, LanguageBreakdown,
│ │ │ # ActivityHeatmap, RepoList
│ │ ├── insights/ # InsightPanel, InsightSkeleton
│ │ └── share/ # ShareCard
│ ├── hooks/ # useAuth, useGitHubActivity,
│ │ # useInsights, useDemoMode
│ ├── lib/
│ │ ├── firebase.ts # Firebase client SDK — import only from here
│ │ ├── functions.ts # Callable function wrappers
│ │ └── demoData.ts # Dummy data — NOT real user data
│ └── types/github.ts
├── functions/
│ ├── src/
│ │ ├── github/fetchActivity.ts
│ │ ├── insights/generateInsights.ts
│ │ ├── scheduler/runBackgroundAnalysis.ts # stub only, Phase 2
│ │ ├── secrets/getSecret.ts
│ │ └── index.ts
│ └── .env.local # GEMINI_API_KEY for local dev only
├── Dockerfile
├── next.config.ts # output: standalone
├── firebase.json
└── firestore.rules

## Environment Variables

All client-side vars use NEXT*PUBLIC* prefix — never VITE\_:

NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_DEMO_MODE # true = full demo, no Firebase needed
NEXT_PUBLIC_USE_EMULATOR # true = hit local emulator on port 5001

GEMINI_API_KEY belongs in functions/.env.local (local) or GCP Secret
Manager (production). Never in the root .env or .env.local.

## Dev Modes

bun run dev # Demo mode — no Firebase
bun run dev:live # Live Firebase — production functions
bun run dev:emulator # Live Firebase — local emulator

For emulator mode — 3 terminals:
Terminal 1: cd functions && bun run build --watch
Terminal 2: firebase emulators:start --only functions
Terminal 3: bun run dev:emulator

## Next.js App Router Rules

- Every component using hooks, state, onClick, or browser APIs needs 'use client'
- Server Components cannot import firebase/auth or browser-only libraries
- Recharts components must be 'use client'
- useSearchParams() requires a Suspense boundary in the parent
- Never reinitialise Firebase — always import from src/lib/firebase.ts

## What NOT To Do

- Never use npm, npx, or yarn — always use bun ONLY
- Never use VITE\_ env prefix
- Never hardcode API keys or secrets
- Never add connectFunctionsEmulator without NEXT_PUBLIC_USE_EMULATOR guard
- Never reinitialise Firebase — import from src/lib/firebase.ts
- Never put GEMINI_API_KEY in the root .env
- Never increase Cloud Run max instances above 5
