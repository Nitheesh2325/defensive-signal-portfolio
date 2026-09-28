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

## 3. Artwork and images

- Keep the generated contour artwork, change its colors or seed in
  `scripts/generate-artwork.mjs`, or replace it with your own original work.
- Do not publish a photograph of anyone without their permission.
- Strip metadata from any raster image you add. The privacy scan fails on EXIF
  and XMP blocks it can detect.
- Prefer SVG with presentation attributes. `<style>` blocks inside SVG may be
  blocked by a strict CSP header.

## 4. Run the privacy scan with your own denylist

The privacy scan works at two levels:

- **Generic rules, everywhere.** CI runs the public-safe scan on pushes to
  `main` and on pull requests: real-looking email addresses, phone numbers, local file paths,
  API keys, private keys, long hex digests, source maps, hosts that are not on
  the allow list, and image metadata. CI never sees your private identifiers.
- **Your private denylist, locally.** Before you publish, run the scan on your
  own machine with a denylist of names, employers, domains, and anything else
  that must never appear. This local run is the pre-publication release gate;
  the generic CI scan alone is not enough.

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

## 5. Keep the promises

Before publishing, confirm:

- [ ] no fictional content remains, and `site.demonstration` is `false`;
- [ ] every claim can be backed by something you could show;
- [ ] the accessibility checklist in `docs/accessibility.md` passes;
- [ ] `npm run check` and `npm audit` pass;
- [ ] you have not added analytics, trackers, or third-party requests you have
      not disclosed to visitors.
