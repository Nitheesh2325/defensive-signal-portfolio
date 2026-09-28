# Notice

Defensive Signal — Accessible Cybersecurity Portfolio Starter
Copyright (c) 2026 Nitheesh Chanambatla, trading as ASTRAYAN Web Studio

## What the MIT License covers

The MIT License in [`LICENSE`](LICENSE) applies to the reusable source code and
tooling in this repository: the TypeScript, CSS, HTML templates, build
configuration, scripts, and workflow files.

## What it does not cover

The MIT License does **not** grant any right to use the following, unless a file
explicitly says otherwise:

- the names **Defensive Signal** and **ASTRAYAN Web Studio**, and any logos,
  wordmarks, or trade dress associated with them;
- trademarks of any third party mentioned in the documentation;
- the demonstration identity "Avery Example" and all demonstration content in
  `src/content/profile.ts`, which is fictional and provided only so the starter
  renders something meaningful;
- the artwork in `public/artwork/` and `public/favicon.svg`, and the output of
  `scripts/generate-artwork.mjs`;
- any portrait, photograph, or likeness. This repository contains none, and you
  must not add one you do not have permission to publish.

You may keep the demonstration content and artwork while evaluating the starter
locally. Replace them with your own before publishing a site built from it.

## Fictional content

Avery Example is not a real person. Every profile detail, case note, and
scenario in this repository is invented. Contact details use the reserved
`example.invalid` domain (RFC 2606), which cannot receive mail or resolve. Any
resemblance to a real person or organisation is coincidental.

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
