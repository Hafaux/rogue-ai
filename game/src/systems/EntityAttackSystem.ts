import { Ticker } from "@pixi/ticker";
import Entity from "../prefabs/Entity";
import Projectile from "../prefabs/Projectile";

export default class EntityAttackSystem implements System {
  timer = 0;
  constructor(
    private entities: Entity[],
    private registerProjectile: (projectile: Projectile) => void,
    private availableTargets: Map<string, Entity[]>
  ) {
    //
  }

  update(delta: number) {
    this.timer += Ticker.shared.elapsedMS / 1000;
    // const elapsedSeconds = (this.startTime - Ticker.shared.elapsedMS) / 1000;
    for (const entity of [...this.entities]) {
      if (
        entity.canAttack &&
        this.timer > 1 / entity.attackSpeed + entity.lastAttackTime
      ) {
        const availableTargets = this.availableTargets.get(entity.type);
        if (availableTargets) {
          const projectile = entity.getProjectile(availableTargets);
          if (projectile) {
            projectile.rotation = projectile.angle - Math.PI / 2;
            this.registerProjectile(projectile);
          }
        }
        entity.lastAttackTime = this.timer;
      }
    }
  }
}
