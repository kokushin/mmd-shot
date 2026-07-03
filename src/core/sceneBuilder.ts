// sceneBuilder.ts - MMDシーンの構築
import { AbstractMesh, Color3, Color4, Engine, Scene, Vector3 } from "@babylonjs/core";
import type { MmdAnimation } from "babylon-mmd/esm/Loader/Animation/mmdAnimation";
import type { MmdMesh } from "babylon-mmd/esm/Runtime/mmdMesh";
import { MmdCamera } from "babylon-mmd/esm/Runtime/mmdCamera";
import { StreamAudioPlayer } from "babylon-mmd/esm/Runtime/Audio/streamAudioPlayer";
import { MmdPlayerControl } from "babylon-mmd/esm/Runtime/Util/mmdPlayerControl";

import { AutoCameraDirector } from "../camera/autoCameraDirector";
import { CameraModeManager, createManualCameras } from "../camera/cameraModeManager";
import { loadMmdModel, loadMmdStage, loadMotion } from "../loading/assetLoader";
import { createMaterialBuilder } from "../mmd/materials";
import { createMmdRuntime, PhysicsSet } from "../mmd/runtime";
import { createLighting } from "../rendering/lighting";
import { EffectPipeline } from "../rendering/presets";
import { createProceduralStage } from "../stage/proceduralStage";
import type { AppContext, AssetSelection, LoadingReporter } from "./context";

/**
 * アセット選択からシーン一式を構築する
 */
export async function buildScene(
  engine: Engine,
  canvas: HTMLCanvasElement,
  selection: AssetSelection,
  reporter: LoadingReporter,
  physics: PhysicsSet
): Promise<AppContext> {
  console.log("シーンを構築します:", selection.modelUrl);
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.02, 0.02, 0.035, 1.0);
  // MMDのシェーディング再現にはambientColor 0.5が必須
  scene.ambientColor = new Color3(0.5, 0.5, 0.5);

  const { directionalLight, shadowGenerator } = createLighting(scene);

  reporter.report("MMDランタイムを初期化中...", 0.05);
  const mmdRuntime = createMmdRuntime(scene, physics);
  const physicsRuntime = physics.physicsRuntime;

  // オーディオ (再生開始前に設定しないと同期がずれる)
  const audioPlayer = new StreamAudioPlayer(scene);
  audioPlayer.preservesPitch = false;
  if (selection.audioUrl !== null) {
    audioPlayer.source = selection.audioUrl;
    await mmdRuntime.setAudioPlayer(audioPlayer);
  }

  // アセットを並列ロード
  const materialBuilder = createMaterialBuilder();
  const [modelMesh, motion, cameraMotion, stageMesh] = await Promise.all([
    loadMmdModel(selection.modelUrl, scene, materialBuilder, reporter, "モデル"),
    loadMotion("dance", selection.motionUrl, scene, reporter, "モーション"),
    selection.cameraMotionUrl !== null
      ? loadMotion("camera", selection.cameraMotionUrl, scene, reporter, "カメラモーション")
      : Promise.resolve<MmdAnimation | null>(null),
    selection.stageUrl !== null
      ? loadMmdStage(selection.stageUrl, scene, createMaterialBuilder(), reporter)
      : Promise.resolve<MmdMesh | null>(null),
  ]);

  reporter.report("シーンを構築中...", 0.95);

  // モデルにモーションをバインド
  const mmdModel = mmdRuntime.createMmdModel(modelMesh);
  const modelAnimationHandle = mmdModel.createRuntimeAnimation(motion);
  mmdModel.setRuntimeAnimation(modelAnimationHandle);

  // モデルの影
  shadowGenerator.addShadowCaster(modelMesh);
  for (const mesh of modelMesh.metadata.meshes) {
    mesh.receiveShadows = true;
  }

  // MMDカメラ (カメラVMDがあればバインド)
  const mmdCamera = new MmdCamera("MmdCamera", new Vector3(0, 10, 0), scene);
  mmdCamera.maxZ = 5000;
  if (cameraMotion !== null) {
    mmdRuntime.addAnimatable(mmdCamera);
    const cameraAnimationHandle = mmdCamera.createRuntimeAnimation(cameraMotion);
    mmdCamera.setRuntimeAnimation(cameraAnimationHandle);
  }

  // ボーン参照 (MMD標準ボーン名)
  const bones = modelMesh.metadata.skeleton.bones;
  const headBone = bones.find((bone) => bone.name === "頭") ?? null;
  const centerBone = bones.find((bone) => bone.name === "センター") ?? null;

  // ステージ (ユーザーPMX or ビルトイン)
  if (stageMesh !== null) {
    for (const mesh of stageMesh.metadata.meshes) {
      mesh.receiveShadows = true;
    }
    shadowGenerator.addShadowCaster(stageMesh);
  } else {
    createProceduralStage(scene, modelMesh.metadata.meshes as readonly AbstractMesh[] as AbstractMesh[]);
  }

  // カメラ一式
  const manualCameras = createManualCameras(scene);
  const autoDirector = new AutoCameraDirector(
    scene,
    () => ({ head: headBone, center: centerBone }),
    () => mmdRuntime.currentTime
  );
  const cameras = { mmd: mmdCamera, ...manualCameras };
  const cameraManager = new CameraModeManager(
    scene,
    canvas,
    cameras,
    autoDirector,
    () => ({ head: headBone }),
    cameraMotion !== null
  );

  // ポストエフェクト (全カメラに適用)
  const effects = new EffectPipeline(scene, [
    mmdCamera,
    autoDirector.camera,
    manualCameras.faceFollow,
    manualCameras.fullBody,
  ]);

  // 毎フレーム更新: ライト追従・カメラ更新・DoFフォーカス
  const headWorldPosition = new Vector3();
  scene.onBeforeRenderObservable.add(() => {
    if (centerBone !== null) {
      centerBone.getFinalMatrix().getTranslationToRef(directionalLight.position);
      directionalLight.position.y -= 10;
    }
    cameraManager.update();
    if (headBone !== null && scene.activeCamera !== null) {
      headBone.getFinalMatrix().getTranslationToRef(headWorldPosition);
      const distance = Vector3.Distance(scene.activeCamera.globalPosition, headWorldPosition);
      effects.setFocusDistance(distance);
    }
  });

  // 再生コントロール (シークバー)
  const playerControl = new MmdPlayerControl(scene, mmdRuntime, audioPlayer);
  playerControl.showPlayerControl();

  await mmdRuntime.playAnimation();
  console.log("シーンの構築が完了しました");

  return {
    engine,
    scene,
    mmdRuntime,
    physicsRuntime,
    audioPlayer,
    model: { mesh: modelMesh, mmdModel, headBone, centerBone },
    cameras,
    cameraManager,
    effects,
    shadowGenerator,
    directionalLight,
    dispose(): void {
      console.log("シーンを破棄します");
      playerControl.dispose();
      effects.dispose();
      mmdRuntime.dispose(scene);
      // 物理ランタイム本体はアプリ生存期間で使い回すため、シーンからの登録解除のみ行う
      // (WASMランタイムのdispose()はハングするため呼ばない)
      physicsRuntime.unregister();
      scene.dispose();
      console.log("シーンを破棄しました");
    },
  };
}
