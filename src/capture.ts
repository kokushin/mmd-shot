// capture.ts - フォトキャプチャ機能 (高解像度レンダーターゲット撮影)
import { CreateScreenshotUsingRenderTargetAsync } from "@babylonjs/core";

import type { AppContext } from "./core/context";

/** 撮影倍率 (表示解像度に対する倍数) */
const CAPTURE_SCALE = 3;
/** 長辺の上限ピクセル数 */
const CAPTURE_MAX_EDGE = 4096;

/**
 * キャプチャ機能のコントローラー
 * シャッター → 高解像度撮影 → プレビュー → 保存/キャンセル
 */
export class CaptureController {
  private readonly _getContext: () => AppContext | null;
  private _capturedImage: string | null = null;
  private _capturing = false;

  constructor(getContext: () => AppContext | null) {
    this._getContext = getContext;
  }

  /** ボタン類のイベントを設定する */
  init(): void {
    document.getElementById("capture-button")?.addEventListener("click", () => {
      void this._capture();
    });
    document.getElementById("close-button")?.addEventListener("click", () => {
      this._closeCaptureView();
    });
    document.getElementById("save-button")?.addEventListener("click", () => {
      void this._saveCaptureImage();
    });
  }

  private async _capture(): Promise<void> {
    const context = this._getContext();
    if (context === null || this._capturing) {
      return;
    }
    this._capturing = true;

    try {
      // アニメーションと音楽を一時停止
      context.mmdRuntime.pauseAnimation();

      // シャッターエフェクト
      const shutterEffect = document.getElementById("shutter-effect");
      if (shutterEffect !== null) {
        shutterEffect.classList.remove("active");
        void shutterEffect.offsetWidth; // リフローを強制してアニメーションを再適用可能にする
        shutterEffect.classList.add("active");
      }

      const imageData = await this._renderHighResolution(context);
      this._capturedImage = imageData;
      this._displayCaptureImage(imageData);
    } catch (error) {
      console.error("キャプチャ中にエラーが発生しました:", error);
      this._showNotification(`キャプチャに失敗しました: ${(error as Error).message}`, 5000);
      this._resumeAnimation();
    } finally {
      this._capturing = false;
    }
  }

  /**
   * ポストエフェクト込みの高解像度スクリーンショットを撮影する
   */
  private async _renderHighResolution(context: AppContext): Promise<string> {
    const engine = context.engine;
    const camera = context.scene.activeCamera;
    if (camera === null) {
      throw new Error("アクティブカメラがありません");
    }

    const renderWidth = engine.getRenderWidth();
    const renderHeight = engine.getRenderHeight();
    const scale = Math.min(CAPTURE_SCALE, CAPTURE_MAX_EDGE / Math.max(renderWidth, renderHeight));
    const width = Math.round(renderWidth * scale);
    const height = Math.round(renderHeight * scale);

    try {
      return await CreateScreenshotUsingRenderTargetAsync(engine, camera, { width, height }, "image/png", 4);
    } catch (error) {
      // フォールバック: 表示キャンバスをそのまま取得
      console.warn("高解像度キャプチャに失敗したため、通常解像度で撮影します:", error);
      const canvas = engine.getRenderingCanvas();
      if (canvas === null) {
        throw error as Error;
      }
      return canvas.toDataURL("image/png");
    }
  }

  private _displayCaptureImage(imageData: string): void {
    const captureView = document.getElementById("capture-view");
    const captureImage = document.getElementById("capture-image") as HTMLImageElement | null;
    if (captureView === null || captureImage === null) {
      console.error("キャプチャビューの要素が見つかりません");
      return;
    }
    captureImage.src = imageData;
    captureView.style.display = "flex";
    captureView.classList.add("active");
  }

  private _closeCaptureView(): void {
    const captureView = document.getElementById("capture-view");
    if (captureView !== null) {
      captureView.classList.remove("active");
      captureView.style.display = "none";
    }
    this._resumeAnimation();
  }

  private _resumeAnimation(): void {
    const context = this._getContext();
    if (context !== null) {
      void context.mmdRuntime.playAnimation();
    }
  }

  private async _saveCaptureImage(): Promise<void> {
    if (this._capturedImage === null) {
      return;
    }

    try {
      if (window.electronAPI !== undefined) {
        const result = await window.electronAPI.saveCaptureImage(this._capturedImage);
        if (result.success) {
          this._closeCaptureView();
          this._showNotification("画像を保存しました");
        } else if (result.message === "保存がキャンセルされました") {
          // キャンセル時はプレビューを維持
        } else if (result.error !== undefined) {
          this._showNotification(`エラー: ${result.error}`, 5000);
        }
      } else {
        // ブラウザ実行時のフォールバック
        const link = document.createElement("a");
        link.href = this._capturedImage;
        link.download = `mmd-capture-${Date.now()}.png`;
        link.click();
        setTimeout(() => {
          this._closeCaptureView();
          this._showNotification("画像を保存しました");
        }, 500);
      }
    } catch (error) {
      console.error("画像保存中にエラーが発生しました:", error);
      this._showNotification(`画像の保存に失敗しました: ${(error as Error).message}`, 5000);
    }
  }

  private _showNotification(message: string, duration = 3000): void {
    const notification = document.getElementById("notification");
    const notificationMessage = document.getElementById("notification-message");
    if (notification === null || notificationMessage === null) {
      return;
    }
    notificationMessage.textContent = message;
    notification.classList.add("show");
    setTimeout(() => {
      notification.classList.remove("show");
    }, duration);
  }
}
