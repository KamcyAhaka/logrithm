---
name: logrithm-conventions
description: Core conventions for the Logrithm project. Use this skill for every task in this codebase — it defines the package manager, environment variables, dev modes, project structure, and rules that must never be violated. Apply whenever touching any file in this project.
---

# Logrithm — Core Conventions

## What This Project Is

Logrithm is an open-source web app that connects to a user's GitHub account,
fetches their commit history via the GitHub GraphQL API, and uses Google Gemini
to generate AI-powered insights about their development patterns.

Tagline: **"Your commit history. Analyzed."**

Brand voice — intelligent, developer-native, slightly witty. Never generic:
- Loading → "Running the algorithm..."
- Error   → "The log is empty. Try again."
- Success → "Algorithm complete."

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend + SSR | Next.js 14, App Router, TypeScript |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Package manager | **Bun** — always, no exceptions |
| Auth | Firebase Auth — GitHub OAuth |
| Database | Firestore |
| Backend | Firebase Cloud Functions Gen 2 — Node.js + TypeScript |
| AI | Google Gemini via @google/generative-ai |
| Secrets | GCP Secret Manager |
| Hosting | Firebase Hosting + Cloud Run |

---

## Package Manager — Bun Always

Never use npm, npx, or yarn. Always Bun:

```bash
bun install          # never npm install
bun run <script>     # never npm run
bunx <tool>          # never npx
```

---

## Project Structure

```
logrithm/
├── .agents/skills/              # Antigravity skills live here
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx             # Login / landing (/)
│   │   ├── dashboard/page.tsx   # Dashboard (/dashboard)
│   │   └── share/[username]/    # Public shareable card
│   ├── components/
│   │   ├── layout/              # Navbar, DemoBanner
│   │   ├── dashboard/           # ActivityHeatmap, CommitChart,
│   │   │                        # LanguageBreakdown, RepoList, StatsCard
│   │   └── insights/            # InsightPanel, InsightSkeleton
│   ├── hooks/                   # useAuth, useGitHubActivity,
│   │                            # useInsights, useDemoMode
│   ├── lib/
│   │   ├── firebase.ts          # Firebase client SDK — import from here only
│   │   ├── functions.ts         # Cloud Functions callable wrappers
│   │   └── demoData.ts          # Dummy data — NOT real user data
│   └── types/github.ts
├── functions/
│   ├── src/
│   │   ├── github/fetchActivity.ts
│   │   ├── insights/generateInsights.ts
│   │   ├── secrets/getSecret.ts
│   │   └── index.ts
│   └── .env.local               # GEMINI_API_KEY for local dev only
├── Dockerfile                   # Cloud Run
├── next.config.ts               # output: standalone
└── firebase.json                # Hosting + Cloud Run rewrite
```

---

## Environment Variables

All client-side vars use `NEXT_PUBLIC_` prefix — never `VITE_`:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_DEMO_MODE          # true = full demo, no Firebase needed
NEXT_PUBLIC_USE_EMULATOR       # true = hit local emulator on port 5001
```

`GEMINI_API_KEY` belongs in `functions/.env.local` (local) or GCP Secret
Manager (production). Never in the root `.env` or `.env.local`.

---

## Dev Modes

```bash
bun run dev            # Demo mode — no Firebase, uses dummy data
bun run dev:live       # Live Firebase — hits production Cloud Functions
bun run dev:emulator   # Live Firebase — hits local emulator (port 5001)
```

For emulator mode, three terminals required:
```bash
# Terminal 1 — compile functions and watch
cd functions && bun run build --watch

# Terminal 2 — run emulator
firebase emulators:start --only functions

# Terminal 3 — Next.js
bun run dev:emulator
```

---

## Next.js App Router Rules

- Every component using hooks, state, onClick, or browser APIs needs `'use client'`
- Server Components cannot import firebase/auth or browser-only libraries
- Recharts components must be `'use client'`
- `useSearchParams()` requires a Suspense boundary in the parent
- Never reinitialise Firebase — always import from `src/lib/firebase.ts`

---

## What NOT To Do

- Never use `npm`, `npx`, or `yarn`
- Never use `VITE_` env prefix
- Never hardcode API keys or secrets
- Never add `connectFunctionsEmulator` without the `NEXT_PUBLIC_USE_EMULATOR` guard
- Never add `'use client'` to a file that doesn't need it (prefer Server Components)
- Never forget `'use client'` on a file that uses hooks
- Never reinitialise Firebase — import from `src/lib/firebase.ts`
- Never put `GEMINI_API_KEY` in the root `.env`
