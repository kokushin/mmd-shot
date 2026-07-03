// engine.ts - Babylon.jsエンジンの作成
import { Engine } from "@babylonjs/core";
import { SdefInjector } from "babylon-mmd/esm/Loader/sdefInjector";

/**
 * レンダリングエンジンを作成する
 * - 解像度制限なし・デバイスピクセル比に追従 (Retina対応)
 * - SDEF (球面デフォーム) シェーダーを注入してMMDのスキニングを忠実に再現
 */
export function createEngine(canvas: HTMLCanvasElement): Engine {
  const engine = new Engine(
    canvas,
    true,
    {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
      powerPreference: "high-performance",
    },
    true // adaptToDeviceRatio: デバイスピクセル比で描画
  );

  SdefInjector.OverrideEngineCreateEffect(engine);

  return engine;
}
