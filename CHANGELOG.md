# [1.5.0](https://github.com/KamcyAhaka/logrithm/compare/v1.4.0...v1.5.0) (2026-06-10)


### Features

* add custom 404 not found page for missing routes ([1e44953](https://github.com/KamcyAhaka/logrithm/commit/1e44953e791b830d1e75acb842c456a654e61095))
* add dynamic SVG README badge component and API endpoint to privacy settings ([8b957c9](https://github.com/KamcyAhaka/logrithm/commit/8b957c9ab2d48e28e0b974c17c90ded643e39b2a))

# [1.4.0](https://github.com/KamcyAhaka/logrithm/compare/v1.3.0...v1.4.0) (2026-06-10)


### Features

* overhaul landing page with modular sections and preview assets ([6c65667](https://github.com/KamcyAhaka/logrithm/commit/6c656679fca276e3f629fd47e1c3af949cad8c28))

# [1.3.0](https://github.com/KamcyAhaka/logrithm/compare/v1.2.0...v1.3.0) (2026-06-10)


### Bug Fixes

* add auth validation to generateInsights function ([6b82de8](https://github.com/KamcyAhaka/logrithm/commit/6b82de86518b7827d2e5897ff06ec00bbe3b61b6))
* prevent layout overflow and improve text truncation in settings pages ([f860964](https://github.com/KamcyAhaka/logrithm/commit/f860964cc57e40c0ea585fb2ab60ed7d453efa9d))
* restrict slug deletion permissions to require only authentication and ownership verification ([17f14fc](https://github.com/KamcyAhaka/logrithm/commit/17f14fc374fa961288b827aed180b04e72ec43d8))


### Features

* add legal policy pages and update site footer with navigation links ([2391dec](https://github.com/KamcyAhaka/logrithm/commit/2391decf2a77662e84a76dd3418f23305db6431c))
* add ScrollToTop component to reset scroll position on route changes ([521a20b](https://github.com/KamcyAhaka/logrithm/commit/521a20b70b7abfabe4f29f0974f89cf885e2a2c7))

# [1.2.0](https://github.com/KamcyAhaka/logrithm/compare/v1.1.1...v1.2.0) (2026-06-08)


### Bug Fixes

* ensure correct repository tracking by matching via repoId instead of array index ([e33e74d](https://github.com/KamcyAhaka/logrithm/commit/e33e74de90202352146c6128000fe1550ca51684))
* **ui:** style FAQ link as a green action pill and resolve horizontal page overflow ([5d08848](https://github.com/KamcyAhaka/logrithm/commit/5d088489cc51561093fd5b893832b8a5442cf637))


### Features

* add repositories settings page to manage repository inclusion preferences ([4b5b3ab](https://github.com/KamcyAhaka/logrithm/commit/4b5b3ab57048761dab37789dcf2e7aebe6ace15a))
* **auth/nav:** redirect logged-in users to dashboard and add profile/share-card options to navbar ([4903ec8](https://github.com/KamcyAhaka/logrithm/commit/4903ec892750993cf3008df75f7ebc7a097e7599))
* **backend:** enforce fail-closed checks for private and org repo name masking ([5f716a5](https://github.com/KamcyAhaka/logrithm/commit/5f716a51f8aa4a9f6c917953f4ea3a72214cdf9c))
* **backend:** mask private and org repository names in Gemini insights based on user settings ([5579762](https://github.com/KamcyAhaka/logrithm/commit/5579762544eef1000235bead779df9681dd16dda))
* convert Repositories header into a navigable link to settings ([992ca4c](https://github.com/KamcyAhaka/logrithm/commit/992ca4cb6b7d6a3dfb23cc12e879080bfd8e7b19))
* implement PWA manifest and add custom icons ([11808be](https://github.com/KamcyAhaka/logrithm/commit/11808bec9a738e38ad2ed0bdbd597d0f9e153ebd))
* **ui:** add copy profile button with toast notification and polish comparison panel layout ([25273df](https://github.com/KamcyAhaka/logrithm/commit/25273df05771fc4bad7ccc160bce37bf493349bc))
* **ui:** add private and org repo visibility toggle switches to settings page ([efcb69a](https://github.com/KamcyAhaka/logrithm/commit/efcb69a28d42892be08380c5b93e08b807eff351))

## [1.1.1](https://github.com/KamcyAhaka/logrithm/compare/v1.1.0...v1.1.1) (2026-06-05)


### Bug Fixes

* **leaderboard:** use salted HMAC for anonymousId and delete on account removal ([4a7606b](https://github.com/KamcyAhaka/logrithm/commit/4a7606b14985354d1842f14f332c503f53685938)), closes [#16](https://github.com/KamcyAhaka/logrithm/issues/16)

# [1.1.0](https://github.com/KamcyAhaka/logrithm/compare/v1.0.0...v1.1.0) (2026-06-03)


### Bug Fixes

* **database:** use flat 2-segment paths for stats documents ([b5024c1](https://github.com/KamcyAhaka/logrithm/commit/b5024c14d08e1e07fbf0dc49430ee92ae2811d8f))
* standardize return to dashboard links and prevent share card text wrapping on mobile ([4714319](https://github.com/KamcyAhaka/logrithm/commit/4714319d9ce0d6795cd6081df7a12475194767a1))
* **ui:** resolve mobile layout overflow and correct prerelease branch config ([3994dc1](https://github.com/KamcyAhaka/logrithm/commit/3994dc1060575a82239f202b6216aff4d7bd4ab9))


### Features

* **backend:** implement deterministic scoring calculator and location parser ([83f52bf](https://github.com/KamcyAhaka/logrithm/commit/83f52bf2a82e6a97bdcdff1431e3d5af943ed1a1))
* **database:** restrict leaderboard collections and configure compound indexes ([3fe4aa9](https://github.com/KamcyAhaka/logrithm/commit/3fe4aa9d4268d6e7e2010194f26517df5595a0a0))
* **functions:** wire deterministic scoring and leaderboard upsert ([bd99726](https://github.com/KamcyAhaka/logrithm/commit/bd99726d78bbcdf1bc609e735fa0ee733fa4af51))
* **settings:** implement comparisons settings section with Pro-gating ([d9d485f](https://github.com/KamcyAhaka/logrithm/commit/d9d485f4e027d197bc1c4a793a4a88c1d08bb407))
* **types:** add location fields and score breakdown interface ([0c72b34](https://github.com/KamcyAhaka/logrithm/commit/0c72b3475f189d4990e168254cf25c59b7c606e8))
* **ui:** create ScoreBreakdown and ComparisonPanel components ([6078aff](https://github.com/KamcyAhaka/logrithm/commit/6078aff864759580736bd958436641c7c6a53855))
* **ui:** wire peer comparisons to dashboard and handle plan limits error ([f88605a](https://github.com/KamcyAhaka/logrithm/commit/f88605a3a62718567885dbd8a2585e09c0baa3f8))

## [1.0.1-beta.1](https://github.com/KamcyAhaka/logrithm/compare/v1.0.0...v1.0.1-beta.1) (2026-06-02)


### Bug Fixes

* standardize return to dashboard links and prevent share card text wrapping on mobile ([0471e97](https://github.com/KamcyAhaka/logrithm/commit/0471e9745f4348c99e644991daecfbae8c4263e0))

# 1.0.0 (2026-06-01)


### Bug Fixes

* show dash placeholder when current streak is zero ([1130447](https://github.com/KamcyAhaka/logrithm/commit/1130447b0cdd68f05c5a9233467c2c7f046fa0dc)), closes [#8](https://github.com/KamcyAhaka/logrithm/issues/8)
* use CSS zoom to scale share card on mobile without overflow ([330fee2](https://github.com/KamcyAhaka/logrithm/commit/330fee22b9049c580633c421e2af99e1dc17b3dd)), closes [#6](https://github.com/KamcyAhaka/logrithm/issues/6)
* use explicit app fonts in share card components for consistent PNG output ([060c8a2](https://github.com/KamcyAhaka/logrithm/commit/060c8a293ecf9dcea9c931515c6cd0984f7af124)), closes [#9](https://github.com/KamcyAhaka/logrithm/issues/9)
* wrap ShareCard in a container to ensure consistent PNG rendering dimensions across devices ([e41cb89](https://github.com/KamcyAhaka/logrithm/commit/e41cb892a10d6cd2d4aa0e71e5c966533b2394f1))


### Features

* add private profile UI and navigation anchor for privacy settings ([364c56d](https://github.com/KamcyAhaka/logrithm/commit/364c56d571d9f4c2f9f21ce03dc7b13a824acf9b))
* **backend:** initialize firebase project and cloud functions ([4073afe](https://github.com/KamcyAhaka/logrithm/commit/4073afe05ad715e0b573bff2c0eff116baa5d651))
* create FAQ page with Accordion component and link from InsightPanel score ([92376d3](https://github.com/KamcyAhaka/logrithm/commit/92376d313f7dafa75c6e3ce10c6fd146e0018235))
* fetch commit counts via commitContributionsByRepository instead of defaultBranchRef history ([7e2eb42](https://github.com/KamcyAhaka/logrithm/commit/7e2eb42d9c3b097b5bb1aba4f7b99c1c796b4276))
* **frontend:** implement dashboard and insight UI components ([de593ac](https://github.com/KamcyAhaka/logrithm/commit/de593ac2b05cf8e4ab02ecfc6e0cf5077ebd298f))
* implement activity score calculation for GitHub insights and update image remote patterns ([9a4954e](https://github.com/KamcyAhaka/logrithm/commit/9a4954e5d256354623a43c228a3376a35c6fc8b2))
* implement configurable share card variants with streak calculations and new modular card components ([88f5cb5](https://github.com/KamcyAhaka/logrithm/commit/88f5cb5f3d118b0fc108d1c987f72717b345e2ba))
* implement Husky pre-commit hooks and Prettier configuration ([3e8b1ff](https://github.com/KamcyAhaka/logrithm/commit/3e8b1ffb06d578132b8b4cc7c9270a6b80904c6a))
* implement plan-based gating system with client-side synchronization and server-side usage limits ([8f5ce4d](https://github.com/KamcyAhaka/logrithm/commit/8f5ce4de406d8fd9cd1ee6a90cb03f413f75c365))
* implement public-facing profile pages with customizable card and full view layouts ([a3eaf46](https://github.com/KamcyAhaka/logrithm/commit/a3eaf4692f0816d00d2e77c6220b238f59a19412))
* implement repository persistence in Firestore to enable privacy-aware insight generation ([921e060](https://github.com/KamcyAhaka/logrithm/commit/921e0608d9c88291eb30c3c00baa8d7ad7496173))
* implement repository selection onboarding flow and extend GitHub repository type definitions ([e786b04](https://github.com/KamcyAhaka/logrithm/commit/e786b047075ad6f0d1e01062fb5badf87abb7443))
* implement scheduled background analysis for automated GitHub activity snapshots and insights generation ([e484376](https://github.com/KamcyAhaka/logrithm/commit/e484376bca65b9f420610b00e64f37899788007d))
* implement secure account deletion with recursive Firestore cleanup and secret removal ([361b82d](https://github.com/KamcyAhaka/logrithm/commit/361b82d7217fa8494d4a56a56e6c8911060b122a))
* implement settings dashboard and layout with reusable UI components ([ddbc48c](https://github.com/KamcyAhaka/logrithm/commit/ddbc48cab930a419242fbd9a4c01f29689a34f01))
* implement user navigation dropdown and enforce mandatory dark mode styling conventions ([85703c1](https://github.com/KamcyAhaka/logrithm/commit/85703c1010a128e5e3fdc5a14bb97ec490a9ae53))
* initialize shadcn/ui and add project utility configurations ([274c149](https://github.com/KamcyAhaka/logrithm/commit/274c149883669b3c27881b6f067c8f913f952adb))
* replace static save button with a sticky floating footer for privacy settings ([37fec05](https://github.com/KamcyAhaka/logrithm/commit/37fec058a00d01689a3fbfea73ac95045c3971ef))
* track and display longest streak date range in insights and ShareCard UI ([9983e9a](https://github.com/KamcyAhaka/logrithm/commit/9983e9a50b50ba8318891e46921f9113da5c3db1))
* update GitHub fetching logic, replace html2canvas with html-to-image, and refactor Firebase Admin auth configuration. ([07caf9a](https://github.com/KamcyAhaka/logrithm/commit/07caf9a8ce02f9af83ada42e70039b3fec2ae8b3))

# 1.0.0 (2026-05-30)


### Bug Fixes

* wrap ShareCard in a container to ensure consistent PNG rendering dimensions across devices ([e41cb89](https://github.com/KamcyAhaka/logrithm/commit/e41cb892a10d6cd2d4aa0e71e5c966533b2394f1))


### Features

* add private profile UI and navigation anchor for privacy settings ([364c56d](https://github.com/KamcyAhaka/logrithm/commit/364c56d571d9f4c2f9f21ce03dc7b13a824acf9b))
* **backend:** initialize firebase project and cloud functions ([4073afe](https://github.com/KamcyAhaka/logrithm/commit/4073afe05ad715e0b573bff2c0eff116baa5d651))
* create FAQ page with Accordion component and link from InsightPanel score ([92376d3](https://github.com/KamcyAhaka/logrithm/commit/92376d313f7dafa75c6e3ce10c6fd146e0018235))
* fetch commit counts via commitContributionsByRepository instead of defaultBranchRef history ([7e2eb42](https://github.com/KamcyAhaka/logrithm/commit/7e2eb42d9c3b097b5bb1aba4f7b99c1c796b4276))
* **frontend:** implement dashboard and insight UI components ([de593ac](https://github.com/KamcyAhaka/logrithm/commit/de593ac2b05cf8e4ab02ecfc6e0cf5077ebd298f))
* implement activity score calculation for GitHub insights and update image remote patterns ([9a4954e](https://github.com/KamcyAhaka/logrithm/commit/9a4954e5d256354623a43c228a3376a35c6fc8b2))
* implement configurable share card variants with streak calculations and new modular card components ([88f5cb5](https://github.com/KamcyAhaka/logrithm/commit/88f5cb5f3d118b0fc108d1c987f72717b345e2ba))
* implement Husky pre-commit hooks and Prettier configuration ([3e8b1ff](https://github.com/KamcyAhaka/logrithm/commit/3e8b1ffb06d578132b8b4cc7c9270a6b80904c6a))
* implement plan-based gating system with client-side synchronization and server-side usage limits ([8f5ce4d](https://github.com/KamcyAhaka/logrithm/commit/8f5ce4de406d8fd9cd1ee6a90cb03f413f75c365))
* implement public-facing profile pages with customizable card and full view layouts ([a3eaf46](https://github.com/KamcyAhaka/logrithm/commit/a3eaf4692f0816d00d2e77c6220b238f59a19412))
* implement repository persistence in Firestore to enable privacy-aware insight generation ([921e060](https://github.com/KamcyAhaka/logrithm/commit/921e0608d9c88291eb30c3c00baa8d7ad7496173))
* implement repository selection onboarding flow and extend GitHub repository type definitions ([e786b04](https://github.com/KamcyAhaka/logrithm/commit/e786b047075ad6f0d1e01062fb5badf87abb7443))
* implement scheduled background analysis for automated GitHub activity snapshots and insights generation ([e484376](https://github.com/KamcyAhaka/logrithm/commit/e484376bca65b9f420610b00e64f37899788007d))
* implement secure account deletion with recursive Firestore cleanup and secret removal ([361b82d](https://github.com/KamcyAhaka/logrithm/commit/361b82d7217fa8494d4a56a56e6c8911060b122a))
* implement settings dashboard and layout with reusable UI components ([ddbc48c](https://github.com/KamcyAhaka/logrithm/commit/ddbc48cab930a419242fbd9a4c01f29689a34f01))
* implement user navigation dropdown and enforce mandatory dark mode styling conventions ([85703c1](https://github.com/KamcyAhaka/logrithm/commit/85703c1010a128e5e3fdc5a14bb97ec490a9ae53))
* initialize shadcn/ui and add project utility configurations ([274c149](https://github.com/KamcyAhaka/logrithm/commit/274c149883669b3c27881b6f067c8f913f952adb))
* replace static save button with a sticky floating footer for privacy settings ([37fec05](https://github.com/KamcyAhaka/logrithm/commit/37fec058a00d01689a3fbfea73ac95045c3971ef))
* track and display longest streak date range in insights and ShareCard UI ([9983e9a](https://github.com/KamcyAhaka/logrithm/commit/9983e9a50b50ba8318891e46921f9113da5c3db1))
* update GitHub fetching logic, replace html2canvas with html-to-image, and refactor Firebase Admin auth configuration. ([07caf9a](https://github.com/KamcyAhaka/logrithm/commit/07caf9a8ce02f9af83ada42e70039b3fec2ae8b3))

# 1.0.0-rebuild.1 (2026-05-27)

### Features

- **backend:** initialize firebase project and cloud functions ([27242b9](https://github.com/KamcyAhaka/logrithm/commit/27242b95cc1ac42bb65c96133d2093ec5b01f730))
- **frontend:** implement dashboard and insight UI components ([e256291](https://github.com/KamcyAhaka/logrithm/commit/e25629138accb9e0aa91294c4fa42f05cd62e752))
- implement configurable share card variants with streak calculations and new modular card components ([68dbdc4](https://github.com/KamcyAhaka/logrithm/commit/68dbdc4065cf42464550f89f3264fde8ac2d5510))
- implement Husky pre-commit hooks and Prettier configuration ([a09fd38](https://github.com/KamcyAhaka/logrithm/commit/a09fd38878064eb300ce68862b92c88a92826398))
- implement plan-based gating system with client-side synchronization and server-side usage limits ([8dc16f0](https://github.com/KamcyAhaka/logrithm/commit/8dc16f08435f9d41488da87a9d4a933dc6ce1d8d))
- implement public-facing profile pages with customizable card and full view layouts ([f553cef](https://github.com/KamcyAhaka/logrithm/commit/f553cef1e5019bf4ea6b79cd8d3b78e999b538e9))
- implement repository persistence in Firestore to enable privacy-aware insight generation ([4bf9112](https://github.com/KamcyAhaka/logrithm/commit/4bf9112bfc37abecf35d36c489240b65b78a035a))
- implement scheduled background analysis for automated GitHub activity snapshots and insights generation ([8e3207a](https://github.com/KamcyAhaka/logrithm/commit/8e3207a4a31e78ca690b298e0facac4a3550f88b))
- implement settings dashboard and layout with reusable UI components ([429927c](https://github.com/KamcyAhaka/logrithm/commit/429927cfc6087b9c70cc34fbc641e057852cb76f))
- implement user navigation dropdown and enforce mandatory dark mode styling conventions ([4c1b7ad](https://github.com/KamcyAhaka/logrithm/commit/4c1b7ad23397d9bd1a39820fbdd1792c70f7cf51))
- initialize shadcn/ui and add project utility configurations ([5684221](https://github.com/KamcyAhaka/logrithm/commit/5684221bc947c4ae32674633d5f694e19f5a5b11))
- update GitHub fetching logic, replace html2canvas with html-to-image, and refactor Firebase Admin auth configuration. ([28bb00f](https://github.com/KamcyAhaka/logrithm/commit/28bb00ffe98a5e26ed9437e1ccfc792dc58f37a6))
