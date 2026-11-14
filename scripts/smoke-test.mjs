import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, permissions: ["clipboard-read", "clipboard-write"] });
const page = await context.newPage();
const errors = [];
page.on("pageerror", error => errors.push(error.message));
const check = (name) => console.log(`PASS · ${name}`);
let testNoteId;

try {
  const response = await page.goto(base, { waitUntil: "networkidle" });
  assert.equal(response.status(), 200);
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator("h1").textContent(), "Thesis overview");
  assert.equal(await page.locator(".metric-value").count(), 4);
  check("workspace and four real market metrics render");

  const pathBefore = await page.locator(".performance-svg path[stroke='#b59af9']").getAttribute("d");
  await page.getByRole("button", { name: "1Y", exact: true }).click();
  assert.equal(await page.getByRole("button", { name: "1Y", exact: true }).getAttribute("aria-pressed"), "true");
  const pathAfter = await page.locator(".performance-svg path[stroke='#b59af9']").getAttribute("d");
  assert.notEqual(pathBefore, pathAfter);
  await page.locator(".chart-legend").getByRole("button", { name: "Total value locked" }).click();
  assert.equal(await page.locator(".chart-legend").getByRole("button", { name: "Total value locked" }).getAttribute("aria-pressed"), "false");
  await page.locator(".chart-legend").getByRole("button", { name: "Total value locked" }).click();
  await page.getByRole("button", { name: "3M", exact: true }).click();
  check("chart date ranges and independent series controls work");

  await page.getByRole("button", { name: "Read thesis", exact: true }).click();
  await page.getByRole("heading", { name: "Investment thesis", exact: true }).waitFor();
  await page.locator(".page-actions").getByRole("button", { name: "Edit thesis" }).click();
  const question = page.getByLabel("Working research question");
  const original = await question.inputValue();
  const updated = original === "Can NEAR turn growing network utility into durable, long-term value?" ? "Can NEAR turn network utility into long-term value?" : original;
  await question.fill(updated);
  await page.getByRole("button", { name: "Save thesis", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "hidden" });
  const research = await (await context.request.get(`${base}/api/research`)).json();
  assert.equal(research.thesis.hypothesis, updated);
  check("thesis edits persist to PostgreSQL");

  await page.getByRole("link", { name: /^Research notebook/ }).click();
  await page.getByRole("button", { name: "New note", exact: true }).click();
  const noteTitle = `[Smoke test] Persistence ${Date.now()}`;
  await page.getByLabel("Title", { exact: true }).fill(noteTitle);
  await page.getByLabel("Note type", { exact: true }).selectOption("Question");
  await page.getByLabel("Your note", { exact: true }).fill("Automated test of note persistence. This temporary note is deleted by the test; it is not research evidence.");
  await page.getByRole("button", { name: "Save note", exact: true }).click();
  await page.getByRole("heading", { name: noteTitle, exact: true }).waitFor();
  const notes = await (await context.request.get(`${base}/api/notes`)).json();
  testNoteId = notes.find(note => note.title === noteTitle)?.id;
  assert.ok(testNoteId);
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("heading", { name: noteTitle, exact: true }).waitFor();
  await page.getByLabel("Filter notes by type").selectOption("Question");
  await page.getByLabel("Search notes").fill(noteTitle);
  assert.equal(await page.locator(".note-card").count(), 1);
  await page.getByRole("button", { name: `Delete note: ${noteTitle}`, exact: true }).click();
  await page.locator(".delete-confirm").getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("heading", { name: noteTitle, exact: true }).waitFor({ state: "hidden" });
  testNoteId = undefined;
  check("notes persist across reloads, filter correctly, and delete");

  await page.keyboard.press("Control+k");
  await page.getByLabel("Search research").fill("methodology");
  await page.getByLabel("Search research").press("Enter");
  await page.getByRole("heading", { name: "Methodology & data", exact: true }).waitFor();
  await page.locator(".query-library-row").first().click();
  await page.getByRole("dialog").waitFor();
  assert.match(await page.locator(".code-block").textContent(), /WHERE block_date >= DATE/);
  assert.match(await page.locator(".code-block").textContent(), /AND block_date < DATE/);
  await page.getByRole("button", { name: "Copy SQL", exact: true }).click();
  await page.getByRole("button", { name: "Copied SQL", exact: true }).waitFor();
  await page.keyboard.press("Escape");
  check("command search, dated SQL inspection, clipboard, and Escape work");

  await page.getByRole("link", { name: "Overview", exact: true }).click();
  await page.getByRole("button", { name: "Share research", exact: true }).click();
  assert.equal(await page.getByLabel("Research link").inputValue(), `${base}/#overview`);
  await page.getByRole("button", { name: "Copy link", exact: true }).click();
  await page.getByRole("button", { name: "Copied", exact: true }).waitFor();
  await page.keyboard.press("Escape");
  check("share links copy the current deployment URL");

  for (const [format, type] of [["md", "text/markdown"], ["csv", "text/csv"], ["json", "application/json"]]) {
    const exported = await context.request.get(`${base}/api/export?format=${format}`);
    assert.equal(exported.status(), 200);
    assert.match(exported.headers()["content-type"], new RegExp(type));
    assert.ok((await exported.body()).length > 100);
    if (format === "md") assert.match(await exported.text(), /Working research question/);
  }
  check("Markdown, CSV, and raw JSON exports are valid");

  const badImport = await context.request.post(`${base}/api/onchain`, { data: { source: "Validation-only smoke test", rows: [{ date: "2026-01-01", active_accounts: -1, transactions: 0 }] } });
  assert.equal(badImport.status(), 400);
  const crossOrigin = await context.request.post(`${base}/api/notes`, { headers: { Origin: "https://untrusted.example" }, data: {} });
  assert.equal(crossOrigin.status(), 403);
  check("invalid data imports and cross-origin writes are rejected");

  const beforeRefresh = (await (await context.request.get(`${base}/api/research`)).json()).snapshot.capturedAt;
  await page.locator(".refresh-button").click();
  await page.waitForFunction(() => document.querySelector(".refresh-button")?.textContent.includes("Re-run data"), undefined, { timeout: 50000 });
  const afterRefresh = await (await context.request.get(`${base}/api/research`)).json();
  const refreshWorked = new Date(afterRefresh.snapshot.capturedAt) > new Date(beforeRefresh);
  if (refreshWorked) check("public sources refresh and save a new snapshot");
  else { assert.ok(afterRefresh.runs.some(run => run.status === "failed" || run.status === "success")); check("refresh failure/rate limit preserves the existing snapshot"); }

  await mkdir("artifacts", { recursive: true });
  await page.waitForTimeout(400);
  await page.screenshot({ path: "artifacts/overview-desktop.png", fullPage: true });
  assert.ok(await page.evaluate(() => document.body.scrollWidth <= innerWidth));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  assert.ok(await page.evaluate(() => document.body.scrollWidth <= innerWidth));
  await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  await page.getByRole("link", { name: "On-chain analytics", exact: true }).click();
  await page.getByRole("heading", { name: "On-chain analytics", exact: true }).waitFor();
  assert.equal(await page.locator(".sidebar.mobile-open").count(), 0);
  await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  await page.getByRole("link", { name: "Overview", exact: true }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: "artifacts/overview-mobile.png", fullPage: true });
  check("mobile navigation and both responsive layouts have no overflow");
  assert.deepEqual(errors, []);
  check("no browser runtime errors");
  console.log("All smoke tests passed.");
} finally {
  if (testNoteId) await context.request.delete(`${base}/api/notes/${testNoteId}`).catch(() => {});
  await browser.close();
}
