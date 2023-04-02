import { ColorMatrixFilter, Sprite } from "pixi.js";
import Scene from "../core/Scene";
import { centerObjects } from "../utils/misc";
import { createTextElement } from "../ui/StatElement";
import gsap from "gsap";
import { PixiPlugin } from "gsap/all";
import { Input } from "@pixi/ui";

gsap.registerPlugin(PixiPlugin);

export const prompt = {
  value: "",
};

export default class StartMenu extends Scene {
  name = "StartMenu";
  loop!: gsap.core.Tween;
  startPromise!: Promise<void>;
  resolveStart!: () => void;
  prompt: any;
  input!: Input;
  title: any;

  async load() {
    await this.utils.assetLoader.loadAssetsGroup("StartMenu");

    const bg = Sprite.from("bg");

    this.title = createTextElement("Rogue AI", {
      fontSize: 200,
    });

    const colorFilter = new ColorMatrixFilter();

    this.title.filters = [colorFilter];

    colorFilter.hue(50, true);

    this.title.tint = 0x00ff00;

    const start = createTextElement("START");

    start.interactive = true;

    start.cursor = "pointer";

    start.on("pointerenter", () => {
      start.scale.set(1.4);
    });

    start.on("pointerleave", () => {
      start.scale.set(1.0);
    });

    this.input = new Input({
      bg: "input",
      textStyle: {
        fontFamily: "upheavtt",
        fill: "0xff00ff",
      },
      padding: {
        top: 11,
        right: 11,
        bottom: 11,
        left: 11,
      },
    });

    this.input.scale.set(10, 10);

    const promptLabel = createTextElement("ENTER PROMPT", {
      fill: 0xaaaaee,
    });

    this.prompt = createTextElement("", {
      wordWrap: true,
      wordWrapWidth: 10,
    });

    document.addEventListener("keydown", (e) => {
      if (e.code === "Backspace") {
        this.prompt.text = "";
        this.input.value = "";
      }

      if (e.code === "Enter") this.resolveStart();
    });

    // @ts-ignore
    this.input.onChange = {
      emit: (a) => {
        this.prompt.text = a;
      },
    };

    this.startPromise = new Promise((resolve) => {
      this.resolveStart = resolve;

      start.once("pointerup", () => {
        resolve();
      });
    });

    const controls = createTextElement("W A S D to move", {
      fill: 0xfefefe,
    });

    centerObjects(
      bg,
      this.title,
      start,
      controls,
      this.input,
      this.prompt,
      promptLabel
    );

    promptLabel.y += 80;

    this.prompt.y += 120;

    this.input.x += -this.input.width / 2;
    this.input.y += -this.input.height / 2 + 200;

    this.title.y -= 300;

    controls.y += 300;

    this.loop = gsap.to(this.title, {
      y: "+=50",
      pixi: {
        tint: 0x2255ff,
      },
      ease: "power1.inOut",
      duration: 1,
      repeat: -1,
      yoyo: true,
    });

    this.addChild(
      bg,
      this.title,
      start,
      controls,
      this.input,
      this.prompt,
      promptLabel
    );
  }

  async start() {
    await this.startPromise;

    gsap.to(this, {
      alpha: 0,
      duration: 1,
    });

    await gsap.to(this.title, {
      y: "-=500",
      ease: "back.in(3)",
      duration: 1,
    });
    this.input.destroy();

    prompt.value = this.prompt.text;

    this.loop.kill();
  }
}
