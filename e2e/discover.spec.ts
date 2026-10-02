import { expect, test } from "@playwright/test";
import { login } from "./helpers/auth";

test("Discover loads its nearby section", async ({ page }) => {
  await login(page);
  await expect(page.getByRole("region", { name: "Yakındaki etkinlikler" })).toBeVisible();
});

test("Istanbul geolocation returns a nearby event and distance", async ({ page, context }) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 41.0082, longitude: 28.9784 });
  await login(page);
  const nearby = page.getByRole("region", { name: "Yakındaki etkinlikler" });
  await nearby.getByRole("button", { name: "Konumumu kullan" }).click();
  await expect(nearby.getByRole("link", { name: /Founder Office Hours.*km/ })).toBeVisible();
});

test("denied location offers city search and category filter", async ({ page, context }) => {
  await context.grantPermissions([]);
  await login(page);
  const nearby = page.getByRole("region", { name: "Yakındaki etkinlikler" });
  await nearby.getByRole("button", { name: "Konumumu kullan" }).click();
  await expect(nearby.getByLabel("Şehir")).toBeVisible();
  await nearby.getByLabel("Şehir").fill("Istanbul");
  await nearby.getByLabel("Kategori").fill("Business");
  await nearby.getByRole("button", { name: "Şehirdeki etkinlikleri göster" }).click();
  await expect(nearby.getByRole("link", { name: /Founder Office Hours/ })).toBeVisible();
  await nearby.getByLabel("Kategori").fill("Technology");
  await nearby.getByRole("button", { name: "Şehirdeki etkinlikleri göster" }).click();
  await expect(nearby.getByRole("link", { name: /Founder Office Hours/ })).toHaveCount(0);
  await expect(nearby.getByText("Yakında etkinlik bulunamadı.")).toBeVisible();
});
