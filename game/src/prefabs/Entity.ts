import { Container, ColorMatrixFilter, Graphics } from "pixi.js";
import { getClosestTarget, getEntityDirection } from "../utils/game";
import Projectile from "./Projectile";
import { wait } from "../utils/misc";

import { OutlineFilter } from "@pixi/filter-outline";
import gsap from "gsap";

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

  colorFilter: ColorMatrixFilter;
  outlineFilter: OutlineFilter;

  constructor() {
    super();

    this.colorFilter = new ColorMatrixFilter();
    this.outlineFilter = new OutlineFilter(5);

    this.addHpBar();

    this.filters = [this.outlineFilter, this.colorFilter];
  }

  addHpBar() {
    const hpBar = new Graphics();

    hpBar.beginFill(0xff0000);

    const hpBarSize = this.size * 2;
    hpBar.drawRect(-hpBarSize / 2, -this.size + 5, this.size * 2, 5);
    hpBar.endFill();

    this.addChild(hpBar);
  }

  async applyDamage(damage: number) {
    if (!this.iframeActive) {
      this.colorFilter.negative(true);

      wait(0.1).then(() => {
        this.colorFilter.reset();
      });

      this.hp -= damage;
      this.emit("CHANGE_HP" as any, this.hp);
      if (this.hp <= 0) {
        await gsap.to(this, {
          pixi: {
            scale: 2,
            alpha: 0,
          },
          duration: 0.2,
          ease: "linear",
        });

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
