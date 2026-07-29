import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  server: {
    host: true,
    port: 5173,
    // Local dev: optional local telemetry server on :3847
    proxy: {
      "/api/game-log": {
        target: "http://127.0.0.1:3847",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/game-log/, "/game-log"),
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
