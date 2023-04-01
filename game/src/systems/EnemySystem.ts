import Enemy from "../prefabs/Enemy";
import Player from "../prefabs/Player";
import { getEntityDirection } from "../utils/game";

export default class EnemySystem implements System {
  constructor(private enemies: Enemy[], private playerRef: Player) {
    //
  }

  playerCollision(enemy: Enemy, delta: number) {
    const { vec, distance, angle } = getEntityDirection(this.playerRef, enemy);

    enemy.rotation = angle;

    const distanceToPlayer = this.playerRef.size * 2;

    if (distance < distanceToPlayer) {
      // player hit
      enemy.x += vec.x * enemy.speed * delta;
      enemy.y += vec.y * enemy.speed * delta;
      this.playerRef.applyDamage(enemy.attackPower);
    } else {
      enemy.x -= vec.x * enemy.speed * delta;
      enemy.y -= vec.y * enemy.speed * delta;
    }
  }

  enemyCollision(enemy: Enemy, delta: number) {
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
      this.enemyCollision(enemy, delta);
    }
  }
}
