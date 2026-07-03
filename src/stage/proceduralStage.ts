// proceduralStage.ts - ビルトインのオリジナルステージ
// 配布ステージの再配布ライセンス問題を避けるため、コードで完全オリジナルのステージを生成する
import {
  AbstractMesh,
  Color3,
  CreateBox,
  CreateGround,
  CreateTorus,
  Mesh,
  MirrorTexture,
  Plane,
  Scene,
  StandardMaterial,
  Vector3,
} from "@babylonjs/core";

export interface ProceduralStage {
  ground: Mesh;
  mirrorTexture: MirrorTexture;
  meshes: Mesh[];
}

/**
 * ビルトインステージを生成する
 * - 暗色の光沢床 (ミラー反射)
 * - 背後にネオンリング + ネオンバー (エミッシブ、GlowLayerで発光)
 */
export function createProceduralStage(scene: Scene, reflectedMeshes: AbstractMesh[]): ProceduralStage {
  const meshes: Mesh[] = [];

  // 光沢床
  const ground = CreateGround("StageGround", { width: 120, height: 120, subdivisions: 2 }, scene);
  ground.receiveShadows = true;
  const groundMaterial = new StandardMaterial("StageGroundMaterial", scene);
  groundMaterial.diffuseColor = new Color3(0.055, 0.055, 0.07);
  groundMaterial.specularColor = new Color3(0.05, 0.05, 0.05);
  groundMaterial.specularPower = 128;

  const mirrorTexture = new MirrorTexture("StageMirror", 1024, scene, true);
  mirrorTexture.mirrorPlane = Plane.FromPositionAndNormal(ground.position, new Vector3(0, -1, 0));
  mirrorTexture.level = 0.5;
  groundMaterial.reflectionTexture = mirrorTexture;
  ground.material = groundMaterial;
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

  // 床への映り込み対象: モデル + ネオン類
  const renderList = mirrorTexture.renderList!;
  for (const mesh of reflectedMeshes) {
    renderList.push(mesh);
  }
  for (const mesh of meshes) {
    if (mesh !== ground) {
      renderList.push(mesh);
    }
  }

  return { ground, mirrorTexture, meshes };
}
