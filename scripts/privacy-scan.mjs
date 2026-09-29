// Identity and privacy scan.
//
//   npm run audit:privacy                 # repository files + dist/ if present
//   npm run audit:privacy -- --history    # also everything reachable in Git history:
//                                         # commit messages and authors, every path, and
//                                         # the contents of every blob, including files
//                                         # that were later deleted or renamed
//
// Generic rules catch real-looking contact details, local file paths, secrets,
// long hashes, source maps, unknown external hosts, and image metadata.
//
// Identifiers that must never be published (your real name, a client's name, a
// private domain) go in a local denylist that is NOT committed:
//
//   .privacy-denylist.json                      (ignored by Git)
//   or DS_PRIVACY_DENYLIST=/path/to/list.json   (kept anywhere outside the repo)
//
//   { "terms": ["Private Name", "private.example"],
//     "allow": { "Private Name": ["LICENSE"] } }
//
// Matching is case-insensitive. `allow` lists files where a term is expected.
//
// Findings name the location (file and line, or commit/blob/path for history).
// A matched denylisted term is printed as [redacted] and other matches are
// masked, but locations show file paths as they are, so keep reports private.

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const withHistory = process.argv.includes("--history");
const findings = [];
// Matched text may itself be sensitive (a token, an address), so only a masked
// hint is printed: the first two characters and the length.
const mask = (value) => {
  const text = String(value);
  if (text === "" || text === "[redacted]") return text;
  return text.length <= 4 ? "****" : `${text.slice(0, 2)}… (${text.length} chars)`;
};
const report = (where, rule, sample) => findings.push({ where, rule, sample: mask(sample) });

/* ------------------------------------------------------------ file list */
const SKIP_DIRS = new Set(["node_modules", ".git", "dist"]);
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return SKIP_DIRS.has(name) ? [] : walk(path);
    return [path];
  });

const inGit = existsSync(join(root, ".git"));
const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const gitBuffer = (args, input, maxBuffer) =>
  execFileSync("git", args, { cwd: root, input, maxBuffer, stdio: ["pipe", "pipe", "pipe"] });

let sourceFiles;
if (inGit) {
  sourceFiles = git("ls-files", "-z", "--cached", "--others", "--exclude-standard")
    .split("\0")
    .filter(Boolean)
    .map((f) => join(root, f));
} else {
  sourceFiles = walk(root).filter((f) => !/[\\/]\.privacy-denylist\.json$/.test(f));
}
const distDir = join(root, "dist");
const distFiles = existsSync(distDir) ? walk(distDir) : [];
const allFiles = [...new Set([...sourceFiles, ...distFiles])].filter((f) => existsSync(f));
const rel = (f) => relative(root, f).split("\\").join("/");

/* ------------------------------------------------------------- denylist */
const denylistPath = process.env.DS_PRIVACY_DENYLIST || join(root, ".privacy-denylist.json");
let terms = [];
let allow = {};
if (existsSync(denylistPath)) {
  const parsed = JSON.parse(readFileSync(denylistPath, "utf8"));
  terms = (parsed.terms ?? []).filter((t) => typeof t === "string" && t.trim().length > 1);
  allow = parsed.allow ?? {};
  console.log(`Denylist loaded: ${terms.length} term(s).`);
} else {
  console.log("No denylist found. Generic rules only (see the header of this script).");
}

/* --------------------------------------------------------- generic rules */
const ALLOWED_HOSTS = [
  /^([a-z0-9-]+\.)*example\.invalid$/,
  /^([a-z0-9-]+\.)*example\.(com|org|net)$/,
  /^portfolio\.example$/,
  /^(localhost|127\.0\.0\.1)$/,
  /^www\.w3\.org$/,
  /^registry\.npmjs\.org$/,
];
// Exact URLs allowed on hosts that are otherwise blocked. Only a character-for-
// character match is accepted, so other paths, repositories, or query strings on
// the same host still fail. These are the README's CI status badge and its link.
// If you fork the starter, replace them with your own repository's URLs.
const ALLOWED_URLS = new Set([
  "https://github.com/Nitheesh2325/defensive-signal-portfolio/actions/workflows/ci.yml/badge.svg?branch=main",
  "https://github.com/Nitheesh2325/defensive-signal-portfolio/actions/workflows/ci.yml?query=branch%3Amain",
]);
const ALLOWED_EMAIL = /@(([a-z0-9-]+\.)*example\.(invalid|com|org|net))$/i;

const RULES = [
  { name: "email address outside reserved example domains", re: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, keep: (m) => !ALLOWED_EMAIL.test(m) },
  { name: "phone number", re: /(?<![\w.])\+?(?:\d{1,3}[\s.-])?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}(?!\w)/g },
  { name: "local file path", re: /\b[A-Za-z]:[\\/](?:Users|Documents and Settings)[\\/]|(?<![\w.])\/(?:home|Users)\/[A-Za-z0-9._-]+\//g },
  { name: "private key", re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g },
  { name: "cloud or API token", re: /\b(?:AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{20,}|xox[abprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{35}|sk-[A-Za-z0-9]{32,})\b/g },
  { name: "long hex digest (possible source hash)", re: /\b[a-f0-9]{64,}\b/gi },
  { name: "source map reference", re: /sourceMappingURL\s*=/g },
  {
    name: "external host not on the allow list",
    // Captures the whole URL (up to whitespace, quotes, brackets, or parentheses)
    // so exact-URL exceptions can be checked; the host decides everything else.
    re: /https?:\/\/([a-z0-9.-]+)[^\s"'`<>()[\]]*/gi,
    keep: (url, host) => !ALLOWED_URLS.has(url) && !ALLOWED_HOSTS.some((re) => re.test(host.toLowerCase())),
  },
];

const TEXT_EXT = new Set([
  "", ".md", ".txt", ".json", ".yml", ".yaml", ".html", ".css", ".js", ".mjs", ".ts", ".svg", ".xml",
  ".gitignore", ".gitattributes", ".editorconfig", ".nvmrc",
]);
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".ico"]);
const IMAGE_METADATA = /Exif\0\0|<x:xmpmeta|http:\/\/ns\.adobe\.com\/xap/;
const isLockfile = (path) => path === "package-lock.json";

// `file` is the repository path checked against the denylist `allow` list.
const scanText = (where, file, text, { lockfile = false } = {}) => {
  scanGeneric(where, text, { lockfile });
  scanDenylist(where, file, text);
};

// Generic rules depend only on content, so each text is checked once.
function scanGeneric(where, text, { lockfile = false } = {}) {
  text.split(/\r?\n/).forEach((line, i) => {
    const at = `${where}:${i + 1}`;
    for (const rule of RULES) {
      // The lockfile carries upstream package metadata (integrity digests, funding
      // links). It is generated by npm, not written by hand, so those rules skip it.
      if (lockfile && (rule.name.startsWith("long hex") || rule.name.startsWith("external host"))) continue;
      for (const m of line.matchAll(rule.re)) {
        if (!rule.keep || rule.keep(m[0], m[1])) report(at, rule.name, m[0]);
      }
    }
  });
}

// Denylist allowances are path-specific, so this runs once per path.
function scanDenylist(where, file, text) {
  if (!terms.length) return;
  text.split(/\r?\n/).forEach((line, i) => {
    const lower = line.toLowerCase();
    for (const term of terms) {
      if (!lower.includes(term.toLowerCase())) continue;
      const allowedIn = allow[term] ?? [];
      if (!allowedIn.includes(file)) report(`${where}:${i + 1}`, "denylisted identifier", "[redacted]");
    }
  });
}

for (const file of allFiles) {
  const name = rel(file);
  const ext = extname(file).toLowerCase();
  for (const term of terms) {
    if (name.toLowerCase().includes(term.toLowerCase())) report(name, "denylisted identifier in file name", "[redacted]");
  }
  if (ext === ".map") report(name, "source map file", name);
  if (IMAGE_EXT.has(ext)) {
    const bytes = readFileSync(file).toString("latin1");
    if (IMAGE_METADATA.test(bytes)) report(name, "image metadata (EXIF/XMP)", name);
    continue;
  }
  if (!TEXT_EXT.has(ext) && !/^\.[a-z]+rc$/.test(ext)) continue;
  scanText(name, name, readFileSync(file, "utf8"), { lockfile: isLockfile(name) });
}

/* ---------------------------------------------------------- Git history */
// Limits keep a malformed or unexpectedly large history from exhausting memory.
// A blob that cannot be scanned within them is a finding, never a silent skip.
const HISTORY_LIMITS = {
  blobBytes: 8 * 1024 * 1024,
  totalBytes: 256 * 1024 * 1024,
  batchBytes: 32 * 1024 * 1024,
};

const isBinary = (buffer) => buffer.subarray(0, 8000).includes(0);
const historyLocation = (commit, id, path) => `history:commit=${commit.slice(0, 12)}:blob=${id.slice(0, 12)}:${path}`;

function scanHistory() {
  if (git("rev-parse", "--is-shallow-repository").trim() !== "false") {
    report("history", "shallow clone: fetch the full history before scanning", "");
    return;
  }

  // Commit messages and identities. No-reply addresses in author fields and commit
  // trailers (for example GitHub's private commit email or a co-author trailer)
  // are non-personal by design. Names in the same fields are still checked
  // against the denylist.
  const log = git("log", "--all", "--format=%an%n%ae%n%cn%n%ce%n%B%n--end--");
  const cleaned = log
    .replace(/[0-9]+\+[A-Za-z0-9-]+@users\.noreply\.github\.com/g, "noreply@example.com")
    .replace(/\b[A-Za-z0-9._+-]*no-?reply@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/gi, "noreply@example.com");
  scanText("git-log", "git-log", cleaned);

  // Every blob reachable from every ref, found by walking the full tree of every
  // commit, so files that were later deleted or renamed are still included.
  const commits = git("rev-list", "--all").split("\n").filter(Boolean);
  // A blob (one exact file content) can appear under several paths and commits.
  // Its content is read once, but every distinct path is kept, because denylist
  // allowances are path-specific.
  const blobs = new Map(); // blob id -> Map(path -> first commit it appeared at under that path)
  const paths = new Set();
  let locationCount = 0;
  for (const commit of commits) {
    const entries = git("ls-tree", "-r", "-z", "--full-tree", commit).split("\0").filter(Boolean);
    for (const entry of entries) {
      const tab = entry.indexOf("\t");
      if (tab < 0) throw new Error(`unreadable tree entry in commit ${commit}`);
      const [, type, id] = entry.slice(0, tab).split(" ");
      const path = entry.slice(tab + 1);
      if (!type || !id || !path) throw new Error(`unreadable tree entry in commit ${commit}`);
      paths.add(path);
      if (type !== "blob") continue;
      if (!blobs.has(id)) blobs.set(id, new Map());
      const locations = blobs.get(id);
      if (!locations.has(path)) {
        locations.set(path, commit);
        locationCount++;
      }
    }
  }
  // A stable representative location for findings that depend only on content.
  const representative = (id) => {
    const [path, commit] = [...blobs.get(id)].sort(([a], [b]) => a.localeCompare(b))[0];
    return { path, commit };
  };

  for (const path of paths) {
    for (const term of terms) {
      if (path.toLowerCase().includes(term.toLowerCase())) {
        report(`history-path:${path}`, "denylisted identifier in historic path", "[redacted]");
      }
    }
  }

  const ids = [...blobs.keys()];
  const sizes = new Map();
  if (ids.length) {
    const check = gitBuffer(["cat-file", "--batch-check=%(objectname) %(objecttype) %(objectsize)"], `${ids.join("\n")}\n`, 64 * 1024 * 1024)
      .toString("utf8")
      .split("\n")
      .filter(Boolean);
    for (const line of check) {
      const [id, type, size] = line.split(" ");
      if (type !== "blob") throw new Error(`object ${id} is missing or not a blob`);
      sizes.set(id, Number(size));
    }
    if (sizes.size !== ids.length) throw new Error("some historical blobs could not be listed");
  }

  let total = 0;
  let batch = [];
  let batchSize = 0;
  let binarySkipped = 0;

  const flush = () => {
    if (!batch.length) return;
    const out = gitBuffer(["cat-file", "--batch"], `${batch.join("\n")}\n`, batchSize + batch.length * 128 + 1024);
    let offset = 0;
    for (const id of batch) {
      const headerEnd = out.indexOf(10, offset);
      if (headerEnd < 0) throw new Error(`truncated output reading blob ${id}`);
      const [gotId, type, size] = out.subarray(offset, headerEnd).toString("utf8").split(" ");
      const length = Number(size);
      if (gotId !== id || type !== "blob" || !Number.isFinite(length)) throw new Error(`unexpected output reading blob ${id}`);
      const content = out.subarray(headerEnd + 1, headerEnd + 1 + length);
      if (content.length !== length) throw new Error(`truncated content for blob ${id}`);
      offset = headerEnd + 1 + length + 1;

      const locations = [...blobs.get(id)];
      const rep = representative(id);
      const repWhere = historyLocation(rep.commit, id, rep.path);

      for (const [path, commit] of locations) {
        if (extname(path).toLowerCase() === ".map") report(historyLocation(commit, id, path), "source map file", path);
      }
      const imagePath = locations.find(([path]) => IMAGE_EXT.has(extname(path).toLowerCase()));
      if (imagePath) {
        if (IMAGE_METADATA.test(content.toString("latin1"))) {
          report(historyLocation(imagePath[1], id, imagePath[0]), "image metadata (EXIF/XMP)", imagePath[0]);
        }
        continue;
      }
      if (isBinary(content)) {
        binarySkipped++;
        continue;
      }

      const text = content.toString("utf8");
      // Generic rules once per blob. Lockfile exceptions apply only when every
      // path this content ever had is the lockfile.
      scanGeneric(repWhere, text, { lockfile: locations.every(([path]) => isLockfile(path)) });
      // Denylist once per distinct historical path, with that path's allowances.
      for (const [path, commit] of locations) scanDenylist(historyLocation(commit, id, path), path, text);
    }
    batch = [];
    batchSize = 0;
  };

  for (const id of ids) {
    const size = sizes.get(id);
    const { commit, path } = representative(id);
    if (size > HISTORY_LIMITS.blobBytes) {
      report(historyLocation(commit, id, path), "historical blob too large to scan; review it by hand", "");
      continue;
    }
    if (total + size > HISTORY_LIMITS.totalBytes) {
      report("history", "history larger than the scan limit; not every blob was inspected", "");
      break;
    }
    total += size;
    if (batchSize + size > HISTORY_LIMITS.batchBytes) flush();
    batch.push(id);
    batchSize += size;
  }
  flush();

  const remotes = git("remote").trim();
  console.log(
    `History scanned: ${commits.length} commit(s), ${paths.size} distinct path(s), ${ids.length} unique blob(s)` +
      ` found at ${locationCount} blob/path location(s)` +
      ` (${(total / 1024).toFixed(0)} KB read, ${binarySkipped} binary blob(s) skipped). Remotes: ${remotes || "none"}.`,
  );
}

if (withHistory) {
  if (!inGit) {
    report("history", "history requested but this folder is not a Git repository", "");
  } else {
    // Fail closed: if any part of the history cannot be read, the scan fails.
    try {
      scanHistory();
    } catch (error) {
      const reason = String(error?.message ?? error).split("\n")[0];
      report("history", `Git history could not be inspected completely (${reason})`, "");
    }
  }
}

/* --------------------------------------------------------------- result */
console.log(`Scanned ${allFiles.length} files${distFiles.length ? ` (including ${distFiles.length} in dist/)` : ""}.`);
if (findings.length) {
  for (const f of findings) console.log(`FAIL  ${f.where}  ${f.rule}${f.sample ? `: ${f.sample}` : ""}`);
  console.log(`\n${findings.length} finding(s).`);
  process.exit(1);
}
console.log("PASS  no identity or privacy findings.");
