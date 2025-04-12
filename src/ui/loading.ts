// loading.ts - ローディング画面関連の機能

/**
 * ローディング画面の要素を取得
 */
export function getLoadingElements(): { customLoadingScreen: any; loadingBar: any; loadingText: any } {
  const customLoadingScreen = document.getElementById("custom-loading-screen") as any;
  const loadingBar = document.querySelector(".loading-bar") as any;
  const loadingText = document.querySelector(".loading-text") as any;

  return { customLoadingScreen, loadingBar, loadingText };
}

/**
 * ローディング完了処理
 */
export function finishLoading(customLoadingScreen: any, loadingText: any, loadingBar: any): void {
  // ローディングが完了したらカスタムローディング画面を非表示にする
  loadingText.textContent = "読み込み完了！";
  loadingBar.style.width = "100%";

  // フェードアウトしてから非表示にする
  setTimeout(() => {
    customLoadingScreen.style.opacity = "0";
    setTimeout(() => {
      customLoadingScreen.style.display = "none";
    }, 500); // トランジション時間と同じ
  }, 500); // 少し待ってからフェードアウト開始
}
