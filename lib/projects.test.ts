import { test } from "node:test";
import assert from "node:assert/strict";
import { projects, projectPath } from "../data/projects.ts";
import { categories } from "../data/categories.ts";

// These catch the mistakes that are easy to make when adding a project by hand.

test("every slug is a unique, URL-safe name", () => {
  const slugs = projects.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, "duplicate slug");
  for (const slug of slugs) assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, `bad slug: ${slug}`);
});

test("every project has the required text and a known category and status", () => {
  for (const p of projects) {
    assert.ok(p.title.trim(), `${p.slug}: title`);
    assert.ok(p.summary.trim().length >= 40, `${p.slug}: summary is too short`);
    assert.ok(p.tags.length > 0, `${p.slug}: tags`);
    assert.equal(new Set(p.tags).size, p.tags.length, `${p.slug}: duplicate tag`);
    assert.ok(p.category in categories, `${p.slug}: unknown category "${p.category}" (add it to data/categories.ts)`);
    assert.ok(["complete", "in-progress", "placeholder"].includes(p.status), `${p.slug}: status`);
  }
});

test("repository links are real GitHub URLs or null", () => {
  for (const p of projects) {
    if (p.repoUrl === null) continue;
    assert.match(p.repoUrl, /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/, `${p.slug}: repoUrl`);
  }
  const urls = projects.flatMap((p) => (p.repoUrl ? [p.repoUrl.toLowerCase()] : []));
  assert.equal(new Set(urls).size, urls.length, "two projects share a repository");
});

test("a project page, when present, has a real overview and highlights", () => {
  for (const p of projects.filter((x) => x.detail)) {
    const d = p.detail!;
    assert.ok(d.overview.trim().length >= 30, `${p.slug}: overview`);
    assert.ok(d.highlights.length > 0 && d.highlights.every((h) => h.trim()), `${p.slug}: highlights`);
    assert.ok(d.notes.every((n) => n.trim()), `${p.slug}: empty note`);
  }
});

test("leftover template or placeholder text is not published", () => {
  const text = JSON.stringify(projects).toLowerCase();
  for (const bad of ["my-project", "my project", "lorem", "todo", "[placeholder]"]) {
    assert.ok(!text.includes(bad), `found "${bad}"`);
  }
});

test("projectPath only returns a page address when the project has a detail page", () => {
  for (const p of projects) {
    assert.equal(projectPath(p), p.detail ? `/projects/${p.slug}` : null);
  }
});
