import { Container, Ticker } from "pixi.js";
import Enemy from "../prefabs/Enemy";
import Player from "../prefabs/Player";
import Projectile from "../prefabs/Projectile";
import { getEntityDistance } from "../utils/game";
import Entity from "../prefabs/Entity";

export default class ProjectileSystem implements System {
  timer = 0;
  projectiles: Map<Entity, Projectile[]> = new Map<Entity, Projectile[]>();

  constructor(
    private entities: Entity[],
    private world: Container
  ) {
    for(const entity of [...entities]) {
      this.projectiles.set(entity, new Array());
    }
    //@ts-ignore
    world.on("ENTITY_SPAWN", (entity: Entity) => {
      this.addEntity(entity);
    });
  }

  addEntity(entity: Entity){
    this.entities.push(entity);
    this.projectiles.set(entity, new Array());
  }

  removeProjectile(entity: Entity, projectile: Projectile) {
    const projectileArray = this.projectiles.get(entity);
    if (projectileArray) {
      projectileArray.splice(
        projectileArray.indexOf(projectile),
        1
      );
    }


    projectile.destroy();
  }

  updateEntityProjectiles(delta: number, entity: Entity) {
    //
    const projectileArray = this.projectiles.get(entity);

    if(projectileArray){
      for (const projectile of [...projectileArray]) {
        // for (const enemy of this.enemies) {
        // }
        const projectileTarget = projectile.target //|| min() 
        const distance = getEntityDistance(projectile, projectileTarget);
  
        //Projectile hit
        if (distance < 20) {
          // entity hit function
          console.warn("HIT ENEMY", projectile.target);
          if(entity.projectileHit(projectileTarget)){
            entity.projectileOnHit(projectileTarget)
            this.removeProjectile(entity, projectile);
            continue;
          }
        }
  
        // projectile dead
        if (projectile.life > entity.projectileLifespan) {
          console.warn("PROJECTILE DEAD");
  
          this.removeProjectile(entity, projectile);
  
          continue;
        }
  
        projectile.life += Ticker.shared.elapsedMS / 1000;
  
        projectile.x -= projectile.direction.x * projectile.speed * delta;
        projectile.y -= projectile.direction.y * projectile.speed * delta;
      }
    }
  }

  spawnProjectile(projectile: Projectile, entityOwner: Entity) {

    projectile.rotation = projectile.angle - Math.PI / 2;

    this.world.addChild(projectile);

    this.projectiles.get(entityOwner)?.push(projectile);

    //console.warn(this.projectiles.get(entityOwner))
  }

  update(delta: number) {
    this.timer += Ticker.shared.elapsedMS / 1000;
    // const elapsedSeconds = (this.startTime - Ticker.shared.elapsedMS) / 1000;
    for (const entity of [...this.entities]) {
  
      this.updateEntityProjectiles(delta, entity);
      if (entity.canAttack && this.timer > entity.attackSpeed + entity.lastAttackTime) {
        const projectile = entity.getProjectile(this.entities);
        if(projectile) {
          this.spawnProjectile(projectile, entity);
        }
        entity.lastAttackTime = this.timer;
      }
    }
  }
}
