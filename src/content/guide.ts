/**
 * Starter documentation rendered on the /guide/ route.
 *
 * This is not demonstration identity content: it explains how to adopt the
 * starter. Keep or remove the route when you publish your own portfolio.
 */

export interface GuideSection {
  readonly id: string;
  readonly title: string;
  readonly paragraphs: readonly string[];
  readonly steps?: readonly string[];
  readonly code?: string;
}

export const guide: readonly GuideSection[] = [
  {
    id: "start",
    title: "Start locally",
    paragraphs: [
      "Defensive Signal is a small Vite and TypeScript project with no runtime dependencies. Every route is plain HTML generated at build time, so it reads well with JavaScript turned off.",
    ],
    code: "npm ci\nnpm run dev",
  },
  {
    id: "replace",
    title: "Replace the demonstration identity",
    paragraphs: [
      "All profile and case-note content for Home, Profile, and Work lives in one typed module, src/content/profile.ts. The compiler checks your edits against src/content/schema.ts. Interface labels such as headings and buttons are in src/render/pages.ts.",
    ],
    steps: [
      "Rewrite the person, contact, practice, work, and learning entries with facts you can support.",
      "Use your real contact addresses only where you are happy for them to be public.",
      "Set site.demonstration to false once no fictional content remains. The banner disappears.",
      "Set site.indexable to true and site.origin to your address when you want search engines to list the site.",
    ],
  },
  {
    id: "honesty",
    title: "Write claims you can evidence",
    paragraphs: [
      "The content model deliberately has no fields for skill percentages, star ratings, or invented metrics. Describe activities, results, and the questions that remain open.",
      "If a number appears, you should be able to show where it came from. If you cannot, describe the change in words instead.",
    ],
  },
  {
    id: "artwork",
    title: "Artwork and motion",
    paragraphs: [
      "The contour artwork is an original SVG in public/artwork/. It is decorative, carries no information, and the page composes correctly if it fails to load.",
      "When motion is allowed, a slow sweep is drawn on a Canvas above it. The sweep stops when the artwork is offscreen or the tab is hidden, never runs under reduced motion, and has a visible pause control.",
      "Do not replace the artwork with a photograph of someone else, and do not publish a portrait you do not have permission to use.",
    ],
  },
  {
    id: "accessibility",
    title: "Accessibility commitments",
    paragraphs: [
      "Keep these properties when you customize the design. Automated checks cannot confirm all of them, so re-check them by hand after significant changes.",
    ],
    steps: [
      "A skip link, one h1 per page, and landmarks for header, navigation, main, and footer.",
      "Every control reachable and operable by keyboard, with a clearly visible focus ring.",
      "Text reflows without horizontal scrolling at 320 CSS pixels and at 400% zoom.",
      "Reduced-motion and forced-colors modes are respected, and nothing depends on hover.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy check before publishing",
    paragraphs: [
      "Run npm run check. It builds the site, audits the output, and scans for contact details outside the reserved example domains, local file paths, source maps, and secret-like strings. CI runs the same generic scan.",
      "Before publishing, add identifiers you must never publish to a local .privacy-denylist.json file and run the scan with --history. With that option, the scan also reads every unique file content in Git history, including content from deleted files. The denylist file is ignored by Git and must never be committed.",
    ],
    code: "npm run check\nnpm run audit:privacy -- --history",
  },
  {
    id: "deploy",
    title: "Deploy anywhere static",
    paragraphs: [
      "The dist/ folder is a static site. Any host that serves static files over HTTPS can publish it. The file docs/deployment.md in the repository lists the response headers worth configuring on your host.",
    ],
  },
];
