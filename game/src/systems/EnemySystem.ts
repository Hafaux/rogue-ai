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

  update(delta: number) {
    for (const enemy of this.enemies) {
      const x = this.playerRef.x - enemy.x;
      const y = this.playerRef.y - enemy.y;

      const vecSize = Math.sqrt(x * x + y * y);

      const normalizedX = x / vecSize;
      const normalizedY = y / vecSize;

      const angle = Math.atan2(y, x);

      enemy.rotation = angle;

      if (vecSize < 100) {
        enemy.x -= normalizedX * enemy.speed * delta;
        enemy.y -= normalizedY * enemy.speed * delta;
      } else {
        enemy.x += normalizedX * enemy.speed * delta;
        enemy.y += normalizedY * enemy.speed * delta;
      }
    }
  }
}
