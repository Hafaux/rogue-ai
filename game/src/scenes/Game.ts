import config from "../config";
import ParallaxBackground from "../prefabs/ParallaxBackground";
import { Player } from "../prefabs/Player";
import Scene from "../core/Scene";
import { CompositeTilemap } from "@pixi/tilemap";

import helloFromBackend from "@rogueai/backend";

export default class Game extends Scene {
  name = "Game";

  private player: Player | undefined;
  private background: ParallaxBackground | undefined;

  load() {
    this.player = new Player();

    this.player.x = window.innerWidth / 2;
    this.player.y = window.innerHeight - this.player.height / 3;

    const tilemap = new CompositeTilemap();

    const width = 50;
    const height = 50;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const idEdge =
          x === 0 || y === 0 || x === width - 1 || y === height - 1;

        tilemap.tile(idEdge ? "brick.png" : "grass.png", x * 32, y * 32);
      }
    }

    this.addChild(tilemap);

    helloFromBackend();
  }

  onResize(width: number, height: number) {
    if (this.player) {
      this.player.x = width / 2;
      this.player.y = height - this.player.height / 3;
    }

    if (this.background) {
      this.background.resize(width, height);
    }
  }
}
