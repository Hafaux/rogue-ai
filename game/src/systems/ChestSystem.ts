import Chest from "../prefabs/Chest";
import Player from "../prefabs/Player";
import { getEntityDistance } from "../utils/game";
import gsap from "gsap";

export default class ChestSystem implements System {
  constructor(private chests: Chest[], private playerRef: Player) {}
  async update(delta: number) {
    for (const chest of [...this.chests]) {
      const distance = getEntityDistance(chest, this.playerRef);

      if (distance > 1000 && chest.filters?.length) {
        chest.filters = [];
      }

      // if (!chest.filters?.length) chest.filters = [chest.outlineFilter];

      //Projectile hit
      if (distance < 70) {
        this.playerRef.increaseXp(chest.reward);

        await gsap.to(chest, {
          pixi: {
            scale: 2,
            alpha: 0,
          },
          ease: "linear",
          duration: 0.2,
        });

        chest.destroy();
      }
    }
  }
}
