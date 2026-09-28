import type { PortfolioContent } from "../content/schema.ts";
import { esc, join, safeHref } from "./escape.ts";

export type RouteId = "home" | "profile" | "work" | "guide" | "not-found";

interface NavItem {
  readonly id: Exclude<RouteId, "not-found">;
  readonly href: string;
  readonly label: string;
}

export const NAV: readonly NavItem[] = [
  { id: "home", href: "/", label: "Home" },
  { id: "profile", href: "/profile/", label: "Profile" },
  { id: "work", href: "/work/", label: "Work" },
  { id: "guide", href: "/guide/", label: "Guide" },
];

export interface PageSpec {
  readonly route: RouteId;
  readonly title: string;
  readonly description: string;
  /** Canonical path relative to `site.origin`; omitted for the 404 page. */
  readonly path?: string;
  readonly main: string;
}

/**
 * Content security policy shipped as a meta tag in production builds. It allows only
 * same-origin scripts, styles, and images, and forbids every network connection.
 * `frame-ancestors` cannot be set from a meta tag: configure it on your host.
 */
export const CSP =
  "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; " +
  "connect-src 'none'; font-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";

/** The wordmark symbol: three nested arcs over a baseline. Original, decorative. */
const MARK = `<svg class="wordmark__mark" viewBox="0 0 32 32" width="28" height="28" aria-hidden="true" focusable="false"><path d="M4 26h24" /><path d="M8 26a8 8 0 0 1 16 0" /><path d="M12 26a4 4 0 0 1 8 0" /><path d="M2 26a14 14 0 0 1 28 0" /></svg>`;

const banner = (c: PortfolioContent): string =>
  c.site.demonstration
    ? `<aside class="demo-note" aria-label="Demonstration notice">
  <p><strong class="demo-note__tag">Demonstration</strong> ${esc(c.person.name)} is a fictional person. Every profile detail and case note on this site is invented. <a href="/guide/#replace">Replace the demo content</a></p>
</aside>`
    : "";

const header = (route: RouteId, c: PortfolioContent): string => {
  const items = NAV.map((item) => {
    const current = item.id === route ? ` aria-current="page"` : "";
    return `<li><a class="routes__link" href="${item.href}"${current}>${esc(item.label)}</a></li>`;
  }).join("");
  return `<header class="topbar">
  <div class="topbar__inner">
    <a class="wordmark" href="/">${MARK}<span class="wordmark__name">${esc(c.site.siteName)}</span></a>
    <nav class="routes" aria-label="Primary"><ul class="routes__list">${items}</ul></nav>
  </div>
</header>`;
};

const footer = (c: PortfolioContent): string => {
  const contact = c.contact
    .map((link) => `<li><a href="${safeHref(link.href)}">${esc(link.text)}</a></li>`)
    .join("");
  return `<footer class="colophon">
  <div class="colophon__inner">
    <div class="colophon__who">
      <p class="colophon__name">${esc(c.person.name)}</p>
      <ul class="colophon__links" aria-label="Contact">${contact}</ul>
    </div>
    <p class="colophon__credit">${esc(c.site.credit)}${
      c.site.demonstration ? " · Demonstration content is fictional." : ""
    }</p>
  </div>
</footer>`;
};

export const renderDocument = (page: PageSpec, c: PortfolioContent, opts: { readonly production: boolean }): string => {
  const origin = c.site.origin.replace(/\/+$/, "");
  const canonical =
    origin && page.path !== undefined ? `<link rel="canonical" href="${esc(origin + page.path)}">` : "";
  const robots = c.site.indexable && page.route !== "not-found" ? "index, follow" : "noindex, nofollow";

  const head = join([
    `<meta charset="utf-8">`,
    opts.production && `<meta http-equiv="Content-Security-Policy" content="${CSP}">`,
    `<meta name="viewport" content="width=device-width, initial-scale=1">`,
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}">`,
    `<meta name="robots" content="${robots}">`,
    `<meta name="referrer" content="no-referrer">`,
    `<meta name="color-scheme" content="light dark">`,
    `<meta name="theme-color" content="#f4f1ea" media="(prefers-color-scheme: light)">`,
    `<meta name="theme-color" content="#111821" media="(prefers-color-scheme: dark)">`,
    canonical,
    `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`,
    `<link rel="stylesheet" href="/src/styles/main.css">`,
    `<script type="module" src="/src/main.ts"></script>`,
  ]);

  return `<!doctype html>
<html lang="${esc(c.site.lang)}" data-route="${page.route}">
<head>
${head}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
${banner(c)}
${header(page.route, c)}
<main id="main" class="page page--${page.route}" tabindex="-1">
${page.main}
</main>
${footer(c)}
</body>
</html>
`;
};
