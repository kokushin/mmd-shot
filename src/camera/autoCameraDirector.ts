// autoCameraDirector.ts - プロシージャル自動カメラ
// カメラVMDがないモーションでも、ショットの自動切替でMV風のカメラワークを生成する
import { Bone, Scene, TargetCamera, Vector3 } from "@babylonjs/core";

type ShotType = "static" | "orbit" | "dollyIn" | "dollyOut";

interface ShotDef {
  /** 注視するボーン */
  target: "head" | "center";
  /** 注視点のY方向オフセット */
  heightOffset: number;
  /** カメラ距離 */
  distance: number;
  /** 仰角 (rad, 正で見下ろし) */
  elevation: number;
  /** 視野角 (rad) */
  fov: number;
  type: ShotType;
}

// 全身→バスト→オービット→顔アップ→膝上→ドリーインの順で巡回
const SHOTS: ShotDef[] = [
  { target: "center", heightOffset: 4.0, distance: 34, elevation: 0.06, fov: 0.5, type: "static" },
  { target: "head", heightOffset: -1.5, distance: 13, elevation: 0.02, fov: 0.48, type: "static" },
  { target: "center", heightOffset: 4.5, distance: 28, elevation: 0.1, fov: 0.52, type: "orbit" },
  { target: "head", heightOffset: -0.3, distance: 7, elevation: 0.0, fov: 0.42, type: "static" },
  { target: "center", heightOffset: 6.0, distance: 21, elevation: 0.04, fov: 0.5, type: "dollyIn" },
  { target: "head", heightOffset: -1.0, distance: 11, elevation: 0.02, fov: 0.48, type: "dollyOut" },
];

interface DirectorBones {
  head: Bone | null;
  center: Bone | null;
}

/**
 * プロシージャル自動カメラ
 * - BPMに合わせて Nビート毎にショットを切り替える (ハードカット)
 * - ショット内ではゆっくりとしたドリフト + 手持ち風の微小な揺れ
 */
export class AutoCameraDirector {
  readonly camera: TargetCamera;

  /** 楽曲のBPM (カット間隔の基準) */
  bpm = 120;
  /** 何ビートごとにカットするか */
  beatsPerCut = 8;

  private readonly _getBones: () => DirectorBones;
  private readonly _getTimeSec: () => number;
  private _currentCut = -1;
  private _shot: ShotDef = SHOTS[0];
  private _azimuth = 0;
  private _driftDirection = 1;
  private readonly _targetPosition = new Vector3(0, 10, 0);
  private readonly _bonePosition = new Vector3(0, 10, 0);

  constructor(scene: Scene, getBones: () => DirectorBones, getTimeSec: () => number) {
    this.camera = new TargetCamera("AutoCamera", new Vector3(0, 10, -30), scene);
    this.camera.minZ = 0.5;
    this.camera.maxZ = 5000;
    this.camera.fov = 0.5;
    this._getBones = getBones;
    this._getTimeSec = getTimeSec;
  }

  /** 毎フレーム呼び出してカメラを更新する */
  update(): void {
    const time = this._getTimeSec();
    const cutDuration = (this.beatsPerCut * 60) / this.bpm;
    const cutIndex = Math.floor(time / cutDuration);
    const cutLocalTime = time - cutIndex * cutDuration;
    const cutProgress = Math.min(1, cutLocalTime / cutDuration);

    if (cutIndex !== this._currentCut) {
      this._currentCut = cutIndex;
      this._shot = SHOTS[((cutIndex % SHOTS.length) + SHOTS.length) % SHOTS.length];
      // カット毎に決定論的な擬似乱数で初期アングルを変える (正面±35度)
      this._azimuth = (this._pseudoRandom(cutIndex) - 0.5) * 1.2;
      this._driftDirection = this._pseudoRandom(cutIndex * 7 + 3) > 0.5 ? 1 : -1;
    }

    const bones = this._getBones();
    const bone = this._shot.target === "head" ? bones.head : bones.center;
    if (bone !== null) {
      bone.getFinalMatrix().getTranslationToRef(this._bonePosition);
    }

    // 注視点 (手持ち風の微小な揺れを加える)
    this._targetPosition.copyFrom(this._bonePosition);
    this._targetPosition.y += this._shot.heightOffset;
    this._targetPosition.x += Math.sin(time * 1.7) * 0.08;
    this._targetPosition.y += Math.sin(time * 2.3 + 1.0) * 0.06;

    // ショット内のカメラ距離・アングルの変化
    let distance = this._shot.distance;
    let azimuth = this._azimuth + this._driftDirection * cutLocalTime * 0.05;
    switch (this._shot.type) {
      case "orbit":
        azimuth = this._azimuth + this._driftDirection * cutLocalTime * 0.35;
        break;
      case "dollyIn":
        distance = this._shot.distance * (1 - 0.45 * this._easeOutCubic(cutProgress));
        break;
      case "dollyOut":
        distance = this._shot.distance * (1 + 0.6 * this._easeOutCubic(cutProgress));
        break;
    }

    // カメラは -Z 方向 (モデル正面) を基準に配置する
    const elevation = this._shot.elevation;
    const horizontal = distance * Math.cos(elevation);
    this.camera.position.set(
      this._targetPosition.x + horizontal * Math.sin(azimuth),
      this._targetPosition.y + distance * Math.sin(elevation),
      this._targetPosition.z - horizontal * Math.cos(azimuth)
    );
    this.camera.fov = this._shot.fov;
    this.camera.setTarget(this._targetPosition);
  }

  private _pseudoRandom(seed: number): number {
    const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  private _easeOutCubic(x: number): number {
    return 1 - Math.pow(1 - x, 3);
  }
}
