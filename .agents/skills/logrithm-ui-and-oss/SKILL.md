---
name: logrithm-ui-and-oss
description: UI conventions, component patterns, and open source contribution guidelines for the Logrithm project. Use when building or modifying React components, writing styles, working on the dashboard layout, adding UI features, reviewing pull requests, or onboarding contributors. Apply whenever the task involves frontend code, design decisions, or anything a contributor might touch.
---

# Logrithm — UI Conventions & Open Source

## Design System

Theme: dark background, green primary accent, monospace for developer feel.

Background : #0a0a0a (page), slightly lighter for cards
Primary : #1D9E75 (green)
Text : white/70 (body), white/40 (secondary), white/20 (muted)
Border : white/10 (standard), white/5 (subtle)
Fonts : JetBrains Mono (wordmark, code, pills), system sans (body)

Cards: rounded-3xl, glass-card class.
Buttons: hover:scale-105 active:scale-95 transitions.

## Wordmark Treatment

"logrithm" in JetBrains Mono:
"log" — normal weight
"r" — #1D9E75 green
"ithm" — normal weight

Apply consistently in Navbar and Login page.

## Dashboard Layout

Row 1: StatsCard × 4 (Total Commits 12mo, PRs Merged, Open Issues, Active Repos)
Row 2: CommitChart (2/3) | LanguageBreakdown (1/3)
Row 3: ActivityHeatmap full width
Row 4: InsightPanel (60%) | RepoList (40%)

CommitChart : area/line chart, last 30 days, green fill, JetBrains Mono axes
LanguageBreakdown : donut chart with legend showing language + count
ActivityHeatmap : GitHub grid style, green intensity, Less→More legend
RepoList : repo name, language dot + name, commit count, star + fork counts

## InsightPanel States

1. Empty — centered card, Terminal icon, "Ready for analysis" heading,
   "Run the algorithm" primary button
2. Loading — <InsightSkeleton /> with animate-pulse shimmer blocks
3. Loaded — @username heading, "Generated just now" subtitle,
   score pill (score: {n}), summary paragraph,
   tags as uppercase pills, topLanguages as green pills,
   "Share insight ↗" button

## Tags Display Rule

Tags come directly from InsightObject.tags — never derive them from
strengths or improvements sentences. This was a previous bug and is fixed.
Render as: uppercase tracking-wider text, rounded-full pills, bg white/5.

## ShareCard Component

'use client' — uses useRef for html2canvas capture.

Card div (captured as PNG):

- Avatar img + @username + "Logrithm analysis" subtitle
- Score pill top right
- Summary paragraph
- Tags pills row
- Top languages pills row
- Footer: "logrithm.dev" left, generation month right

Buttons OUTSIDE card div (not in PNG capture):

- "Download PNG" → html2canvas(cardRef.current, { backgroundColor: '#0a0a0a', scale: 2 })
- "Copy link" → navigator.clipboard.writeText(shareUrl)

Install: bun add html2canvas

## 'use client' Rules

Required on components using:

- Any React hook
- onClick, onChange, or any event handler
- Browser APIs (window, navigator, document)
- Recharts
- html2canvas

Prefer Server Components where no interactivity is needed.

## Suspense Boundaries

Any component using useDemoMode (which uses useSearchParams) must be
wrapped in <Suspense> in its parent page.

## OSS & Collaboration Awareness

The GitHub activity being analyzed may include:

- Contributions to other people's repos (forks, upstream PRs)
- OSS maintainer activity (reviewing PRs, triaging issues, merging)
- Private repo contributions (counts visible, repo names may not be)
- Forked repos — should be distinguishable from original repos in UI

When building UI that displays activity data, account for:

- Users with high PR counts but low personal repo commits
  (OSS contributors, reviewers, maintainers — not low productivity)
- Users whose primary activity is private repos
- Forked repos inflating repo counts

The Gemini prompt already includes OSS context — do not remove it.

## Open Source Code Standards

Written for external contributors — always:

- TypeScript, no implicit any (add comment if any is unavoidable)
- Loading + error states for every async operation
- Mobile responsive — sm: md: lg: Tailwind prefixes
- No hardcoded strings that should be env vars or constants
- Meaningful variable names

## README Requirements

- "Try the live demo" link → /dashboard?demo
- First contributor step: zero config demo
  bun install
  bun run dev
- All three dev modes documented
- Architecture diagram
- GitHub OAuth setup
- GCP Secret Manager setup
- Contributing section
- MIT License

## PR Review Checklist

[ ] No npm/yarn/npx — full bun path used
[ ] No VITE\_ env prefixes
[ ] 'use client' present where needed, absent where not
[ ] No hardcoded secrets
[ ] Loading and error states for async operations
[ ] Mobile responsive
[ ] Brand voice in UI copy
[ ] Tags not derived from strengths/improvements sentences
[ ] No Gemini calls without cache check
