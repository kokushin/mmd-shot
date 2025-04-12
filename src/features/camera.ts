// camera.ts - カメラ関連の機能

/**
 * カメラを設定
 */
export function setupCameras(scene: any): { mmdCamera: any; camera: any } {
  // MMD 用カメラ
  const mmdCamera = new (BABYLONMMD as any).MmdCamera("MmdCamera", new (BABYLON as any).Vector3(0, 10, 0), scene);
  mmdCamera.maxZ = 5000;

  // 全体表示モード用カメラ（TikTokのダンス動画のように中央に表示、キャラクターは正面向き）
  const fullBodyCamera = new (BABYLON as any).ArcRotateCamera(
    "FullBodyCamera",
    (Math.PI * 3) / 2, // Alpha（横回転）- 3π/2（270度）でキャラクターが正面を向く
    Math.PI / 2.5, // Beta（縦回転）
    45, // 距離
    new (BABYLON as any).Vector3(0, 10, 0), // ターゲット位置
    scene
  );
  fullBodyCamera.maxZ = 5000;
  fullBodyCamera.lowerRadiusLimit = 30; // 最小ズーム距離
  fullBodyCamera.upperRadiusLimit = 60; // 最大ズーム距離
  fullBodyCamera.wheelDeltaPercentage = 0.01; // ホイールズーム感度

  // 顔追従モード用カメラ
  const faceFollowCamera = new (BABYLON as any).ArcRotateCamera(
    "FaceFollowCamera",
    (Math.PI * 3) / 2, // Alpha（横回転）- 3π/2（270度）でキャラクターが正面を向く
    Math.PI / 2.5, // Beta（縦回転）
    10, // 距離（顔により近く）
    new (BABYLON as any).Vector3(0, 15, 0), // ターゲット位置（顔の高さに合わせる）
    scene
  );
  faceFollowCamera.maxZ = 5000;
  faceFollowCamera.lowerRadiusLimit = 8; // 最小ズーム距離を短く
  faceFollowCamera.upperRadiusLimit = 20; // 最大ズーム距離も短く
  faceFollowCamera.wheelDeltaPercentage = 0.01; // ホイールズーム感度

  // グローバル変数にカメラモード情報を保存
  (window as any).mmdCameraMode = {
    currentMode: "faceFollow", // デフォルトは顔追従モード
    cameras: {
      faceFollow: faceFollowCamera,
      fullBody: fullBodyCamera,
    },
  };

  // デフォルトのカメラを顔追従モードに設定
  const camera = faceFollowCamera;

  return { mmdCamera, camera };
}
