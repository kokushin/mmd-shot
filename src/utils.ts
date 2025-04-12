// utils.ts - ユーティリティ関数と定数

// Viteの環境変数を使用して開発モードかどうかを判定
export const isDev: boolean = import.meta.env.DEV;

// 環境に関する情報をログに出力
if (isDev) {
  console.log("開発モードでアプリケーションを実行しています");
} else {
  console.log("本番モードでアプリケーションを実行しています");
}

/**
 * ブラウザ環境かElectron環境かを判定
 * @returns {boolean} Electron環境の場合はtrue、ブラウザ環境の場合はfalse
 */
export function isElectron(): boolean {
  // Electronの特徴的なプロパティをチェック
  return typeof window !== "undefined" && typeof window.process === "object" && typeof window.process.type === "string";
}

/**
 * デバッグ情報をコンソールに出力
 * @param {string} message - 出力するメッセージ
 * @param {any} data - 出力するデータ（オプション）
 */
export function debug(message: string, data: any = null): void {
  if (isDev) {
    if (data) {
      console.log(`[DEBUG] ${message}`, data);
    } else {
      console.log(`[DEBUG] ${message}`);
    }
  }
}
