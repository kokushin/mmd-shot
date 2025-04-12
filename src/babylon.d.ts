// babylon.d.ts - Babylon.jsの型定義

declare namespace BABYLON {
  class Scene {
    clearColor: Color4;
    activeCamera: Camera;
    animationTimeScale: number;
    onBeforeRenderObservable: Observable<Scene>;
    render(): void;
    enablePhysics(gravity: Vector3, plugin: any): void;
  }

  class Engine {
    getRenderingCanvas(): HTMLCanvasElement;
    resize(): void;
    runRenderLoop(callback: () => void): void;
  }

  class Vector3 {
    constructor(x: number, y: number, z: number);
    x: number;
    y: number;
    z: number;
    scale(scale: number): Vector3;
  }

  class Color3 {
    constructor(r: number, g: number, b: number);
  }

  class Color4 {
    constructor(r: number, g: number, b: number, a: number);
  }

  class Camera {
    attachControl(canvas: HTMLCanvasElement, noPreventDefault?: boolean): void;
    maxZ: number;
    setTarget(target: Vector3): void;
  }

  class ArcRotateCamera extends Camera {
    constructor(name: string, alpha: number, beta: number, radius: number, target: Vector3, scene: Scene);
    lowerRadiusLimit: number;
    upperRadiusLimit: number;
    wheelDeltaPercentage: number;
  }

  class HemisphericLight {
    constructor(name: string, direction: Vector3, scene: Scene);
    intensity: number;
    specular: Color3;
    groundColor: Color3;
  }

  class DirectionalLight {
    constructor(name: string, direction: Vector3, scene: Scene);
    intensity: number;
    autoCalcShadowZBounds: boolean;
    autoUpdateExtends: boolean;
    shadowMaxZ: number;
    shadowMinZ: number;
    orthoTop: number;
    orthoBottom: number;
    orthoLeft: number;
    orthoRight: number;
    shadowOrthoScale: number;
    position: Vector3;
  }

  class ShadowGenerator {
    constructor(mapSize: number, light: DirectionalLight, useFullFloatFirst?: boolean);
    static QUALITY_MEDIUM: number;
    usePercentageCloserFiltering: boolean;
    forceBackFacesOnly: boolean;
    filteringQuality: number;
    frustumEdgeFalloff: number;
    addShadowCaster(mesh: Mesh): void;
  }

  class Mesh {
    receiveShadows: boolean;
    getFacetNormal(index: number): Vector3;
  }

  class MeshBuilder {
    static CreateGround(name: string, options: any, scene: Scene): Mesh;
  }

  class Material {
    static MATERIAL_ALPHABLEND: number;
    static MATERIAL_ALPHATEST: number;
  }

  class StandardMaterial {
    constructor(name: string, scene: Scene);
    diffuseColor: Color3;
    specularPower: number;
    reflectionTexture: MirrorTexture;
  }

  class MirrorTexture {
    constructor(name: string, size: number, scene: Scene, generateMipMaps?: boolean);
    mirrorPlane: Plane;
    renderList: Mesh[];
    level: number;
  }

  class Plane {
    static FromPositionAndNormal(position: Vector3, normal: Vector3): Plane;
  }

  class DefaultRenderingPipeline {
    constructor(name: string, hdr: boolean, scene: Scene, cameras: Camera[]);
    samples: number;
    bloomEnabled: boolean;
    chromaticAberrationEnabled: boolean;
    chromaticAberration: {
      aberrationAmount: number;
    };
    fxaaEnabled: boolean;
    imageProcessingEnabled: boolean;
    imageProcessing: {
      toneMappingEnabled: boolean;
      toneMappingType: number;
      vignetteWeight: number;
      vignetteStretch: number;
      vignetteColor: Color4;
      vignetteEnabled: boolean;
    };
  }

  class ImageProcessingConfiguration {
    static TONEMAPPING_ACES: number;
  }

  class Observable<T> {
    add(callback: (eventData: T) => void): void;
  }

  class SceneLoader {
    static GetPluginForExtension(extension: string): any;
    static ImportMeshAsync(
      meshNames: any,
      rootUrl: string,
      sceneFilename: any,
      scene: Scene,
      onProgress?: (event: any) => void
    ): Promise<any>;
  }

  class HavokPlugin {
    constructor();
  }
}

declare namespace BABYLONMMD {
  class MmdCamera {
    constructor(name: string, position: BABYLON.Vector3, scene: BABYLON.Scene);
    maxZ: number;
    addAnimation(animation: any): void;
    setAnimation(name: string): void;
  }

  class MmdPhysics {
    constructor(scene: BABYLON.Scene);
  }

  class MmdRuntime {
    constructor(scene: BABYLON.Scene, physics: MmdPhysics);
    register(scene: BABYLON.Scene): void;
    setCamera(camera: MmdCamera): void;
    setAudioPlayer(audioPlayer: StreamAudioPlayer): void;
    createMmdModel(mesh: BABYLON.Mesh): any;
    playAnimation(): void;
    pauseAnimation(): void;
    isAnimationPaused: boolean;
  }

  class StreamAudioPlayer {
    constructor(scene: BABYLON.Scene);
    preservesPitch: boolean;
    source: string;
    pause(): void;
    play(): void;
  }

  class BvmdLoader {
    constructor(scene: BABYLON.Scene);
    loadAsync(name: string, url: string, onProgress?: (event: any) => void): Promise<any>;
  }

  class MmdPlayerControl {
    constructor(scene: BABYLON.Scene, mmdRuntime: MmdRuntime, audioPlayer: StreamAudioPlayer);
    showPlayerControl(): void;
  }
}

declare function HavokPhysics(): Promise<any>;

declare namespace Playground {
  function CreateScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene;
}

declare global {
  interface Window {
    mmdShotApp: {
      setSceneReference: (
        scene: BABYLON.Scene,
        mmdRuntime: BABYLONMMD.MmdRuntime,
        audioPlayer: BABYLONMMD.StreamAudioPlayer
      ) => void;
      pauseAnimation: () => void;
      resumeAnimation: () => void;
      toggleCameraMode: () => void;
    };
    mmdCameraMode: {
      currentMode: string;
      cameras: {
        faceFollow: BABYLON.ArcRotateCamera;
        fullBody: BABYLON.ArcRotateCamera;
      };
    };
    captureMMDScene: () => void;
    captureImage: string;
    rendererScene: BABYLON.Scene | null;
    rendererMmdRuntime: BABYLONMMD.MmdRuntime | null;
    rendererAudioPlayer: BABYLONMMD.StreamAudioPlayer | null;
    displayCaptureImage: (imageData: string) => void;
    engine: BABYLON.Engine;
    scene: BABYLON.Scene;
    initFunction: () => Promise<void>;
  }

  var BABYLON: typeof BABYLON;
  var BABYLONMMD: typeof BABYLONMMD;
  var HK: any;
  var Playground: typeof Playground;
  var HavokPhysics: typeof HavokPhysics;
}
