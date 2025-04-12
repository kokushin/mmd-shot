// lighting.ts - ライティング関連の機能

/**
 * ライティングを設定
 */
export function setupLighting(scene: any): {
  directionalLight: any;
  shadowGenerator: any;
  lensFlareSystem: any;
} {
  // 半球ライト
  const hemisphericLight = new (BABYLON as any).HemisphericLight(
    "HemisphericLight",
    new (BABYLON as any).Vector3(0, 1, 0),
    scene
  );
  hemisphericLight.intensity = 0.4;
  hemisphericLight.specular = new (BABYLON as any).Color3(0, 0, 0);
  hemisphericLight.groundColor = new (BABYLON as any).Color3(1, 1, 1);

  // 指向性ライト
  const directionalLight = new (BABYLON as any).DirectionalLight(
    "DirectionalLight",
    new (BABYLON as any).Vector3(0.5, -1, 1),
    scene
  );
  directionalLight.intensity = 0.8;
  directionalLight.autoCalcShadowZBounds = false;
  directionalLight.autoUpdateExtends = false;
  directionalLight.shadowMaxZ = 20;
  directionalLight.shadowMinZ = -15;
  directionalLight.orthoTop = 18;
  directionalLight.orthoBottom = -1;
  directionalLight.orthoLeft = -10;
  directionalLight.orthoRight = 10;
  directionalLight.shadowOrthoScale = 0;

  // シャドウジェネレーター
  const shadowGenerator = new (BABYLON as any).ShadowGenerator(1024, directionalLight, true);
  shadowGenerator.usePercentageCloserFiltering = true;
  shadowGenerator.forceBackFacesOnly = true;
  shadowGenerator.filteringQuality = (BABYLON as any).ShadowGenerator.QUALITY_MEDIUM;
  shadowGenerator.frustumEdgeFalloff = 0.1;

  // レンズフレアシステムの作成
  const lensFlareSystem = new (BABYLON as any).LensFlareSystem("lensFlareSystem", directionalLight, scene);

  // メインのフレア
  const mainColor = new (BABYLON as any).Color3(1.0, 0.8, 0.4);
  const mainFlare = new (BABYLON as any).LensFlare(0.5, 0, mainColor, null, lensFlareSystem);

  // 追加のフレア要素
  const blueColor = new (BABYLON as any).Color3(0.4, 0.5, 1.0);
  new (BABYLON as any).LensFlare(0.3, 0.6, blueColor, null, lensFlareSystem);

  const redColor = new (BABYLON as any).Color3(1.0, 0.3, 0.3);
  new (BABYLON as any).LensFlare(0.2, -0.2, redColor, null, lensFlareSystem);

  const greenColor = new (BABYLON as any).Color3(0.5, 1.0, 0.5);
  new (BABYLON as any).LensFlare(0.15, -0.4, greenColor, null, lensFlareSystem);

  // 複数の小さなフレア
  const smallColor = new (BABYLON as any).Color3(0.8, 0.8, 1.0);
  new (BABYLON as any).LensFlare(0.1, 1.0, smallColor, null, lensFlareSystem);
  new (BABYLON as any).LensFlare(0.1, 1.5, smallColor, null, lensFlareSystem);
  new (BABYLON as any).LensFlare(0.07, 2.0, smallColor, null, lensFlareSystem);

  // レンズフレアの表示条件設定
  lensFlareSystem.isEnabled = true;

  return { directionalLight, shadowGenerator, lensFlareSystem };
}
