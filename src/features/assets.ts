// assets.ts - アセットのロード関連の機能

import { getModelPath, getMotionPath } from "../utils/env";

/**
 * アセットをロード
 */
export async function loadAssets(scene: any, mmdRuntime: any, loadingText: any, loadingBar: any): Promise<any[]> {
  // 進行状況を追跡する変数
  let totalProgress = 0;
  let loadingItems = 3; // モーション、モデル、物理エンジンの3つ

  // ローディングテキストと進行状況バーを更新する関数
  const updateLoadingProgress = (updateIndex: number, text: string, progress?: number): void => {
    // テキストを更新
    loadingText.textContent = text;

    // 進行状況を計算（各アイテムの進行状況の平均）
    if (progress !== undefined) {
      totalProgress += (progress - totalProgress / loadingItems) / loadingItems;
      loadingBar.style.width = `${Math.min(100, totalProgress * 100)}%`;
    }
  };

  const promises = [];

  // モーションのパスを環境変数から取得
  const motionPath = getMotionPath();
  // モデルのパスを環境変数から取得
  const modelPath = getModelPath();

  // モーションのロード
  const vmdLoader = new (BABYLONMMD as any).VmdLoader(scene);
  promises.push(
    vmdLoader.loadAsync("motion", motionPath, (event: any) => {
      const progress = event.loaded / event.total;
      updateLoadingProgress(0, `モーションを読み込み中... ${Math.floor(progress * 100)}%`, progress);
    })
  );

  // モデルのロード
  promises.push(
    (BABYLON as any).SceneLoader.ImportMeshAsync(undefined, modelPath, undefined, scene, (event: any) => {
      const progress = event.loaded / event.total;
      updateLoadingProgress(1, `モデルを読み込み中... ${Math.floor(progress * 100)}%`, progress);
    })
  );

  // 物理エンジンのロード
  promises.push(
    (async () => {
      updateLoadingProgress(2, "物理エンジンを読み込み中...", 0);
      const havokPlugin = new (BABYLON as any).HavokPlugin();
      scene.enablePhysics(new (BABYLON as any).Vector3(0, -9.8, 0), havokPlugin);
      updateLoadingProgress(2, "物理エンジンの読み込みが完了しました", 1);
    })()
  );

  return await Promise.all(promises);
}
