// MMD Shot アプリケーションのメインTypeScriptファイル
import { isDev, debug } from "./utils";
import * as Engine from "./core/engine";
import * as Scene from "./core/scene";

// 開発モードの場合はデバッグ情報を表示
if (isDev) {
  debug("app.tsを読み込みました");
}

// アプリケーション初期化
window.addEventListener("DOMContentLoaded", initializeApp);
window.addEventListener("resize", Engine.handleResize);

/**
 * アプリケーションの初期化
 */
function initializeApp(): void {
  console.log("アプリケーションを初期化しています...");

  // キャンバスの取得
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
  Engine.setCanvas(canvas);

  // Babylon.jsエンジンの初期化
  (window as any)
    .initFunction()
    .then(() => {
      console.log("初期化関数が完了しました");
    })
    .catch((error: any) => {
      console.error("初期化中にエラーが発生しました:", error);
    });

  // UIイベントリスナーの設定
  setupEventListeners();
}

/**
 * UIイベントリスナーの設定
 */
function setupEventListeners(): void {
  // キャプチャボタンのイベントリスナー
  const captureButton = document.getElementById("capture-button");
  if (captureButton) {
    console.log("キャプチャボタンを設定しています");
    captureButton.addEventListener("click", captureScene);
  } else {
    console.error("キャプチャボタンが見つかりません");
  }
}

/**
 * シーンをキャプチャする関数
 */
function captureScene(): void {
  console.log("キャプチャボタンがクリックされました（addEventListener）");

  // グローバル関数が存在するか確認
  if (typeof (window as any).captureMMDScene === "function") {
    console.log("window.captureMMDSceneを呼び出します");
    (window as any).captureMMDScene();
  } else {
    console.error("window.captureMMDSceneが関数として存在しません");
    alert("キャプチャ機能が初期化されていません");
  }
}

/**
 * 初期化関数
 */
(window as any).initFunction = async function (): Promise<void> {
  try {
    // HavokPhysicsの初期化
    console.log("HavokPhysicsを初期化中...");
    (globalThis as any).HK = await (HavokPhysics as any)();
    console.log("HavokPhysicsが初期化されました");

    // エンジンを初期化
    console.log("エンジンを初期化中...");
    const engine = await Engine.createEngineAsync();
    (window as any).engine = engine;
    console.log("エンジンが初期化されました");

    if (!engine) throw new Error("engine should not be null.");

    // シーンを作成してグローバル変数とwindowオブジェクトの両方に代入
    console.log("シーンを作成中...");
    const scene = await Scene.createScene();
    (window as any).scene = scene;
    Scene.setSceneToRender(scene);
    console.log("シーンが作成されました");

    // レンダリングループの開始
    console.log("レンダリングループを開始します");
    Engine.startRenderLoop(Scene.getSceneToRender());
    console.log("レンダリングループが開始されました");
  } catch (error) {
    console.error("初期化中にエラーが発生しました:", error);
    throw error;
  }
};
