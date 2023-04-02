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
    this.attackSpeed = 0.5;
    this.attackPower = 100;
    this.speed = 10;
    this.size = 30;

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
}
