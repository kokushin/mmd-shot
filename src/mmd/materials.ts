// materials.ts - MMDマテリアルビルダーの設定
import { MmdStandardMaterialBuilder } from "babylon-mmd/esm/Loader/mmdStandardMaterialBuilder";

/**
 * MMD標準マテリアルビルダーを作成する
 *
 * デフォルトの DepthWriteAlphaBlendingWithEvaluation レンダリング方式は
 * テクスチャのアルファを自動評価して透過方式を決定するため、
 * 旧実装のようなモデル固有のマテリアル名ハードコードは不要
 */
export function createMaterialBuilder(): MmdStandardMaterialBuilder {
  const builder = new MmdStandardMaterialBuilder();
  return builder;
}
