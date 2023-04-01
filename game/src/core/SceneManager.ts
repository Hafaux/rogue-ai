import { Application, IRenderer, settings, SCALE_MODES } from "pixi.js";
import Scene from "./Scene";
import { Debug } from "../utils/debug";
import AssetLoader from "./AssetLoader";
import { Viewport } from "pixi-viewport";

if (import.meta.env.DEV) Debug.init();

settings.SCALE_MODE = SCALE_MODES.NEAREST;

export interface SceneUtils {
  assetLoader: AssetLoader;
  renderer: IRenderer;
  viewport: Viewport;
}

export default class SceneManager {
  private sceneConstructors = this.importScenes();

  app: Application;
  sceneInstances = new Map<string, Scene>();
  currentScene?: Scene;
  viewport: Viewport;

  constructor() {
    this.app = new Application({
      view: document.querySelector("#app") as HTMLCanvasElement,
      autoDensity: true,
      resizeTo: window,
      powerPreference: "high-performance",
      backgroundColor: 0x23272a,
    });

    window.__PIXI_APP__ = this.app;

    this.viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      events: this.app.renderer.events,
    });

    this.app.stage.addChild(this.viewport);

    window.addEventListener("resize", (ev: UIEvent) => {
      const target = ev.target as Window;

      this.currentScene?.onResize?.(target.innerWidth, target.innerHeight);
    });
  }

  importScenes() {
    const sceneModules = import.meta.glob("/src/scenes/*.ts", {
      eager: true,
    }) as Record<string, { default: ConstructorType<typeof Scene> }>;

    return Object.entries(sceneModules).reduce((acc, [path, module]) => {
      const fileName = path.split("/").pop()?.split(".")[0];

      if (!fileName) throw new Error("Error while parsing filename");

      acc[fileName] = module.default;

      return acc;
    }, {} as Record<string, ConstructorType<typeof Scene>>);
  }

  async switchScene(sceneName: string, deletePrevious = true): Promise<Scene> {
    await this.removeScene(deletePrevious);

    this.currentScene = this.sceneInstances.get(sceneName);

    if (!this.currentScene) this.currentScene = await this.initScene(sceneName);

    if (!this.currentScene)
      throw new Error(`Failed to initialize scene: ${sceneName}`);

    this.viewport.addChild(this.currentScene);

    if (this.currentScene.start) await this.currentScene.start();

    return this.currentScene;
  }

  private async removeScene(destroyScene: boolean) {
    if (!this.currentScene) return;

    if (destroyScene) {
      this.sceneInstances.delete(this.currentScene.name);

      this.currentScene.destroy({ children: true });
    } else {
      this.viewport.removeChild(this.currentScene);
    }

    if (this.currentScene.unload) await this.currentScene.unload();

    this.currentScene = undefined;
  }

  private async initScene(sceneName: string) {
    const sceneUtils = {
      assetLoader: new AssetLoader(),
      renderer: this.app.renderer,
      viewport: this.viewport,
    };

    const scene = new this.sceneConstructors[sceneName](sceneUtils);

    this.sceneInstances.set(sceneName, scene);

    if (scene.load) await scene.load();

    return scene;
  }
}
