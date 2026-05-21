# Logrithm — Your commit history. Analyzed.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-Auth+Firestore-orange?logo=firebase)](https://firebase.google.com)
[![Cloud Run](https://img.shields.io/badge/Cloud_Run-GCP-blue?logo=google-cloud)](https://cloud.google.com/run)
[![Bun](https://img.shields.io/badge/Bun-package_manager-black?logo=bun)](https://bun.sh)
[![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-purple?logo=google)](https://ai.google.dev)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> Connect your GitHub. Logrithm reads your activity log and runs the algorithm — surfacing patterns, strengths, and blind spots you didn't know were there.

**[Try the live demo →](https://logrithm.dev/dashboard?demo)**

---

## Architecture

```
Browser
  ↓
Firebase Hosting (CDN, static assets)
  ↓ rewrite
Cloud Run (Next.js 16 SSR — max 5 instances)
  ↓
Firebase Auth ← GitHub OAuth
Firestore (insights cache, user profiles)
Cloud Functions Gen 2 → GitHub GraphQL API
                       → Gemini 2.5 Flash (via GCP Secret Manager)
```

---

## Quick Start (Zero Config)

The demo runs with **no Firebase account, no API keys, no `.env.local`**:

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **"Try the Demo →"**.

---

## Dev Modes

| Command                | Description                                     |
| ---------------------- | ----------------------------------------------- |
| `bun run dev`          | **Demo mode** — sample data, no Firebase needed |
| `bun run dev:live`     | Live Firebase — needs `.env.local`              |
| `bun run dev:emulator` | Local emulator — run functions locally          |

### Emulator mode (3 terminals)

```bash
# Terminal 1 — compile functions in watch mode
cd functions && bun run build:watch

# Terminal 2 — start Firebase emulator
firebase emulators:start --only functions

# Terminal 3 — start Next.js with emulator flag
bun run dev:emulator
```

---

## Setup for Live Mode

### 1. Clone & install

```bash
git clone https://github.com/your-org/logrithm.git
cd logrithm
bun install
cd functions && bun install
```

### 2. Create `.env.local` (root)

Copy `.env.example` to `.env.local` and fill in your Firebase project values:

```bash
cp .env.example .env.local
```

Get values from [Firebase Console → Project Settings → General → Your apps](https://console.firebase.google.com).

### 3. GitHub OAuth App

1. Go to [GitHub Developer Settings → OAuth Apps](https://github.com/settings/developers)
2. Create a new OAuth App:
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: your Firebase Auth redirect URL
3. Copy the Client ID and Secret into Firebase Console → Authentication → GitHub

### 4. GEMINI_API_KEY (local dev)

Create `functions/.env.local` (gitignored):

```bash
GEMINI_API_KEY=your-key-here
```

Get a key from [Google AI Studio](https://aistudio.google.com/app/apikey).

> In production, the key is read from GCP Secret Manager automatically. Never put it in the root `.env`.

### 5. GCP Secret Manager (production)

```bash
echo -n "your-gemini-key" | gcloud secrets create GEMINI_API_KEY \
  --data-file=- \
  --project=logrithm-ai
```

Grant the Cloud Functions service account access:

```bash
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:logrithm-ai@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## CI/CD

Push to `main` triggers the full deploy pipeline:

1. Build Next.js (`output: standalone`)
2. Build Docker image → push to Artifact Registry
3. Deploy to Cloud Run (`--max-instances 5` — hard cap, never change)
4. Deploy Cloud Functions + Firestore rules
5. Deploy Hosting

Required GitHub Secrets: `GOOGLE_CREDENTIALS`, `FIREBASE_SERVICE_ACCOUNT`, and all `NEXT_PUBLIC_FIREBASE_*` vars.

---

## Project Structure

```
logrithm/
├── src/
│   ├── app/                   # Next.js App Router pages
│   ├── components/            # React components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Firebase, demo data, function wrappers
│   └── types/                 # TypeScript interfaces
├── functions/
│   └── src/                   # Cloud Functions (Gen 2)
│       ├── github/            # fetchGitHubActivity
│       ├── insights/          # generateInsights (Gemini)
│       ├── scheduler/         # Phase 2 stub
│       └── secrets/           # GCP Secret Manager wrapper
├── Dockerfile                 # Cloud Run image
├── firebase.json              # Hosting + Functions config
└── firestore.rules            # Security rules
```

---

## Contributing

1. Fork the repo
2. Start with `bun install && bun run dev` — demo mode requires zero config
3. Make your changes
4. Run `bun run build` to verify TypeScript
5. Open a PR

**PR checklist:**

- [ ] No `npm`/`yarn`/`npx` — use `bun` everywhere
- [ ] `'use client'` present where needed (hooks, browser APIs, Recharts)
- [ ] Loading and error states for all async operations
- [ ] Mobile responsive (Tailwind `sm:` / `md:` / `lg:` prefixes)
- [ ] No hardcoded secrets
- [ ] `bun run dev` still works with zero config

---

## License

MIT — see [LICENSE](LICENSE).

Built with ❤️ using Next.js, Firebase, Gemini, and Bun.
