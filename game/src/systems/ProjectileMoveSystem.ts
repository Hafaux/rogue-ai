import { Ticker } from "pixi.js";
import Projectile from "../prefabs/Projectile";
import { getEntityDistance } from "../utils/game";

export default class ProjectileMoveSystem implements System {
  timer = 0;

  constructor(private projectiles: Projectile[]) {}

  removeProjectile(projectile: Projectile) {
    this.projectiles.splice(this.projectiles.indexOf(projectile), 1);
    projectile.destroy();
  }

  updateEntityProjectile(delta: number, projectile: Projectile) {
    //
    // for (const enemy of this.enemies) {
    // }
    const projectileTarget = projectile.target; //|| min()
    const distance = getEntityDistance(projectile, projectileTarget);

    //Projectile hit
    if (distance < 20) {
      // entity hit function
      console.warn("HIT ENEMY", projectile.target);
      if (projectile.checkHit()) {
        projectile.onHit(projectileTarget);
        this.removeProjectile(projectile);
        return;
      }
    }

    // projectile dead
    if (projectile.life > projectile.data.projectileLifespan) {
      console.warn("PROJECTILE DEAD");

      this.removeProjectile(projectile);

      return;
    }

    projectile.life += Ticker.shared.elapsedMS / 1000;

    projectile.x -= projectile.direction.x * projectile.speed * delta;
    projectile.y -= projectile.direction.y * projectile.speed * delta;
  }

  //
  // }

  update(delta: number) {
    for (const projectile of [...this.projectiles]) {
      this.updateEntityProjectile(delta, projectile);
    }
  }
}
