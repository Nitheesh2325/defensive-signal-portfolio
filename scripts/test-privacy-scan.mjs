// Regression test for `privacy-scan.mjs --history`.
//
//   npm run test:privacy
//
// Builds throwaway Git repositories in the system temp folder, commits fictional
// canary values, deletes them again, and checks that the history scan still
// finds them. Canary strings are assembled at runtime so this file itself never
// contains a matchable secret, address, or denylisted term.

import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scanner = join(dirname(fileURLToPath(import.meta.url)), "privacy-scan.mjs");

// Fictional canaries only.
const CANARY_NAME = ["Zephyrine", "Quillfeather"].join(" ");
const CANARY_TOKEN = "AKIA" + "CANARYFAKE000001";
const CANARY_EMAIL = ["canary.leak", "canary-mail.test"].join("@");
const NOREPLY_AUTHOR = ["1234567+canary-dev", "users.noreply.github.com"].join("@");

const workspace = mkdtempSync(join(tmpdir(), "ds-privacy-test-"));
// Isolate from the machine's Git configuration with an empty global config file.
const emptyConfig = join(workspace, "empty.gitconfig");
writeFileSync(emptyConfig, "");

const gitEnv = {
  ...process.env,
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_CONFIG_GLOBAL: emptyConfig,
  GIT_AUTHOR_NAME: "Canary Developer",
  GIT_AUTHOR_EMAIL: NOREPLY_AUTHOR,
  GIT_COMMITTER_NAME: "Canary Developer",
  GIT_COMMITTER_EMAIL: NOREPLY_AUTHOR,
};
delete gitEnv.DS_PRIVACY_DENYLIST;

const denylist = join(workspace, "denylist.json");
writeFileSync(denylist, JSON.stringify({ terms: [CANARY_NAME] }));

let failures = 0;
const check = (label, condition, detail = "") => {
  console.log(`${condition ? "ok  " : "FAIL"}  ${label}${!condition && detail ? `\n      ${detail}` : ""}`);
  if (!condition) failures++;
};

function makeRepo(name) {
  const dir = join(workspace, name);
  mkdirSync(join(dir, "scripts"), { recursive: true });
  copyFileSync(scanner, join(dir, "scripts", "privacy-scan.mjs"));
  const git = (...args) => execFileSync("git", args, { cwd: dir, env: gitEnv, stdio: "pipe" });
  git("init", "-q", "-b", "main");
  git("config", "commit.gpgsign", "false");
  git("config", "core.autocrlf", "false");
  const write = (file, text) => writeFileSync(join(dir, file), text);
  const commit = (message) => {
    git("add", "-A");
    git("commit", "-q", "-m", message);
  };
  const remove = (file) => git("rm", "-q", file);
  const rename = (from, to) => git("mv", from, to);
  write("README.md", "# Canary project\n\nFictional content for a scanner test.\n");
  commit("Add readme");
  return { dir, write, commit, remove, rename };
}

function scan(dir, { withDenylist = true, history = true } = {}) {
  const env = { ...gitEnv };
  if (withDenylist) env.DS_PRIVACY_DENYLIST = denylist;
  const args = [join(dir, "scripts", "privacy-scan.mjs")];
  if (history) args.push("--history");
  const run = spawnSync(process.execPath, args, { cwd: dir, env, encoding: "utf8" });
  return { status: run.status, output: `${run.stdout}${run.stderr}` };
}

const leaksNothing = (output) =>
  !output.includes(CANARY_NAME) && !output.includes(CANARY_TOKEN) && !output.includes(CANARY_EMAIL);

try {
  // 1. Clean history passes, with a GitHub no-reply author on every commit.
  {
    const repo = makeRepo("clean");
    repo.write("notes.md", "Nothing private here.\n");
    // Lockfile metadata (digests, upstream links) follows the same exceptions in
    // history as in the working tree, including after the file is deleted.
    const digest = "ab".repeat(32);
    const upstream = ["https:", "", "upstream-project.dev", "sponsor"].join("/");
    repo.write("package-lock.json", `{ "integrity": "${digest}", "funding": "${upstream}" }\n`);
    repo.commit("Add notes and lockfile");
    repo.remove("package-lock.json");
    repo.commit("Remove lockfile");
    const result = scan(repo.dir);
    check("clean history passes", result.status === 0, result.output);
    check("GitHub no-reply author address is permitted", !/email address/.test(result.output), result.output);
  }

  // 2. A denylisted identifier committed, renamed, then deleted is still found.
  {
    const repo = makeRepo("denylisted");
    repo.write("draft.md", `Draft bio for ${CANARY_NAME}.\n`);
    repo.commit("Add draft");
    repo.rename("draft.md", "bio.md");
    repo.commit("Rename draft");
    repo.remove("bio.md");
    repo.commit("Remove bio");
    const current = scan(repo.dir, { history: false });
    check("deleted identifier is absent from the working tree scan", current.status === 0, current.output);
    const result = scan(repo.dir);
    check("deleted denylisted identifier fails --history", result.status === 1, result.output);
    check(
      "finding names the historical blob and path",
      /history:commit=[0-9a-f]{12}:blob=[0-9a-f]{12}:(draft|bio)\.md:1\s+denylisted identifier/.test(result.output),
      result.output,
    );
    check("denylisted term is never printed", leaksNothing(result.output), result.output);
  }

  // 3. A generic secret and personal address committed, then deleted, are still found.
  {
    const repo = makeRepo("generic");
    repo.write("config.txt", `key = ${CANARY_TOKEN}\ncontact = ${CANARY_EMAIL}\n`);
    repo.commit("Add config");
    repo.remove("config.txt");
    repo.commit("Remove config");
    const result = scan(repo.dir, { withDenylist: false });
    check("deleted token fails --history", result.status === 1 && /config\.txt:1\s+cloud or API token/.test(result.output), result.output);
    check("deleted personal email fails --history", /config\.txt:2\s+email address/.test(result.output), result.output);
    check("matched secrets are masked in the report", leaksNothing(result.output), result.output);
  }

  // 4. A personal address in a commit message is still found; no-reply is not.
  {
    const repo = makeRepo("message");
    repo.write("a.md", "a\n");
    repo.commit(`Add a\n\nReported-by: ${CANARY_EMAIL}`);
    const result = scan(repo.dir, { withDenylist: false });
    check("personal address in a commit message fails", result.status === 1 && /git-log:\d+\s+email address/.test(result.output), result.output);
  }

  // 5. The scan fails closed when history cannot be read.
  {
    const dir = join(workspace, "not-a-repo");
    mkdirSync(join(dir, "scripts"), { recursive: true });
    copyFileSync(scanner, join(dir, "scripts", "privacy-scan.mjs"));
    const result = scan(dir, { withDenylist: false });
    check("--history outside a Git repository fails", result.status === 1, result.output);
  }
} finally {
  rmSync(workspace, { recursive: true, force: true });
}

if (failures) {
  console.log(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log("\nAll privacy-scan history checks passed.");
