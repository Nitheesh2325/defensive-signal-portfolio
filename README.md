# Defensive Signal — Accessible Cybersecurity Portfolio Starter

Defensive Signal is a small, dependency-free starter for building an honest,
accessible portfolio for security work. It ships with a clearly labelled
fictional practitioner, **Avery Example**, so you can see the shape of a
finished site before replacing every word with your own.

> **Demonstration content.** Avery Example is not a real person. Every case
> note is invented. Contact details use the reserved `example.invalid` domain.

## What you get

- **Four routes** — Home, Profile, Work, and Guide — each a complete HTML page
  that reads well with JavaScript turned off.
- **One typed content module.** Everything a visitor reads on Home, Profile,
  and Work comes from `src/content/profile.ts`, checked against
  `src/content/schema.ts`. The schema has no fields for skill percentages or
  invented metrics.
- **Case notes** structured as context, approach, result, and what is still
  open, with a shareable practice-area filter on the Work route.
- **Original abstract artwork** (contour rings around a quiet centre) with an
  optional Canvas sweep that respects reduced motion, pauses offscreen, and has
  a visible pause control.
- **Light and dark themes** that follow the visitor's system setting.
- **No runtime dependencies, analytics, trackers, cookies, storage, web fonts,
  or network requests** after the page loads. A strict Content Security Policy
  is added to every built page.
- **Audits you can run locally and in CI**: a site audit of the build output
  and an identity/privacy scan of the repository, build, and Git history.

## Quick start

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev        # http://127.0.0.1:5173
```

Build and check everything:

```sh
npm run check      # typecheck, build, site audit, privacy scan
npm run preview    # serve dist/ locally
```

## Make it yours

1. Rewrite `src/content/profile.ts` with facts you can support.
2. Set `site.demonstration` to `false` when no fictional content remains.
3. Set `site.indexable` and `site.origin` when you are ready for search engines.
4. Put identifiers you must never publish in a local `.privacy-denylist.json`
   (ignored by Git) and run `npm run audit:privacy`.
5. Deploy the `dist/` folder to any static host.

The full walkthrough is on the Guide route and in
[`docs/customization.md`](docs/customization.md).

## Project layout

```text
index.html, profile/, work/, guide/, 404.html   route placeholders
vite.config.ts                                  renders each route from content
src/content/schema.ts                           content contract
src/content/profile.ts                          demonstration content (replace)
src/content/guide.ts                            starter documentation page
src/render/                                     HTML templates, escaping
src/enhance/                                    optional browser enhancements
src/styles/                                     tokens, layout, components, modes
public/artwork/                                 generated abstract artwork
scripts/                                        audits and artwork generator
docs/                                           architecture and guides
```

## Documentation

- [Architecture](docs/architecture.md)
- [Accessibility](docs/accessibility.md)
- [Privacy-safe customisation](docs/customization.md)
- [Deployment](docs/deployment.md)
- [Contributing](CONTRIBUTING.md) · [Security policy](SECURITY.md) · [Support](SUPPORT.md)

## License

Code is released under the [MIT License](LICENSE). Names, demonstration
content, artwork, and branding are **not** covered by that license; see
[`NOTICE.md`](NOTICE.md).

Published by ASTRAYAN Web Studio.
