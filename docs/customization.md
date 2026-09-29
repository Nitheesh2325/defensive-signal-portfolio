# Privacy-safe customization

This guide takes you from the fictional demonstration to your own published
portfolio without leaking anything you did not mean to publish.

## 1. Replace the content

Edit `src/content/profile.ts`. The compiler checks it against
`src/content/schema.ts`.

- **person** — your name, a plain-words role, and a location at a precision you
  are comfortable sharing publicly. "Remote" or a region is fine.
- **contact** — only addresses you want public. Only `mailto:` and `https:`
  links are accepted.
- **practice** — areas you actually work in, described by activity. The schema
  has no field for skill levels on purpose.
- **work** — case notes. Describe context, approach, and result in words. Leave
  out employer names, client names, system names, and numbers unless you have
  permission and can evidence them.
- **learning** — what you study or practice.

When nothing fictional remains, set `site.demonstration` to `false`. The notice
strip and the "Fictional scenario" labels disappear.

## 2. Decide on indexing

Demonstration builds are `noindex, nofollow`. When you are ready:

- set `site.indexable` to `true`;
- set `site.origin` to your address, for example `https://portfolio.example`,
  to add canonical links;
- review `public/robots.txt` and, if you want one, add a sitemap.

## 3. Replace the branding

The Defensive Signal and ASTRAYAN Web Studio names and marks are not licensed
under MIT (see `NOTICE.md`). Before you publish a site built from the starter,
replace every one of them:

- **site name** — `site.siteName` in `src/content/profile.ts`, which is
  "Defensive Signal" in the demo and appears in the header and page titles;
- **footer attribution** — `site.credit` in `src/content/profile.ts`, which
  names Defensive Signal and ASTRAYAN Web Studio;
- **wordmark symbol** — the `MARK` SVG in `src/render/layout.ts`, shown beside
  the site name;
- **favicon** — `public/favicon.svg`, which repeats the wordmark symbol;
- **artwork** — the bundled contour artwork in `public/artwork/` (see below).

Publishing this repository does not grant permission to use these names or
marks, and a site built from it must not present itself as Defensive Signal or
as an ASTRAYAN Web Studio work without separate permission.

## 4. Artwork and images

- Replace the bundled contour artwork and favicon before publishing. They are
  excluded from the MIT License (see `NOTICE.md`). Generate your own with a
  different seed and colors in `scripts/generate-artwork.mjs`, or use your own
  original work.
- Do not publish a photograph of anyone without their permission.
- Strip metadata from any raster image you add. The privacy scan fails on EXIF
  and XMP blocks it can detect.
- Prefer SVG with presentation attributes. `<style>` blocks inside SVG may be
  blocked by a strict CSP header.

## 5. Run the privacy scan with your own denylist

The privacy scan works at two levels:

- **Generic rules, in CI and locally.** CI runs the public-safe scan on pushes
  to `main` and on pull requests. It looks for real-looking email addresses,
  phone numbers, local file paths, API keys, private keys, long hex digests,
  source maps, hosts that are not on the allow list, and image metadata. CI is
  never given your private denylist.
- **Your private denylist, locally only.** Before you publish, run the scan on
  your own machine with a denylist of names, employers, domains, and anything
  else that must never appear. This local run is the pre-publication release
  gate; the generic CI scan alone cannot catch identifiers it does not know
  about.

The host allow list covers reserved example domains, loopback addresses, the
SVG namespace, and the npm registry. One narrower exception exists: two exact
URLs, the README's CI status badge and its link, are allowed on `github.com`
through `ALLOWED_URLS` in `scripts/privacy-scan.mjs`. Only a character-for-
character match passes, so any other GitHub URL, including other paths in the
same repository, still fails. If you fork the starter, replace those two URLs
with your own repository's badge URLs.

Create `.privacy-denylist.json` in the project root, or keep the file anywhere
outside the repository and point `DS_PRIVACY_DENYLIST` at it. The default file
name is ignored by Git. Never commit the denylist: the list of things you are
protecting is itself private.

```json
{
  "terms": ["Your Name", "Your Employer Ltd", "internal-hostname", "your.personal.address"],
  "allow": { "Your Name": ["LICENSE"] }
}
```

Then run:

```sh
npm run check
npm run audit:privacy -- --history
```

With `--history`, the scan reads everything reachable in Git history: commit
messages and authors, every historical path, and every unique historical blob,
including content from files that were later deleted or renamed.

A blob is one exact file content. Git stores identical content once, so one
blob can appear under several paths and in many commits, and the number of
unique blobs is usually smaller than the number of file versions a history
contains. The scan reads each unique blob once, applies the generic rules to it
once, and applies the denylist separately for every path the blob ever had, so
an `allow` entry for one path never excuses the same content under another.

Deleting a leaked file in a new commit does not remove it from history; if the
scan finds one, rewrite the history before the repository is ever pushed.
GitHub no-reply author addresses are permitted. Findings name the commit, blob,
and path (the exact path for denylist findings, a representative one for
generic findings). A matched denylisted term is always printed as
`[redacted]`, but locations show file paths as they are, so a path that itself
contains a denylisted term appears in the report. Keep the report private.

If history cannot be read completely (for example a shallow clone), the scan
fails rather than passing on partial evidence.

## 6. Keep the promises

Before publishing, confirm:

- [ ] no fictional content remains, and `site.demonstration` is `false`;
- [ ] the site name, footer attribution, wordmark symbol, favicon, and artwork
      are your own, with no Defensive Signal or ASTRAYAN Web Studio branding;
- [ ] every claim can be backed by something you could show;
- [ ] the accessibility checklist in `docs/accessibility.md` passes;
- [ ] `npm run check` and `npm audit` pass;
- [ ] you have not added analytics, trackers, or third-party requests you have
      not disclosed to visitors.
