// assetPanel.ts - アセット選択パネル
import type { AssetSelection } from "../core/context";
import { resolveAssetUrl } from "../utils/env";

interface SelectConfig {
  selectId: string;
  category: AssetCategory;
  /** 未選択オプションのラベル (nullなら必須項目) */
  noneLabel: string | null;
}

const SELECT_CONFIGS: SelectConfig[] = [
  { selectId: "asset-select-model", category: "models", noneLabel: null },
  { selectId: "asset-select-motion", category: "motions", noneLabel: null },
  { selectId: "asset-select-camera", category: "cameras", noneLabel: "なし (自動カメラ)" },
  { selectId: "asset-select-stage", category: "stages", noneLabel: "ビルトインステージ" },
  { selectId: "asset-select-audio", category: "audios", noneLabel: "なし" },
];

export interface AssetPanelDefaults {
  model: string;
  motion: string;
  audio: string | null;
  camera: string | null;
  stage: string | null;
}

/**
 * アセット選択パネル
 * Electron IPCでアセットフォルダをスキャンし、選択内容の適用時にシーンを再構築させる
 */
export class AssetPanel {
  private readonly _defaults: AssetPanelDefaults;
  private readonly _onApply: (selection: AssetSelection) => void;

  constructor(defaults: AssetPanelDefaults, onApply: (selection: AssetSelection) => void) {
    this._defaults = defaults;
    this._onApply = onApply;
  }

  /** パネルを初期化する (ブラウザ実行時は非表示のまま) */
  async init(): Promise<void> {
    const panelButton = document.getElementById("asset-panel-button");
    const panel = document.getElementById("asset-panel");
    if (panelButton === null || panel === null) {
      return;
    }
    if (window.electronAPI?.listAssets === undefined) {
      panelButton.style.display = "none";
      return;
    }

    const defaultsByCategory: Record<AssetCategory, string | null> = {
      models: this._defaults.model,
      motions: this._defaults.motion,
      cameras: this._defaults.camera,
      stages: this._defaults.stage,
      audios: this._defaults.audio,
    };

    for (const config of SELECT_CONFIGS) {
      const select = document.getElementById(config.selectId) as HTMLSelectElement | null;
      if (select === null) {
        continue;
      }
      select.innerHTML = "";

      if (config.noneLabel !== null) {
        const noneOption = document.createElement("option");
        noneOption.value = "";
        noneOption.textContent = config.noneLabel;
        select.appendChild(noneOption);
      }

      const entries = await window.electronAPI.listAssets(config.category);
      for (const entry of entries) {
        const option = document.createElement("option");
        option.value = entry.path;
        option.textContent = entry.name;
        select.appendChild(option);
      }

      // .envのデフォルトを初期選択にする
      const defaultPath = defaultsByCategory[config.category];
      if (defaultPath !== null && entries.some((entry) => entry.path === defaultPath)) {
        select.value = defaultPath;
      }
    }

    panelButton.addEventListener("click", () => {
      panel.classList.toggle("open");
    });
    document.getElementById("asset-panel-close")?.addEventListener("click", () => {
      panel.classList.remove("open");
    });
    document.getElementById("asset-panel-apply")?.addEventListener("click", () => {
      const selection = this._readSelection();
      if (selection !== null) {
        panel.classList.remove("open");
        this._onApply(selection);
      }
    });
  }

  private _readSelection(): AssetSelection | null {
    const read = (selectId: string): string | null => {
      const select = document.getElementById(selectId) as HTMLSelectElement | null;
      if (select === null || select.value === "") {
        return null;
      }
      return select.value;
    };

    const modelPath = read("asset-select-model");
    const motionPath = read("asset-select-motion");
    if (modelPath === null || motionPath === null) {
      return null;
    }

    const cameraPath = read("asset-select-camera");
    const stagePath = read("asset-select-stage");
    const audioPath = read("asset-select-audio");

    return {
      modelUrl: resolveAssetUrl(modelPath),
      motionUrl: resolveAssetUrl(motionPath),
      audioUrl: audioPath !== null ? resolveAssetUrl(audioPath) : null,
      cameraMotionUrl: cameraPath !== null ? resolveAssetUrl(cameraPath) : null,
      stageUrl: stagePath !== null ? resolveAssetUrl(stagePath) : null,
    };
  }
}
