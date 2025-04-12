// scene.ts - Babylon.jsシーン関連の機能
import * as Engine from "./engine";
import { loadBabylonMmd, configurePmxLoader, isBabylonMmdLoaded } from "../features/mmd";
import { setupCameras } from "../features/camera";
import { setupLighting } from "../features/lighting";
import { setupMmd } from "../features/mmd";
import { getLoadingElements, finishLoading } from "../ui/loading";
import { loadAssets } from "../features/assets";
import { setupMmdModelAndAnimation } from "../features/model";
import { createGround } from "../features/ground";
import { setupPostProcessing } from "../features/postprocessing";

// グローバル変数の型定義拡張
declare global {
  interface Window {
    BABYLON: any;
    BABYLONMMD: any;
    mmdShotApp: {
      setSceneReference: (scene: any, mmdRuntime: any, audioPlayer: any) => void;
      pauseAnimation: () => void;
      resumeAnimation: () => void;
      toggleCameraMode: () => void;
      [key: string]: any;
    };
    mmdCameraMode: {
      currentMode: string;
      cameras: {
        faceFollow: any;
        fullBody: any;
        [key: string]: any;
      };
      [key: string]: any;
    };
    rendererScene: any;
    rendererMmdRuntime: any;
    rendererAudioPlayer: any;
    rendererPipeline: any; // ポストプロセスパイプラインのグローバル参照を追加
  }
}

// グローバル変数
let scene: any;
let sceneToRender: any;
let renderPipeline: any; // ポストプロセスパイプライン

/**
 * シーンを取得
 */
export function getScene(): any {
  return scene;
}

/**
 * レンダリング対象のシーンを取得
 */
export function getSceneToRender(): any {
  return sceneToRender;
}

/**
 * レンダリング対象のシーンを設定
 */
export function setSceneToRender(newScene: any): void {
  sceneToRender = newScene;
}

/**
 * シーンの作成
 */
export async function createScene(): Promise<any> {
  try {
    // BABYLONグローバル変数のチェック
    if (!window.BABYLON) {
      console.error(
        "BABYLONグローバル変数が定義されていません。Babylon.jsが正しく読み込まれていることを確認してください。"
      );
      // 少し待ってから再チェック
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!window.BABYLON) {
        throw new Error("BABYLONグローバル変数が見つかりません");
      }
    }

    const engine = Engine.getEngine();
    if (!engine) {
      throw new Error("エンジンが初期化されていません");
    }

    const canvas = engine.getRenderingCanvas();
    if (!canvas) {
      throw new Error("レンダリングキャンバスが取得できません");
    }

    return await Playground.CreateScene(engine, canvas);
  } catch (error) {
    console.error("シーン作成中にエラーが発生しました:", error);
    throw error;
  }
}

/**
 * グローバル参照の設定
 */
export function setGlobalReferences(scene: any, mmdRuntime: any, audioPlayer: any, pipeline: any): void {
  console.log("シーン参照を設定します");
  console.log("window.mmdShotApp:", window.mmdShotApp ? "存在します" : "存在しません");

  // 確実にmmdShotAppが存在するようにする
  if (!window.mmdShotApp) {
    console.log("window.mmdShotAppを作成します");
    window.mmdShotApp = {
      setSceneReference: function (s: any, m: any, a: any) {
        console.log("シーン参照を設定しました（フォールバック）");
      },
      pauseAnimation: function () {},
      resumeAnimation: function () {},
      toggleCameraMode: function () {},
    };
  }

  // カメラモード切り替え関数を追加
  window.mmdShotApp.toggleCameraMode = function (): void {
    if (!scene || !window.mmdCameraMode) {
      console.error("シーンまたはカメラモード情報が見つかりません");
      return;
    }

    // 現在のモードを取得
    const currentMode = window.mmdCameraMode.currentMode;

    // モードを切り替え
    if (currentMode === "faceFollow") {
      window.mmdCameraMode.currentMode = "fullBody";
      scene.activeCamera = window.mmdCameraMode.cameras.fullBody;
      console.log("カメラモードを全体表示に切り替えました");
    } else {
      window.mmdCameraMode.currentMode = "faceFollow";
      scene.activeCamera = window.mmdCameraMode.cameras.faceFollow;
      console.log("カメラモードを顔追従に切り替えました");
    }

    // アクティブカメラをキャンバスにアタッチ
    scene.activeCamera.attachControl(Engine.getEngine().getRenderingCanvas(), true);

    // カメラモード表示を更新
    const cameraModeIndicator = document.getElementById("camera-mode-indicator");
    if (cameraModeIndicator) {
      cameraModeIndicator.textContent =
        window.mmdCameraMode.currentMode === "faceFollow" ? "顔追従モード" : "全体表示モード";
    }
  };

  // シーン参照を設定
  window.mmdShotApp.setSceneReference(scene, mmdRuntime, audioPlayer);

  // グローバル参照も設定
  window.rendererScene = scene;
  window.rendererMmdRuntime = mmdRuntime;
  window.rendererAudioPlayer = audioPlayer;
  window.rendererPipeline = pipeline; // ポストプロセスパイプラインをグローバルに保存
}

/**
 * Playgroundクラス - MMDシーンの作成と管理
 */
export class Playground {
  /**
   * MMDシーンを作成
   */
  static async CreateScene(engine: any, canvas: HTMLCanvasElement): Promise<any> {
    try {
      console.log("シーンを作成中...");

      // BABYLONグローバル変数のチェック
      if (!window.BABYLON) {
        console.error("BABYLONグローバル変数が定義されていません");
        // 少し待ってから再チェック
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (!window.BABYLON) {
          throw new Error("BABYLONグローバル変数が見つかりません");
        }
      }

      // Babylon MMD を読み込み
      console.log("Babylon MMDを読み込み中...");
      await loadBabylonMmd();

      // 読み込み確認と待機
      let retries = 0;
      while (!isBabylonMmdLoaded() && retries < 5) {
        console.log("BABYLONMMDのロードを待機しています...");
        await new Promise((resolve) => setTimeout(resolve, 500));
        retries++;
      }

      if (!isBabylonMmdLoaded()) {
        console.error("BABYLONMMDグローバル変数が定義されていません");
        throw new Error("BABYLONMMDグローバル変数が見つかりません");
      }

      // PMXローダー設定
      console.log("PMXローダーを設定中...");
      configurePmxLoader();

      // シーン作成
      console.log("シーンオブジェクトを作成中...");
      scene = new window.BABYLON.Scene(engine);
      scene.clearColor = new window.BABYLON.Color4(0.5, 0.5, 0.5, 1.0);
      console.log("シーンオブジェクトが作成されました");

      // カメラ設定
      console.log("カメラを設定中...");
      const { mmdCamera, camera } = setupCameras(scene);
      console.log("カメラが設定されました");

      // ライティング設定
      console.log("ライティングを設定中...");
      const { directionalLight, shadowGenerator, lensFlareSystem } = setupLighting(scene);
      console.log("ライティングが設定されました");
      console.log("レンズフレアシステムが設定されました");

      // MMD関連設定
      console.log("MMD関連を設定中...");
      const { mmdRuntime, audioPlayer } = setupMmd(scene);
      console.log("MMD関連が設定されました");

      // カスタムローディング画面の設定
      console.log("ローディング画面を設定中...");
      const { customLoadingScreen, loadingBar, loadingText } = getLoadingElements();
      console.log("ローディング画面が設定されました");

      // アセットのロード
      console.log("アセットを読み込み中...");
      const loadResults = await loadAssets(scene, mmdRuntime, loadingText, loadingBar);
      console.log("アセットの読み込みが完了しました");

      // ローディング完了処理
      console.log("ローディング完了処理を実行中...");
      finishLoading(customLoadingScreen, loadingText, loadingBar);

      // MMDモデルとアニメーションの設定
      console.log("MMDモデルとアニメーションを設定中...");
      setupMmdModelAndAnimation(scene, mmdRuntime, mmdCamera, loadResults, shadowGenerator, directionalLight);
      console.log("MMDモデルとアニメーションが設定されました");

      // 地面の作成
      console.log("地面を作成中...");
      const { ground, modelMesh } = createGround(scene, loadResults);
      console.log("地面が作成されました");

      // ポストプロセス設定
      console.log("ポストプロセスを設定中...");
      renderPipeline = setupPostProcessing(scene, camera);
      console.log("ポストプロセスが設定されました");

      // カメラをアクティブに設定
      console.log("アクティブカメラを設定中...");
      scene.activeCamera = camera;
      camera.attachControl(canvas, true);
      console.log("アクティブカメラが設定されました");

      // シーンとMMDランタイムの参照をグローバルに設定
      console.log("グローバル参照を設定中...");
      setGlobalReferences(scene, mmdRuntime, audioPlayer, renderPipeline);
      console.log("グローバル参照が設定されました");

      return scene;
    } catch (error) {
      console.error("シーン作成中に例外が発生しました:", error);
      throw error;
    }
  }
}
