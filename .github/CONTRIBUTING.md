# Contributing to Logrithm

Thanks for your interest in contributing! This document covers the branching strategy, commit conventions, and release process.

## Branching strategy

Logrithm uses a **parallel branch** model with two release channels:

| Branch   | Purpose                    | Release type                     |
| -------- | -------------------------- | -------------------------------- |
| `main`   | Stable production releases | `v1.0.1`, `v1.1.0`, `v2.0.0`     |
| `beta`   | Prerelease staging         | `v1.0.1-beta.1`, `v1.0.1-beta.2` |
| `feat/*` | Active feature development | `v1.0.1-feat-xyz.1` (dev only)   |

### The parallel model

`beta` and `main` are **parallel channels** — you never merge `beta` into `main`.

Instead, each feature or fix branch targets both channels independently:

```
feat/your-feature
    │
    ├── PR → beta    (test as a prerelease first)
    │
    └── PR → main    (promote to stable when ready)
```

This keeps `main`'s linear history clean and gives semantic-release accurate commit messages on both branches.

### Merge strategy — rebase and merge only

Both `beta` and `main` enforce **linear commit history**. Always use **Rebase and merge** when landing PRs — never squash or merge commit.

> Why rebase over squash? semantic-release reads individual commit messages to determine version bumps. Rebase preserves every `fix:` and `feat:` commit so the version calculation is always accurate.

## Commit message format

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) spec. Every commit must be formatted as:

```
<type>(<optional scope>): <short description>

<optional body>

<optional footer — e.g. Closes #42>
```

### Types and their version impact

| Type              | Description                          | Version bump  |
| ----------------- | ------------------------------------ | ------------- |
| `fix`             | Bug fix                              | Patch `1.0.x` |
| `feat`            | New feature                          | Minor `1.x.0` |
| `BREAKING CHANGE` | Breaking API change (in footer)      | Major `x.0.0` |
| `chore`           | Tooling, config, maintenance         | None          |
| `docs`            | Documentation only                   | None          |
| `refactor`        | Code change with no behaviour change | None          |
| `test`            | Adding or updating tests             | None          |
| `perf`            | Performance improvement              | None          |

### Examples

```
fix: show dash placeholder when current streak is zero

Closes #8
```

```
feat: add wrapped share card variant

Adds a year-in-review style card showing total commits, active repos
and top languages for the sharing page.
```

```
feat!: change insight API response shape

BREAKING CHANGE: InsightObject.tags is now string[] instead of Tag[].
Consumers must update to access tag.label directly.
```

## Workflow

### Working on a bug fix or feature

```bash
# Start from an up-to-date main
git checkout main && git pull

# Create your branch
git checkout -b fix/your-description
# or
git checkout -b feat/your-description

# Make your changes with conventional commits
git commit -m "fix: correct the thing that was wrong"

# Push and open a PR to beta first
git push -u origin fix/your-description
# Open PR: fix/your-description → beta

# Once merged to beta and the prerelease looks good,
# open a second PR targeting main
# Open PR: fix/your-description → main
```

### Release flow

Releases are fully automated via [semantic-release](https://semantic-release.gitbook.io/) — no manual tagging or version bumping.

- Merging to **`beta`** → creates a prerelease tag (e.g. `v1.0.1-beta.1`) and updates `CHANGELOG.md`
- Merging to **`main`** → creates a stable release tag (e.g. `v1.0.1`) and updates `CHANGELOG.md`

The `chore(release): x.x.x [skip ci]` commit you see in the history is pushed back automatically by the release bot — do not revert it.

## Local setup

```bash
# Clone and install (uses Bun)
git clone https://github.com/KamcyAhaka/logrithm.git
cd logrithm
bun install

# Run in demo mode (no Firebase account needed)
bun dev

# Run against live Firebase (requires .env.local)
bun dev:live
```

See `README.md` for full environment variable setup.
