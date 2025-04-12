// engine.ts - Babylon.jsエンジン関連の機能

// グローバル変数の型定義拡張
declare global {
  interface Window {
    BABYLON: any;
  }
}

// グローバル変数
let canvas: HTMLCanvasElement;
let engine: any;

/**
 * キャンバスを設定
 */
export function setCanvas(canvasElement: HTMLCanvasElement): void {
  canvas = canvasElement;
  console.log("キャンバスが設定されました");
}

/**
 * エンジンを取得
 */
export function getEngine(): any {
  return engine;
}

/**
 * リサイズイベントハンドラ
 */
export function handleResize(): void {
  if (engine) {
    console.log("ウィンドウリサイズによりエンジンをリサイズします");
    engine.resize();
  }
}

/**
 * レンダリングループの開始
 */
export function startRenderLoop(scene: any): void {
  if (!engine) {
    console.error("エンジンが初期化されていないため、レンダリングループを開始できません");
    return;
  }

  if (!scene) {
    console.error("シーンが指定されていないため、レンダリングループを開始できません");
    return;
  }

  console.log("レンダリングループを開始します");
  engine.runRenderLoop(function () {
    if (scene && scene.activeCamera) {
      scene.render();
    }
  });
}

/**
 * デフォルトエンジンの作成
 */
export function createDefaultEngine(): any {
  try {
    if (!window.BABYLON) {
      console.error("BABYLONグローバル変数が定義されていません");
      throw new Error("BABYLONグローバル変数が見つかりません");
    }

    if (!canvas) {
      console.error("キャンバスが設定されていません");
      throw new Error("キャンバスが設定されていません");
    }

    console.log("デフォルトエンジンを作成します");
    return new window.BABYLON.Engine(
      canvas,
      true,
      {
        preserveDrawingBuffer: true,
        stencil: true,
        alpha: true,
      },
      true,
      {
        adaptToDeviceRatio: true,
        maxResolution: 1024,
      }
    );
  } catch (error) {
    console.error("デフォルトエンジンの作成中にエラーが発生しました:", error);
    throw error;
  }
}

/**
 * 非同期エンジン作成
 */
export async function createEngineAsync(): Promise<any> {
  try {
    console.log("エンジンを作成中...");
    // babylon.js スクリプトが完全に読み込まれるまで少し待つ
    if (!window.BABYLON) {
      console.log("BABYLONグローバル変数がまだ定義されていません。ロードを待機します...");
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    engine = createDefaultEngine();
    console.log("エンジンが作成されました");
    return engine;
  } catch (e) {
    console.error("エンジン作成中にエラーが発生しました:", e);
    console.log("利用可能なエンジン作成関数が失敗しました。代わりにデフォルトエンジンを作成します");
    try {
      // 少し待ってからもう一度試す
      await new Promise((resolve) => setTimeout(resolve, 1000));
      engine = createDefaultEngine();
      return engine;
    } catch (e2) {
      console.error("デフォルトエンジンの作成も失敗しました:", e2);
      throw e2;
    }
  }
}
