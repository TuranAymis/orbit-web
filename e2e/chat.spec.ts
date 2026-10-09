import { expect, test, type Page } from "@playwright/test";
import { login, seedAccounts } from "./helpers/auth";

async function openBuildersChat(page: Page): Promise<void> {
  await page.goto("/chat");
  await page.getByRole("button", { name: "orbit builders" }).click();
  await expect(page.getByRole("heading", { name: "Messages", exact: true }).first()).toBeVisible();
  await expect(page.getByText("Status: connected")).toBeVisible();
}

test("chat receives, reconnects without duplicates, and retains history", async ({ browser, context, page, isMobile }) => {
  const secondContext = await browser.newContext({
    viewport: page.viewportSize() ?? { width: 1280, height: 800 },
    userAgent: await page.evaluate(() => navigator.userAgent),
    isMobile,
    hasTouch: isMobile,
  });
  try {
    const paidPage = await secondContext.newPage();
    // context.setOffline() does not drop an already open WebSocket in Chromium, so cut the socket through a route instead.
    let blockChat = false;
    const openSockets: Array<{ close: () => void }> = [];
    await paidPage.routeWebSocket(/\/ws\/chat/, (ws) => {
      if (blockChat) {
        ws.close();
        return;
      }
      ws.connectToServer();
      openSockets.push(ws);
    });
    await login(page, seedAccounts.free);
    await login(paidPage, seedAccounts.paid);

    // The default seed gives Orbit Builders to the free account only.
    // Join through the Groups UI; the backend join operation is idempotent.
    await paidPage.goto("/groups");
    const builders = paidPage.getByRole("link", { name: "Open Orbit Builders" }).locator("..");
    // The group list now reflects real membership, so a previous project run may have joined already.
    const joinButton = builders.getByRole("button", { name: "Join group" });
    const joinedButton = builders.getByRole("button", { name: "Joined" });
    await expect(joinButton.or(joinedButton)).toBeVisible();
    if (await joinButton.isVisible()) {
      await joinButton.click();
    }
    await expect(joinedButton).toBeVisible();

    await openBuildersChat(page);
    await openBuildersChat(paidPage);
    const firstMessage = `e2e-online-${crypto.randomUUID()}`;
    await page.getByRole("textbox", { name: "Message #orbit-builders" }).fill(firstMessage);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(paidPage.getByText(firstMessage, { exact: true })).toBeVisible();

    blockChat = true;
    openSockets.splice(0).forEach((ws) => ws.close());
    await expect(paidPage.getByText("Status: reconnecting")).toBeVisible();
    const offlineMessage = `e2e-reconnect-${crypto.randomUUID()}`;
    await page.getByRole("textbox", { name: "Message #orbit-builders" }).fill(offlineMessage);
    await page.getByRole("button", { name: "Send message" }).click();
    blockChat = false;
    await expect(paidPage.getByText(offlineMessage, { exact: true })).toBeVisible();
    await expect(paidPage.getByText(offlineMessage, { exact: true })).toHaveCount(1);
    await paidPage.reload();
    // The page opens the first conversation after a reload, so select Orbit Builders again.
    await openBuildersChat(paidPage);
    await expect(paidPage.getByText(firstMessage, { exact: true })).toBeVisible();
    await expect(paidPage.getByText(offlineMessage, { exact: true })).toHaveCount(1);
  } finally {
    await secondContext.close();
    await context.setOffline(false);
  }
});
