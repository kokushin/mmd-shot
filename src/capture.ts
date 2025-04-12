// MMD Shot キャプチャ機能
import { isDev } from "./utils";

if (isDev) {
  console.log("開発モードでキャプチャ機能を実行しています");
}

/**
 * キャプチャ機能の初期化
 */
function initializeCapture(): void {
  console.log("キャプチャ機能を初期化しています...");

  // グローバルスコープでキャプチャ関数を定義
  (window as any).captureMMDScene = captureMMDScene;

  // キャプチャビューの要素を取得
  const captureView = document.getElementById("capture-view");
  const closeButton = document.getElementById("close-button");
  const saveButton = document.getElementById("save-button");

  // イベントリスナーを設定
  if (closeButton) {
    closeButton.addEventListener("click", closeCaptureView);
  }

  if (saveButton) {
    saveButton.addEventListener("click", saveCaptureImage);
  }

  console.log("キャプチャ機能の初期化が完了しました");
}

/**
 * MMDシーンをキャプチャする
 */
function captureMMDScene(): void {
  console.log("captureMMDScene関数が呼び出されました");

  try {
    // canvasを直接取得
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    if (!canvas) {
      console.error("renderCanvasが見つかりません");
      alert("キャンバスが見つかりません");
      return;
    }

    // シャッターエフェクトを再生開始
    const shutterEffect = document.getElementById("shutter-effect");
    if (!shutterEffect) {
      console.error("シャッターエフェクト要素が見つかりません");
      return;
    }

    // アニメーションと音楽を一時停止（シャッターエフェクト表示前に）
    pauseAnimation();

    // クラスをリセットして再度アニメーションを適用できるようにする
    shutterEffect.classList.remove("active");
    // DOMの再描画を強制
    void shutterEffect.offsetWidth;

    // フラッシュがピークに達する瞬間（アニメーションの25%地点）に画像を取得
    const imageData = canvas.toDataURL("image/png");

    // キャプチャデータを保存
    (window as any).captureImage = imageData;

    // その後アニメーション開始
    shutterEffect.classList.add("active");

    // アニメーション完了後に画像を表示（アニメーション時間の半分経過後）
    setTimeout(() => {
      displayCaptureImage(imageData);
    }, 250); // アニメーション時間0.5sの半分
  } catch (error) {
    console.error("キャプチャ中にエラーが発生しました:", error);
    alert(`キャプチャ中にエラーが発生しました: ${(error as Error).message}`);
  }
}

/**
 * アニメーションと音楽を一時停止
 */
function pauseAnimation(): void {
  if ((window as any).mmdShotApp && typeof (window as any).mmdShotApp.pauseAnimation === "function") {
    (window as any).mmdShotApp.pauseAnimation();
  } else {
    console.log("pauseAnimation関数が見つからないため、一時停止をスキップします");
  }
}

/**
 * キャプチャした画像を表示
 * @param {string} imageData - 画像データ（Data URL形式）
 */
function displayCaptureImage(imageData: string): void {
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

    // キャプチャビューを表示
    captureView.style.display = "flex";
    captureView.classList.add("active");

    console.log("キャプチャビューを表示しました");
  } catch (error) {
    console.error("キャプチャ画像の表示中にエラーが発生しました:", error);
    alert(`キャプチャ画像の表示中にエラーが発生しました: ${(error as Error).message}`);
  }
}

/**
 * キャプチャビューを閉じる
 */
function closeCaptureView(): void {
  console.log("closeCaptureView関数が呼び出されました");

  const captureView = document.getElementById("capture-view");

  if (!captureView) {
    console.error("キャプチャビューが見つかりません");
    return;
  }

  // キャプチャビューを非表示
  captureView.classList.remove("active");
  captureView.style.display = "none";

  // アニメーションと音楽を再開
  resumeAnimation();
}

/**
 * アニメーションと音楽を再開
 */
function resumeAnimation(): void {
  if ((window as any).mmdShotApp && typeof (window as any).mmdShotApp.resumeAnimation === "function") {
    (window as any).mmdShotApp.resumeAnimation();
  } else {
    console.error("window.mmdShotApp.resumeAnimationが関数として存在しません");
  }
}

/**
 * 通知を表示する関数
 * @param {string} message - 表示するメッセージ
 * @param {number} duration - 表示時間（ミリ秒）
 */
function showNotification(message: string, duration: number = 3000): void {
  console.log(`通知を表示: ${message}`);

  const notification = document.getElementById("notification");
  const notificationMessage = document.getElementById("notification-message");

  if (!notification || !notificationMessage) {
    console.error("通知要素が見つかりません");
    return;
  }

  // メッセージを設定
  notificationMessage.textContent = message;

  // 通知を表示
  notification.classList.add("show");

  // 指定時間後に非表示
  setTimeout(() => {
    notification.classList.remove("show");
  }, duration);
}

/**
 * キャプチャした画像を保存
 */
async function saveCaptureImage(): Promise<void> {
  console.log("saveCaptureImage関数が呼び出されました");

  if (!(window as any).captureImage) {
    console.error("保存する画像がありません");
    return;
  }

  try {
    // Electronのネイティブ保存機能を使用
    if (window.electronAPI) {
      // Electronの保存ダイアログを使用
      const result = await window.electronAPI.saveCaptureImage((window as any).captureImage);

      if (result.success) {
        console.log(`画像を保存しました: ${result.filePath}`);
        // 保存が成功したらキャプチャビューを閉じて再生を再開
        closeCaptureView();

        // 保存成功の通知を表示
        showNotification("画像を保存しました");
      } else {
        if (result.message) {
          console.log(result.message);
          // ユーザーがキャンセルした場合も再生を再開
          if (result.message === "保存がキャンセルされました") {
            closeCaptureView();
          }
        } else if (result.error) {
          console.error(`保存中にエラーが発生しました: ${result.error}`);
          showNotification(`エラー: ${result.error}`, 5000);
        }
      }
    } else {
      // フォールバック: ブラウザ上での実行向け
      console.log("ElectronAPIが見つかりません。ブラウザのダウンロード機能を使用します。");
      const link = document.createElement("a");
      link.href = (window as any).captureImage;
      link.download = `mmd-capture-${new Date().getTime()}.png`;
      link.click();

      // ブラウザでのダウンロード後も再生を再開し通知を表示
      setTimeout(() => {
        closeCaptureView();
        showNotification("画像を保存しました");
      }, 500); // ダウンロードダイアログ表示のために少し遅延
    }
  } catch (error) {
    console.error("画像保存中にエラーが発生しました:", error);
    showNotification(`画像の保存に失敗しました: ${(error as Error).message}`, 5000);
  }
}

// DOMが読み込まれた後にキャプチャ機能を初期化
document.addEventListener("DOMContentLoaded", initializeCapture);
