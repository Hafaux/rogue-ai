import { AStarFinder } from "astar-typescript";
import Enemy from "../prefabs/Enemy";
import Player from "../prefabs/Player";
import { getDirection, getEntityDirection } from "../utils/game";
import { utils } from "pixi.js";
import Entity from "../prefabs/Entity";

export default class EnemySystem implements System {
  aStar: AStarFinder;
  emitter = new utils.EventEmitter();

  constructor(
    private enemies: Enemy[],
    private playerRef: Player,
    collisionMatrix: CollisionMatrix,
    private worldSize: {
      tileSize: number;
      scale: number;
      readonly area: number;
    }
  ) {
    console.warn(this.worldSize.area);

    this.aStar = new AStarFinder({
      grid: {
        matrix: collisionMatrix,
      },
      diagonalAllowed: false,
    });

    const recalcTargetPath = () => {
      for (const enemy of enemies) {
        enemy.pathToTarget = this.aStar.findPath(
          enemy.tileCoords.current,
          this.playerRef.tileCoords.current
        );
      }
    };

    this.playerRef.on("TILE_CHANGE" as any, recalcTargetPath);
    this.emitter.on("TILE_CHANGE" as any, recalcTargetPath);
  }

  playerCollision(enemy: Enemy, delta: number) {
    this.setTileCoords(enemy);

    if (enemy.pathToTarget.length <= 1) {
      // something else

      return;
    }

    const pathTarget = enemy.pathToTarget[1];

    const pathObj = {
      x: pathTarget[0] * this.worldSize.area + this.worldSize.area / 2,
      y: pathTarget[1] * this.worldSize.area + this.worldSize.area / 2,
    };

    const { vec, angle } = getDirection(pathObj, {
      x: enemy.x,
      y: enemy.y,
    });

    enemy.x -= vec.x * enemy.speed * delta;
    enemy.y -= vec.y * enemy.speed * delta;

    enemy.rotation = angle;
  }

  setTileCoords(enemy: Entity) {
    const { current } = enemy.tileCoords;

    const newCoords = {
      x: Math.floor(enemy.x / this.worldSize.area),
      y: Math.floor(enemy.y / this.worldSize.area),
    };

    if (JSON.stringify(newCoords) !== JSON.stringify(current)) {
      console.log(newCoords);

      enemy.tileCoords.previous = {
        ...enemy.tileCoords.current,
      };

      enemy.tileCoords.current = newCoords;

      this.emitter.emit("TILE_CHANGE" as any, newCoords);
    }
  }

  updateEnemy(enemy: Enemy, delta: number) {
    const otherEnemies = this.enemies.filter((e) => e !== enemy);

    for (const otherEnemy of otherEnemies) {
      const { vec, distance } = getEntityDirection(otherEnemy, enemy);

      if (distance < otherEnemy.size * 2) {
        enemy.x += vec.x * enemy.speed * delta;
        enemy.y += vec.y * enemy.speed * delta;
      }
    }
  }

  update(delta: number) {
    for (const enemy of [...this.enemies]) {
      this.playerCollision(enemy, delta);
      this.updateEnemy(enemy, delta);
    }
  }
}
