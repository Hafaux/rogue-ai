import { Container, ColorMatrixFilter } from "pixi.js";
import { getClosestTarget, getEntityDirection } from "../utils/game";
import Projectile from "./Projectile";
import { wait } from "../utils/misc";

export default class Entity extends Container {
  type = "";
  target?: Entity;

  killReward = 1;
  xp = 0;
  level = 1;

  attackSpeed = 100;
  lastAttackTime = Number.MIN_SAFE_INTEGER;
  attackPower = 1;
  critChance = 0;
  critMultiplier = 2;

  pathToTarget: number[][] = [];
  currentPathTarget: {
    x: number;
    y: number;
  } = {
    x: 0,
    y: 0,
  };

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

  tileCoords: {
    current: {
      x: number;
      y: number;
    };
    previous: {
      x: number;
      y: number;
    };
  } = {
    current: {
      x: 0,
      y: 0,
    },
    previous: {
      x: 0,
      y: 0,
    },
  };

  filter: ColorMatrixFilter;

  constructor() {
    super();

    this.filter = new ColorMatrixFilter();

    this.filters = [this.filter];
  }

  applyDamage(damage: number) {
    if (!this.iframeActive) {
      this.filter.sepia(true);

      wait(0.2).then(() => {
        this.filter.reset();
      });

      this.hp -= damage;
      this.emit("CHANGE_HP" as any, this.hp);
      if (this.hp <= 0) {
        this.destroy();
        return { killed: true, killReward: this.killReward };
      }
      this.iframeActive = true;
      setTimeout(() => {
        this.iframeActive = false;
      }, this.iframes * 1000);
    }
    return { killed: false, killReward: 0 };
  }

  getProjectile(availableTargets: Entity[]) {
    if (!this.canAttack) return;
    const target = getClosestTarget(this, availableTargets);
    if (!target) {
      return;
    }
    const { vec, angle } = getEntityDirection(target, this);

    const projectile = new Projectile(this.x, this.y, target, this, vec); // we do this in the entity
    projectile.angle = angle;
    return projectile;
  }

  increaseXp(xpAmountIncrease: number) {
    this.xp += xpAmountIncrease;
    this.emit("CHANGE_XP" as any, this.xp);
  }
}
