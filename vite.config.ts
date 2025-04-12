import { defineConfig } from "vite";
import { resolve } from "path";
import fs from 'fs-extra';
import path from 'path';

// カスタムプラグイン: 静的ファイルをコピーする
function copyAssets() {
  return {
    name: 'vite:copy-assets',
    enforce: 'post' as const, // 'pre'または'post'の型を明示
    apply: 'build' as const,  // applyにもconst assertionを追加
    async closeBundle() {
      const assetFolders = ['libs', 'models', 'motions', 'audios'];
      
      for (const folder of assetFolders) {
        if (fs.existsSync(folder)) {
          await fs.copy(
            path.resolve(folder),
            path.resolve('dist', folder),
            { overwrite: true }
          );
          console.log(`Copied ${folder} to dist/${folder}`);
        }
      }
    }
  };
}

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
  plugins: [
    copyAssets()
  ],
  server: {
    port: 5173,
    open: false, // ブラウザを自動的に開かない
  },
  // Electronのプリロードスクリプトを処理するための設定
  optimizeDeps: {
    exclude: ["electron"],
  },
});
