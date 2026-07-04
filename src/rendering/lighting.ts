// lighting.ts - ライティングとシャドウの設定
import { Color3, DirectionalLight, HemisphericLight, Scene, ShadowGenerator, Vector3 } from "@babylonjs/core";

export interface LightingSet {
  hemisphericLight: HemisphericLight;
  directionalLight: DirectionalLight;
  shadowGenerator: ShadowGenerator;
}

/**
 * ライティングを設定する
 * MMDのライティングモデルは単一の指向性ライトが基本。
 * 補助として弱い半球ライトを追加している。
 */
export function createLighting(scene: Scene): LightingSet {
  const hemisphericLight = new HemisphericLight("HemisphericLight", new Vector3(0, 1, 0), scene);
  hemisphericLight.intensity = 0.2;
  hemisphericLight.specular = new Color3(0, 0, 0);
  hemisphericLight.groundColor = new Color3(1, 1, 1);

  // MMDのデフォルト照明 (154/255 ≒ 0.6)。ambient寄与0.25 + 半球0.2と合わせて
  // 合計約1.05倍とし、淡い肌テクスチャが白飛びしないようにする
  // 方向は正面寄り・浅めの俯角にする: 急な俯角だと顔にトゥーンの2階調目が大きく乗り、
  // アニメ調のフラットな顔 (一般的なMMD動画の見た目) から離れてしまう
  const directionalLight = new DirectionalLight("DirectionalLight", new Vector3(0.35, -0.5, 1), scene);
  directionalLight.intensity = 0.6;
  // シャドウフラスタムはモデル周辺に固定し、ライト位置の追従で追いかける
  directionalLight.autoCalcShadowZBounds = false;
  directionalLight.autoUpdateExtends = false;
  directionalLight.shadowMaxZ = 20;
  directionalLight.shadowMinZ = -15;
  directionalLight.orthoTop = 18;
  directionalLight.orthoBottom = -1;
  directionalLight.orthoLeft = -10;
  directionalLight.orthoRight = 10;
  directionalLight.shadowOrthoScale = 0;

  const shadowGenerator = new ShadowGenerator(2048, directionalLight, true);
  shadowGenerator.transparencyShadow = true;
  shadowGenerator.usePercentageCloserFiltering = true;
  shadowGenerator.forceBackFacesOnly = true;
  shadowGenerator.filteringQuality = ShadowGenerator.QUALITY_HIGH;
  shadowGenerator.frustumEdgeFalloff = 0.1;
  // 影は約半分の濃さに抑える (Babylonは1.0=影なし)。フル濃度は白い衣装に黒い塊が乗り、
  // トゥーン調のフラットな見た目 (一般的なMMD動画の落ち影程度) から浮いてしまう
  shadowGenerator.setDarkness(0.45);

  return { hemisphericLight, directionalLight, shadowGenerator };
}
