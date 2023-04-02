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
    this.aStar = new AStarFinder({
      grid: {
        matrix: collisionMatrix,
      },
      diagonalAllowed: false,
    });

    const recalcTargetPath = () => {
      for (const enemy of enemies) {
        try {
          enemy.pathToTarget = this.aStar.findPath(
            enemy.tileCoords.current,
            this.playerRef.tileCoords.current
          );
        } catch {
          //
        }
      }
    };

    this.playerRef.on("TILE_CHANGE" as any, recalcTargetPath);
    this.emitter.on("TILE_CHANGE" as any, recalcTargetPath);
  }

  playerCollision(enemy: Enemy, delta: number) {
    this.setTileCoords(enemy);

    const {
      distance,
      vec: vecPlayer,
      angle: angleToPlayer,
    } = getEntityDirection(this.playerRef, enemy);

    if (distance < 70) {
      this.playerRef.applyDamage(enemy.attackPower);

      return;
    }

    if (enemy.pathToTarget.length <= 1) {
      enemy.rotation = angleToPlayer;

      enemy.x -= vecPlayer.x * enemy.speed * delta;
      enemy.y -= vecPlayer.y * enemy.speed * delta;

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

    // console.warn(distance);

    enemy.rotation = angle;

    enemy.x -= vec.x * enemy.speed * delta;
    enemy.y -= vec.y * enemy.speed * delta;
  }

  setTileCoords(enemy: Entity) {
    const { current } = enemy.tileCoords;

    const newCoords = {
      x: Math.floor(enemy.x / this.worldSize.area),
      y: Math.floor(enemy.y / this.worldSize.area),
    };

    if (JSON.stringify(newCoords) !== JSON.stringify(current)) {
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

      if (distance < otherEnemy.size) {
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
