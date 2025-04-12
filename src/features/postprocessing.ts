// postprocessing.ts - ポストプロセス関連の機能

/**
 * ポストプロセスの設定
 */
export function setupPostProcessing(scene: any, camera: any): any {
  // すべてのカメラを取得（顔追従モードと全体表示モード両方に適用するため）
  const cameras = [];
  if ((window as any).mmdCameraMode) {
    cameras.push((window as any).mmdCameraMode.cameras.faceFollow);
    cameras.push((window as any).mmdCameraMode.cameras.fullBody);
  } else {
    // フォールバックとして現在のカメラを使用
    cameras.push(camera);
  }
  
  const defaultPipeline = new (BABYLON as any).DefaultRenderingPipeline("default", true, scene, cameras);
  defaultPipeline.samples = 8;

  // ブルームエフェクトの設定
  defaultPipeline.bloomEnabled = true;
  defaultPipeline.bloomThreshold = 0.2; // ブルームの閾値
  defaultPipeline.bloomWeight = 0.3; // ブルームの強さ
  defaultPipeline.bloomKernel = 64; // ブルームのぼかし範囲
  defaultPipeline.bloomScale = 0.5; // ブルームのスケール

  // 被写界深度（Depth of Field）の設定
  defaultPipeline.depthOfFieldEnabled = true;
  defaultPipeline.depthOfFieldBlurLevel = (BABYLON as any).DepthOfFieldEffectBlurLevel.High;
  defaultPipeline.depthOfField.fStop = 2.0; // F値（小さいほどボケが強くなる）
  defaultPipeline.depthOfField.focalLength = 50; // 焦点距離mm
  defaultPipeline.depthOfField.focusDistance = 5000; // フォーカス距離（mm）
  defaultPipeline.depthOfField.lensSize = 50; // レンズサイズ

  defaultPipeline.chromaticAberrationEnabled = true;
  defaultPipeline.chromaticAberration.aberrationAmount = 1;
  defaultPipeline.fxaaEnabled = true;
  defaultPipeline.imageProcessingEnabled = true;
  defaultPipeline.imageProcessing.toneMappingEnabled = true;
  defaultPipeline.imageProcessing.toneMappingType = (BABYLON as any).ImageProcessingConfiguration.TONEMAPPING_ACES;
  defaultPipeline.imageProcessing.vignetteWeight = 0.5;
  defaultPipeline.imageProcessing.vignetteStretch = 0.5;
  defaultPipeline.imageProcessing.vignetteColor = new (BABYLON as any).Color4(0, 0, 0, 0);
  defaultPipeline.imageProcessing.vignetteEnabled = true;

  return defaultPipeline;
}

/**
 * 被写体（MMDモデル）にフォーカスを合わせる
 * @param pipeline ポストプロセスパイプライン
 * @param headBone 頭のボーン（フォーカスポイント）
 * @param camera カメラ
 */
export function focusOnModel(pipeline: any, headBone: any, camera: any): void {
  if (!pipeline.depthOfFieldEnabled || !headBone) return;

  // 頭の位置を取得
  const headPosition = new (BABYLON as any).Vector3(0, 0, 0);
  headBone.getFinalMatrix().getTranslationToRef(headPosition);

  // カメラからモデルの頭までの距離を計算（mm単位）
  const cameraPosition = camera.position;
  const distance = (BABYLON as any).Vector3.Distance(cameraPosition, headPosition);

  // フォーカス距離をモデルの位置に設定（単位をmm単位に変換）
  pipeline.depthOfField.focusDistance = distance * 1000;
}

/**
 * 被写界深度の設定を更新
 * @param pipeline ポストプロセスパイプライン
 * @param fStop F値（小さいほどボケが強くなる）
 * @param focalLength 焦点距離（mm）
 * @param lensSize レンズサイズ
 */
export function updateDepthOfFieldSettings(
  pipeline: any,
  fStop: number = 2.0,
  focalLength: number = 50,
  lensSize: number = 50
): void {
  if (!pipeline.depthOfFieldEnabled) return;

  pipeline.depthOfField.fStop = fStop;
  pipeline.depthOfField.focalLength = focalLength;
  pipeline.depthOfField.lensSize = lensSize;
}
