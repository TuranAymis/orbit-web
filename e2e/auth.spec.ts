import { expect, test } from "@playwright/test";
import { login, seedAccounts } from "./helpers/auth";

test("seed account can log in", async ({ page }) => {
  await login(page, seedAccounts.free);
});

test("wrong password shows an error", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(seedAccounts.free);
  await page.getByLabel("Password").fill("incorrect-password");
  await page.getByRole("button", { name: "Continue to Orbit" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("log out clears the session", async ({ page, isMobile }) => {
  await login(page);
  if (isMobile) await page.getByRole("button", { name: "Open navigation menu" }).click();
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("protected route redirects a logged out visitor", async ({ page }) => {
  await page.goto("/settings");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByLabel("Email")).toBeVisible();
});
