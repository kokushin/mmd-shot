// electron.d.ts
// Electronアプリケーションのプレロードスクリプトで定義されたAPIの型定義

interface ElectronAPI {
  saveCaptureImage: (imageData: string) => Promise<{
    success: boolean;
    filePath?: string;
    message?: string;
    error?: string;
  }>;
}

// グローバルなWindow interfaceを拡張
declare interface Window {
  electronAPI: ElectronAPI;
  captureImage: string;
  mmdShotApp: {
    setSceneReference: (scene: any, mmdRuntime: any, audioPlayer: any) => void;
    pauseAnimation: () => void;
    resumeAnimation: () => void;
    toggleCameraMode: () => void;
    [key: string]: any;
  };
}