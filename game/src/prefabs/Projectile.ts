import { Container, Graphics } from "pixi.js";
import Entity from "./Entity";

export default class Projectile extends Container {
  sprite: Graphics;
  life = 0;
  speed = 5;

  constructor(
    x: number,
    y: number,
    public target: Entity,
    public direction: Vec2D = {
      x: 0,
      y: 0,
    }
  ) {
    super();
    //
    this.sprite = new Graphics();

    this.position.set(x, y);

    this.sprite.beginFill(0xff0000);
    this.sprite.drawPolygon(0, 0, 20, 40, -20, 40);
    this.sprite.endFill();

    this.addChild(this.sprite);
  }
}
