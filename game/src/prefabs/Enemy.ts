import { Container, Graphics, Sprite } from "pixi.js";

export default class Enemy extends Container {
  sprite!: Sprite | Graphics;
  speed = 2;

  constructor(public hp = 100, public type = "normal") {
    super();

    this.sprite = new Graphics();

    const enemySize = 50;

    this.sprite.beginFill(Math.random() * 16777215);
    this.sprite.drawRect(-enemySize / 2, -enemySize / 2, enemySize, enemySize);
    this.sprite.endFill();

    this.addChild(this.sprite);
  }
}
