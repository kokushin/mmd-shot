// runtime.ts - MMDランタイムと物理エンジン (Bullet WASM) のセットアップ
import { Scene, Vector3 } from "@babylonjs/core";
import { GetMmdWasmInstance } from "babylon-mmd/esm/Runtime/Optimized/mmdWasmInstance";
import { MmdWasmInstanceTypeSPR } from "babylon-mmd/esm/Runtime/Optimized/InstanceType/singlePhysicsRelease";
import { MultiPhysicsRuntime } from "babylon-mmd/esm/Runtime/Optimized/Physics/Bind/Impl/multiPhysicsRuntime";
import { MmdBulletPhysics } from "babylon-mmd/esm/Runtime/Optimized/Physics/mmdBulletPhysics";
import { MmdRuntime } from "babylon-mmd/esm/Runtime/mmdRuntime";

/**
 * アプリ生存期間で1つだけ保持する物理ランタイム一式
 * (WASMランタイムの破棄はハングするため、シーン再構築時も使い回す)
 */
export interface PhysicsSet {
  physicsRuntime: MultiPhysicsRuntime;
}

/**
 * Bullet WASM物理ランタイムを作成する (アプリ起動時に1回だけ呼ぶ)
 * - 重力はMMD標準の -98 (現実の約10倍) に設定
 * - 床の静的コライダーは追加しない: ロング丈スカートの裾が床と常時接触し、
 *   摩擦→ジョイント連鎖でスカート全体が腰まで捲れ上がる。MMD標準も床剛体なしが期待動作
 */
export async function createPhysicsRuntime(): Promise<PhysicsSet> {
  // シングルスレッド + 物理 + リリースビルド (SharedArrayBuffer不要)
  const wasmInstance = await GetMmdWasmInstance(new MmdWasmInstanceTypeSPR());

  const physicsRuntime = new MultiPhysicsRuntime(wasmInstance);
  physicsRuntime.setGravity(new Vector3(0, -98, 0));
  // disableOffsetForConstraintFrame (sceneBuilder.ts) 使用時のコンストレイント破綻対策。
  // babylon-mmd のドキュメントが 1/120 以下を推奨している
  physicsRuntime.fixedTimeStep = 1 / 120;

  return { physicsRuntime };
}

/**
 * シーンごとのMMDランタイムを作成し、物理ランタイムをシーンに登録する
 */
export function createMmdRuntime(scene: Scene, physics: PhysicsSet): MmdRuntime {
  physics.physicsRuntime.register(scene);

  const mmdRuntime = new MmdRuntime(scene, new MmdBulletPhysics(physics.physicsRuntime));
  mmdRuntime.register(scene);

  return mmdRuntime;
}
