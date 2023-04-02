import { OutlineFilter } from "@pixi/filter-outline";
import { Container, Sprite, Texture } from "pixi.js";

export default class Chest extends Container {
  sprite!: Sprite;
  reward = 5;
  outlineFilter: OutlineFilter;
  claimed = false;

  constructor(public texture: Texture) {
    super();

    this.sprite = new Sprite(texture);
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(2.5);

    this.outlineFilter = new OutlineFilter();

    this.filters = [];

    this.addChild(this.sprite);
  }
}
