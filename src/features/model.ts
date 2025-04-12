// model.ts - MMDモデルとアニメーションの設定に関連する機能
import { focusOnModel } from "./postprocessing";

/**
 * MMDモデルとアニメーションの設定
 */
export function setupMmdModelAndAnimation(
  scene: any,
  mmdRuntime: any,
  mmdCamera: any,
  loadResults: any[],
  shadowGenerator: any,
  directionalLight: any
): { modelMesh: any; mmdModel: any; headBone: any } {
  mmdRuntime.setCamera(mmdCamera);
  mmdCamera.addAnimation(loadResults[0]);
  mmdCamera.setAnimation("motion");

  const modelMesh = loadResults[1].meshes[0];
  modelMesh.receiveShadows = true;
  shadowGenerator.addShadowCaster(modelMesh);

  const mmdModel = mmdRuntime.createMmdModel(modelMesh);
  mmdModel.addAnimation(loadResults[0]);
  mmdModel.setAnimation("motion");

  // 顔のボーンを探す
  const headBone = loadResults[1].skeletons[0].bones.find((bone: any) => bone.name === "頭");
  const bodyBone = loadResults[1].skeletons[0].bones.find((bone: any) => bone.name === "センター");

  // 顔追従カメラのターゲット位置を更新
  const faceFollowCamera = (window as any).mmdCameraMode.cameras.faceFollow;
  const fullBodyCamera = (window as any).mmdCameraMode.cameras.fullBody;

  // 固定Y座標（高さ）を設定
  const fixedYPosition = 16.5;

  // 現在のカメラターゲット位置
  const currentTarget = new (BABYLON as any).Vector3(0, fixedYPosition, 0);

  // イージング係数（0〜1の値、小さいほどスムーズになる）
  const easingFactor = 0.1;

  scene.onBeforeRenderObservable.add(() => {
    // ライトの位置更新
    bodyBone.getFinalMatrix().getTranslationToRef(directionalLight.position);
    directionalLight.position.y -= 10;

    // レンダリングパイプラインが設定されていれば、被写界深度のフォーカスを更新
    const pipeline = (window as any).rendererPipeline;
    if (pipeline && headBone) {
      // 現在のカメラに基づいてフォーカスを更新
      const activeCamera = scene.activeCamera;
      focusOnModel(pipeline, headBone, activeCamera);
    }

    // 顔追従カメラのターゲット位置を更新（頭のボーンが見つかった場合）
    if (headBone && (window as any).mmdCameraMode.currentMode === "faceFollow") {
      // 頭の位置を取得
      const headPosition = new (BABYLON as any).Vector3(0, 0, 0);
      headBone.getFinalMatrix().getTranslationToRef(headPosition);

      // 目標位置（Y座標は固定）
      const targetPosition = new (BABYLON as any).Vector3(headPosition.x, fixedYPosition, headPosition.z);

      // 現在の位置から目標位置へスムーズに移動（イージング）
      currentTarget.x += (targetPosition.x - currentTarget.x) * easingFactor;
      currentTarget.z += (targetPosition.z - currentTarget.z) * easingFactor;

      // カメラのターゲット位置を更新
      faceFollowCamera.setTarget(currentTarget);
    }
  });

  return { modelMesh, mmdModel, headBone };
}
