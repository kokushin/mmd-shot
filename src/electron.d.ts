// electron.d.ts - プリロードスクリプトで公開されるAPIの型定義

/** アセットスキャン結果の1件 */
interface AssetEntry {
  /** ファイル名 */
  name: string;
  /** アセットルートからの相対パス (例: "models/foo/bar.pmx") */
  path: string;
}

type AssetCategory = "models" | "motions" | "cameras" | "stages" | "audios";

interface ElectronAPI {
  saveCaptureImage: (imageData: string) => Promise<{
    success: boolean;
    filePath?: string;
    message?: string;
    error?: string;
  }>;
  listAssets: (category: AssetCategory) => Promise<AssetEntry[]>;
  getPath: (name: string) => Promise<string> | string;
  isProduction: boolean;
}

declare interface Window {
  electronAPI?: ElectronAPI;
}
