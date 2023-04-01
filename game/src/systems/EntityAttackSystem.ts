import { Ticker } from "@pixi/ticker";
import Entity from "../prefabs/Entity";
import Projectile from "../prefabs/Projectile";

export default class EntityAttackSystem implements System {
  timer = 0;
  constructor(
    private entities: Entity[],
    private registerProjectile: (projectile: Projectile) => void
  ) {
    //
  }

  update(delta: number) {
    this.timer += Ticker.shared.elapsedMS / 1000;
    // const elapsedSeconds = (this.startTime - Ticker.shared.elapsedMS) / 1000;
    for (const entity of [...this.entities]) {
      if (
        entity.canAttack &&
        this.timer > entity.attackSpeed + entity.lastAttackTime
      ) {
        const projectile = entity.getProjectile(this.entities);
        if (projectile) {
          projectile.rotation = projectile.angle - Math.PI / 2;
          this.registerProjectile(projectile);
        }
        entity.lastAttackTime = this.timer;
      }
    }
  }
}
