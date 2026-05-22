---
name: logrithm-contributor-safety
description: Contributor compatibility rules for the Logrithm codebase. Use this skill whenever adding, modifying, or refactoring any code in this project — including new features, bug fixes, dependencies, configuration changes, or Cloud Function updates. Ensures every change remains safe, reproducible, and accessible for external OSS contributors on any machine.
---

# Logrithm — Contributor Safety

## Why This Skill Exists

Logrithm is MIT-licensed and open to external contributors. Any code added
by an AI agent must work out of the box for someone who has just cloned
the repo on a fresh machine — regardless of OS, shell, or local setup.

Never add code that only works because of something specific to the current
developer's machine, environment, or accounts.

---

## Dependency Rules

### Adding new packages

- Always use: bun add <package>
- Never install a package and use it without adding it to package.json
- Always check if a package already exists in package.json before adding
- Prefer packages with zero or minimal native dependencies
  (native deps break on different OS/architectures)
- Never add a package that requires a paid account or private registry
- Check the licence of any new package — must be MIT, Apache 2.0, BSD,
  or ISC compatible. Never add GPL-licenced packages (incompatible with MIT)

### Dependency placement

- Runtime code used in src/ → "dependencies" in root package.json
- Dev tooling (linting, types, build tools) → "devDependencies"
- Cloud Function deps → functions/package.json, not root package.json
- Never cross-contaminate — root deps must not be imported in functions/
  and vice versa

---

## Environment & Secrets Rules

Never add code that assumes a specific secret, key, or credential exists
without providing a clear fallback or graceful error.

Every new environment variable must:

1. Be added to .env.example with an empty value and a comment explaining it
2. Have a fallback in code (demo data, feature flag, or graceful skip)
3. Be documented in README.md under setup instructions

Never add:

- Hardcoded API keys, tokens, or secrets anywhere
- References to specific GCP project IDs in application code
  (use process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID instead)
- Machine-specific absolute paths in any committed file
- Credentials or service account files — these must stay in .gitignore

---

## Configuration File Rules

Changes to these files affect every contributor — treat with care:

tsconfig.json

- Do not loosen strictness (no implicit any, strict must stay true)
- Do not add path aliases that aren't supported in both Next.js and
  the functions/ tsconfig

next.config.ts

- output: 'standalone' must never be removed — required for Cloud Run
- Do not add experimental features without checking Next.js 14 support

firebase.json

- Cloud Run rewrite rule must always be present
- Do not change function region from us-central1

firestore.rules

- Never relax security rules — users/{uid}/\*\* must stay uid-gated
- Never add a rule that allows public writes
- Always test rule changes against existing data model

.gitignore

- Must always include: .env.local, functions/.env.local,
  _-key.json, _.pem, firebase-debug.log, .next/, node_modules/
- Never remove existing gitignore entries

---

## Code Portability Rules

### No machine-specific paths

Never commit absolute paths. Use relative paths or environment variables:
Bad : '/Users/divine/project/logrithm'
Good : process.cwd() or relative './path'

### No OS-specific shell syntax in scripts

package.json scripts must work on Mac, Linux, and Windows (via Bun):
Bad : "script": "export VAR=true && next dev" ← fails on Windows
Good : Use cross-env if env vars needed in scripts:
bun add -D cross-env
"script": "cross-env NEXT_PUBLIC_DEMO_MODE=true next dev"

Exception: the existing dev/dev:live/dev:emulator scripts use Unix syntax
and are documented as Mac/Linux — do not change them, but do not add
new Unix-only scripts without a cross-env alternative.

### No platform-specific packages

Never add packages that only work on a specific OS or CPU architecture
without explicit fallbacks. Check the package's README for platform support.

---

## Cloud Functions Portability

### Runtime target

Functions deploy to Node.js 20 on Google Cloud. Code must be compatible
with Node.js 20 — do not use APIs introduced after Node 20.

### No local filesystem assumptions

Cloud Functions run in a stateless container. Never write to or read from
the local filesystem in function code — use Firestore or Cloud Storage.

### Timeout awareness

Default function timeout is 60 seconds. Any new function doing external
API calls (GitHub, Gemini) must handle timeout gracefully and not leave
Firestore in a partially-written state.

---

## API & External Service Rules

### GitHub API

- Always use the authenticated GraphQL endpoint with the user's own token
- Never store or log GitHub OAuth tokens in plaintext
- If adding new GraphQL fields, verify they exist in GitHub's schema first:
  https://docs.github.com/en/graphql/reference

### Gemini API

- Model must be gemini-2.5-flash for all current (free tier) users
- Never change the model without updating both the function and the UI
  copy that references it (e.g. "Gemini 2.5 Flash" in InsightPanel)
- Prompt changes must preserve the OSS contributor context note and
  the tags formatting rules — these fix known bugs

### Firebase / Firestore

- Never add a new Firestore collection without updating firestore.rules
- Never add a new field to user profiles without updating the
  TypeScript interface in src/types/github.ts
- Never change the InsightObject shape without updating:
  functions/src/insights/generateInsights.ts (Gemini prompt)
  src/types/github.ts (interface)
  src/components/insights/InsightPanel.tsx (display)
  src/lib/demoData.ts (DUMMY_INSIGHTS)
  src/app/share/[username]/page.tsx (ShareCard)

---

## Demo Mode Must Always Work

The zero-config demo is the first experience for every new contributor.
After any change, verify:

bun install && bun run dev # must work with no .env.local at all

Never add a component or page that crashes when:

- Firebase is not configured
- GEMINI_API_KEY is absent
- The user is not authenticated

Every new feature must either work in demo mode or be hidden behind
the useDemoMode check.

---

## UI & Theming Rules

Logrithm is strictly a dark-themed application ("Your commit history. Analyzed." terminal style).

- Never introduce light-themed default colors.
- Always ensure new UI components (like ShadCN components) default to dark mode by applying the `.dark` class to the root `<html>` element, or by merging dark variables directly into `:root`.
- Do not add theme toggles or light mode variants; they break the core brand aesthetic.

---

## Before Committing Any Change

Check:
[ ] bun run dev works with zero config (demo mode)
[ ] bun run build completes without TypeScript errors
[ ] No new absolute paths in committed files
[ ] No new env vars without .env.example entry and fallback
[ ] No new packages without licence check
[ ] No GPL-licenced dependencies added
[ ] firestore.rules updated if new collections added
[ ] src/types/github.ts updated if data shapes changed
[ ] DUMMY_INSIGHTS updated if InsightObject shape changed
[ ] README.md updated if setup steps changed
