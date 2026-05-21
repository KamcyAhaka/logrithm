---
name: logrithm-firebase
description: Firebase and Firestore conventions for the Logrithm project. Use when working with Firebase Auth, Firestore collections, security rules, demo mode, user profiles, plan field, or the shareable insights card. Apply whenever reading or writing Firestore, checking auth state, or adding new collections.
---

# Logrithm — Firebase & Firestore

## GCP Project

Project ID : logrithm-ai
Region : us-central1 (all services)

Already provisioned — do not recreate:
Firebase Auth, Firestore, Cloud Functions, Cloud Run,
Artifact Registry, Secret Manager, Service Account

## Firebase Client Init

File: src/lib/firebase.ts — always import from here, never reinitialise.
Emulator connection already handled via NEXT_PUBLIC_USE_EMULATOR guard:

if (
typeof window !== 'undefined' &&
process.env.NODE_ENV === 'development' &&
process.env.NEXT_PUBLIC_USE_EMULATOR === 'true'
) {
connectFunctionsEmulator(functions, 'localhost', 5001);
}

Export: app, auth, db, functions

## Firestore Data Model

users/{uid}/
profile: {
githubLogin : string
displayName : string
avatarUrl : string
createdAt : ISO string
plan : 'free' ← hardcode free, pro comes later
isPublic : false ← controls /share/[username] visibility
}
tokens/github: {
accessToken : string
updatedAt : ISO string
}
insights/
latest: {
data : InsightObject
generatedAt : ISO string
}
history/{YYYY-MM}: { ← Phase 2, written by scheduler
data : InsightObject
generatedAt : ISO string
}
snapshots/{YYYY-MM-DD}: { ← Phase 2, raw GitHub data cache
activity : GitHubActivity
capturedAt : ISO string
}

Always write plan: 'free' and isPublic: false on new user profile.
Scaffold history/ and snapshots/ in the data model now — nothing
writes to them until Phase 2.

## Security Rules

users/{uid}/\*\* → read/write only if request.auth.uid == uid
No public reads via client SDK.

/share/[username] reads Firestore server-side via admin SDK — this
bypasses security rules safely and is intentional.

## Demo Mode

Activated by NEXT_PUBLIC_DEMO_MODE=true OR ?demo query param.

- Skip Firebase Auth entirely
- Use DUMMY_GITHUB_DATA and DUMMY_INSIGHTS from src/lib/demoData.ts
- Show <DemoBanner /> at top of dashboard
- Login page: "Try the Demo →" → /dashboard?demo

useDemoMode hook is the single source of truth:

'use client'
import { useSearchParams } from 'next/navigation'

export const useDemoMode = () => {
const searchParams = useSearchParams()
return (
process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ||
searchParams.has('demo')
)
}

Always use this hook — never check env vars directly in components.
Wrap consumers in <Suspense> boundary.

## Shareable Insights Route

Route: /share/[username] — public, no auth required.

- Server Component reads Firestore via admin SDK
- Check profile.isPublic === true before rendering
- If false or user not found → "No public insights for @{username}"
- Renders <ShareCard /> client component
- ShareCard captures PNG via html2canvas (scale: 2, bg: #0a0a0a)
- Buttons outside card div: "Download PNG" + "Copy link"
- isPublic defaults to false — user must opt in via settings (Phase 2)
