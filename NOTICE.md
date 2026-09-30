# Notice

**Defensive Signal — Accessible Cybersecurity Portfolio Starter**

Copyright (c) 2026 Nitheesh Chanambatla.

Defensive Signal is created and maintained by Nitheesh Chanambatla.

## What the MIT License covers

The MIT License in [`LICENSE`](LICENSE) applies to the reusable parts of this
repository:

- source code, including the TypeScript, CSS, and HTML templates;
- build configuration;
- audit scripts, the artwork generator script, and other tooling;
- CI workflow files;
- documentation, including the source-code examples in it (commands, code, and
  configuration snippets).

## What it does not cover

The MIT License does **not** grant any right to use the following material:

- **Defensive Signal** — the name and its branding, including the wordmark
  symbol drawn in `src/render/layout.ts` and the favicon;
- **the creator's name as a site attribution** — the footer credit naming
  Nitheesh Chanambatla (`site.credit` in `src/content/profile.ts`). A site
  built from the starter must not present itself as the creator's work. This
  does not affect the copyright notice in `LICENSE`, which the MIT License
  requires you to keep with copies of the software;
- **Avery Example** — the fictional identity and all demonstration content,
  including the profile, contact details, principles, practice areas, case
  notes, and learning notes in `src/content/profile.ts`;
- **artwork** — the generated artwork in `public/artwork/` and the favicon
  artwork in `public/favicon.svg`, including identical copies regenerated with
  the default settings of `scripts/generate-artwork.mjs`;
- **documentation images** — the screenshots and social-preview image in
  `docs/media/`, which show the Defensive Signal branding, the fictional
  demonstration content, and the bundled artwork;
- **likenesses and media** — any portrait, photograph, likeness, or other media
  added in future without separate permission (this repository contains none);
- **third-party trademarks** mentioned anywhere in the repository.

This material stays excluded even when it appears inside a source or
documentation file. For example, the documentation's code examples are
MIT-licensed, but the fictional names, sample profile text, branding, and
artwork that appear alongside them are not.

You may keep the demonstration content, branding, attribution, and artwork
while evaluating the starter locally. Before publishing a site built from it,
replace the Defensive Signal name (`site.siteName`), the footer attribution
(`site.credit`), the wordmark symbol, the favicon, and the bundled artwork,
unless you have separate permission to use them. Publishing this repository
does not grant that permission. Artwork you create yourself, including artwork
you generate with your own settings in `scripts/generate-artwork.mjs`, is
yours.

## Fictional content

Avery Example is not a real person. Every profile detail, case note, and
scenario in this repository is invented. Contact details use the reserved
`example.invalid` domain (RFC 2606), which cannot receive mail or resolve. Any
resemblance to a real person or organization is coincidental.

## Third-party software

The starter has no runtime dependencies. Development tools are installed from
npm under their own licenses:

| Package | Purpose | License |
| --- | --- | --- |
| `vite` | Development server and production build | MIT |
| `typescript` | Type checking | Apache-2.0 |

Their transitive dependencies are recorded in `package-lock.json`. Among them,
`lightningcss` is MPL-2.0 and `detect-libc` is Apache-2.0; they are used only at
build time and are not shipped to visitors.
