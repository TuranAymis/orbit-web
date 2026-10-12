import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { defineConfig } from "vitest/config";
import { loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function pwaServiceWorker(): Plugin {
  let outDir = path.resolve(__dirname, "dist");
  let apiUrl = "http://localhost:8000";
  return {
    name: "orbit-pwa-service-worker",
    apply: "build",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
      apiUrl = loadEnv(config.mode, config.root, "VITE_ORBIT_API_URL").VITE_ORBIT_API_URL || apiUrl;
    },
    async closeBundle() {
      const swPath = path.join(outDir, "sw.js");
      const source = await readFile(swPath, "utf8");
      const files = await readdir(outDir, { recursive: true });
      const hash = createHash("sha256");
      for (const file of files.sort()) {
        if (file === "sw.js") continue;
        const fullPath = path.join(outDir, file);
        const content = await readFile(fullPath).catch(() => null);
        if (content) hash.update(file).update(content);
      }
      hash.update(source).update(apiUrl);
      hash.update("orbit-pwa-revision-1"); // Bump this salt to force a fresh cache without changing app files.
      const version = hash.digest("hex").slice(0, 16);
      await writeFile(swPath, source
        .replace('"__ORBIT_CACHE_VERSION__"', JSON.stringify(version))
        .replace('"__ORBIT_API_URL__"', JSON.stringify(apiUrl)));
    },
  };
}

export default defineConfig({
  plugins: [react(), pwaServiceWorker()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    exclude: ["e2e/**", "node_modules/**", "dist/**"],
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/tests/setup.ts",
    css: true,
  },
});
