import { Container } from "pixi.js";
import { getEntityDirection } from "../utils/game";
import Projectile from "./Projectile";

export default class Entity extends Container {
  type = "";
  target?: Entity;

  attackSpeed = 100;
  lastAttackTime = Number.MIN_SAFE_INTEGER;
  attackPower = 1;
  critChance = 1;
  critMultiplier = 1;

  iframes = 1; // seconds
  iframeActive = false;
  hp = 100;
  defence = 0;
  hpRegen = 0;

  speed = 1;
  dodge = 0;
  projectileLifespan = 0;
  size = 50;
  canAttack = false;
  // types

  constructor() {
    super();
    this.on("CHANGE_HP" as any, (newHp) => {
      if (newHp <= 0) {
        this.destroy();
      }
    });
  }

  applyDamage(damage: number) {
    if (!this.iframeActive) {
      this.hp -= damage;
      this.emit("CHANGE_HP" as any, this.hp);
      this.iframeActive = true;
      setTimeout(() => {
        this.iframeActive = false;
      }, this.iframes * 1000);
    }
  }

  getProjectile(entities: Entity[]) {
    if (!this.canAttack) return;
    const target = this.target || entities.find((entity) => entity != this);
    if (!target) {
      return;
    }
    const { vec, angle } = getEntityDirection(target, this);

    const projectile = new Projectile(this.x, this.y, target, vec); // we do this in the entity
    projectile.angle = angle;
    return projectile;
  }
}
