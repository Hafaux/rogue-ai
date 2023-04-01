import { Graphics, Text } from "pixi.js";
import Entity from "./Entity";

export default class Player extends Entity {
  sprite: Graphics;

  velocity: {
    x: number;
    y: number;
  };

  constructor(public hp = 100) {
    super();
    
    this.speed = 10;
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.sprite = new Graphics();

    this.sprite.beginFill(0xff00ff);
    this.sprite.drawCircle(0, 0, this.size);
    this.sprite.endFill();

    const text = new Text("PLAYER", {
      fontSize: 20,
    });
    text.x = -40;
    text.y = -20;

    this.addChild(this.sprite, text);
  }
}
