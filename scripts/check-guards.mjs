#!/usr/bin/env node
// Repo guardrails: no long dashes in shipped content, no secrets or infra
// identifiers in tracked files. Run via `npm run check` and in the pre-commit hook.
import { execSync } from "node:child_process";
import { join } from "node:path";
import { ROOT, read, findDashes, DASH_LABELS, SECRET_PATTERNS, envDenylist } from "./lib.mjs";

const BINARY = /\.(png|jpe?g|gif|webp|ico|woff2?|ttf|otf|pdf|docx?|zip)$/i;
// Files allowed to contain long-dash glyphs because they document the rule itself.
const DASH_EXEMPT = new Set(["CLAUDE.md"]);
const READ_SKIP = new Set(["package-lock.json"]);

function tracked() {
  return execSync("git ls-files -z", { cwd: ROOT }).toString("utf8").split("\0").filter(Boolean);
}

const files = tracked().filter((f) => !BINARY.test(f) && !READ_SKIP.has(f.split("/").pop()));
const failures = [];

// 1) No long dashes in shipped content (site/) or docs, except rule docs.
for (const f of files) {
  if (DASH_EXEMPT.has(f)) continue;
  const hits = findDashes(read(join(ROOT, f)));
  for (const h of hits) {
    failures.push(
      `${f}:${h.line}:${h.col} long dash (${DASH_LABELS[h.cp]}). Use a comma, period, colon or parentheses.`,
    );
  }
}

// 2) No high-confidence secrets in any tracked file.
for (const f of files) {
  const text = read(join(ROOT, f));
  for (const { name, re } of SECRET_PATTERNS) {
    if (re.test(text)) failures.push(`${f}: looks like a committed secret (${name}).`);
  }
}

// 3) No infra identifiers from .env.local leaking into tracked files.
const denylist = envDenylist();
for (const f of files) {
  const text = read(join(ROOT, f));
  for (const { key, value } of denylist) {
    if (text.includes(value))
      failures.push(
        `${f}: contains the value of ${key} from .env.local (keep infra ids out of the repo).`,
      );
  }
}

// 4) No .env file should be tracked (only .env.example is allowed).
for (const f of files) {
  const base = f.split("/").pop();
  if (/^\.env/.test(base) && base !== ".env.example") {
    failures.push(`${f}: an env file is tracked. Only .env.example may be committed.`);
  }
}

if (failures.length) {
  console.error(`✗ Guard checks failed (${failures.length}):\n`);
  for (const line of failures) console.error("  - " + line);
  console.error("");
  process.exit(1);
}
console.log(
  `✓ Guard checks passed (${files.length} tracked files, ${denylist.length} denylisted values).`,
);
