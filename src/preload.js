"use strict";
// preload.js
const { contextBridge, ipcRenderer } = require("electron");
const path = require('path');

// レンダラープロセスで使用するAPIを公開
contextBridge.exposeInMainWorld("electronAPI", {
  // キャプチャした画像をメインプロセスに送信し、保存結果を受け取る
  saveCaptureImage: (imageData) => ipcRenderer.invoke("save-capture", imageData),
  
  // パス情報を取得するためのAPI
  getPath: (name) => {
    if (name === 'userData') {
      return ipcRenderer.invoke('get-user-data-path');
    }
    return '';
  },
  isProduction: process.env.NODE_ENV === 'production'
});
