/**
 * Build configuration for Defensive Signal.
 *
 * Each route's HTML file is a placeholder. The `render-pages` plugin replaces it with
 * a complete document generated from the typed content in `src/content/`, so every
 * page works with JavaScript turned off. The config imports nothing from `vite`
 * itself, which keeps it readable and lets `tsc` check it without extra typings.
 */

import { content } from "./src/content/profile.ts";
import { guide } from "./src/content/guide.ts";
import { renderDocument } from "./src/render/layout.ts";
import { pages } from "./src/render/pages.ts";

interface HtmlContext {
  readonly path: string;
  readonly server?: unknown;
}

const routes = pages(content, guide);

const renderPages = {
  name: "defensive-signal:render-pages",
  transformIndexHtml: {
    order: "pre" as const,
    handler(_html: string, ctx: HtmlContext): string {
      const page = routes[ctx.path];
      if (!page) throw new Error(`No page is defined for ${ctx.path}`);
      return renderDocument(page, content, { production: ctx.server === undefined });
    },
  },
};

export default {
  appType: "mpa" as const,
  plugins: [renderPages],
  build: {
    target: "es2022",
    sourcemap: false,
    assetsInlineLimit: 0,
    modulePreload: { polyfill: false },
    rollupOptions: {
      input: {
        home: "index.html",
        profile: "profile/index.html",
        work: "work/index.html",
        guide: "guide/index.html",
        notFound: "404.html",
      },
    },
  },
  server: { host: "127.0.0.1" },
  preview: { host: "127.0.0.1" },
};
