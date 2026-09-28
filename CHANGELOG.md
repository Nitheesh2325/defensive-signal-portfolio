# Changelog

All notable changes to this project are recorded here, newest first. The
project uses semantic versioning.

## [Unreleased]

### Fixed

- `privacy-scan --history` now scans the contents of every blob reachable in
  Git history, including files that were later deleted or renamed, fails closed
  when history cannot be read completely, and masks matched values in its
  report.
- The history scan keeps every path a blob appeared under and applies
  denylist allowances per path, so identical content under an allowed and a
  non-allowed path is still reported. Generic rules still run once per blob.

### Added

- `npm run test:privacy`, a regression test that runs the history scan against
  disposable Git repositories with fictional canaries, including shared-blob
  allowance cases and a real shallow clone. CI runs it before the privacy scan.

## [0.1.0] — 2026-09-28

### Added

- Four build-time rendered routes: Home, Profile, Work, and Guide, plus a 404
  page, all readable without JavaScript.
- A single typed content module with a fictional demonstration identity.
- Work route filter by practice area, stored in the address for sharing and
  Back/Forward navigation.
- Original generated contour artwork with light and dark variants, a CSS
  stand-in if it fails to load, and an optional bounded Canvas sweep with a
  pause control.
- Light and dark themes, reduced-motion, forced-colours, and print styles.
- Site audit and identity/privacy scan scripts.
- CI workflow with a read-only token and SHA-pinned actions.
- Contribution, conduct, security, support, and notice documents.
