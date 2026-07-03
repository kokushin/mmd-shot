"use strict";
// preload.js
const { contextBridge, ipcRenderer } = require("electron");

// レンダラープロセスで使用するAPIを公開
contextBridge.exposeInMainWorld("electronAPI", {
  // キャプチャした画像をメインプロセスに送信し、保存結果を受け取る
  saveCaptureImage: (imageData) => ipcRenderer.invoke("save-capture", imageData),

  // アセット一覧を取得する (category: models | motions | cameras | stages | audios)
  listAssets: (category) => ipcRenderer.invoke("assets:list", category),

  // パス情報を取得するためのAPI
  getPath: (name) => {
    if (name === "userData") {
      return ipcRenderer.invoke("get-user-data-path");
    }
    return "";
  },
  isProduction: process.env.NODE_ENV === "production",
});
