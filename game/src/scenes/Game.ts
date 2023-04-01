import Player from "../prefabs/Player";
import Scene from "../core/Scene";
import { CompositeTilemap } from "@pixi/tilemap";

import EnemySystem from "../systems/EnemySystem";
import { Container, Ticker } from "pixi.js";
import PlayerSystem from "../systems/PlayerSystem";
import { Sprite, Texture } from "pixi.js";
import MapGenerator from "../core/MapGenerator";
import ProjectileMoveSystem from "../systems/ProjectileMoveSystem";
import EntityAttackSystem from "../systems/EntityAttackSystem";
import StatElement from "../ui/StatElement";
import Enemy from "../prefabs/Enemy";
import Entity from "../prefabs/Entity";
import Projectile from "../prefabs/Projectile";
import { getClosestTarget, removeIfDestroyed } from "../utils/game";

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
  private enemies: Enemy[] = [];
  private entities: Entity[] = [];
  private projectiles: Projectile[] = [];
  private availableTargets: Map<string, Entity[]> = new Map<string, Entity[]>();
  systems: System[] = [];
  uiContainer!: Container;
  enemySystem!: EnemySystem;
  playerSystem!: PlayerSystem;
  worldSize!: { tileSize: number; scale: number; readonly area: number };

  async testTsEndpoints() {
    // await trpc.activatePlayer.query({
    //   playerId: "0",
    //   theme: "space dystopia",
    // });

    // await trpc.checkPlayer.query({
    //   playerId: "0",
    // });

    // await trpc.deactivatePlayer.query({
    //   playerId: "0",
    // });

    // await trpc.checkPlayer.query({
    //   playerId: "0",
    // });

    // await trpc.getNarration.query({
    //   playerId: "0",
    // });

    // await trpc.storeNarration.query({
    //   playerId: "0",
    //   narrationSerial: "boiler",
    // });
    console.log("Done");
  }

  async load() {
    this.testTsEndpoints();

    this.worldSize = {
      tileSize: 32,
      scale: 4,

      get area() {
        return this.tileSize * this.scale;
      },
    };

    // console.warn(await trpc.getNarration.query("1"));
    console.log(this.projectiles);

    this.player = new Player();

    this.uiContainer = new Container();

    this.utils.viewport.parent.addChild(this.uiContainer);
    this.utils.viewport.follow(this.player);

    this.player.x = window.innerWidth / 2;
    this.player.y = window.innerHeight / 2;

    const collisionMatrix = this.addBackground();
    this.availableTargets.set("Enemy", [this.player]);
    this.availableTargets.set("Player", this.enemies);

    this.initUi();

    this.initSystems(collisionMatrix);

    this.addEntity(this.player);

    this.spawnEnemies();
  }

  addEntity(entity: Entity) {
    this.entities.push(entity);
    this.addChild(entity);
  }

  spawnEnemy(x = 0, y = 0) {
    const enemy = new Enemy();

    enemy.x = x;
    enemy.y = y;

    this.enemies.push(enemy);
    this.addEntity(enemy);
  }

  spawnProjectile(projectile: Projectile) {
    this.projectiles.push(projectile);
    this.addChild(projectile);
  }

  initUi() {
    const hp = new StatElement("HP", 100, {
      alpha: 0.7,
    });

    this.player.on("CHANGE_HP" as any, (newHp: number) => {
      hp.update(newHp);
    });

    const xp = new StatElement("XP", 0, {
      alpha: 0.7,
      valueColor: 0x8888ff,
    });

    this.player.on("CHANGE_XP" as any, (newXp: number) => {
      xp.update(newXp);
    });

    xp.y = hp.height;
    this.uiContainer.addChild(hp, xp);
  }

  initSystems(collisionMatrix: CollisionMatrix) {
    this.enemySystem = new EnemySystem(
      this.enemies,
      this.player,
      collisionMatrix,
      this.worldSize
    );
    this.addSystem(this.enemySystem);

    this.playerSystem = new PlayerSystem(
      this.player,
      collisionMatrix,
      this.worldSize
    );

    this.addSystem(this.playerSystem);

    this.addSystem(
      new EntityAttackSystem(
        this.entities,
        this.spawnProjectile.bind(this),
        this.availableTargets
      )
    );
    this.addSystem(new ProjectileMoveSystem(this.projectiles));

    Ticker.shared.add((delta) => {
      this.updateSystems(delta);
    });
  }

  addBackground() {
    const tilemap = new CompositeTilemap();

    const mapGen = new MapGenerator(
      this.utils.renderer,
      this.worldSize.tileSize,
      this.worldSize.tileSize,
      "dungeonGen"
    );
    const mapBuffer = mapGen.generate(1000);

    const collisionMatrix: CollisionMatrix = [];

    console.warn(mapGen);

    for (let y = 0; y < mapGen.height; y++) {
      collisionMatrix.push([]);

      for (let x = 0; x < mapGen.width; x++) {
        const i = x + y * mapGen.height;

        const color = mapBuffer.slice(i * 4, i * 4 + 4);

        const brightness = (color[0] + color[1] + color[2]) / 3;

        collisionMatrix[y][x] = brightness < 0.01 ? 1 : 0;

        tilemap.tile(
          brightness < 0.01 ? "brick.png" : "grass.png",
          x * this.worldSize.tileSize,
          y * this.worldSize.tileSize
        );
      }
    }

    console.warn(collisionMatrix);

    tilemap.scale.set(this.worldSize.scale);

    console.warn(tilemap);

    this.addChild(tilemap);

    const minimap = Sprite.from(
      Texture.fromBuffer(mapBuffer, mapGen.width, mapGen.height)
    );

    minimap.scale.set(4);

    minimap.x = this.utils.viewport.screenWidth - minimap.width;

    this.uiContainer.addChild(minimap);

    return collisionMatrix;
  }

  spawnEnemies() {
    const enemiesAmount = 3;

    for (let i = 0; i < enemiesAmount; i++) {
      this.spawnEnemy(Math.random() * 700 + 100, Math.random() * 700 + 100);
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
    //clean up
    removeIfDestroyed(this.entities);
    removeIfDestroyed(this.enemies);
    removeIfDestroyed(this.projectiles);
    for (const projectile of this.projectiles) {
      const availableTargets = this.availableTargets.get(
        projectile.creatorStats.type
      );
      if (!availableTargets) continue;
      const newClosest = getClosestTarget(projectile, availableTargets);
      if (newClosest) {
        projectile.target = newClosest;
      }
    }
    for (const system of this.systems) {
      system.update(delta);
    }
  }
}
