# Contributing

Thank you for helping improve Defensive Signal. The starter aims to stay small,
accessible, private by default, and easy to understand, so changes are judged
against those goals first.

## Before you start

- For anything larger than a small fix, open an issue first so the approach can
  be agreed before you spend time on it.
- Security problems go through the private process in [`SECURITY.md`](SECURITY.md),
  never a public issue.
- Everyone taking part follows the [Code of Conduct](CODE_OF_CONDUCT.md).

## Ground rules

- **No runtime dependencies.** Development dependencies need a clear reason, a
  compatible license, and a security check.
- **No real people.** Demonstration content stays fictional, uses
  `example.invalid` contact details, and never includes a real photograph or
  likeness.
- **No tracking.** No analytics, trackers, third-party fonts, cookies, or
  client-side storage.
- **Progressive enhancement.** Every page must remain complete and readable
  with JavaScript disabled. Enhancements must fail safely.
- **Accessibility is not optional.** Keep the commitments in
  [`docs/accessibility.md`](docs/accessibility.md).
- **Honest content model.** Do not add fields for proficiency scores, ratings,
  or metrics that invite unsupported claims.

## Development

```sh
npm ci
npm run dev
```

Before opening a pull request, run:

```sh
npm run check
npm audit
```

Then check your change by hand with a keyboard, at 320 CSS pixels wide, at 200%
zoom, with reduced motion enabled, and with JavaScript disabled. Say in the pull
request which of these you tested and which you did not.

## Pull requests

- Keep each pull request focused on one change.
- Describe what a visitor or maintainer will notice, and how you tested it.
- Update documentation and `CHANGELOG.md` when behavior changes.
- Regenerate artwork with `node scripts/generate-artwork.mjs` rather than
  editing the SVG by hand.

By contributing, you agree that your contributions to the source code, tooling,
CI workflow, and documentation are licensed under the MIT License in this
repository, as described in [`NOTICE.md`](NOTICE.md). Do not contribute names,
logos, artwork, likenesses, or personal content that you do not have permission
to share.
