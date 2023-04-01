import Player from "../prefabs/Player";
import Scene from "../core/Scene";
import { CompositeTilemap } from "@pixi/tilemap";

import EnemySystem from "../systems/EnemySystem";
import { Container, Ticker } from "pixi.js";
import PlayerSystem from "../systems/PlayerSystem";
import { Sprite, Texture } from "pixi.js";
import MapGenerator from "../core/MapGenerator";
import ProjectileSystem from "../systems/ProjectileSystem";
import StatElement from "../ui/StatElement";

// import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

// import type { AppRouter } from "../../../backend/src/router";

// const trpc = createTRPCProxyClient<AppRouter>({
//   links: [
//     httpBatchLink({
//       url: "http://localhost:2023",
//     }),
//   ],
// });

export default class Game extends Scene {
  name = "Game";

  private player!: Player;

  systems: System[] = [];

  enemySystem!: EnemySystem;
  playerSystem!: PlayerSystem;

  uiContainer!: Container;

  async load() {
    // console.warn(await trpc.getNarration.query("1"));

    this.player = new Player();

    this.uiContainer = new Container();

    this.utils.viewport.parent.addChild(this.uiContainer);

    this.utils.viewport.follow(this.player);

    this.player.x = window.innerWidth / 2;
    this.player.y = window.innerHeight / 2;

    this.addBackground();

    this.initUi();

    this.initSystems();

    this.addChild(this.player);

    this.spawnEnemies();
  }

  initUi() {
    const hp = new StatElement("HP", 100, {
      alpha: 0.7,
    });

    const xp = new StatElement("XP", 0, {
      alpha: 0.7,
      valueColor: 0x8888ff,
    });

    xp.y = hp.height;

    this.uiContainer.addChild(hp, xp);
  }

  initSystems() {
    this.enemySystem = new EnemySystem(this, this.player);
    this.addSystem(this.enemySystem);

    this.playerSystem = new PlayerSystem(this.player);
    this.addSystem(this.playerSystem);

    this.addSystem(
      new ProjectileSystem(this.enemySystem.enemies, this.player, this)
    );

    Ticker.shared.add((delta) => {
      this.updateSystems(delta);
    });
  }

  addBackground() {
    const tilemap = new CompositeTilemap();

    const mapGen = new MapGenerator(this.utils.renderer, 32, 32, "dungeonGen");

    const mapBuffer = mapGen.generate(1000);

    for (let y = 0; y < mapGen.height; y++) {
      for (let x = 0; x < mapGen.width; x++) {
        const i = x + y * mapGen.height;

        const color = mapBuffer.slice(i * 4, i * 4 + 4);

        const brightness = (color[0] + color[1] + color[2]) / 3;

        tilemap.tile(
          brightness < 0.01 ? "brick.png" : "grass.png",
          x * 32,
          y * 32
        );
      }
    }

    this.addChild(tilemap);

    const minimap = Sprite.from(
      Texture.fromBuffer(mapBuffer, mapGen.width, mapGen.height)
    );

    minimap.scale.set(4);

    minimap.x = this.utils.viewport.screenWidth - minimap.width;

    this.uiContainer.addChild(minimap);
  }

  spawnEnemies() {
    const enemiesAmount = 10;

    for (let i = 0; i < enemiesAmount; i++) {
      this.enemySystem.spawnEnemy(
        Math.random() * 700 + 100,
        Math.random() * 700 + 100
      );
    }
  }

  onResize(width: number, height: number) {
    if (this.player) {
      this.player.x = width / 2;
      this.player.y = height - this.player.height / 3;
    }
  }

  addSystem(system: System) {
    this.systems.push(system);
  }

  updateSystems(delta: number) {
    for (const system of this.systems) {
      system.update(delta);
    }
  }
}
