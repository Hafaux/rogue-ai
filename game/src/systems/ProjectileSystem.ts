import { Container, Ticker } from "pixi.js";
import Enemy from "../prefabs/Enemy";
import Player from "../prefabs/Player";
import Projectile from "../prefabs/Projectile";
import { getEntityDirection, getEntityDistance } from "../utils/game";

export default class ProjectileSystem implements System {
  timer = 0;
  startTime = 0;
  shootFrequency: number;
  projectiles: {
    player: Projectile[];
    enemy: Projectile[];
  } = {
    player: [],
    enemy: [],
  };

  constructor(
    private enemies: Enemy[],
    private player: Player,
    private world: Container
  ) {
    //
    this.shootFrequency = 1;
  }

  updateEnemyProjectiles() {
    //
  }

  removeProjectile(projectile: Projectile) {
    this.projectiles.player.splice(
      this.projectiles.player.indexOf(projectile),
      1
    );

    projectile.destroy();
  }

  updatePlayerProjectiles(delta: number) {
    //
    for (const projectile of [...this.projectiles.player]) {
      // for (const enemy of this.enemies) {
      // }
      const distance = getEntityDistance(projectile, projectile.target);

      // Projectile hit
      if (distance < 20) {
        console.warn("HIT ENEMY", projectile.target);

        this.removeProjectile(projectile);

        continue;
      }

      // projectile dead
      if (projectile.life > 2.5) {
        console.warn("PROJECTILE DEAD");

        this.removeProjectile(projectile);

        continue;
      }

      projectile.life += Ticker.shared.elapsedMS / 1000;

      projectile.x -= projectile.direction.x * projectile.speed * delta;
      projectile.y -= projectile.direction.y * projectile.speed * delta;
    }
  }

  spawnPlayerProjectiles() {
    const closestEnemy = this.enemies[0];

    const { vec, angle } = getEntityDirection(closestEnemy, this.player);

    const projectile = new Projectile(
      this.player.x,
      this.player.y,
      closestEnemy,
      vec
    );

    projectile.rotation = angle - Math.PI / 2;

    this.world.addChild(projectile);

    this.projectiles.player.push(projectile);
  }

  update(delta: number) {
    // const elapsedSeconds = (this.startTime - Ticker.shared.elapsedMS) / 1000;
    this.startTime += Ticker.shared.elapsedMS / 1000;

    this.updatePlayerProjectiles(delta);

    if (this.startTime > this.shootFrequency) {
      this.spawnPlayerProjectiles();
      this.startTime = 0;
    }
  }
}
