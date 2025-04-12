// mmd.ts - Babylon MMD関連の機能

import { getBgmPath } from "../utils/env";

/**
 * Babylon MMDが読み込まれているか確認
 */
export function isBabylonMmdLoaded(): boolean {
  return typeof (window as any).BABYLONMMD !== "undefined";
}

/**
 * Babylon MMDを読み込む
 */
export async function loadBabylonMmd(): Promise<void> {
  // すでに読み込まれている場合は何もしない
  if (isBabylonMmdLoaded()) {
    console.log("Babylon MMDはすでに読み込まれています");
    return;
  }

  console.log("Babylon MMDを読み込みます...");
  return new Promise((resolve, reject) => {
    try {
      const babylonMmdScript = document.createElement("script");
      // babylon-mmd@0.40.0
      babylonMmdScript.src = "./libs/babylon/babylon.mmd.min.js";
      babylonMmdScript.onload = () => {
        console.log("Babylon MMDの読み込みが完了しました");
        if (!isBabylonMmdLoaded()) {
          reject(new Error("Babylon MMDのグローバル変数が見つかりません"));
          return;
        }
        resolve();
      };
      babylonMmdScript.onerror = () => {
        reject(new Error("Babylon MMDの読み込みに失敗しました"));
      };
      document.head.appendChild(babylonMmdScript);
    } catch (error) {
      console.error("Babylon MMDの読み込み中にエラーが発生しました:", error);
      reject(error);
    }
  });
}

/**
 * PMXローダーを設定
 */
export function configurePmxLoader(): void {
  try {
    if (typeof BABYLON === "undefined") {
      console.error("BABYLONグローバル変数が定義されていません");
      return;
    }

    const pmxLoader = BABYLON.SceneLoader.GetPluginForExtension(".pmx");
    if (!pmxLoader) {
      console.error("PMXローダープラグインが見つかりません");
      return;
    }

    const materialBuilder = pmxLoader.materialBuilder;
    materialBuilder.useAlphaEvaluation = false;
    materialBuilder.loadOutlineRenderingProperties = () => {};

    const alphaBlendMaterials = ["face02", "Facial02", "HL", "Hairshadow", "q302"];
    const alphaTestMaterials = ["q301"];

    materialBuilder.afterBuildSingleMaterial = (material: any) => {
      if (!alphaBlendMaterials.includes(material.name) && !alphaTestMaterials.includes(material.name)) return;
      material.transparencyMode = alphaBlendMaterials.includes(material.name)
        ? BABYLON.Material.MATERIAL_ALPHABLEND
        : BABYLON.Material.MATERIAL_ALPHATEST;
      material.useAlphaFromDiffuseTexture = true;
      material.diffuseTexture.hasAlpha = true;
    };

    console.log("PMXローダーの設定が完了しました");
  } catch (error) {
    console.error("PMXローダーの設定中にエラーが発生しました:", error);
  }
}

/**
 * MMD関連の設定
 */
export function setupMmd(scene: any): {
  mmdRuntime: any;
  audioPlayer: any;
} {
  try {
    if (!isBabylonMmdLoaded()) {
      throw new Error("Babylon MMDが読み込まれていません");
    }

    const BABYLONMMD = (window as any).BABYLONMMD;

    // MMDランタイム
    const mmdRuntime = new BABYLONMMD.MmdRuntime(scene, new BABYLONMMD.MmdPhysics(scene));
    mmdRuntime.register(scene);

    // オーディオプレイヤー
    const audioPlayer = new BABYLONMMD.StreamAudioPlayer(scene);
    audioPlayer.preservesPitch = false;
    // BGMのパスを環境変数から取得
    audioPlayer.source = getBgmPath();
    mmdRuntime.setAudioPlayer(audioPlayer);

    // アニメーションの一時停止と再開のためのフラグ
    mmdRuntime.isAnimationPaused = false;

    // オリジナルのplayAnimation関数を保存
    const originalPlayAnimation = mmdRuntime.playAnimation.bind(mmdRuntime);

    // playAnimation関数をオーバーライド
    mmdRuntime.playAnimation = function (): void {
      mmdRuntime.isAnimationPaused = false;
      // アニメーションタイムスケールを通常に戻す
      scene.animationTimeScale = 1;
      originalPlayAnimation();
    };

    // pauseAnimation関数を追加
    mmdRuntime.pauseAnimation = function (): void {
      if (!mmdRuntime.isAnimationPaused) {
        mmdRuntime.isAnimationPaused = true;

        // シーンのアニメーションを一時停止
        // Babylon.jsのアニメーションエンジンを一時停止
        scene.animationTimeScale = 0;

        // オーディオを一時停止
        if (audioPlayer) {
          audioPlayer.pause();
        }

        console.log("アニメーションとオーディオを一時停止しました");
      }
    };

    // アニメーションを開始
    mmdRuntime.playAnimation();

    // プレイヤーコントロール
    const mmdPlayerControl = new BABYLONMMD.MmdPlayerControl(scene, mmdRuntime, audioPlayer);
    mmdPlayerControl.showPlayerControl();

    console.log("MMDの設定が完了しました");
    return { mmdRuntime, audioPlayer };
  } catch (error) {
    console.error("MMD設定中にエラーが発生しました:", error);
    throw error;
  }
}
