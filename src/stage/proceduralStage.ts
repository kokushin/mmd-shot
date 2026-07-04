// proceduralStage.ts - ビルトインのオリジナルステージ
// 配布ステージの再配布ライセンス問題を避けるため、コードで完全オリジナルのステージを生成する
import {
  AbstractMesh,
  Color3,
  Color4,
  CreateBox,
  CreateCylinder,
  CreateGround,
  CreateTorus,
  Mesh,
  MirrorTexture,
  Plane,
  Scene,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";

/** ビルトインステージの種類 */
export type StageVariant = "neon" | "brightStudio";

/** アセット選択パネルで「明るいスタジオ」を表す特殊値 (ファイルパスと衝突しないスキーム付き) */
export const BRIGHT_STAGE_SELECT_VALUE = "builtin://bright-studio";

export interface ProceduralStage {
  ground: Mesh;
  mirrorTexture: MirrorTexture;
  meshes: Mesh[];
  /** このステージに合うシーン背景色 */
  clearColor: Color4;
}

/**
 * ビルトインステージを生成する
 * - neon: 暗色の光沢床 + ネオンリング/バー (エミッシブ、GlowLayerで発光)
 * - brightStudio: 白基調の明るいスタジオ + パステル調の背景パネル
 */
export function createProceduralStage(
  scene: Scene,
  reflectedMeshes: AbstractMesh[],
  variant: StageVariant = "neon"
): ProceduralStage {
  return variant === "brightStudio"
    ? createBrightStudioStage(scene, reflectedMeshes)
    : createNeonStage(scene, reflectedMeshes);
}

function createNeonStage(scene: Scene, reflectedMeshes: AbstractMesh[]): ProceduralStage {
  const meshes: Mesh[] = [];

  // 光沢床
  const { ground, mirrorTexture } = createMirrorGround(scene, new Color3(0.055, 0.055, 0.07), 0.5);
  meshes.push(ground);

  // ネオンリング (モデル背後)
  const ringColors = [new Color3(0.35, 0.75, 1.0), new Color3(1.0, 0.35, 0.65)];
  for (let i = 0; i < 2; i++) {
    const ring = CreateTorus(`NeonRing${i}`, { diameter: 26 + i * 6, thickness: 0.25, tessellation: 64 }, scene);
    ring.position = new Vector3(0, 11, 14 + i * 4);
    ring.rotation.x = Math.PI / 2;
    const ringMaterial = new StandardMaterial(`NeonRingMaterial${i}`, scene);
    ringMaterial.emissiveColor = ringColors[i];
    ringMaterial.diffuseColor = Color3.Black();
    ringMaterial.specularColor = Color3.Black();
    ringMaterial.disableLighting = true;
    ring.material = ringMaterial;
    meshes.push(ring);
  }

  // ネオンバー (左右に配置)
  const barColors = [
    new Color3(0.35, 0.75, 1.0),
    new Color3(1.0, 0.35, 0.65),
    new Color3(0.75, 0.45, 1.0),
  ];
  for (let i = 0; i < 6; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const index = Math.floor(i / 2);
    const bar = CreateBox(`NeonBar${i}`, { width: 0.3, height: 22, depth: 0.3 }, scene);
    bar.position = new Vector3(side * (14 + index * 5), 11, 18 + index * 6);
    const barMaterial = new StandardMaterial(`NeonBarMaterial${i}`, scene);
    barMaterial.emissiveColor = barColors[index];
    barMaterial.diffuseColor = Color3.Black();
    barMaterial.specularColor = Color3.Black();
    barMaterial.disableLighting = true;
    bar.material = barMaterial;
    meshes.push(bar);
  }

  fillMirrorRenderList(mirrorTexture, ground, meshes, reflectedMeshes);

  return { ground, mirrorTexture, meshes, clearColor: new Color4(0.02, 0.02, 0.035, 1.0) };
}

/**
 * 明るいスタジオステージ
 * 白基調の床 + パステル調の背景壁/アクセントで、トゥーンモデルが映える明るい画面にする。
 * ライト自体の光量は変えない (モデルの露出設計を壊さない) ため、明るさは材質側で出す
 */
function createBrightStudioStage(scene: Scene, reflectedMeshes: AbstractMesh[]): ProceduralStage {
  const meshes: Mesh[] = [];

  // 明るい白床 (映り込みは控えめ)
  const { ground, mirrorTexture } = createMirrorGround(scene, new Color3(0.82, 0.82, 0.85), 0.25);
  meshes.push(ground);

  // 背景壁 (パステルのラベンダーブルー)。ライトだけでは沈むため弱いエミッシブで持ち上げる
  const backWall = CreateBox("StudioBackWall", { width: 140, height: 60, depth: 1 }, scene);
  backWall.position = new Vector3(0, 30, 45);
  const backWallMaterial = new StandardMaterial("StudioBackWallMaterial", scene);
  backWallMaterial.diffuseColor = new Color3(0.62, 0.66, 0.82);
  backWallMaterial.emissiveColor = new Color3(0.38, 0.41, 0.53);
  backWallMaterial.specularColor = Color3.Black();
  backWall.material = backWallMaterial;
  meshes.push(backWall);

  // パステルのアクセントパネル (背景壁の手前に立てる)
  const panelColors = [
    new Color3(0.98, 0.80, 0.86), // ピンク
    new Color3(0.80, 0.88, 0.98), // 水色
    new Color3(0.86, 0.80, 0.96), // ラベンダー
    new Color3(0.98, 0.94, 0.78), // クリームイエロー
  ];
  for (let i = 0; i < 4; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const index = Math.floor(i / 2);
    const panel = CreateBox(`StudioPanel${i}`, { width: 7, height: 24 - index * 6, depth: 0.8 }, scene);
    panel.position = new Vector3(side * (13 + index * 8), (24 - index * 6) / 2, 36 - index * 4);
    panel.rotation.y = side * 0.25;
    const panelMaterial = new StandardMaterial(`StudioPanelMaterial${i}`, scene);
    panelMaterial.diffuseColor = panelColors[i];
    panelMaterial.emissiveColor = panelColors[i].scale(0.55);
    panelMaterial.specularColor = Color3.Black();
    panel.material = panelMaterial;
    meshes.push(panel);
  }

  // 白いリングライト風のアクセント (モデル背後、発光は控えめでブルームさせない)
  const halo = CreateTorus("StudioHalo", { diameter: 24, thickness: 0.35, tessellation: 64 }, scene);
  halo.position = new Vector3(0, 12, 30);
  halo.rotation.x = Math.PI / 2;
  const haloMaterial = new StandardMaterial("StudioHaloMaterial", scene);
  haloMaterial.emissiveColor = new Color3(0.8, 0.8, 0.82);
  haloMaterial.diffuseColor = Color3.Black();
  haloMaterial.specularColor = Color3.Black();
  haloMaterial.disableLighting = true;
  halo.material = haloMaterial;
  meshes.push(halo);

  // 白い円柱の飾り柱 (左右)
  for (let i = 0; i < 2; i++) {
    const side = i === 0 ? -1 : 1;
    const pillar = CreateCylinder(`StudioPillar${i}`, { diameter: 2.2, height: 26, tessellation: 24 }, scene);
    pillar.position = new Vector3(side * 24, 13, 28);
    const pillarMaterial = new StandardMaterial(`StudioPillarMaterial${i}`, scene);
    pillarMaterial.diffuseColor = new Color3(0.9, 0.9, 0.92);
    pillarMaterial.emissiveColor = new Color3(0.42, 0.42, 0.44);
    pillarMaterial.specularColor = Color3.Black();
    pillar.material = pillarMaterial;
    meshes.push(pillar);
  }

  fillMirrorRenderList(mirrorTexture, ground, meshes, reflectedMeshes);

  return { ground, mirrorTexture, meshes, clearColor: new Color4(0.84, 0.87, 0.94, 1.0) };
}

/** 映り込み付きの床を作る */
function createMirrorGround(
  scene: Scene,
  diffuseColor: Color3,
  mirrorLevel: number
): { ground: Mesh; mirrorTexture: MirrorTexture } {
  const ground = CreateGround("StageGround", { width: 120, height: 120, subdivisions: 2 }, scene);
  ground.receiveShadows = true;
  const groundMaterial = new StandardMaterial("StageGroundMaterial", scene);
  groundMaterial.diffuseColor = diffuseColor;
  groundMaterial.specularColor = new Color3(0.05, 0.05, 0.05);
  groundMaterial.specularPower = 128;

  const mirrorTexture = new MirrorTexture("StageMirror", 1024, scene, true);
  mirrorTexture.mirrorPlane = Plane.FromPositionAndNormal(ground.position, new Vector3(0, -1, 0));
  mirrorTexture.level = mirrorLevel;
  groundMaterial.reflectionTexture = mirrorTexture;
  ground.material = groundMaterial;

  return { ground, mirrorTexture };
}

/** 床への映り込み対象を設定する: モデル + ステージ小物 */
function fillMirrorRenderList(
  mirrorTexture: MirrorTexture,
  ground: Mesh,
  meshes: Mesh[],
  reflectedMeshes: AbstractMesh[]
): void {
  const renderList = mirrorTexture.renderList!;
  for (const mesh of reflectedMeshes) {
    renderList.push(mesh);
  }
  for (const mesh of meshes) {
    if (mesh !== ground) {
      renderList.push(mesh);
    }
  }
}
