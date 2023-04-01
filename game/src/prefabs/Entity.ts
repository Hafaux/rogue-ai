import { Container } from "pixi.js";


export default class Entity extends Container {
    attackSpeed = 1;
    attackPower = 1;
    critChance = 1;
    critMultiplier = 1;
    hp = 100;
    defence = 0;
    hpRegen = 0;
    speed = 1;
    dodge = 0;
    range = 0;
    size = 50;
    // types
  
    constructor() {
      super();
    }
  }
  