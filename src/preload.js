"use strict";
// preload.js
const { contextBridge, ipcRenderer } = require("electron");

// レンダラープロセスで使用するAPIを公開
contextBridge.exposeInMainWorld("electronAPI", {
  // キャプチャした画像をメインプロセスに送信し、保存結果を受け取る
  saveCaptureImage: (imageData) => ipcRenderer.invoke("save-capture", imageData),
});
