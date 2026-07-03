import { defineConfig } from "vite";
import { resolve } from "path";

// 本番アセットはelectron-builderのextraResources + app://assetsプロトコルで配信するため、
// distへのコピーは不要

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  build: {
    // Electron 34 (Chromium 132) 向け
    target: "esnext",
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
    open: false,
    watch: {
      // electron-builderの出力とアセットフォルダは監視しない (ページリロード防止)
      ignored: ["**/build/**", "**/dist/**", "**/models/**", "**/motions/**", "**/audios/**", "**/cameras/**", "**/stages/**"],
    },
  },
  optimizeDeps: {
    // babylon-mmd: WASMを import.meta.url 経由でロードするため事前バンドル不可
    // @babylonjs/core: babylon-mmdと同一インスタンスを共有する必要があるため除外
    //   (事前バンドルするとSceneLoaderのプラグインレジストリが分裂しPMXローダーが見つからなくなる)
    exclude: ["electron", "babylon-mmd", "@babylonjs/core"],
  },
});
