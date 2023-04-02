import { Graphics } from "pixi.js";
import Entity from "./Entity";

export default class Player extends Entity {
  sprite: Graphics;

  velocity: {
    x: number;
    y: number;
  };

  skillPoints = 0;

  mapIndex = 0;

  constructor(public hp = 100) {
    super();
    this.type = "Player";
    this.canAttack = true;
    this.projectileLifespan = 5;
    this.attackSpeed = 1;
    this.attackPower = 100;
    this.speed = 10;
    this.size = 30;
    this.defence = 100;

    this.iframes = 0.4;

    this.velocity = {
      x: 0,
      y: 0,
    };
    this.sprite = new Graphics();

    this.tileCoords.current = {
      x: 0,
      y: 0,
    };

    this.tileCoords.previous = {
      x: 0,
      y: 0,
    };

    this.sprite.beginFill(0xff00ff);
    this.sprite.drawCircle(0, 0, this.size);
    this.sprite.endFill();

    this.addChild(this.sprite);
  }
  applyDamage(damage: number) {
    const result = super.applyDamage(damage);

    return result;
  }

  addHpBar() {
    const hpBarSize = this.size * 4;

    this.hpBar = new Graphics();

    this.hpBar.beginFill(0xff0000);
    this.hpBar.drawRect(-hpBarSize / 2, -this.size + 5, hpBarSize, 10);
    this.hpBar.endFill();

    const hpBar2 = new Graphics();

    hpBar2.beginFill(0xbebe);
    hpBar2.drawRect(-hpBarSize / 2 - 1, -this.size + 3, hpBarSize + 2, 14);

    hpBar2.endFill();

    this.addChild(hpBar2, this.hpBar);
  }
}
