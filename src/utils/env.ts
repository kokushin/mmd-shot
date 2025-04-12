/**
 * 環境変数を管理するユーティリティ
 */

// Viteの環境変数は import.meta.env 経由でアクセス

/**
 * モデルのパスを取得
 */
export function getModelPath(): string {
  return import.meta.env.VITE_MODEL_PATH as string;
}

/**
 * モーションのパスを取得
 */
export function getMotionPath(): string {
  return import.meta.env.VITE_MOTION_PATH as string;
}

/**
 * BGMのパスを取得
 */
export function getBgmPath(): string {
  return import.meta.env.VITE_BGM_PATH as string;
}
