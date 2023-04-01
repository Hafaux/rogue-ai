import { Graphics, Sprite } from "pixi.js";
import Entity from "./Entity"

export default class Enemy extends Entity {
  sprite!: Sprite | Graphics;

  constructor(public hp = 100, public type = "normal") {
    super();
    this.speed = 2;
    this.sprite = new Graphics();
    this.type = "Enemy";

    this.sprite.beginFill(Math.random() * 16777215);
    this.sprite.drawRect(-this.size / 2, -this.size / 2, this.size, this.size);
    this.sprite.endFill();

    this.addChild(this.sprite);
  }
}
