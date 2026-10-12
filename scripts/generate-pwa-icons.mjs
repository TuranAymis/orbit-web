import { readFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = path.join(root, "public", "icons");
const svg = await readFile(path.join(iconsDir, "icon.svg"), "utf8");
await mkdir(iconsDir, { recursive: true });
const browser = await chromium.launch();
try {
  for (const { name, size, maskable } of [
    { name: "icon-192.png", size: 192, maskable: false },
    { name: "icon-512.png", size: 512, maskable: false },
    { name: "icon-maskable-512.png", size: 512, maskable: true },
  ]) {
    const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    const artwork = maskable ? svg.replace('rx="112"', 'rx="0"') : svg;
    await page.setContent(`<html><head><style>html,body{margin:0;width:100%;height:100%;background:#0d0d12}svg{display:block;width:100%;height:100%}</style></head><body>${artwork}</body></html>`);
    await page.screenshot({ path: path.join(iconsDir, name) });
    await page.close();
  }
} finally {
  await browser.close();
}
