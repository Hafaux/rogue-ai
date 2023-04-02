import Player from "../prefabs/Player";
import Scene from "../core/Scene";
import { CompositeTilemap } from "@pixi/tilemap";
import EnemySystem from "../systems/EnemySystem";
import { Assets, Container, Spritesheet, Ticker } from "pixi.js";
import PlayerSystem from "../systems/PlayerSystem";
import { Sprite, Texture } from "pixi.js";
import MapGenerator from "../core/MapGenerator";
import ProjectileMoveSystem from "../systems/ProjectileMoveSystem";
import EntityAttackSystem from "../systems/EntityAttackSystem";
import StatElement from "../ui/StatElement";
import Enemy from "../prefabs/Enemy";
import Entity from "../prefabs/Entity";
import Projectile from "../prefabs/Projectile";
import { getClosestTarget, removeIfDestroyed, tryChance } from "../utils/game";
import Chest from "../prefabs/Chest";
import ChestSystem from "../systems/ChestSystem";
import { gsap } from "gsap";
import { Howl, Howler } from "howler";
import { groupCollapsed } from "console";
import trpc from "../core/trpc";
import { prompt } from "./StartMenu";
import NarrationSystem from "../systems/NarrationSystem";
import { CRTFilter } from "@pixi/filter-crt";
import { GlitchFilter } from "@pixi/filter-glitch";
import ShaderSystem from "../systems/ShaderSystem";
import UiSystem from "../systems/UiSystem";
import { Narration } from "@rogueai/backend/src/narrator/narrator";

export const playerData = {
  level: 1,
};

export default class Game extends Scene {
  name = "Game";

  private player!: Player;
  private chests: Chest[] = [];
  private enemies: Enemy[] = [];
  private entities: Entity[] = [];
  private projectiles: Projectile[] = [];
  private narrations: Narration[] = [];
  private availableTargets: Map<string, Entity[]> = new Map<string, Entity[]>();
  systems: System[] = [];
  uiContainer!: Container;
  enemySystem!: EnemySystem;
  playerSystem!: PlayerSystem;
  narrationSystem!: NarrationSystem;
  worldSize!: { tileSize: number; scale: number; readonly area: number };
  collisionMatrix!: CollisionMatrix;
  spritesheet!: Spritesheet;

  windowFocused = true;

  filterTimer = 0;

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

    // const narations = JSON.parse(
    //   await trpc.getNarration.query({
    //     playerId: "0",
    //   })
    // );

    // console.log(narations[0].audio_file);

    // await trpc.storeNarration.query({
    //   playerId: "0",
    //   narrationSerial: "boiler",
    // });
    console.log("Done");
  }

  async load() {
    this.alpha = 0;

    gsap.to(this, {
      alpha: 1,
      duration: 0.5,
      ease: "linear",
    });
    this.testTsEndpoints();

    this.spritesheet = new Spritesheet(
      Texture.from("spritesheet"),
      Assets.cache.get("atlasGen")
    );

    this.windowFocused = true;

    this.spritesheet.parse();

    this.worldSize = {
      tileSize: 32,
      scale: 8,

      get area() {
        return this.tileSize * this.scale;
      },
    };

    this.uiContainer = new Container();

    this.utils.viewport.parent.addChild(this.uiContainer);

    this.collisionMatrix = this.addBackground();

    this.spawnPlayer(this.collisionMatrix);

    this.utils.viewport.follow(this.player);

    this.availableTargets.set("Enemy", [this.player]);
    this.availableTargets.set("Player", this.enemies);

    this.player.on("destroyed", () => {
      this.utils.viewport.plugins.remove("follow");
    });

    this.initSystems(this.collisionMatrix);
    this.addEntity(this.player);
    this.spawnEnemies(this.collisionMatrix);

    window.onblur = () => {
      this.windowFocused = false;
    };

    window.onfocus = () => {
      this.windowFocused = true;
    };
  }

  addEntity(entity: Entity) {
    this.entities.push(entity);
    this.addChild(entity);
  }

  spawnPlayer(collisionMatrix: CollisionMatrix) {
    this.player = new Player();

    const tiles = collisionMatrix.length;

    const y = Math.floor(tiles / 2);

    for (let x = tiles / 2; x < tiles; x++) {
      const insideWall = collisionMatrix[y][x];

      if (!insideWall) {
        this.player.x = x * this.worldSize.area + this.worldSize.area / 2;
        this.player.y = y * this.worldSize.area + this.worldSize.area / 2;
      }
    }
  }

  spawnEnemy(x = 0, y = 0) {
    const enemy = new Enemy(
      tryChance(50)
        ? this.spritesheet.textures.enemy1
        : this.spritesheet.textures.enemy2
    );

    enemy.x = x;
    enemy.y = y;

    enemy.scale.set(0);

    gsap.to(enemy, {
      pixi: {
        scale: 1,
      },
      ease: "elastic.out(1.5)",
      duration: 1,
    });

    this.enemies.push(enemy);
    this.addEntity(enemy);
  }

  spawnProjectile(projectile: Projectile) {
    this.projectiles.push(projectile);
    this.addChild(projectile);
  }

  initSystems(collisionMatrix: CollisionMatrix) {
    const playerId = PlayerSystem.idNext();
    this.playerSystem = new PlayerSystem(
      this.player,
      collisionMatrix,
      this.worldSize,
      playerId
    );

    console.log("Calling activatePlayer()");
    trpc.activatePlayer
      .query({
        playerId: playerId,
        theme: prompt.value || "random",
      })
      .then((resp) => {
        console.log("Adding narrationSystem()");
        this.narrationSystem = new NarrationSystem(playerId, this.narrations);
        Ticker.shared.add((delta) => {
          this.narrationSystem.update(delta);
        });
        this.player.on("CHANGE_XP" as any, (newXp) => {
          if (newXp >= 5) {
            this.narrationSystem.grabNarration("levelup");
          }
        });
        this.addSystem(
          new ProjectileMoveSystem(this.projectiles, this.narrationSystem)
        );
        this.enemySystem = new EnemySystem(
          this.enemies,
          this.player,
          collisionMatrix,
          this.worldSize,
          this.narrationSystem
        );
        this.addSystem(this.enemySystem);
      });

    this.addSystem(this.playerSystem);

    this.addSystem(new ShaderSystem(this, this.player));

    this.addSystem(new UiSystem(this.player, this.uiContainer));

    this.addSystem(
      new EntityAttackSystem(
        this.entities,
        this.spawnProjectile.bind(this),
        this.availableTargets
      )
    );

    this.addSystem(new ChestSystem(this.chests, this.player));

    Ticker.shared.add(this.updateSystemsFn);
  }

  updateSystemsFn = ((delta: number) => {
    this.updateSystems(delta);
  }).bind(this);

  addBackground() {
    const mapGen = new MapGenerator(
      this.utils.renderer,
      this.worldSize.tileSize,
      this.worldSize.tileSize,
      "dungeonGen"
    );
    const mapBuffer = mapGen.generate(1000);

    const collisionMatrix: CollisionMatrix = [];
    let chestPityTimer = 0;
    const generateMap = (firstMap: boolean) => {
      const tilemap = new CompositeTilemap();

      for (let y = 0; y < mapGen.height; y++) {
        if (firstMap) collisionMatrix.push([]);

        for (let x = 0; x < mapGen.width; x++) {
          const i = x + y * mapGen.height;

          const color = mapBuffer.slice(i * 4, i * 4 + 4);

          const brightness = (color[0] + color[1] + color[2]) / 3;

          if (firstMap) collisionMatrix[y][x] = brightness < 0.01 ? 1 : 0;

          if (brightness >= 0.01) {
            if (tryChance(1) || chestPityTimer > 20) {
              const worldCoordsX =
                x * this.worldSize.area + this.worldSize.area / 2;
              const worldCoordsY =
                y * this.worldSize.area + this.worldSize.area / 2;

              const chest = new Chest(this.spritesheet.textures.crate);

              chest.x = worldCoordsX;
              chest.y = worldCoordsY;

              this.chests.push(chest);
              this.addChild(chest);
              chestPityTimer = 0;
            } else {
              chestPityTimer++;
            }
          }
          tilemap.tile(
            brightness < 0.01 ? "wall" : "floor",
            x * this.worldSize.tileSize,
            y * this.worldSize.tileSize
          );
        }
      }

      return tilemap;
    };

    for (let mapIndex = 0; mapIndex < 9; mapIndex++) {
      const firstMap = mapIndex === 0;

      const mapX = (mapIndex % 3) - 1;
      const mapY = Math.floor(mapIndex / 3) - 1;

      const tilemap = generateMap(firstMap);

      tilemap.x = mapX * tilemap.width * this.worldSize.scale;
      tilemap.y = mapY * tilemap.height * this.worldSize.scale;

      tilemap.scale.set(this.worldSize.scale);

      this.addChild(tilemap);
    }

    const minimap = Sprite.from(
      Texture.fromBuffer(mapBuffer, mapGen.width, mapGen.height)
    );

    minimap.scale.set(4);

    minimap.x = this.utils.viewport.screenWidth - minimap.width;

    this.uiContainer.addChild(minimap);

    return collisionMatrix;
  }

  spawnEnemies(collisionMatrix: CollisionMatrix) {
    const secondsPerWave = 2;
    const enemiesAmount = 4;

    setInterval(() => {
      if (this.enemies.length > 20) return;

      const { current } = this.player.tileCoords;

      for (let i = 0; i < enemiesAmount; i++) {
        const dirs = [
          [-1, -1],
          [-1, 1],
          [1, 1],
          [1, -1],
        ];

        let randomDir = dirs[Math.floor(Math.random() * dirs.length)];

        let enemiesPos;

        const isPosValid = (pos: { x: number; y: number }) => {
          return pos.x < 32 && pos.y >= 0 && pos.x > 0 && pos.x < 32;
        };

        for (let j = 1; j < 10; j++) {
          try {
            enemiesPos = {
              x: current.x + randomDir[0] * j,
              y: current.y + randomDir[1] * j,
            };

            if (!isPosValid(enemiesPos)) {
              throw null;
            }

            if (!collisionMatrix[enemiesPos.y][enemiesPos.x]) break;
            else {
              throw null;
            }
          } catch (e) {
            randomDir = dirs[Math.floor(Math.random() * dirs.length)];
          }
        }

        if (enemiesPos && isPosValid(enemiesPos)) {
          this.spawnEnemy(
            enemiesPos.x * this.worldSize.area +
              this.worldSize.area * Math.random(),
            enemiesPos.y * this.worldSize.area +
              this.worldSize.area * Math.random()
          );
        }
      }
    }, secondsPerWave * 1000);
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
    if (this.player.destroyed || this.destroyed) {
      Ticker.shared.remove(this.updateSystemsFn);

      playerData.level = this.player.level;

      gsap.to(this.uiContainer, {
        alpha: 0,
      });

      console.warn("OVER");

      this.emit("OVER" as any);

      return;
    }

    //clean up
    removeIfDestroyed(this.entities);
    removeIfDestroyed(this.enemies);
    removeIfDestroyed(this.projectiles);
    removeIfDestroyed(this.chests);

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
