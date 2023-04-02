import { Sprite, Ticker } from "pixi.js";
import Scene from "../core/Scene";
import { centerObjects } from "../utils/misc";
import StatElement, { createTextElement } from "../ui/StatElement";
import gsap from "gsap";
import { GlitchFilter } from "@pixi/filter-glitch";
import { playerData } from "./Game";

export default class GameOver extends Scene {
  name = "GameOver";
  loop!: gsap.core.Tween;

  restartPromise!: Promise<void>;
  resolveStart!: () => void;

  async load() {
    console.log(this);
    this.utils.viewport.x = 0;
    this.utils.viewport.y = 0;

    const bg = Sprite.from("loading");

    gsap.from(this, {
      alpha: 0,
      ease: "linear",
    });

    const gameOver = createTextElement("GAME OVER", {
      fontSize: 100,
      fill: 0xff0000,
    });

    gameOver.alpha = 1;

    gameOver.resolution = 2;

    const retry = createTextElement("try again?", {
      fontSize: 60,
    });

    const glitchFilter = new GlitchFilter({
      offset: 20,
    });

    Ticker.shared.add((delta) => {
      glitchFilter.seed = delta;
    });

    gameOver.filters = [glitchFilter];

    // this.loop = gsap.to(gameOver, {
    //   rotation: Math.PI * 2,
    //   ease: "back.inOut",
    //   duration: 1,
    //   repeatDelay: 0.5,
    //   repeat: -1,
    // });
    const score = new StatElement("HIGH SCORE", playerData.level, {
      labelColor: 0xbbbbbb,
    });

    centerObjects(bg, gameOver, retry, score);

    score.scale.set(0.8);

    gameOver.y -= 300;

    score.y += 100;
    score.x -= score.width / 2;

    const tl = gsap.timeline();

    tl.from(gameOver, {
      alpha: 0,
      y: "-100",
      duration: 3,
    })
      .from(retry, {
        alpha: 0,
      })
      .from(score, {
        alpha: 0,
      });

    retry.interactive = true;

    retry.cursor = "pointer";

    retry.on("pointerenter", () => {
      gsap.to(retry, {
        pixi: {
          scale: 1.4,
        },
        ease: "elastic.out",
      });
    });

    retry.on("pointerleave", () => {
      gsap.to(retry, {
        pixi: {
          scale: 1.0,
        },
        ease: "elastic.out",
      });
    });

    this.restartPromise = new Promise((resolve) => {
      this.resolveStart = resolve;

      retry.once("pointerup", () => {
        resolve();
      });
    });

    this.addChild(bg, gameOver, retry, score);
  }

  async start() {
    await this.restartPromise;

    document.location.reload();
  }
}
