import { Ticker } from "pixi.js";
import Projectile from "../prefabs/Projectile";
import { getEntityDistance } from "../utils/game";

export default class ProjectileMoveSystem implements System {
  timer = 0;

  constructor(private projectiles: Projectile[]) {}

  updateProjectile(delta: number, projectile: Projectile) {
    // projectile dead
    if (projectile.life > projectile.creatorStats.projectileLifespan) {
      console.warn("PROJECTILE DEAD");

      projectile.destroy();
      return;
    }

    if (!projectile.target.destroyed) {
      const distance = getEntityDistance(projectile, projectile.target);

      //Projectile hit
      if (distance < 20) {
        // entity hit function
        console.warn("HIT ENEMY", projectile.target);
        if (projectile.checkHit()) {
          projectile.onHit(projectile.target);
          projectile.destroy();
          return;
        }
      }
    }

    projectile.life += Ticker.shared.elapsedMS / 1000;

    projectile.x -= projectile.direction.x * projectile.speed * delta;
    projectile.y -= projectile.direction.y * projectile.speed * delta;
  }

  //
  // }

  update(delta: number) {
    for (const projectile of [...this.projectiles]) {
      this.updateProjectile(delta, projectile);
    }
  }
}
