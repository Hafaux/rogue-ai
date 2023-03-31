import { Container, Graphics, Sprite } from "pixi.js";

export default class Enemy extends Container {
  sprite!: Sprite | Graphics;

  constructor(public hp = 100) {
    super();

    this.sprite = new Graphics();

    this.sprite.beginFill(Math.random() * 16777215);
    this.sprite.drawRect(0, 0, 50, 50);
    this.sprite.endFill();

    this.addChild(this.sprite);
  }
}
