// assetLoader.ts - PMXモデル / VMDモーションのロード
import { LoadAssetContainerAsync, Scene } from "@babylonjs/core";
import type { IMmdMaterialBuilder } from "babylon-mmd/esm/Loader/IMmdMaterialBuilder";
import { VmdLoader } from "babylon-mmd/esm/Loader/vmdLoader";
import type { MmdAnimation } from "babylon-mmd/esm/Loader/Animation/mmdAnimation";
import type { MmdMesh, MmdSkinnedMesh } from "babylon-mmd/esm/Runtime/mmdMesh";
import { MmdMesh as MmdMeshUtil } from "babylon-mmd/esm/Runtime/mmdMesh";

import type { LoadingReporter } from "../core/context";

/**
 * PMXモデルをロードしてシーンに追加する
 */
export async function loadMmdModel(
  url: string,
  scene: Scene,
  materialBuilder: IMmdMaterialBuilder,
  reporter: LoadingReporter,
  label: string
): Promise<MmdSkinnedMesh> {
  const container = await LoadAssetContainerAsync(url, scene, {
    onProgress: (event) => {
      const ratio = event.total > 0 ? event.loaded / event.total : 0;
      reporter.report(`${label}を読み込み中... ${Math.floor(ratio * 100)}%`, ratio);
    },
    pluginOptions: {
      mmdmodel: {
        materialBuilder,
        // 開発時はテクスチャロード失敗などをconsoleに出す
        loggingEnabled: import.meta.env.DEV,
      },
    },
  });
  container.addAllToScene();

  const rootMesh = container.meshes[0];
  if (!MmdMeshUtil.isMmdSkinnedMesh(rootMesh as MmdSkinnedMesh)) {
    throw new Error(`MMDモデルとして読み込めませんでした: ${url}`);
  }
  return rootMesh as MmdSkinnedMesh;
}

/**
 * PMXステージ (静的モデル) をロードしてシーンに追加する
 */
export async function loadMmdStage(
  url: string,
  scene: Scene,
  materialBuilder: IMmdMaterialBuilder,
  reporter: LoadingReporter
): Promise<MmdMesh> {
  const container = await LoadAssetContainerAsync(url, scene, {
    onProgress: (event) => {
      const ratio = event.total > 0 ? event.loaded / event.total : 0;
      reporter.report(`ステージを読み込み中... ${Math.floor(ratio * 100)}%`, ratio);
    },
    pluginOptions: {
      mmdmodel: {
        materialBuilder,
        // ステージは物理・モーフ不要なのでビルドをスキップして軽量化
        buildSkeleton: false,
        buildMorph: false,
        loggingEnabled: import.meta.env.DEV,
      },
    },
  });
  container.addAllToScene();
  return container.meshes[0] as MmdMesh;
}

/**
 * VMDモーションをロードする (複数ファイルは1つのアニメーションに合成)
 */
export async function loadMotion(
  name: string,
  urls: string | string[],
  scene: Scene,
  reporter: LoadingReporter,
  label: string
): Promise<MmdAnimation> {
  const loader = new VmdLoader(scene);
  loader.loggingEnabled = import.meta.env.DEV;
  return loader.loadAsync(name, urls, (event) => {
    const ratio = event.total > 0 ? event.loaded / event.total : 0;
    reporter.report(`${label}を読み込み中... ${Math.floor(ratio * 100)}%`, ratio);
  });
}
