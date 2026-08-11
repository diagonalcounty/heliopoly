import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  // Relative asset URLs so the same build works on heliopoly.live and in the
  // iOS WKWebView file:// bundle (ios/Heliopoly/Heliopoly/WebDist).
  base: "./",
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
