// presets.ts - ポストエフェクトのプリセット管理
import {
  Camera,
  DefaultRenderingPipeline,
  DepthOfFieldEffectBlurLevel,
  GlowLayer,
  ImageProcessingConfiguration,
  Scene,
  SSAO2RenderingPipeline,
} from "@babylonjs/core";

export type EffectPresetName = "rich" | "classic";

export const EFFECT_PRESET_LABELS: Record<EffectPresetName, string> = {
  rich: "リッチ",
  classic: "クラシックMMD",
};

/**
 * ポストエフェクト一式を管理する
 * - リッチ: Ray-MMD風 (ブルーム / 被写界深度 / SSAO / ACES / ビネット / グロー)
 * - クラシックMMD: エフェクトなしのフラットなMMD調 (FXAAのみ)
 */
export class EffectPipeline {
  readonly pipeline: DefaultRenderingPipeline;
  private readonly _scene: Scene;
  private readonly _cameras: Camera[];
  private _ssao: SSAO2RenderingPipeline | null = null;
  private _glow: GlowLayer | null = null;
  private _preset: EffectPresetName = "rich";

  constructor(scene: Scene, cameras: Camera[]) {
    this._scene = scene;
    this._cameras = cameras;

    this.pipeline = new DefaultRenderingPipeline("default", true, scene, cameras);
    this.applyPreset("rich");
  }

  get preset(): EffectPresetName {
    return this._preset;
  }

  get glowLayer(): GlowLayer | null {
    return this._glow;
  }

  /** 被写界深度のフォーカス距離を更新する (シーン単位) */
  setFocusDistance(distanceInUnits: number): void {
    if (this.pipeline.depthOfFieldEnabled) {
      this.pipeline.depthOfField.focusDistance = distanceInUnits * 1000;
    }
  }

  applyPreset(name: EffectPresetName): void {
    this._preset = name;
    const p = this.pipeline;
    const imageProcessing = p.imageProcessing;

    if (name === "rich") {
      p.samples = 4;
      p.fxaaEnabled = true;

      p.bloomEnabled = true;
      // 閾値を高くして淡い肌・白い衣装をブルーム対象から外す (ネオン等の高輝度のみ光らせる)
      p.bloomThreshold = 0.85;
      p.bloomWeight = 0.2;
      p.bloomKernel = 64;
      p.bloomScale = 0.5;

      p.depthOfFieldEnabled = true;
      p.depthOfFieldBlurLevel = DepthOfFieldEffectBlurLevel.High;
      p.depthOfField.fStop = 2.8;
      p.depthOfField.focalLength = 50;
      p.depthOfField.lensSize = 50;

      p.chromaticAberrationEnabled = true;
      p.chromaticAberration.aberrationAmount = 1.0;

      p.imageProcessingEnabled = true;
      imageProcessing.toneMappingEnabled = true;
      imageProcessing.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;
      imageProcessing.exposure = 1.0;
      imageProcessing.contrast = 1.05;
      imageProcessing.vignetteEnabled = true;
      imageProcessing.vignetteWeight = 0.8;
      imageProcessing.vignetteStretch = 0.5;

      if (this._ssao === null) {
        this._ssao = new SSAO2RenderingPipeline("ssao", this._scene, { ssaoRatio: 0.5, blurRatio: 1 }, this._cameras);
        // 0.3/1.5 は口の中・鼻下・顎に黒ずみが乗るため、接地感が出る最小限に抑える
        this._ssao.totalStrength = 0.15;
        this._ssao.radius = 0.6;
        this._ssao.samples = 16;
      }
      if (this._glow === null) {
        this._glow = new GlowLayer("glow", this._scene, { mainTextureSamples: 2 });
        this._glow.intensity = 0.6;
      }
    } else {
      p.samples = 4;
      p.fxaaEnabled = true;

      p.bloomEnabled = false;
      p.depthOfFieldEnabled = false;
      p.chromaticAberrationEnabled = false;

      p.imageProcessingEnabled = true;
      imageProcessing.toneMappingEnabled = false;
      imageProcessing.exposure = 1.0;
      imageProcessing.contrast = 1.0;
      imageProcessing.vignetteEnabled = false;

      if (this._ssao !== null) {
        this._ssao.dispose();
        this._ssao = null;
      }
      if (this._glow !== null) {
        this._glow.dispose();
        this._glow = null;
      }
    }
  }

  togglePreset(): EffectPresetName {
    this.applyPreset(this._preset === "rich" ? "classic" : "rich");
    return this._preset;
  }

  dispose(): void {
    this._ssao?.dispose();
    this._glow?.dispose();
    this.pipeline.dispose();
  }
}
