// Site audit for the production build in dist/.
//
//   npm run build && npm run audit:site
//
// Checks the output a visitor would receive: structure, links, security posture,
// external requests, and size budgets. Read-only and offline.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

const BUDGET = {
  jsGzip: 20 * 1024,
  cssGzip: 15 * 1024,
  anyFile: 150 * 1024,
};

const EXPECTED_ROUTES = ["index.html", "profile/index.html", "work/index.html", "guide/index.html", "404.html"];

const failures = [];
const fail = (message) => failures.push(message);

if (!existsSync(dist)) {
  console.error("dist/ is missing. Run `npm run build` first.");
  process.exit(1);
}

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const files = walk(dist).sort();
const rel = (file) => relative(dist, file).split("\\").join("/");
const read = (file) => readFileSync(file, "utf8");

/* ---------------------------------------------------------------- manifest */
console.log("Build manifest");
for (const file of files) console.log(`  ${rel(file)}  ${statSync(file).size} B`);

/* -------------------------------------------------------------- source maps */
for (const file of files) {
  if (extname(file) === ".map") fail(`source map shipped: ${rel(file)}`);
  if ([".js", ".css"].includes(extname(file)) && /sourceMappingURL\s*=/.test(read(file))) {
    fail(`sourceMappingURL comment in ${rel(file)}`);
  }
}

/* ------------------------------------------------------------------ routes */
for (const route of EXPECTED_ROUTES) {
  if (!existsSync(join(dist, route))) fail(`route missing from build: ${route}`);
}

const demoMode = /demonstration:\s*true/.test(read(join(root, "src/content/profile.ts")));
const htmlFiles = files.filter((f) => extname(f) === ".html");
const titles = new Map();
const idsByPage = new Map();

for (const file of htmlFiles) {
  const name = rel(file);
  const html = read(file);
  idsByPage.set(name, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));

  if (!/^<!doctype html>/i.test(html)) fail(`${name}: missing doctype`);
  if (!/<html lang="[a-z]{2}(-[A-Za-z]+)?"/.test(html)) fail(`${name}: missing lang attribute`);
  if (!/<meta name="viewport" content="width=device-width, initial-scale=1">/.test(html)) {
    fail(`${name}: missing or zoom-restricting viewport meta`);
  }
  if (/user-scalable=no|maximum-scale=1(?!\d)/.test(html)) fail(`${name}: viewport blocks zoom`);
  if (!/<meta http-equiv="Content-Security-Policy" content="default-src 'none';/.test(html)) {
    fail(`${name}: production Content-Security-Policy meta missing`);
  }
  const h1s = html.match(/<h1\b/g) ?? [];
  if (h1s.length !== 1) fail(`${name}: expected exactly one <h1>, found ${h1s.length}`);
  if (!/<a class="skip-link" href="#main">/.test(html) || !/<main id="main"/.test(html)) {
    fail(`${name}: skip link or main landmark missing`);
  }
  if (!/<nav\b[^>]*aria-label="Primary"/.test(html)) fail(`${name}: primary navigation landmark missing`);
  if (!/<footer\b/.test(html)) fail(`${name}: footer landmark missing`);

  const title = (html.match(/<title>([^<]+)<\/title>/) ?? [])[1];
  if (!title) fail(`${name}: missing <title>`);
  else if (titles.has(title)) fail(`${name}: title duplicates ${titles.get(title)}`);
  else titles.set(title, name);

  const description = (html.match(/<meta name="description" content="([^"]*)">/) ?? [])[1] ?? "";
  if (description.length < 50 || description.length > 200) {
    fail(`${name}: meta description should be 50–200 characters (found ${description.length})`);
  }

  const robots = (html.match(/<meta name="robots" content="([^"]*)">/) ?? [])[1];
  if (!robots) fail(`${name}: robots meta missing`);
  if (name === "404.html" && robots !== "noindex, nofollow") fail("404.html must be noindex, nofollow");
  if (demoMode && robots !== "noindex, nofollow") fail(`${name}: demonstration builds must not be indexable`);
  if (demoMode && !/class="demo-note"/.test(html)) fail(`${name}: demonstration notice missing`);

  // CSP forbids inline script and inline style; catch them before the browser does.
  for (const m of html.matchAll(/<script\b([^>]*)>/g)) {
    if (!/\bsrc="/.test(m[1])) fail(`${name}: inline <script> is blocked by the CSP`);
  }
  if (/<style\b/.test(html) || /\sstyle="/.test(html)) fail(`${name}: inline styles are blocked by the CSP`);
  if (/\son[a-z]+="/.test(html)) fail(`${name}: inline event handler attribute`);

  // Resources must be same-origin; links may point anywhere.
  for (const m of html.matchAll(/<(script|link|img|source|iframe|video|audio)\b[^>]*?\s(?:src|href|srcset)="([^"]+)"/g)) {
    if (/^(https?:)?\/\//i.test(m[2])) fail(`${name}: external resource ${m[2]}`);
  }
  for (const m of html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)) {
    const href = m[1];
    if (/^javascript:/i.test(href)) fail(`${name}: javascript: link`);
    if (/^https?:/i.test(href) && !/^https:\/\/([a-z0-9-]+\.)*example\.invalid(\/|$)/i.test(href) && demoMode) {
      fail(`${name}: demonstration link leaves the reserved example domain: ${href}`);
    }
    if (/^mailto:/i.test(href) && demoMode && !/@example\.invalid$/i.test(href)) {
      fail(`${name}: demonstration email outside example.invalid: ${href}`);
    }
  }
}

/* ---------------------------------------------------------- internal links */
const pageFor = (path) => {
  const clean = path.replace(/^\//, "");
  if (clean === "") return "index.html";
  if (clean.endsWith("/")) return `${clean}index.html`;
  return clean;
};

for (const file of htmlFiles) {
  const name = rel(file);
  const html = read(file);
  for (const m of html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)) {
    const href = m[1];
    if (/^(https?:|mailto:)/i.test(href)) continue;
    const [path, hash] = href.split("#");
    const target = path ? pageFor(path) : name;
    if (!existsSync(join(dist, target))) {
      fail(`${name}: broken link ${href}`);
      continue;
    }
    if (hash && !(idsByPage.get(target) ?? new Set()).has(hash)) fail(`${name}: link ${href} has no matching id`);
  }
}

/* ----------------------------------------------------------- JS and CSS */
const NETWORK_APIS = /\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|importScripts)\b/;
for (const file of files.filter((f) => extname(f) === ".js")) {
  const text = read(file);
  if (NETWORK_APIS.test(text)) fail(`${rel(file)}: network API present (${text.match(NETWORK_APIS)[1]})`);
  if (/\b(localStorage|sessionStorage|indexedDB|document\.cookie)\b/.test(text)) {
    fail(`${rel(file)}: client-side storage or cookies`);
  }
  if (/\beval\(|new Function\(/.test(text)) fail(`${rel(file)}: dynamic code evaluation`);
}
for (const file of files.filter((f) => extname(f) === ".css")) {
  const text = read(file);
  if (/url\(\s*["']?(https?:)?\/\//i.test(text) || /@import\s+(url\()?["']?https?:/i.test(text)) {
    fail(`${rel(file)}: external CSS resource`);
  }
  if (/@font-face/i.test(text)) fail(`${rel(file)}: web font declared (the starter uses system fonts)`);
}

/* ------------------------------------------------------------------ SVG */
for (const file of files.filter((f) => extname(f) === ".svg")) {
  const text = read(file);
  if (/<script\b|\son[a-z]+=/i.test(text)) fail(`${rel(file)}: SVG contains script`);
  if (/<style\b/i.test(text)) fail(`${rel(file)}: SVG <style> would be blocked by a strict CSP header`);
  if (/<metadata\b|inkscape:|sodipodi:|<!--/i.test(text)) fail(`${rel(file)}: SVG carries editor metadata or comments`);
  if (/(?:href|src)="(https?:)?\/\//i.test(text)) fail(`${rel(file)}: SVG references an external resource`);
}

/* --------------------------------------------------------------- budgets */
const gz = (ext) =>
  files.filter((f) => extname(f) === ext).reduce((sum, f) => sum + gzipSync(readFileSync(f)).length, 0);
const js = gz(".js");
const css = gz(".css");
console.log(`\nBudgets\n  JS  ${(js / 1024).toFixed(1)} KB gzip (limit ${BUDGET.jsGzip / 1024} KB)`);
console.log(`  CSS ${(css / 1024).toFixed(1)} KB gzip (limit ${BUDGET.cssGzip / 1024} KB)`);
if (js > BUDGET.jsGzip) fail("JavaScript over budget");
if (css > BUDGET.cssGzip) fail("CSS over budget");
for (const file of files) {
  if (statSync(file).size > BUDGET.anyFile) fail(`${rel(file)} is larger than ${BUDGET.anyFile / 1024} KB`);
}

/* ---------------------------------------------------------------- result */
console.log("");
if (failures.length) {
  for (const f of failures) console.log(`FAIL  ${f}`);
  console.log(`\n${failures.length} problem(s) found.`);
  process.exit(1);
}
console.log(`PASS  ${htmlFiles.length} pages, ${files.length} files, no problems found.`);
