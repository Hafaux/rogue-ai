import { Container, Graphics, Text } from "pixi.js";

export default class Player extends Container {
  sprite: Graphics;

  speed = 10;

  velocity: {
    x: number;
    y: number;
  };

  constructor(private hp = 100) {
    super();

    this.velocity = {
      x: 0,
      y: 0,
    };

    this.sprite = new Graphics();

    this.sprite.beginFill(0xff00ff);
    this.sprite.drawCircle(0, 0, 50);
    this.sprite.endFill();

    const text = new Text("PLAYER", {
      fontSize: 20,
    });
    text.x = -40;
    text.y = -20;

    this.addChild(this.sprite, text);
  }
}
