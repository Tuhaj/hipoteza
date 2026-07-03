// Shared helpers for repo checks (guards + tests). Zero dependencies.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

// Repo root: this file lives in <root>/scripts/, so ".." is the root.
export const ROOT = fileURLToPath(new URL("..", import.meta.url));
export const SITE = join(ROOT, "site");

const SKIP_DIRS = new Set(["node_modules", ".git", "fonts"]);

/** Recursively list files under `dir`, optionally filtered by extension set (with dots). */
export function walk(dir, exts = null) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      out.push(...walk(join(dir, ent.name), exts));
    } else if (!exts || exts.has(extname(ent.name).toLowerCase())) {
      out.push(join(dir, ent.name));
    }
  }
  return out;
}

export const read = (p) => readFileSync(p, "utf8");
export const rel = (p) => p.slice(ROOT.length).replace(/^[/\\]/, "");

/** List the deployed HTML pages under site/. */
export const htmlPages = () => walk(SITE, new Set([".html"])).sort();

// Long dashes forbidden by the project rules: figure dash, en, em, horizontal bar.
// Defined by codepoint so this source file stays free of the glyphs it forbids.
export const DASH_CODEPOINTS = [0x2012, 0x2013, 0x2014, 0x2015];
const DASH_SET = new Set(DASH_CODEPOINTS);
export const DASH_LABELS = {
  0x2012: "figure dash",
  0x2013: "en dash",
  0x2014: "em dash",
  0x2015: "horizontal bar",
};

/** Find long-dash occurrences in `text`. Returns [{line, col, cp}]. */
export function findDashes(text) {
  const hits = [];
  text.split("\n").forEach((lineStr, i) => {
    for (let c = 0; c < lineStr.length; c++) {
      const cp = lineStr.codePointAt(c);
      if (DASH_SET.has(cp)) hits.push({ line: i + 1, col: c + 1, cp });
    }
  });
  return hits;
}

// High-confidence secret patterns. Matching any of these in a tracked file is a hard failure.
export const SECRET_PATTERNS = [
  { name: "Brevo API key", re: /xkeysib-[a-f0-9]{64}-[A-Za-z0-9]{16}/ },
  { name: "AWS access key id", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "Private key block", re: /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/ },
];

/**
 * Build a denylist of sensitive literal values from a local, gitignored .env.local
 * (S3 bucket, distribution id, key, sender). Used to assert none of them leaked into
 * tracked files. The values themselves never live in the repo, so nothing is exposed.
 */
export function envDenylist() {
  const envPath = join(ROOT, ".env.local");
  if (!existsSync(envPath)) return [];
  const wanted = new Set([
    "HIPOTEZA_BUCKET",
    "HIPOTEZA_DISTRIBUTION_ID",
    "HIPOTEZA_SENDER_EMAIL",
    "BREVO_API_KEY",
  ]);
  const out = [];
  for (const line of read(envPath).split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const [, key, rawVal] = m;
    const val = rawVal.replace(/^["']|["']$/g, "").trim();
    if (wanted.has(key) && val.length >= 6) out.push({ key, value: val });
  }
  return out;
}
