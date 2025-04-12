/**
 * 環境変数を管理するユーティリティ
 */

// Viteの環境変数は import.meta.env 経由でアクセス
import path from 'path';

// 開発環境とビルド環境で適切なパスを返す関数
function getAssetPath(relativePath: string): string {
  const isProduction = import.meta.env.PROD;
  
  // 実行環境がElectronの場合（windowオブジェクトが存在する場合）
  if (typeof window !== 'undefined' && (window as any).electronAPI) {
    if (isProduction) {
      // 本番環境では、パスを適切に解決する
      const appPath = path.dirname((window as any).location.pathname);
      return `${appPath}/${relativePath}`;
    }
  }
  
  // 開発環境では相対パス
  return `./${relativePath}`;
}

/**
 * モデルのパスを取得
 */
export function getModelPath(): string {
  const modelPath = import.meta.env.VITE_MODEL_PATH as string;
  return getAssetPath(modelPath);
}

/**
 * モーションのパスを取得
 */
export function getMotionPath(): string {
  const motionPath = import.meta.env.VITE_MOTION_PATH as string;
  return getAssetPath(motionPath);
}

/**
 * BGMのパスを取得
 */
export function getBgmPath(): string {
  const bgmPath = import.meta.env.VITE_BGM_PATH as string;
  return getAssetPath(bgmPath);
}
