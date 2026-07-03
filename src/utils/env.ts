/**
 * 環境変数とアセットパスを管理するユーティリティ
 * アセットのデフォルトパスは .env (VITE_*) で指定する
 */

// パスの各セグメントをURLエンコードする (日本語・中国語ファイル名対応)
function encodeAssetPath(relativePath: string): string {
  return relativePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

/**
 * アセットの相対パス (例: "models/foo/bar.pmx") をロード可能なURLに解決する
 * - 開発: Vite開発サーバーのルート相対
 * - 本番 (Electron): app://assets/ プロトコル経由でリソースフォルダから配信
 */
export function resolveAssetUrl(relativePath: string): string {
  const clean = relativePath.replace(/^\.\//, "");
  const isElectronProd =
    typeof window !== "undefined" && window.electronAPI !== undefined && import.meta.env.PROD;

  if (isElectronProd) {
    return `app://assets/${encodeAssetPath(clean)}`;
  }
  return `./${encodeAssetPath(clean)}`;
}

function stripPrefix(value: string | undefined): string | null {
  if (value === undefined || value.trim() === "") {
    return null;
  }
  return value.replace(/^\.\//, "");
}

/**
 * .env で指定されたデフォルトアセットの相対パス一式
 */
export function getDefaultAssetPaths(): {
  model: string;
  motion: string;
  audio: string | null;
  camera: string | null;
  stage: string | null;
} {
  const model = stripPrefix(import.meta.env.VITE_MODEL_PATH as string | undefined);
  const motion = stripPrefix(import.meta.env.VITE_MOTION_PATH as string | undefined);
  if (model === null || motion === null) {
    throw new Error("VITE_MODEL_PATH / VITE_MOTION_PATH を .env に設定してください");
  }
  return {
    model,
    motion,
    audio: stripPrefix(import.meta.env.VITE_BGM_PATH as string | undefined),
    camera: stripPrefix(import.meta.env.VITE_CAMERA_PATH as string | undefined),
    stage: stripPrefix(import.meta.env.VITE_STAGE_PATH as string | undefined),
  };
}
