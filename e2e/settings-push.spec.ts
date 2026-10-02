import { expect, test } from "@playwright/test";
import { login } from "./helpers/auth";

test("notification preferences persist across reload", async ({ page }, testInfo) => {
  const account = ["free@orbit.local", "paid@orbit.local", "moderator@orbit.local"][testInfo.project.name === "mobile-pixel7" ? 1 : testInfo.project.name === "mobile-iphone13" ? 2 : 0];
  await login(page, account);
  // The checkbox shows defaults until the preferences request resolves, so wait for it before reading state.
  const loaded = page.waitForResponse((r) => r.url().includes("/notifications/preferences") && r.request().method() === "GET");
  await page.goto("/settings");
  await loaded;
  await expect(page.getByRole("heading", { name: "Bildirim tercihleri" })).toBeVisible();
  const chatPreference = () => page.getByRole("checkbox", { name: "Sohbet" });
  const original = await chatPreference().isChecked();
  // The checkbox is controlled and only flips after the server confirms, so click and assert instead of setChecked.
  const toggleTo = async (value: boolean) => {
    if ((await chatPreference().isChecked()) !== value) await chatPreference().click();
    await expect(chatPreference()).toBeChecked({ checked: value });
  };
  try {
    await toggleTo(!original);
    const reloaded = page.waitForResponse((r) => r.url().includes("/notifications/preferences") && r.request().method() === "GET");
    await page.reload();
    await reloaded;
    await expect(chatPreference()).toBeChecked({ checked: !original });
  } finally {
    await toggleTo(original);
  }
});

test("denied browser notification permission shows fallback", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "Notification", {
      configurable: true,
      value: { permission: "denied", requestPermission: async () => "denied" },
    });
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: { register: async () => { throw new Error("Permission denied"); } },
    });
  });
  await login(page);
  await page.goto("/settings");
  await expect(page.getByText("Tarayıcı bildirim izni reddedildi.")).toBeVisible();
  await expect(page.getByRole("checkbox", { name: "Sohbet" })).toBeVisible();
});
