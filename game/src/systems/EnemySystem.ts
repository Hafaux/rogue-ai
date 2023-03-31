import { Container } from "pixi.js";
import Enemy from "../prefabs/Enemy";
import { Player } from "../prefabs/Player";

export default class EnemySystem implements System {
  enemies: Enemy[] = [];

  constructor(private world: Container, private playerReference: Player) {
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
      // console.log(enemy, this.playerReference, delta);
    }
  }
}
