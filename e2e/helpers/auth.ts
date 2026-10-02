import { expect, type Page } from "@playwright/test";

export const seedAccounts = {
  free: "free@orbit.local",
  paid: "paid@orbit.local",
  moderator: "moderator@orbit.local",
  admin: "admin@orbit.local",
} as const;

export async function login(page: Page, email: string = seedAccounts.free): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("123456");
  await page.getByRole("button", { name: "Continue to Orbit" }).click();
  await expect(page).toHaveURL(/\/discover$/);
  await expect(page.getByRole("heading", { name: "Discover", exact: true })).toBeVisible();
}
