# Architecture

Defensive Signal is a static multi-page site built with Vite and strict
TypeScript. It has no runtime dependencies and no server component.

## Build-time rendering

```text
src/content/profile.ts ─┐
src/content/guide.ts ───┼─► src/render/pages.ts ─► src/render/layout.ts ─► complete HTML
src/content/schema.ts ──┘            (templates)          (document shell)
```

1. Each route has a placeholder HTML file (`index.html`, `profile/index.html`,
   `work/index.html`, `guide/index.html`, `404.html`) so Vite treats it as an
   entry point.
2. The `defensive-signal:render-pages` plugin in `vite.config.ts` runs first in
   Vite's HTML pipeline and replaces each placeholder with a complete document
   generated from the content modules.
3. Vite then bundles the referenced stylesheet and script, hashes their file
   names, and writes `dist/`.

Because rendering happens at build time, every page is fully readable before
any JavaScript runs, search engines see real content, and there is no
client-side routing to break Back, Forward, or deep links.

In development the same plugin runs on each request. Vite restarts the dev
server when a file imported by `vite.config.ts` changes, so content edits appear
after a reload.

## Content contract

`src/content/schema.ts` defines `PortfolioContent`. The compiler rejects content
that does not match it. Renderers validate cross-references at build time; for
example, a case note whose `area` does not match a practice area stops the build.

All text is escaped by `esc()`. Links pass through `safeHref()`, which accepts
only `https:`, `mailto:`, root-relative, and in-page links, and fails the build
for anything else.

## Browser enhancements

`src/main.ts` runs each enhancement in isolation, so a failure in one leaves the
page and the others intact.

| Module | Purpose | Without it |
| --- | --- | --- |
| `enhance/plate.ts` | Artwork failure stand-in; bounded Canvas sweep with pause control | Static artwork, no motion |
| `enhance/work-filter.ts` | Practice-area filter stored as `?area=` with history support | All case notes listed |
| `enhance/media.ts` | Small `matchMedia` helper | — |

### Sweep lifecycle

The sweep is the only animation. It:

- never starts under `prefers-reduced-motion: reduce` or `forced-colors: active`,
  and stops if either preference turns on while the page is open;
- runs only while the artwork intersects the viewport, the document is visible,
  and the visitor has not pressed **Pause motion**;
- draws at most 30 frames per second with the device pixel ratio capped at 2 and
  the backing store capped at one megapixel;
- keeps its state when the page enters the back/forward cache, and releases its
  observers and frame loop when the document is really unloaded.

## Styles

| File | Contents |
| --- | --- |
| `tokens.css` | Color, type, spacing, and radius tokens for light and dark |
| `base.css` | Reset, typography defaults, focus ring, skip link |
| `layout.css` | Page frame, notice strip, top bar, headings, TOC layout, footer |
| `components.css` | Lede, artwork plate, principles, case notes, filter, guide |
| `modes.css` | Reduced motion, forced colors, print |

## Security posture

- Production pages carry a Content Security Policy meta tag allowing only
  same-origin scripts, styles, and images, and no network connections.
- No inline scripts, inline styles, or event-handler attributes are emitted; the
  site audit fails the build output if any appear.
- Artwork SVGs use presentation attributes instead of `<style>` blocks, so they
  still render when a host sends a strict CSP header with every response.
- Source maps are disabled and the audit rejects any that appear.

## Audits

| Script | Checks |
| --- | --- |
| `scripts/audit-site.mjs` | Routes, landmarks, one `h1`, titles, descriptions, robots, CSP, inline code, external resources, internal links and anchors, network and storage APIs, SVG safety, size budgets |
| `scripts/privacy-scan.mjs` | Non-example emails, phone numbers, local paths, keys and tokens, long digests, source maps, unknown hosts, image metadata, and an optional private denylist. With `--history`: commit messages, authors, every historic path, and every unique reachable blob (read once, generic rules once, denylist per historical path), including content from deleted files; fails closed on shallow or unreadable history |
| `scripts/test-privacy-scan.mjs` | Regression test in disposable Git repositories: deleted denylisted and secret canaries must fail, path-specific allowances hold for shared blobs, shallow clones fail closed, clean history passes, GitHub no-reply authors stay permitted |
