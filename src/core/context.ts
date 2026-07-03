// context.ts - アプリ全体で共有する型定義
import type { Bone, DirectionalLight, Engine, Scene, ShadowGenerator } from "@babylonjs/core";
import type { MmdCamera } from "babylon-mmd/esm/Runtime/mmdCamera";
import type { MmdModel } from "babylon-mmd/esm/Runtime/mmdModel";
import type { MmdRuntime } from "babylon-mmd/esm/Runtime/mmdRuntime";
import type { MmdSkinnedMesh } from "babylon-mmd/esm/Runtime/mmdMesh";
import type { StreamAudioPlayer } from "babylon-mmd/esm/Runtime/Audio/streamAudioPlayer";
import type { MultiPhysicsRuntime } from "babylon-mmd/esm/Runtime/Optimized/Physics/Bind/Impl/multiPhysicsRuntime";

import type { CameraModeManager, CameraSet } from "../camera/cameraModeManager";
import type { EffectPipeline } from "../rendering/presets";

/**
 * シーン構築時に使うアセットの選択内容
 */
export interface AssetSelection {
  /** モデルPMXのURL */
  modelUrl: string;
  /** ダンスモーションVMDのURL */
  motionUrl: string;
  /** 音声ファイルのURL (nullで無音) */
  audioUrl: string | null;
  /** カメラモーションVMDのURL (nullでカメラVMDモード無効) */
  cameraMotionUrl: string | null;
  /** ステージPMXのURL (nullでビルトインステージ) */
  stageUrl: string | null;
}

/**
 * ロード進捗の通知先
 */
export interface LoadingReporter {
  report(text: string, ratio: number): void;
}

/**
 * 構築済みシーンの参照一式
 */
export interface AppContext {
  engine: Engine;
  scene: Scene;
  mmdRuntime: MmdRuntime;
  physicsRuntime: MultiPhysicsRuntime;
  audioPlayer: StreamAudioPlayer;
  model: {
    mesh: MmdSkinnedMesh;
    mmdModel: MmdModel;
    headBone: Bone | null;
    centerBone: Bone | null;
  };
  cameras: CameraSet;
  cameraManager: CameraModeManager;
  effects: EffectPipeline;
  shadowGenerator: ShadowGenerator;
  directionalLight: DirectionalLight;
  /** シーンと物理・ランタイムを破棄する (アセット切替時の再構築用) */
  dispose(): void;
}
