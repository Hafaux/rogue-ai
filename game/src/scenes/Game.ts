import Player from "../prefabs/Player";
import Scene from "../core/Scene";
import { CompositeTilemap } from "@pixi/tilemap";

import EnemySystem from "../systems/EnemySystem";
import { Ticker } from "pixi.js";
import PlayerSystem from "../systems/PlayerSystem";

export default class Game extends Scene {
  name = "Game";

  private player!: Player;

  systems: System[] = [];

  enemySystem!: EnemySystem;
  playerSystem!: PlayerSystem;

  load() {
    this.player = new Player();

    this.player.x = window.innerWidth / 2;
    this.player.y = window.innerHeight / 2;

    this.addBackground();

    this.enemySystem = new EnemySystem(this, this.player);
    this.addSystem(this.enemySystem);

    this.playerSystem = new PlayerSystem(this.player);
    this.addSystem(this.playerSystem);

    this.spawnEnemies();

    this.addChild(this.player);

    Ticker.shared.add((delta) => {
      this.updateSystems(delta);
    });
  }

  addBackground() {
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
