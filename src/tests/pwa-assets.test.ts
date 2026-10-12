// @vitest-environment node
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";

const root = process.cwd();

describe("PWA assets", () => {
  it("declares required manifest fields and generated icon targets", async () => {
    const manifest = JSON.parse(await readFile(path.join(root, "public/manifest.webmanifest"), "utf8"));
    expect(manifest).toMatchObject({ name: "Orbit", short_name: "Orbit", start_url: "/", scope: "/", display: "standalone" });
    expect(manifest.description).toBeTruthy();
    expect(manifest.background_color).toMatch(/^#/);
    expect(manifest.theme_color).toMatch(/^#/);
    for (const [src, size, purpose] of ([
      ["/icons/icon-192.png", "192x192", undefined],
      ["/icons/icon-512.png", "512x512", undefined],
      ["/icons/icon-maskable-512.png", "512x512", "maskable"],
    ] as const)) {
      expect(manifest.icons).toContainEqual(expect.objectContaining({ src, sizes: size, type: "image/png", ...(purpose ? { purpose } : {}) }));
      // Icon generation is a separate, browser-driven command.
      const icon = await stat(path.join(root, "public", src.slice(1))).catch(() => null);
      if (icon) expect(icon.size).toBeGreaterThan(0);
    }
  });

  it("does not intercept API, cross-origin, non-GET, or /ws requests", async () => {
    const source = (await readFile(path.join(root, "public/sw.js"), "utf8"))
      .replace('"__ORBIT_API_URL__"', '"https://orbit.test/api"');
    const handlers = new Map<string, (event: unknown) => void>();
    const self = {
      location: { origin: "https://orbit.test" },
      addEventListener: (name: string, listener: (event: unknown) => void) => handlers.set(name, listener),
    };
    runInNewContext(source, { self, URL, Promise });
    const fetchHandler = handlers.get("fetch")!;
    for (const [url, method] of [
      ["https://orbit.test/api/profile", "GET"],
      ["https://api.orbit.test/users", "GET"],
      ["https://orbit.test/ws/chat", "GET"],
      ["https://orbit.test/assets/app-abcdef123456.js", "POST"],
    ]) {
      const respondWith = vi.fn();
      fetchHandler({ request: { url, method, mode: "navigate" }, respondWith });
      expect(respondWith).not.toHaveBeenCalled();
    }
  });
});
