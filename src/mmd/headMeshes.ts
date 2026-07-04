// headMeshes.ts - 頭部メッシュ (顔・目・口・髪) の判定
// アニメ調の顔に前髪や鼻の投影影が乗ると不気味の谷に落ちるため、
// 頭部メッシュはPMXの受影フラグに関わらずセルフシャドウを受けないようにする。
// 材質名のハードコードではなくスキンウェイトで判定するのでモデル非依存。
import { AbstractMesh, VertexBuffer } from "@babylonjs/core";
import type { MmdSkinnedMesh } from "babylon-mmd/esm/Runtime/mmdMesh";

/** 頭部メッシュとみなすウェイト比率のしきい値 (総ウェイトの8割以上が頭ボーン配下) */
const HEAD_WEIGHT_RATIO = 0.8;

/**
 * モデルの中から頭部メッシュを収集する
 * スキンウェイトの合計のうち「頭」ボーンとその子孫に割り当てられた割合が
 * HEAD_WEIGHT_RATIO 以上のメッシュを頭部とみなす
 */
export function collectHeadMeshes(modelMesh: MmdSkinnedMesh): Set<AbstractMesh> {
  const headMeshes = new Set<AbstractMesh>();
  const skeleton = modelMesh.metadata.skeleton;
  const headBone = skeleton.bones.find((bone) => bone.name === "頭");
  if (headBone === undefined) {
    return headMeshes;
  }

  // 「頭」ボーン自身と子孫ボーンのインデックス集合
  const headBoneIndices = new Set<number>();
  const stack = [headBone];
  while (stack.length > 0) {
    const bone = stack.pop()!;
    headBoneIndices.add(skeleton.bones.indexOf(bone));
    stack.push(...bone.children);
  }

  for (const mesh of modelMesh.metadata.meshes) {
    const indices = mesh.getVerticesData(VertexBuffer.MatricesIndicesKind);
    const weights = mesh.getVerticesData(VertexBuffer.MatricesWeightsKind);
    if (indices === null || weights === null) {
      continue;
    }

    let totalWeight = 0;
    let headWeight = 0;
    for (let i = 0; i < weights.length; i++) {
      const weight = weights[i];
      if (weight <= 0) {
        continue;
      }
      totalWeight += weight;
      if (headBoneIndices.has(indices[i])) {
        headWeight += weight;
      }
    }

    if (totalWeight > 0 && headWeight / totalWeight >= HEAD_WEIGHT_RATIO) {
      headMeshes.add(mesh);
    }
  }

  return headMeshes;
}
