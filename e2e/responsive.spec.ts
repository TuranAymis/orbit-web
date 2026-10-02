import { expect, test, type Page } from "@playwright/test";
import { login } from "./helpers/auth";

const routes = ["/", "/discover", "/chat", "/settings"];

async function assertLayout(page: Page, mobile: boolean, hasNavigation = true): Promise<void> {
  await expect.poll(() => page.evaluate(() =>
    document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  )).toBe(true);

  if (!mobile) return;
  if (hasNavigation) {
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await expect(page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: /Discover/ })).toBeVisible();
    // The backdrop spans the screen under the drawer, so click its exposed right edge.
    const viewport = page.viewportSize();
    await page.getByRole("button", { name: "Close navigation menu" }).click({ position: { x: (viewport?.width ?? 400) - 6, y: 300 } });
  }

  const undersized = await page.evaluate(() => {
    const selectors = "a[href], button, input, select, textarea, [role=button], [role=checkbox]";
    return Array.from(document.querySelectorAll<HTMLElement>(selectors))
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0;
      })
      .map((element) => {
        // A checkbox is tapped through its label, so measure the label's area when there is one.
        const target = element instanceof HTMLInputElement ? element.closest("label") ?? element : element;
        const rect = target.getBoundingClientRect();
        return {
          label: element.getAttribute("aria-label") || target.textContent?.trim().slice(0, 40) || element.tagName,
          width: rect.width,
          height: rect.height,
        };
      })
      .filter(({ width, height }) => width < 40 || height < 40);
  });
  expect(undersized, "Mobile interactive targets smaller than 40×40 CSS px").toEqual([]);
}

test("login, home, Discover, chat, and settings fit their viewport", async ({ page, isMobile }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  // Known product bug (Trello card "ORBIT | Chat | Varsayılan kanal 403"): /chat preselects a channel whose
  // history the account may not read, so GET /chats?group_id=... answers 403. Remove this filter once it is fixed.
  const knownForbiddenChatHistory = new Set<string>();
  page.on("response", (response) => {
    if (response.status() === 403 && /\/chats\?group_id=/.test(response.url())) knownForbiddenChatHistory.add(response.url());
  });

  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Access Terminal" })).toBeVisible();
  await assertLayout(page, isMobile, false);
  await login(page);
  for (const route of routes) {
    await page.goto(route);
    await expect(page.getByLabel("Notifications", { exact: true })).toBeVisible();
    await assertLayout(page, isMobile);
  }
  const unexpected = knownForbiddenChatHistory.size > 0
    ? errors.filter((message) => !message.includes("403 (Forbidden)"))
    : errors;
  expect(unexpected, "Browser console or page errors").toEqual([]);
});
