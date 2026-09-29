# Changelog

All notable changes to this project are recorded here, newest first. The
project uses semantic versioning.

## [0.1.1] — 2026-09-29

### Changed

- Ownership and attribution: LICENSE, NOTICE.md, the package author, and the
  demonstration footer attribution now name the project's creator directly,
  and the README adds a "Created and maintained by" line linking to the
  creator's GitHub profile. The previous studio trading name is removed from
  all current files.
- NOTICE.md and the adoption guidance now require replacing the Defensive
  Signal name, the creator's footer attribution, the wordmark, the artwork, and
  the favicon before publishing a derived site, unless separately permitted,
  while keeping the MIT copyright notice.
- CONTRIBUTING.md states that contributors keep the copyright in their own
  contributions. The Code of Conduct and security policy refer to a single
  maintainer.
- README: a metadata row with the official CI status badge and plain links to
  the license and changelog, a Demo section explaining that no hosted demo is
  provided and how to run it locally, a "Build and check" section in place of
  "Quick start", and a "Features" section that describes the verified
  capabilities in place of "What you get".
- Privacy scan: three exact URLs are allowed on `github.com`: the README CI
  badge, its link, and the creator's profile link. Any other GitHub URL still
  fails, and the regression test covers both cases.

### Fixed

- Privacy scan: a supplied denylist that is missing, unreadable, malformed, or
  structurally invalid now stops the scan with exit status 2 and an error that
  does not quote the file, instead of silently falling back to the generic
  rules. Regression tests cover each case.

## [0.1.0] — 2026-09-28

First public release.

### Site

- Four build-time rendered routes: Home, Profile, Work, and Guide, plus a 404
  page, all readable without JavaScript.
- A single typed content module with a fictional demonstration identity.
- Work route filter by practice area, stored in the address for sharing and
  Back/Forward navigation.
- Original generated contour artwork with light and dark variants, a CSS
  stand-in if it fails to load, and an optional bounded Canvas sweep with a
  pause control.
- Light and dark themes, reduced-motion, forced-colors, and print styles.

### Audits and CI

- Site audit script for the build output.
- Identity and privacy scan. With `--history`, it scans commit messages,
  authors, every historical path, and the contents of every unique blob
  reachable in Git history, including files that were later deleted or
  renamed. It applies denylist allowances per path, masks matched values in its
  report, and fails closed when history cannot be read completely.
- `npm run test:privacy`, a regression test that runs the history scan against
  disposable Git repositories with fictional canaries, including shared-blob
  allowance cases and a real shallow clone.
- CI workflow with a read-only token and SHA-pinned actions that runs the
  typecheck, build, site audit, privacy regression test, generic history scan,
  source-map check, and dependency audit.

### Documentation and licensing

- README, contributing guide, Code of Conduct, security policy, support
  policy, and architecture, accessibility, customization, and deployment
  guides, in US English.
- MIT License for the source code, tooling, CI workflow, and documentation,
  including documentation code examples. NOTICE.md excludes the Defensive
  Signal name and marks, the publisher's name and marks, the fictional
  demonstration identity and content, the bundled artwork and favicon, and any
  likeness, including where they appear inside source or documentation files.
- Adoption guidance that requires replacing the site name, footer attribution,
  wordmark symbol, favicon, and artwork before publishing a derived site.
- Private reporting guidance for security and conduct concerns, with a
  fallback when private vulnerability reporting is not enabled.
