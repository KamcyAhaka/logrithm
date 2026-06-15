# [1.1.0-beta.8](https://github.com/KamcyAhaka/logrithm/compare/v1.1.0-beta.7...v1.1.0-beta.8) (2026-06-15)


### Bug Fixes

* **dashboard:** hide languages with 0 commits in breakdown chart and legend ([c961f75](https://github.com/KamcyAhaka/logrithm/commit/c961f75f16b1946217994d4d272f84d98452014f))
* **firebase:** route admin db connections to dev-db in local development ([aa8319d](https://github.com/KamcyAhaka/logrithm/commit/aa8319d9e32965f6a1060395e7a8e0bfe495f1a3))
* **functions:** update plan and leaderboard services to use dynamic db proxy ([70b3bc1](https://github.com/KamcyAhaka/logrithm/commit/70b3bc1ba65672ae7eddaf597f1d2039e4ebc9fc))
* **insights:** replace cohort terminology with user-friendly terms and add stats threshold guard ([a9d1158](https://github.com/KamcyAhaka/logrithm/commit/a9d11584565e07378b97f47c2195d6a97cb8efa9))


### Features

* **backend:** add accountability partner flow, action plan generation, and configure security rules ([eb697f0](https://github.com/KamcyAhaka/logrithm/commit/eb697f0d6ad8c2ea65175ca10334d15ce5fc4bae))
* **backend:** relax invite constraints and configure collectionGroup indexes ([1d96842](https://github.com/KamcyAhaka/logrithm/commit/1d968426cc546617a726bdd278a10080a55faa56))
* **frontend:** implement goals dashboard, wizard, progress tracking & partner invites ([50f0674](https://github.com/KamcyAhaka/logrithm/commit/50f0674b1930c7c9509cfdbbbd6f199cd1eb3436))
* **frontend:** implement tiered goal limits, upgrade modal, and past goals list ([5b4d674](https://github.com/KamcyAhaka/logrithm/commit/5b4d6746ecf0bf4615800c187a942375169a255a))
* **functions:** implement dynamic dev-db proxy routing using AsyncLocalStorage ([a085f0e](https://github.com/KamcyAhaka/logrithm/commit/a085f0e455c9c95afc6b36c06caf7e17a02bacc5))
* **types:** support isProOnly presets and goal documents ([c41fd5d](https://github.com/KamcyAhaka/logrithm/commit/c41fd5d84d7c4127106f3684a8f77902c89132d9))

# [1.1.0-beta.7](https://github.com/KamcyAhaka/logrithm/compare/v1.1.0-beta.6...v1.1.0-beta.7) (2026-06-14)


### Bug Fixes

* enable dynamic GitHub secret resolution from Firestore user document paths ([cecb4ce](https://github.com/KamcyAhaka/logrithm/commit/cecb4ce45b5d46c8310261a28ee9f229ec1b1443))


### Features

* clear dashboard store state upon user logout in useAuth hook ([cf75c9f](https://github.com/KamcyAhaka/logrithm/commit/cf75c9f3c24356cb809e2b3d2279807d9c21a23a))

# [1.1.0-beta.6](https://github.com/KamcyAhaka/logrithm/compare/v1.1.0-beta.5...v1.1.0-beta.6) (2026-06-10)


### Features

* add custom 404 not found page for missing routes ([cf01f7d](https://github.com/KamcyAhaka/logrithm/commit/cf01f7d28bef0d4aeed05b2d0c744744758c98a4))
* add dynamic SVG README badge component and API endpoint to privacy settings ([f4fa006](https://github.com/KamcyAhaka/logrithm/commit/f4fa006b247f4ce6fea9e869d72f363e682dbde7))

# [1.1.0-beta.5](https://github.com/KamcyAhaka/logrithm/compare/v1.1.0-beta.4...v1.1.0-beta.5) (2026-06-10)


### Features

* overhaul landing page with modular sections and preview assets ([8955633](https://github.com/KamcyAhaka/logrithm/commit/895563347d5e168e973546aadaa514c9d8582cf4))

# [1.1.0-beta.4](https://github.com/KamcyAhaka/logrithm/compare/v1.1.0-beta.3...v1.1.0-beta.4) (2026-06-10)


### Bug Fixes

* add auth validation to generateInsights function ([fb66080](https://github.com/KamcyAhaka/logrithm/commit/fb660808da2ff16d28592d83858ae3a08b207f64))
* prevent layout overflow and improve text truncation in settings pages ([5070300](https://github.com/KamcyAhaka/logrithm/commit/5070300c79de60e7864906d2dfe855b24c03b3c4))
* restrict slug deletion permissions to require only authentication and ownership verification ([d0878b9](https://github.com/KamcyAhaka/logrithm/commit/d0878b9e0110f19756d6b87ca8fab35f4adc159e))


### Features

* add legal policy pages and update site footer with navigation links ([c37235d](https://github.com/KamcyAhaka/logrithm/commit/c37235d3c9f49db15cf9f72085d8d8dd7c976d42))
* add ScrollToTop component to reset scroll position on route changes ([6c0ac52](https://github.com/KamcyAhaka/logrithm/commit/6c0ac521114fa74c3c3ff88615a4c425f8e1cdd1))

# [1.1.0-beta.3](https://github.com/KamcyAhaka/logrithm/compare/v1.1.0-beta.2...v1.1.0-beta.3) (2026-06-08)


### Bug Fixes

* ensure correct repository tracking by matching via repoId instead of array index ([c76799f](https://github.com/KamcyAhaka/logrithm/commit/c76799fcb09fed80c0ef603df8cd3c6c41ba74eb))
* **ui:** style FAQ link as a green action pill and resolve horizontal page overflow ([89c2b20](https://github.com/KamcyAhaka/logrithm/commit/89c2b20861a48e7df6f839c6dabe96453048bf7b))


### Features

* add repositories settings page to manage repository inclusion preferences ([cb0ccd9](https://github.com/KamcyAhaka/logrithm/commit/cb0ccd91c0f2618bcdb1404ff9af59804508d09e))
* **auth/nav:** redirect logged-in users to dashboard and add profile/share-card options to navbar ([6fbf29b](https://github.com/KamcyAhaka/logrithm/commit/6fbf29b61f2b890462ee9929e5d6465c5407cbed))
* **backend:** enforce fail-closed checks for private and org repo name masking ([a66e67d](https://github.com/KamcyAhaka/logrithm/commit/a66e67d11941d98dabb616f9064f71b9c6d67939))
* **backend:** mask private and org repository names in Gemini insights based on user settings ([4402cd4](https://github.com/KamcyAhaka/logrithm/commit/4402cd4089c2cce1648a16f6d845f1b706164f50))
* convert Repositories header into a navigable link to settings ([df9e21b](https://github.com/KamcyAhaka/logrithm/commit/df9e21b2be1da93aa1daf2fae5095179ec95fc5b))
* implement PWA manifest and add custom icons ([6f7be0b](https://github.com/KamcyAhaka/logrithm/commit/6f7be0b26be6f8e9e74370be0be80899c70236ef))
* **ui:** add copy profile button with toast notification and polish comparison panel layout ([2d5e95e](https://github.com/KamcyAhaka/logrithm/commit/2d5e95ee9b85429f80bd7e8eee885a73b08617ff))
* **ui:** add private and org repo visibility toggle switches to settings page ([c45c01a](https://github.com/KamcyAhaka/logrithm/commit/c45c01a928e094426c69cda81a8d650e9fa04eb9))

# [1.1.0-beta.2](https://github.com/KamcyAhaka/logrithm/compare/v1.1.0-beta.1...v1.1.0-beta.2) (2026-06-04)


### Bug Fixes

* **leaderboard:** use salted HMAC for anonymousId and delete on account removal ([b540214](https://github.com/KamcyAhaka/logrithm/commit/b540214a15342d67d14993b117be295cd22da991)), closes [#16](https://github.com/KamcyAhaka/logrithm/issues/16)

# [1.1.0-beta.1](https://github.com/KamcyAhaka/logrithm/compare/v1.0.1-beta.1...v1.1.0-beta.1) (2026-06-02)


### Bug Fixes

* **database:** use flat 2-segment paths for stats documents ([f434127](https://github.com/KamcyAhaka/logrithm/commit/f4341276add77fba209b49ef6c32e90a2d0f5958))
* **ui:** resolve mobile layout overflow and correct prerelease branch config ([8a5c09b](https://github.com/KamcyAhaka/logrithm/commit/8a5c09bafaa9b6876eb36df3060038aef39b0775))


### Features

* **backend:** implement deterministic scoring calculator and location parser ([edc0800](https://github.com/KamcyAhaka/logrithm/commit/edc0800acc763709f5e906fb728158a21821b884))
* **database:** restrict leaderboard collections and configure compound indexes ([81ee853](https://github.com/KamcyAhaka/logrithm/commit/81ee853cdd576940c48e478bcc388692e49c732f))
* **functions:** wire deterministic scoring and leaderboard upsert ([6372e48](https://github.com/KamcyAhaka/logrithm/commit/6372e4840f6b506ea48a9e0704df7a34d93a768c))
* **settings:** implement comparisons settings section with Pro-gating ([a66459a](https://github.com/KamcyAhaka/logrithm/commit/a66459a296e5ba33abc6b1952686077bffab5055))
* **types:** add location fields and score breakdown interface ([daffcb3](https://github.com/KamcyAhaka/logrithm/commit/daffcb3517daac440d1736abec127ddd9a6e6d3b))
* **ui:** create ScoreBreakdown and ComparisonPanel components ([e20285f](https://github.com/KamcyAhaka/logrithm/commit/e20285feba9d1c22fd3ca1596180709add128482))
* **ui:** wire peer comparisons to dashboard and handle plan limits error ([f6c3f79](https://github.com/KamcyAhaka/logrithm/commit/f6c3f793e5ae91cb6651d664310b0b8c4494723a))

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
