// ground.ts - 地面関連の機能

/**
 * 地面の作成
 */
export function createGround(scene: any, loadResults: any[]): { ground: any; modelMesh: any } {
  const modelMesh = loadResults[1].meshes[0];

  // 地面
  const ground = (BABYLON as any).MeshBuilder.CreateGround(
    "Ground",
    { width: 100, height: 100, subdivisions: 2, updatable: false },
    scene
  );
  ground.receiveShadows = true;
  const groundMaterial = (ground.material = new (BABYLON as any).StandardMaterial("GroundMaterial", scene));
  groundMaterial.diffuseColor = new (BABYLON as any).Color3(0.65, 0.65, 0.65);
  groundMaterial.specularPower = 128;

  const groundReflectionTexture = (groundMaterial.reflectionTexture = new (BABYLON as any).MirrorTexture(
    "MirrorTexture",
    1024,
    scene,
    true
  ));
  groundReflectionTexture.mirrorPlane = (BABYLON as any).Plane.FromPositionAndNormal(
    ground.position,
    ground.getFacetNormal(0).scale(-1)
  );
  groundReflectionTexture.renderList = [modelMesh];
  groundReflectionTexture.level = 0.45;

  return { ground, modelMesh };
}
