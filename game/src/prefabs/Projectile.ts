import { Container, Graphics } from "pixi.js";
import Entity from "./Entity";
import { tryChance } from "../utils/game";
import { OutlineFilter } from "@pixi/filter-outline";

export default class Projectile extends Container {
  sprite: Graphics;
  life = 4;
  speed = 10;
  creatorStats: {
    projectileLifespan: number;
    attackPower: number;
    type: string;
    critChance: number;
    critMultiplier: number;
  } = {
    projectileLifespan: 0,
    attackPower: 0,
    critChance: 0,
    critMultiplier: 0,
    type: "",
  };
  constructor(
    x: number,
    y: number,
    public target: Entity,
    private creator: Entity,
    public direction: Vec2D = {
      x: 0,
      y: 0,
    }
  ) {
    super();

    const outlineFilter = new OutlineFilter(5);
    //
    // this.data = {
    //   ...this.data,
    //   ...
    // }

    for (const key in this.creatorStats) {
      // @ts-ignore
      this.creatorStats[key] = creator[key];
    }

    this.sprite = new Graphics();

    this.filters = [outlineFilter];

    this.position.set(x, y);

    this.sprite.beginFill(0xff0000);
    this.sprite.drawPolygon(0, 0, 20, 40, -20, 40);
    this.sprite.endFill();

    this.addChild(this.sprite);
  }

  checkHit(hitTarget: Entity) {
    // check evasion
    return !tryChance(hitTarget.dodge);
  }

  async onHit(hitTarget: Entity) {
    // apply debufs calculate damage stuff like that
    // resists
    if (hitTarget.destroyed) return;
    let damageValue =
      this.creatorStats.attackPower * (100 / (100 + hitTarget.defence));
    if (tryChance(this.creatorStats.critChance)) {
      damageValue *= this.creatorStats.critMultiplier;
    }
    console.warn(this.creatorStats.attackPower);

    const { killed, killReward } = await hitTarget.applyDamage(
      this.creatorStats.attackPower
    );
    if (killed && !this.creator.destroyed) {
      this.creator.increaseXp(killReward);
    }
  }
}
