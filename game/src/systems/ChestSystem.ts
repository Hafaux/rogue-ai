import Chest from "../prefabs/Chest";
import Player from "../prefabs/Player";
import { getEntityDistance } from "../utils/game";

export default class ChestSystem implements System {
  constructor(private chests: Chest[], private playerRef: Player) {}
  update(delta: number) {
    for (const chest of [...this.chests]) {
      const distance = getEntityDistance(chest, this.playerRef);

      //Projectile hit
      if (distance < 70) {
        this.playerRef.increaseXp(chest.reward);
        chest.destroy();
      }
    }
  }
}
