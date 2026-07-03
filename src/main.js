// main.js - Electronメインプロセス
const { app, BrowserWindow, ipcMain, dialog, protocol, net } = require("electron");
const path = require("path");
const { pathToFileURL } = require("url");
const fs = require("fs");

// 開発モードかどうかを判定
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

// Vite開発サーバーのURL
const VITE_DEV_SERVER_URL = "http://localhost:5173";

// アセットカテゴリの定義 (IPCスキャン用)
const ASSET_CATEGORIES = {
  models: { dir: "models", exts: [".pmx"] },
  motions: { dir: "motions", exts: [".vmd"] },
  cameras: { dir: "cameras", exts: [".vmd"] },
  stages: { dir: "stages", exts: [".pmx"] },
  audios: { dir: "audios", exts: [".mp3", ".wav", ".ogg", ".m4a"] },
};

// アセットのルートディレクトリ (開発: プロジェクトルート / 本番: リソースフォルダ)
function getAssetRoot() {
  return isDev ? path.join(__dirname, "..") : process.resourcesPath;
}

// 本番用カスタムプロトコル:
//   app://bundle/... -> dist/ (ビルド成果物。fetch対応が必要なWASM読み込みのため必須)
//   app://assets/... -> リソースフォルダのアセット
protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true },
  },
]);

function registerAppProtocol() {
  protocol.handle("app", (request) => {
    const url = new URL(request.url);
    const pathname = decodeURIComponent(url.pathname);
    let filePath = null;

    if (url.hostname === "bundle") {
      filePath = path.join(__dirname, "../dist", pathname);
    } else if (url.hostname === "assets") {
      filePath = path.join(getAssetRoot(), pathname);
    }

    // パストラバーサル対策
    if (filePath === null || pathname.includes("..")) {
      return new Response("Not Found", { status: 404 });
    }
    return net.fetch(pathToFileURL(filePath).toString());
  });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 480,
    height: 854,
    minWidth: 320,
    minHeight: 568,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // 画面中央へ配置
  mainWindow.center();

  // 開発モードの場合はViteの開発サーバーを使用
  if (isDev) {
    console.log("開発モード: Vite開発サーバーを使用します");
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    // 開発ツールを開く
    mainWindow.webContents.openDevTools();
  } else {
    // 本番モードはapp://プロトコル経由でロード (fetch/WASMを動作させるため)
    console.log("本番モード: app://プロトコルでロードします");
    mainWindow.loadURL("app://bundle/index.html");
  }

  // 動作確認用: MMD_SNAP_DIR 指定時、定期的にウィンドウ内容をPNG保存する
  if (process.env.MMD_SNAP_DIR) {
    setInterval(async () => {
      try {
        const image = await mainWindow.webContents.capturePage();
        fs.writeFileSync(path.join(process.env.MMD_SNAP_DIR, "preview.png"), image.toPNG());
      } catch (e) {
        // ウィンドウ破棄後などは無視
      }
    }, 5000);
  }

  // 動作確認用: MMD_UI_TEST 指定時、UIを自動操作してスクリーンショットを保存する
  if (process.env.MMD_UI_TEST && process.env.MMD_SNAP_DIR) {
    const snap = async (name) => {
      const image = await mainWindow.webContents.capturePage();
      fs.writeFileSync(path.join(process.env.MMD_SNAP_DIR, name), image.toPNG());
    };
    const click = (id) =>
      mainWindow.webContents.executeJavaScript(`document.getElementById(${JSON.stringify(id)}).click()`);
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    setTimeout(async () => {
      try {
        await snap("t0-initial.png");
        await click("camera-mode-button"); await sleep(2000); await snap("t1-camera-face.png");
        await click("camera-mode-button"); await sleep(2000); await snap("t2-camera-full.png");
        await click("camera-mode-button"); await sleep(2000); await snap("t3-camera-auto.png");
        await click("effect-preset-button"); await sleep(2000); await snap("t4-preset-classic.png");
        await click("effect-preset-button"); await sleep(2000); await snap("t5-preset-rich.png");
        await click("capture-button"); await sleep(6000); await snap("t6-capture-view.png");
        await click("close-button"); await sleep(1500); await snap("t7-closed.png");
        await click("asset-panel-button"); await sleep(1000); await snap("t8-asset-panel.png");
        await click("asset-panel-apply"); await sleep(20000); await snap("t9-rebuilt.png");
        console.log("MMD_UI_TEST: 完了");
      } catch (e) {
        console.error("MMD_UI_TEST: 失敗", e);
      }
    }, 15000);
  }
}

app.whenReady().then(() => {
  registerAppProtocol();
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
    process.exit(0);
  }
});

// アセット一覧の取得 (カテゴリごとにディレクトリを再帰スキャン)
ipcMain.handle("assets:list", (event, category) => {
  const config = ASSET_CATEGORIES[category];
  if (!config) {
    return [];
  }

  const rootDir = path.join(getAssetRoot(), config.dir);
  if (!fs.existsSync(rootDir)) {
    return [];
  }

  const results = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (config.exts.includes(path.extname(entry.name).toLowerCase())) {
        // アセットルートからの相対パス (レンダラー側でURLに解決する)
        const relativePath = path.relative(getAssetRoot(), fullPath).split(path.sep).join("/");
        results.push({ name: path.basename(entry.name), path: relativePath });
      }
    }
  };
  walk(rootDir);
  return results;
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
