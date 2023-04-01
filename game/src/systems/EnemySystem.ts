import { Container } from "pixi.js";
import Enemy from "../prefabs/Enemy";
import Player from "../prefabs/Player";

export default class EnemySystem implements System {
  enemies: Enemy[] = [];

  constructor(private world: Container, private playerRef: Player) {
    //
  }

  spawnEnemy(x = 0, y = 0) {
    const enemy = new Enemy();

    enemy.x = x;
    enemy.y = y;

    this.enemies.push(enemy);

    this.world.addChild(enemy);
  }

  getEntityDirection(entity: Container, targetEntity: Container) {
    const x = targetEntity.x - entity.x;
    const y = targetEntity.y - entity.y;

    const vecSize = Math.sqrt(x * x + y * y);

    const normalizedX = x / vecSize;
    const normalizedY = y / vecSize;

    const angle = Math.atan2(y, x);

    return {
      vec: {
        x: normalizedX,
        y: normalizedY,
      },
      distance: vecSize,
      angle,
    };
  }

  playerCollision(enemy: Enemy, delta: number) {
    const { vec, distance, angle } = this.getEntityDirection(
      this.playerRef,
      enemy
    );

    enemy.rotation = angle;

    const distanceToPlayer = 100;

    if (distance < distanceToPlayer) {
      enemy.x += vec.x * enemy.speed * delta;
      enemy.y += vec.y * enemy.speed * delta;
    } else {
      enemy.x -= vec.x * enemy.speed * delta;
      enemy.y -= vec.y * enemy.speed * delta;
    }
  }

  enemyCollision(enemy: Enemy, delta: number) {
    const otherEnemies = this.enemies.filter((e) => e !== enemy);

    const distanceToEntity = 60;

    for (const otherEnemy of otherEnemies) {
      const { vec, distance } = this.getEntityDirection(otherEnemy, enemy);

      if (distance < distanceToEntity) {
        enemy.x += vec.x * enemy.speed * delta;
        enemy.y += vec.y * enemy.speed * delta;
      }
    }
  }

  update(delta: number) {
    for (const enemy of this.enemies) {
      this.playerCollision(enemy, delta);

      this.enemyCollision(enemy, delta);
    }
  }
}
