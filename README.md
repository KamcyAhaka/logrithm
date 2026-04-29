# Logrithm — Your commit history. Analyzed.

[![Demo](https://img.shields.io/badge/demo-live-blueviolet)](https://logrithm.web.app/?demo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Logrithm is an AI-powered GitHub activity analyzer that helps developers understand their contribution patterns, strengths, and areas for improvement. Built with Next.js, Firebase, and Google Gemini.

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Charts**: Recharts
- **Backend**: Firebase Cloud Functions (Gen 2), Node.js
- **Auth**: Firebase Auth + GitHub OAuth
- **Database**: Firestore
- **AI**: Google Gemini 2.5 Flash
- **Deployment**: Firebase Hosting + Google Cloud Run (SSR)
- **Runtime**: Bun

## 🏗️ Architecture

```text
    Browser
      ↓
    Firebase Hosting (CDN, static assets)
      ↓ rewrite
    Cloud Run (Next.js SSR server)
      ↓
    Firebase Auth ← GitHub OAuth
    Firestore (cache)
    Cloud Functions → GitHub GraphQL API
                    → Gemini API (via Secret Manager)
```

## 🛠️ Local Setup

1. **Clone and Install**
   ```bash
   bun install
   ```

2. **Run in Demo Mode** (Zero Config)
   ```bash
   bun run dev
   ```
   Navigate to `http://localhost:3000/?demo`

3. **Production Setup**
   - Copy `.env.example` to `.env.local` and fill in Firebase config.
   - Set up [GitHub OAuth](https://github.com/settings/developers) apps.
   - Deploy functions: `cd functions && bun run deploy`
   - Set up GCP Secret Manager for `GEMINI_API_KEY`.

## 🚢 Deployment

The project uses a standalone Docker build for Cloud Run.

```bash
docker build -t logrithm .
# Push to Artifact Registry and deploy to Cloud Run
```

## 📄 License

MIT © [Logrithm Team]
