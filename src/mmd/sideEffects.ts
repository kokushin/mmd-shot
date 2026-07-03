// sideEffects.ts - babylon-mmd / Babylon.js のside-effectインポートを集約
// これらのインポートはローダー・レンダラー・アニメーションランタイムを登録する

// PMXローダー (SceneLoaderに.pmxプラグインを登録)
import "babylon-mmd/esm/Loader/pmxLoader";
// MMDアウトラインレンダラー (輪郭線描画)
import "babylon-mmd/esm/Loader/mmdOutlineRenderer";
// モデル用MMDアニメーションランタイム (MmdModel.createRuntimeAnimation を有効化)
import "babylon-mmd/esm/Runtime/Animation/mmdRuntimeModelAnimation";
// カメラ用MMDアニメーションランタイム (MmdCamera.createRuntimeAnimation を有効化)
import "babylon-mmd/esm/Runtime/Animation/mmdRuntimeCameraAnimation";
