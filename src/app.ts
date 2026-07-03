// app.ts - MMD Shot エントリポイント
import "./mmd/sideEffects";
import "./styles.css";

import { RegisterDxBmpTextureLoader } from "babylon-mmd/esm/Loader/registerDxBmpTextureLoader";

import { CaptureController } from "./capture";
import type { AppContext, AssetSelection } from "./core/context";
import { createEngine } from "./core/engine";
import { buildScene } from "./core/sceneBuilder";
import { createPhysicsRuntime } from "./mmd/runtime";
import { EFFECT_PRESET_LABELS } from "./rendering/presets";
import { AssetPanel } from "./ui/assetPanel";
import { LoadingScreen } from "./ui/loading";
import { getDefaultAssetPaths, resolveAssetUrl } from "./utils/env";

window.addEventListener("DOMContentLoaded", () => {
  void main();
});

async function main(): Promise<void> {
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement | null;
  if (canvas === null) {
    throw new Error("renderCanvasが見つかりません");
  }

  const loading = new LoadingScreen();
  const engine = createEngine(canvas);
  RegisterDxBmpTextureLoader();

  // 物理ランタイム (WASM) はアプリ生存期間で1つだけ作成して使い回す
  loading.report("物理エンジンを初期化中...", 0.02);
  const physics = await createPhysicsRuntime();

  const defaults = getDefaultAssetPaths();
  const initialSelection: AssetSelection = {
    modelUrl: resolveAssetUrl(defaults.model),
    motionUrl: resolveAssetUrl(defaults.motion),
    audioUrl: defaults.audio !== null ? resolveAssetUrl(defaults.audio) : null,
    cameraMotionUrl: defaults.camera !== null ? resolveAssetUrl(defaults.camera) : null,
    stageUrl: defaults.stage !== null ? resolveAssetUrl(defaults.stage) : null,
  };

  let context: AppContext | null = null;
  let building = false;

  const cameraModeIndicator = document.getElementById("camera-mode-indicator");
  const updateCameraIndicator = (): void => {
    if (cameraModeIndicator !== null && context !== null) {
      cameraModeIndicator.textContent = context.cameraManager.label;
    }
  };
  const presetButton = document.getElementById("effect-preset-button");
  const updatePresetButton = (): void => {
    if (presetButton !== null && context !== null) {
      presetButton.textContent = `✨ ${EFFECT_PRESET_LABELS[context.effects.preset]}`;
    }
  };

  // シーンの構築 / 再構築 (アセット切替時)
  const rebuild = async (selection: AssetSelection): Promise<void> => {
    if (building) {
      return;
    }
    building = true;
    const previous = context;
    context = null;
    try {
      previous?.dispose();
    } catch (error) {
      console.error("シーン破棄中にエラーが発生しました:", error);
    }
    loading.show();
    try {
      context = await buildScene(engine, canvas, selection, loading, physics);
      loading.finish();
      updateCameraIndicator();
      updatePresetButton();
    } catch (error) {
      console.error("シーンの構築に失敗しました:", error);
      loading.showError(`読み込みに失敗しました: ${(error as Error).message}`);
    } finally {
      building = false;
    }
  };

  await rebuild(initialSelection);

  // 撮影機能
  const capture = new CaptureController(() => context);
  capture.init();

  // カメラモード切替
  document.getElementById("camera-mode-button")?.addEventListener("click", () => {
    context?.cameraManager.cycle();
    updateCameraIndicator();
  });

  // エフェクトプリセット切替
  presetButton?.addEventListener("click", () => {
    context?.effects.togglePreset();
    updatePresetButton();
  });

  // アセット選択パネル
  const assetPanel = new AssetPanel(defaults, (selection) => {
    void rebuild(selection);
  });
  await assetPanel.init();

  // レンダリングループ
  engine.runRenderLoop(() => {
    if (context !== null && context.scene.activeCamera !== null) {
      context.scene.render();
    }
  });
  window.addEventListener("resize", () => {
    engine.resize();
  });
}
