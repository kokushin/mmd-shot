// renderer.ts
console.log("renderer.tsを読み込みました");

// グローバル変数（windowオブジェクトのプロパティとして使用）
(window as any).rendererScene = null;
(window as any).rendererMmdRuntime = null;
(window as any).rendererAudioPlayer = null;
(window as any).captureImage = null;

// Viteの環境変数
const isDev: boolean = import.meta.env.DEV;
if (isDev) {
  console.log("開発モードでレンダラーを実行しています");
}

// キャプチャ機能が既に定義されているか確認
if (typeof (window as any).captureMMDScene !== "function") {
  console.log("window.captureMMDSceneが存在しないため、定義します");

  // 直接キャプチャ機能を実装
  (window as any).captureMMDScene = function (): void {
    console.log("グローバルcaptureMMDScene関数が呼び出されました（renderer.ts）");

    try {
      // canvasを直接取得
      const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
      if (!canvas) {
        console.error("renderCanvasが見つかりません");
        alert("キャンバスが見つかりません");
        return;
      }

      console.log("canvasを取得しました:", canvas);

      // アニメーションと音楽を一時停止（可能であれば）
      if ((window as any).mmdShotApp && typeof (window as any).mmdShotApp.pauseAnimation === "function") {
        (window as any).mmdShotApp.pauseAnimation();
      } else {
        console.log("pauseAnimation関数が見つからないため、一時停止をスキップします");
      }

      // canvasから直接画像データを取得
      const imageData = canvas.toDataURL("image/png");
      console.log("キャンバスから画像データを取得しました:", imageData.substring(0, 50) + "...");

      // キャプチャした画像を表示
      const captureView = document.getElementById("capture-view");
      const captureImageElement = document.getElementById("capture-image") as HTMLImageElement;

      if (!captureView || !captureImageElement) {
        console.error("キャプチャビューまたはキャプチャ画像要素が見つかりません");
        alert("キャプチャビューの表示に失敗しました。要素が見つかりません。");
        return;
      }

      // 画像を設定
      captureImageElement.src = imageData;
      console.log("キャプチャ画像を設定しました");

      // キャプチャビューを表示
      captureView.style.display = "flex";
      captureView.classList.add("active");
      console.log("キャプチャビューを表示しました");

      // キャプチャデータを保存
      (window as any).captureImage = imageData;
    } catch (error) {
      console.error("キャプチャ中にエラーが発生しました:", error);
      alert(`キャプチャ中にエラーが発生しました: ${(error as Error).message}`);
    }
  };
} else {
  console.log("window.captureMMDSceneは既に定義されています");
}

// グローバル関数が定義されたことを確認
console.log(
  "window.captureMMDSceneの状態:",
  typeof (window as any).captureMMDScene === "function" ? "関数として存在します" : "存在しません"
);

// グローバルオブジェクトを作成
(window as any).mmdShotApp = {
  // シーンとMMDランタイムの参照を設定する関数
  setSceneReference: function (sceneRef: any, mmdRuntimeRef: any, audioPlayerRef: any): void {
    console.log("setSceneReference が呼び出されました");
    (window as any).rendererScene = sceneRef;
    (window as any).rendererMmdRuntime = mmdRuntimeRef;
    (window as any).rendererAudioPlayer = audioPlayerRef;
    console.log("シーン参照が設定されました", (window as any).rendererScene ? "成功" : "失敗");
  },

  // アニメーションと音楽を一時停止する関数
  pauseAnimation: function (): void {
    console.log("pauseAnimation関数が呼び出されました");
    if ((window as any).rendererMmdRuntime) {
      (window as any).rendererMmdRuntime.pauseAnimation();
    }

    if ((window as any).rendererAudioPlayer) {
      (window as any).rendererAudioPlayer.pause();
    }
  },

  // アニメーションと音楽を再開する関数
  resumeAnimation: function (): void {
    console.log("resumeAnimation関数が呼び出されました");
    if ((window as any).rendererMmdRuntime) {
      (window as any).rendererMmdRuntime.playAnimation();
    } else if ((window as any).scene) {
      // シーンのアニメーションタイムスケールを通常に戻す
      (window as any).scene.animationTimeScale = 1;
    }

    if ((window as any).rendererAudioPlayer) {
      (window as any).rendererAudioPlayer.play();
    }
  },
};

// グローバルオブジェクトが作成されたことを確認
console.log("window.mmdShotAppが作成されました:", (window as any).mmdShotApp ? "成功" : "失敗");

// 初期化関数
function initializeApp(): void {
  console.log("アプリを初期化しています...");

  // キャプチャボタンのイベントリスナー
  const captureButton = document.getElementById("capture-button");
  if (captureButton) {
    console.log("キャプチャボタンを設定しています");
    captureButton.addEventListener("click", captureScene);
  } else {
    console.error("キャプチャボタンが見つかりません");
  }

  // カメラモード切り替えボタンのイベントリスナー
  const cameraModeButton = document.getElementById("camera-mode-button");
  if (cameraModeButton) {
    console.log("カメラモード切り替えボタンを設定しています");
    cameraModeButton.addEventListener("click", toggleCameraMode);
  } else {
    console.error("カメラモード切り替えボタンが見つかりません");
  }

  // 閉じるボタンのイベントリスナー
  const closeButton = document.getElementById("close-button");
  if (closeButton) {
    closeButton.addEventListener("click", closeCaptureView);
  } else {
    console.error("閉じるボタンが見つかりません");
  }

  // 保存ボタンのイベントリスナーは重複を避けるために削除
  // capture.tsですでに登録されているため、ここでは登録しない
}

// カメラモードを切り替える関数
function toggleCameraMode(): void {
  console.log("カメラモード切り替えボタンがクリックされました");

  // グローバル関数が存在するか確認
  if ((window as any).mmdShotApp && typeof (window as any).mmdShotApp.toggleCameraMode === "function") {
    console.log("window.mmdShotApp.toggleCameraModeを呼び出します");
    (window as any).mmdShotApp.toggleCameraMode();
  } else {
    console.error("window.mmdShotApp.toggleCameraModeが関数として存在しません");
    alert("カメラモード切り替え機能が初期化されていません");
  }
}

// DOMが読み込まれた後に実行
document.addEventListener("DOMContentLoaded", initializeApp);

// ローカル関数（イベントリスナー用）
// シーンをキャプチャする関数
function captureScene(): void {
  console.log("ローカルcaptureScene関数が呼び出されました");
  // グローバル関数を呼び出す
  (window as any).captureMMDScene();
}

// キャプチャした画像を表示する関数（グローバルスコープで定義）
(window as any).displayCaptureImage = function (imageData: string): void {
  console.log("displayCaptureImage関数が呼び出されました");

  // 要素を取得
  const captureView = document.getElementById("capture-view");
  const captureImageElement = document.getElementById("capture-image") as HTMLImageElement;

  if (!captureView || !captureImageElement) {
    console.error("キャプチャビューまたはキャプチャ画像要素が見つかりません");
    alert("キャプチャビューの表示に失敗しました。要素が見つかりません。");
    return;
  }

  try {
    // 画像を設定
    captureImageElement.src = imageData;
    console.log("キャプチャ画像を設定しました");

    // キャプチャビューを表示
    captureView.style.display = "flex";
    captureView.classList.add("active");

    // 確実に表示されるようにタイムアウトを設定
    setTimeout(() => {
      if (!captureView.classList.contains("active")) {
        captureView.classList.add("active");
      }
      console.log("キャプチャビューを表示しました（タイムアウト後）");
    }, 100);

    console.log("キャプチャビューを表示しました");
  } catch (error) {
    console.error("キャプチャ画像の表示中にエラーが発生しました:", error);
    alert(`キャプチャ画像の表示中にエラーが発生しました: ${(error as Error).message}`);
  }
};

// ローカルスコープでも定義（互換性のため）
function displayCaptureImage(imageData: string): void {
  (window as any).displayCaptureImage(imageData);
}

// キャプチャビューを閉じる関数
function closeCaptureView(): void {
  console.log("closeCaptureView関数が呼び出されました");
  const captureView = document.getElementById("capture-view");

  if (!captureView) {
    console.error("キャプチャビューが見つかりません");
    return;
  }

  // キャプチャビューを非表示
  captureView.classList.remove("active");

  // アニメーションと音楽を再開
  if ((window as any).mmdShotApp && typeof (window as any).mmdShotApp.resumeAnimation === "function") {
    (window as any).mmdShotApp.resumeAnimation();
  } else {
    console.error("window.mmdShotApp.resumeAnimationが関数として存在しません");
  }
}

// キャプチャした画像を保存する関数
function saveCaptureImage(): void {
  console.log("saveCaptureImage関数が呼び出されました");
  if (!(window as any).captureImage) {
    console.error("保存する画像がありません");
    return;
  }

  // 画像を保存（ダウンロード）
  console.log("キャプチャ画像を保存します");

  // ダウンロードリンクを作成
  const link = document.createElement("a");
  link.href = (window as any).captureImage;
  link.download = `mmd-capture-${new Date().getTime()}.png`;
  link.click();
}
