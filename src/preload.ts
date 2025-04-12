// preload.ts
import { contextBridge, ipcRenderer } from "electron";

// レンダラープロセスで使用するAPIを公開
contextBridge.exposeInMainWorld("electronAPI", {
  // キャプチャした画像をメインプロセスに送信し、保存結果を受け取る
  saveCaptureImage: (imageData: string) => ipcRenderer.invoke("save-capture", imageData),
});

// グローバルな型定義を追加
declare global {
  interface Window {
    electronAPI: {
      saveCaptureImage: (imageData: string) => Promise<{
        success: boolean;
        filePath?: string;
        message?: string;
        error?: string;
      }>;
    };
  }
}
