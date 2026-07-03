// cameraModeManager.ts - カメラモードの管理 (カメラVMD / 自動 / 手動)
import { ArcRotateCamera, Bone, Scene, Vector3 } from "@babylonjs/core";
import type { MmdCamera } from "babylon-mmd/esm/Runtime/mmdCamera";

import type { AutoCameraDirector } from "./autoCameraDirector";

export type CameraModeId = "vmd" | "auto" | "faceFollow" | "fullBody";

export const CAMERA_MODE_LABELS: Record<CameraModeId, string> = {
  vmd: "カメラ: モーション",
  auto: "カメラ: 自動",
  faceFollow: "カメラ: 顔追従",
  fullBody: "カメラ: 全身",
};

export interface CameraSet {
  mmd: MmdCamera;
  faceFollow: ArcRotateCamera;
  fullBody: ArcRotateCamera;
}

interface ManagerBones {
  head: Bone | null;
}

/**
 * 手動カメラ2種を作成する
 */
export function createManualCameras(scene: Scene): { faceFollow: ArcRotateCamera; fullBody: ArcRotateCamera } {
  // 全身カメラ (alpha 270度でモデル正面)
  const fullBody = new ArcRotateCamera(
    "FullBodyCamera",
    (Math.PI * 3) / 2,
    Math.PI / 2.5,
    45,
    new Vector3(0, 10, 0),
    scene
  );
  fullBody.maxZ = 5000;
  fullBody.lowerRadiusLimit = 20;
  fullBody.upperRadiusLimit = 80;
  fullBody.wheelDeltaPercentage = 0.01;

  // 顔追従カメラ
  const faceFollow = new ArcRotateCamera(
    "FaceFollowCamera",
    (Math.PI * 3) / 2,
    Math.PI / 2.5,
    10,
    new Vector3(0, 15, 0),
    scene
  );
  faceFollow.maxZ = 5000;
  faceFollow.lowerRadiusLimit = 5;
  faceFollow.upperRadiusLimit = 25;
  faceFollow.wheelDeltaPercentage = 0.01;

  return { faceFollow, fullBody };
}

/**
 * カメラモードの切替と毎フレーム更新を担う
 */
export class CameraModeManager {
  private readonly _scene: Scene;
  private readonly _canvas: HTMLCanvasElement;
  private readonly _cameras: CameraSet;
  private readonly _autoDirector: AutoCameraDirector;
  private readonly _getBones: () => ManagerBones;
  private readonly _modes: CameraModeId[];
  private _current: CameraModeId;

  // 顔追従のイージング用
  private readonly _followTarget = new Vector3(0, 16.5, 0);
  private readonly _headPosition = new Vector3(0, 16.5, 0);
  private readonly _followFixedY = 16.5;
  private readonly _followEasing = 0.1;

  constructor(
    scene: Scene,
    canvas: HTMLCanvasElement,
    cameras: CameraSet,
    autoDirector: AutoCameraDirector,
    getBones: () => ManagerBones,
    hasCameraVmd: boolean
  ) {
    this._scene = scene;
    this._canvas = canvas;
    this._cameras = cameras;
    this._autoDirector = autoDirector;
    this._getBones = getBones;
    this._modes = hasCameraVmd
      ? ["vmd", "auto", "faceFollow", "fullBody"]
      : ["auto", "faceFollow", "fullBody"];
    this._current = this._modes[0];
    this._activate(this._current);
  }

  get current(): CameraModeId {
    return this._current;
  }

  get label(): string {
    return CAMERA_MODE_LABELS[this._current];
  }

  /** 次のモードへ切り替える */
  cycle(): CameraModeId {
    const index = this._modes.indexOf(this._current);
    const next = this._modes[(index + 1) % this._modes.length];
    this.setMode(next);
    return next;
  }

  setMode(mode: CameraModeId): void {
    if (!this._modes.includes(mode)) {
      return;
    }
    // 現在の手動カメラの操作を解除
    this._cameras.faceFollow.detachControl();
    this._cameras.fullBody.detachControl();

    this._current = mode;
    this._activate(mode);
  }

  /** 毎フレームの更新 (顔追従イージング / 自動カメラ) */
  update(): void {
    switch (this._current) {
      case "auto":
        this._autoDirector.update();
        break;
      case "faceFollow": {
        const head = this._getBones().head;
        if (head !== null) {
          head.getFinalMatrix().getTranslationToRef(this._headPosition);
          this._followTarget.x += (this._headPosition.x - this._followTarget.x) * this._followEasing;
          this._followTarget.z += (this._headPosition.z - this._followTarget.z) * this._followEasing;
          this._followTarget.y = this._followFixedY;
          this._cameras.faceFollow.setTarget(this._followTarget.clone());
        }
        break;
      }
    }
  }

  private _activate(mode: CameraModeId): void {
    switch (mode) {
      case "vmd":
        this._scene.activeCamera = this._cameras.mmd;
        break;
      case "auto":
        this._scene.activeCamera = this._autoDirector.camera;
        break;
      case "faceFollow":
        this._scene.activeCamera = this._cameras.faceFollow;
        this._cameras.faceFollow.attachControl(this._canvas, true);
        break;
      case "fullBody":
        this._scene.activeCamera = this._cameras.fullBody;
        this._cameras.fullBody.attachControl(this._canvas, true);
        break;
    }
  }
}
