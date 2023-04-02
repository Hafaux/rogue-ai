import { Ticker } from "pixi.js";
import Projectile from "../prefabs/Projectile";
import Game from "../scenes/Game";
import { getEntityDistance } from "../utils/game";
import NarrationSystem from "./NarrationSystem";

export default class ProjectileMoveSystem implements System {
  timer = 0;

  constructor(
    private projectiles: Projectile[],
    private narrationSystemRef: NarrationSystem
  ) {}

  updateProjectile(delta: number, projectile: Projectile) {
    // projectile dead
    if (projectile.life > projectile.creatorStats.projectileLifespan) {
      projectile.destroy();
      return;
    }

    if (!projectile.target.destroyed) {
      const distance = getEntityDistance(projectile, projectile.target);

      //Projectile hit
      if (distance < 50) {
        // entity hit function
        if (projectile.checkHit(projectile.target)) {
          projectile.onHit(projectile.target);
        } else {
          try {
            this.narrationSystemRef.grabNarration("dodge");
          } catch (e) {
            console.warn("FAILED TO GRAB VOICE FROM SERVER", e);
          }
        }
        projectile.destroy();
        return;
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
