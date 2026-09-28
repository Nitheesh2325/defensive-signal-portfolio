# Privacy-safe customisation

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
- **learning** — what you study or practise.

When nothing fictional remains, set `site.demonstration` to `false`. The notice
strip and the "Fictional scenario" labels disappear.

## 2. Decide on indexing

Demonstration builds are `noindex, nofollow`. When you are ready:

- set `site.indexable` to `true`;
- set `site.origin` to your address, for example `https://portfolio.example`,
  to add canonical links;
- review `public/robots.txt` and, if you want one, add a sitemap.

## 3. Artwork and images

- Keep the generated contour artwork, change its colours or seed in
  `scripts/generate-artwork.mjs`, or replace it with your own original work.
- Do not publish a photograph of anyone without their permission.
- Strip metadata from any raster image you add. The privacy scan fails on EXIF
  and XMP blocks it can detect.
- Prefer SVG with presentation attributes. `<style>` blocks inside SVG may be
  blocked by a strict CSP header.

## 4. Run the privacy scan with your own denylist

Create `.privacy-denylist.json` in the project root. It is ignored by Git, so the
list of things you are protecting never becomes part of the repository.

```json
{
  "terms": ["Your Employer Ltd", "internal-hostname", "your.personal.address"],
  "allow": { "Your Name": ["LICENSE"] }
}
```

Then run:

```sh
npm run check
npm run audit:privacy -- --history
```

The scan also looks for real-looking email addresses, phone numbers, local
file paths, API keys, private keys, long hex digests, source maps, and hosts
that are not on its allow list.

## 5. Keep the promises

Before publishing, confirm:

- [ ] no fictional content remains, and `site.demonstration` is `false`;
- [ ] every claim can be backed by something you could show;
- [ ] the accessibility checklist in `docs/accessibility.md` passes;
- [ ] `npm run check` and `npm audit` pass;
- [ ] you have not added analytics, trackers, or third-party requests you have
      not disclosed to visitors.
