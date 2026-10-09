import { expect, test, type Locator, type Page } from "@playwright/test";
import { login, seedAccounts } from "./helpers/auth";

async function clickAndWaitForSave(
  page: Page,
  button: Locator,
  method: string,
  pathname: RegExp,
): Promise<void> {
  const saved = page.waitForResponse((response) =>
    response.request().method() === method && pathname.test(new URL(response.url()).pathname),
  );
  await button.click();
  expect((await saved).ok()).toBe(true);
}

async function countFrom(locator: Locator, noun: "members" | "attendees"): Promise<number> {
  const text = (await locator.textContent())?.trim() ?? "";
  const match = text.match(new RegExp(`^([\\d,]+) ${noun}$`));
  expect(match, `Expected a ${noun} count, received ${text}`).not.toBeNull();
  return Number(match![1].replaceAll(",", ""));
}

test("free member can join and leave a seeded group", async ({ page }, testInfo) => {
  // The projects run in parallel against one database; only one may change this membership.
  test.skip(testInfo.project.name !== "desktop-chromium");
  await login(page, seedAccounts.free);
  await page.goto("/groups");
  await expect(page.getByRole("heading", { name: "Discover Groups" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Orbit Builders" })).toBeVisible();
  await page.getByRole("link", { name: "Open Orbit Founders Circle" }).click();
  await expect(page.getByRole("heading", { name: "Orbit Founders Circle", exact: true })).toBeVisible();

  const join = page.getByRole("button", { name: "Join Group", exact: true });
  const leave = page.getByRole("button", { name: "Leave Group", exact: true });
  const memberCount = page.getByText(/^\d[\d,]* members$/).first();
  await expect(join.or(leave)).toBeVisible();
  const before = await countFrom(memberCount, "members");
  let joined = before;
  try {
    if (await join.isVisible()) {
      await clickAndWaitForSave(page, join, "POST", /\/groups\/[^/]+\/members$/);
    }
    await expect(leave).toBeVisible();
    joined = await countFrom(memberCount, "members");
    expect(joined).toBeGreaterThanOrEqual(before);
    await page.reload();
    await expect(leave).toBeVisible();
    expect(await countFrom(memberCount, "members")).toBeGreaterThanOrEqual(before);
  } finally {
    if (await leave.isVisible().catch(() => false)) {
      await clickAndWaitForSave(page, leave, "DELETE", /\/groups\/[^/]+\/members\/me$/);
      await expect(join).toBeVisible();
      expect(await countFrom(memberCount, "members")).toBeLessThanOrEqual(joined);
      await page.reload();
      await expect(join).toBeVisible();
      expect(await countFrom(memberCount, "members")).toBeLessThanOrEqual(joined);
    }
  }
});

test("free member can join and leave a seeded event", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-pixel7");
  await login(page, seedAccounts.free);
  await page.goto("/events");
  await expect(page.getByRole("heading", { name: "Upcoming Events" })).toBeVisible();
  await page.getByRole("link", { name: "Founder Office Hours", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Founder Office Hours", exact: true })).toBeVisible();

  const join = page.getByRole("button", { name: "Join Event", exact: true });
  const leave = page.getByRole("button", { name: "Leave Event", exact: true });
  const attendeeCount = page.getByText(/^\d[\d,]* attendees$/).first();
  await expect(join.or(leave)).toBeVisible();
  const before = await countFrom(attendeeCount, "attendees");
  let joined = before;
  try {
    if (await join.isVisible()) {
      await clickAndWaitForSave(page, join, "POST", /\/events\/[^/]+\/join$/);
    }
    await expect(leave).toBeVisible();
    joined = await countFrom(attendeeCount, "attendees");
    expect(joined).toBeGreaterThanOrEqual(before);
    await page.reload();
    await expect(leave).toBeVisible();
    expect(await countFrom(attendeeCount, "attendees")).toBeGreaterThanOrEqual(before);
  } finally {
    if (await leave.isVisible().catch(() => false)) {
      await clickAndWaitForSave(page, leave, "POST", /\/events\/[^/]+\/leave$/);
      await expect(join).toBeVisible();
      expect(await countFrom(attendeeCount, "attendees")).toBeLessThanOrEqual(joined);
      await page.reload();
      await expect(join).toBeVisible();
      expect(await countFrom(attendeeCount, "attendees")).toBeLessThanOrEqual(joined);
    }
  }
});

test("free account has no group or event management controls", async ({ page }) => {
  await login(page, seedAccounts.free);
  await page.goto("/groups");
  await expect(page.getByRole("heading", { name: "Discover Groups" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create Group" })).toHaveCount(0);
  await page.getByRole("link", { name: "Open Orbit Founders Circle" }).click();
  await expect(page.getByRole("heading", { name: "Orbit Founders Circle", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete Group" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Create event for this group" })).toHaveCount(0);
  await page.goto("/events");
  await expect(page.getByRole("heading", { name: "Upcoming Events" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create Event" })).toHaveCount(0);
  await page.getByRole("link", { name: "Founder Office Hours", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Founder Office Hours", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Delete Event" })).toHaveCount(0);
});

test("admin sees global group and event creation", async ({ page }) => {
  await login(page, seedAccounts.admin);
  await page.goto("/groups");
  await expect(page.getByRole("button", { name: "Create Group" })).toBeVisible();
  await page.goto("/events");
  await expect(page.getByRole("button", { name: "Create Event" })).toBeVisible();
});

test("moderator has no global event creation control", async ({ page }) => {
  await login(page, seedAccounts.moderator);
  await page.goto("/events");
  await expect(page.getByRole("heading", { name: "Upcoming Events" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create Event" })).toHaveCount(0);
});
