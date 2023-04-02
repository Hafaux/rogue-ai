import { Graphics, Sprite, Texture } from "pixi.js";
import Entity from "./Entity";

export default class Enemy extends Entity {
  sprite!: Sprite | Graphics;

  constructor(public texture: Texture, public hp = 10) {
    super();
    this.speed = 2;
    this.hp = 100;
    this.defence = 100;
    this.type = "Enemy";

    // this.sprite = new Sprite(texture);
    // this.sprite.scale.set(2);

    this.sprite = new Graphics();

    this.sprite.beginFill(Math.random() * 16777215);
    this.sprite.drawRect(-this.size / 2, -this.size / 2, this.size, this.size);
    this.sprite.endFill();

    this.addChild(this.sprite);
  }
}
