// loading.ts - ローディング画面
import type { LoadingReporter } from "../core/context";

/**
 * ローディング画面の表示管理
 * 並列ロードの進捗はバーが逆行しないよう単調増加で表示する
 */
export class LoadingScreen implements LoadingReporter {
  private readonly _screen: HTMLElement | null;
  private readonly _bar: HTMLElement | null;
  private readonly _text: HTMLElement | null;
  private _maxRatio = 0;

  constructor() {
    this._screen = document.getElementById("custom-loading-screen");
    this._bar = document.querySelector<HTMLElement>(".loading-bar");
    this._text = document.querySelector<HTMLElement>(".loading-text");
  }

  report(text: string, ratio: number): void {
    if (this._text !== null) {
      this._text.textContent = text;
    }
    this._maxRatio = Math.max(this._maxRatio, Math.min(1, ratio));
    if (this._bar !== null) {
      this._bar.style.width = `${Math.floor(this._maxRatio * 100)}%`;
    }
  }

  /** ローディング画面を再表示する (シーン再構築時) */
  show(): void {
    this._maxRatio = 0;
    if (this._bar !== null) {
      this._bar.style.width = "0%";
      this._bar.style.backgroundColor = "#007aff";
    }
    if (this._text !== null) {
      this._text.textContent = "読み込み中...";
    }
    if (this._screen !== null) {
      this._screen.style.display = "flex";
      this._screen.style.opacity = "1";
    }
  }

  /** ローディング完了。フェードアウトして非表示にする */
  finish(): void {
    if (this._text !== null) {
      this._text.textContent = "読み込み完了！";
    }
    if (this._bar !== null) {
      this._bar.style.width = "100%";
    }
    setTimeout(() => {
      if (this._screen !== null) {
        this._screen.style.opacity = "0";
        setTimeout(() => {
          if (this._screen !== null) {
            this._screen.style.display = "none";
          }
        }, 500);
      }
    }, 500);
  }

  /** エラーメッセージを表示する */
  showError(message: string): void {
    if (this._text !== null) {
      this._text.textContent = message;
    }
    if (this._bar !== null) {
      this._bar.style.backgroundColor = "#ff3b30";
    }
  }
}
