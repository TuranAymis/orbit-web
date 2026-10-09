import { expect, test } from "@playwright/test";
import { login, seedAccounts } from "./helpers/auth";

test("topbar lists the seeded welcome notification and can mark it read", async ({ page }, testInfo) => {
  await login(page, seedAccounts.free);
  await page.getByRole("button", { name: "Notifications", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Notifications" })).toBeVisible();
  const welcome = page.getByRole("button", { name: /Welcome to Orbit.*Your free membership is active/ });
  await expect(welcome).toBeVisible();

  // Marking read is permanent, so one project performs it and all projects accept a prior read.
  if (testInfo.project.name === "desktop-chromium") {
    const unreadDot = welcome.locator("span.rounded-full.bg-primary");
    if (await unreadDot.count()) {
      const markedRead = page.waitForResponse((response) =>
        response.request().method() === "POST" && /\/notifications\/[^/]+\/read$/.test(new URL(response.url()).pathname),
      );
      await welcome.click();
      expect((await markedRead).ok()).toBe(true);
      await expect(unreadDot).toHaveCount(0);
      await page.reload();
      await page.getByRole("button", { name: "Notifications", exact: true }).click();
      await expect(welcome).toBeVisible();
      await expect(welcome.locator("span.rounded-full.bg-primary")).toHaveCount(0);
    }
  }
});

test("profile edit persists and restores the original display name", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-iphone13");
  await login(page, seedAccounts.free);
  await page.getByRole("button", { name: "Profile menu" }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole("heading", { name: "Profile", exact: true })).toBeVisible();
  const name = page.getByLabel("Name", { exact: true });
  await expect(name).toHaveValue(/.+/);
  const original = await name.inputValue();
  await expect(page.getByRole("heading", { name: original, exact: true })).toBeVisible();
  const updated = `${original} e2e ${crypto.randomUUID().slice(0, 8)}`;
  try {
    await name.fill(updated);
    const saved = page.waitForResponse((response) =>
      response.request().method() === "PUT" && new URL(response.url()).pathname === "/profile",
    );
    await page.getByRole("button", { name: "Save Profile" }).click();
    expect((await saved).ok()).toBe(true);
    await expect(page.getByRole("heading", { name: updated, exact: true })).toBeVisible();
    await page.reload();
    await expect(name).toHaveValue(updated);
  } finally {
    await name.fill(original);
    const restored = page.waitForResponse((response) =>
      response.request().method() === "PUT" && new URL(response.url()).pathname === "/profile",
    );
    await page.getByRole("button", { name: "Save Profile" }).click();
    expect((await restored).ok()).toBe(true);
    await page.reload();
    await expect(name).toHaveValue(original);
  }
});
