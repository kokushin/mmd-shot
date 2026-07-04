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

  // PMXの材質フラグ (セルフシャドウの投影/受影など) を後段のシャドウ設定で参照できるよう保存する
  const originalAfterBuild = builder.afterBuildSingleMaterial;
  builder.afterBuildSingleMaterial = (material, materialIndex, materialInfo, imagePathTable, texturesInfo, scene, rootUrl): void => {
    originalAfterBuild(material, materialIndex, materialInfo, imagePathTable, texturesInfo, scene, rootUrl);
    material.metadata = { ...material.metadata, mmdMaterialFlag: materialInfo.flag };
  };

  return builder;
}
