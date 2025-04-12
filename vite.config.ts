import { defineConfig } from "vite";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
  server: {
    port: 5173,
    open: false, // ブラウザを自動的に開かない
  },
  // Electronのプリロードスクリプトを処理するための設定
  optimizeDeps: {
    exclude: ["electron"],
  },
});
