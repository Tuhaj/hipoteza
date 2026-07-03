// Structural tests for the static site. Runs with `node --test` (no dependencies).
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { basename, join } from "node:path";
import { SITE, htmlPages, read, findDashes } from "../scripts/lib.mjs";

const pages = htmlPages();
const nameOf = (p) => basename(p);
const contentPages = pages.filter((p) => nameOf(p) !== "404.html");

test("there are HTML pages to check", () => {
  assert.ok(pages.length >= 6, `expected the core pages, found ${pages.length}`);
});

for (const page of pages) {
  const name = nameOf(page);
  const html = read(page);

  test(`${name}: has the required head metadata`, () => {
    assert.match(html, /<html[^>]*\blang="pl"/, "missing lang=pl");
    assert.match(html, /<meta[^>]*charset=/i, "missing charset");
    assert.match(html, /name="viewport"/, "missing viewport");
    assert.match(html, /<title>[^<]+<\/title>/, "missing/empty title");
    assert.match(html, /name="description"\s+content="[^"]{20,}/, "missing/short meta description");
    assert.match(html, /rel="icon"/, "missing favicon link");
  });

  test(`${name}: has nav GitHub icon and theme toggle`, () => {
    assert.match(
      html,
      /class="nav__icon"[^>]*github\.com\/Tuhaj\/hipoteza/,
      "missing nav GitHub icon",
    );
    assert.match(html, /id="themeToggle"/, "missing theme toggle");
  });

  test(`${name}: internal .html links resolve to existing files`, () => {
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    for (const href of hrefs) {
      if (/^(https?:|mailto:|tel:|data:)/.test(href) || href.startsWith("#")) continue;
      const path = href.split("#")[0].split("?")[0];
      if (path === "" || path === "/") {
        assert.ok(existsSync(join(SITE, "index.html")), `${href} -> index.html missing`);
        continue;
      }
      if (!path.endsWith(".html")) continue;
      const target = path.replace(/^\//, "");
      assert.ok(existsSync(join(SITE, target)), `${name}: dead link ${href} -> site/${target}`);
    }
  });
}

test("form pages carry a hidden honeypot field", () => {
  for (const name of ["index.html", "zglos-projekt.html", "zostan-recenzentem.html"]) {
    const html = read(join(SITE, name));
    assert.match(html, /class="hp"/, `${name}: no honeypot input`);
    assert.match(html, /class="hp"[^>]*position:absolute/, `${name}: honeypot not hidden inline`);
  }
});

test("sitemap covers every content page and points only to real files", () => {
  const sitemap = read(join(SITE, "sitemap.xml"));
  const locs = [...sitemap.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => m[1]);
  assert.ok(locs.length > 0, "sitemap has no <loc> entries");

  // Every listed URL resolves to a file that exists.
  for (const loc of locs) {
    const path = loc.replace(/^https?:\/\/[^/]+/, "");
    const file = path === "/" ? "index.html" : path.replace(/^\//, "");
    assert.ok(existsSync(join(SITE, file)), `sitemap lists ${loc} but site/${file} is missing`);
  }

  // Every content page is present in the sitemap (index maps to the root URL).
  const listed = new Set(
    locs.map((l) => l.replace(/^https?:\/\/[^/]+/, "").replace(/^\/$/, "/index.html")),
  );
  for (const page of contentPages) {
    const url = "/" + nameOf(page);
    assert.ok(
      listed.has(url) || (nameOf(page) === "index.html" && listed.has("/index.html")),
      `sitemap missing ${nameOf(page)}`,
    );
  }
});

test("404 page is excluded from the sitemap and marked noindex", () => {
  const sitemap = read(join(SITE, "sitemap.xml"));
  assert.ok(!/404\.html/.test(sitemap), "404.html should not be in the sitemap");
  const html = read(join(SITE, "404.html"));
  assert.match(html, /name="robots"\s+content="noindex/, "404 page should be noindex");
});

test("config.js defines the form endpoints", () => {
  const cfg = read(join(SITE, "assets", "config.js"));
  for (const key of ["signupEndpoint", "reviewerEndpoint", "projectEndpoint"]) {
    assert.match(cfg, new RegExp(key + "\\s*:"), `config.js missing ${key}`);
  }
});

test("robots.txt references the sitemap", () => {
  const robots = read(join(SITE, "robots.txt"));
  assert.match(robots, /Sitemap:\s*https?:\/\/\S+sitemap\.xml/i, "robots.txt missing Sitemap line");
});

test("no long dashes anywhere under site/", () => {
  for (const page of htmlPages()) {
    const hits = findDashes(read(page));
    assert.equal(hits.length, 0, `${nameOf(page)} has a long dash at line ${hits[0]?.line}`);
  }
});
