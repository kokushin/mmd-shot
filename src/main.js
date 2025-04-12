// main.js
const { app, BrowserWindow, ipcMain, dialog, nativeImage } = require("electron");
const path = require("path");
const url = require("url");
const fs = require("fs");

// 開発モードかどうかを判定
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

// Vite開発サーバーのURL
const VITE_DEV_SERVER_URL = "http://localhost:5173";

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 375,
    height: 667,
    transparent: false, // 透過なし
    frame: true, // メニューバーを表示
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true, // コンテキスト分離を有効化
      preload: path.join(__dirname, "preload.js"), // プリロードスクリプトのパス
    },
    resizable: false, // サイズ変更不可
  });

  // 画面中央へ配置
  mainWindow.center();

  // マウス操作を有効化
  mainWindow.setIgnoreMouseEvents(false);

  mainWindow.webContents.openDevTools();

  // 開発モードの場合はViteの開発サーバーを使用
  if (isDev) {
    console.log("開発モード: Vite開発サーバーを使用します");
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    // 開発ツールを開く
    mainWindow.webContents.openDevTools();
  } else {
    // 本番モードの場合はビルドされたファイルを使用
    console.log("本番モード: ビルドされたファイルを使用します");
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// アプリケーション終了時の処理
app.on("window-all-closed", () => {
  // プラットフォームに関係なく、アプリケーションを終了する
  app.quit();
});

// アプリケーションが終了する直前の処理
app.on("before-quit", () => {
  // 開発モードの場合、親プロセスも強制終了させる
  if (process.env.NODE_ENV === "development") {
    console.log("アプリケーションを終了します...");
    // 親プロセスを強制終了
    process.exit(0);
  }
});

// キャプチャした画像の保存処理
ipcMain.handle("save-capture", async (event, imageData) => {
  try {
    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");

    // ファイル保存ダイアログを表示
    const { filePath } = await dialog.showSaveDialog({
      title: "キャプチャ画像を保存",
      defaultPath: `mmd-capture-${new Date().getTime()}.png`,
      filters: [{ name: "PNG画像", extensions: ["png"] }],
    });

    if (filePath) {
      // Base64文字列をバッファに変換して保存
      fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
      return { success: true, filePath };
    } else {
      // ユーザーがキャンセルした場合
      return { success: false, message: "保存がキャンセルされました" };
    }
  } catch (error) {
    console.error("画像保存中にエラーが発生しました:", error);
    return { success: false, error: error.message };
  }
});

// ユーザーデータパス取得ハンドラ
ipcMain.handle("get-user-data-path", () => {
  return app.getPath("userData");
});
