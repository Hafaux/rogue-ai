import { Container } from "pixi.js";
import Player from "../prefabs/Player";
import StatElement from "../ui/StatElement";

export default class UiSystem implements System {
  constructor(private player: Player, private uiContainer: Container) {
    this.initUi();
    //
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(delta: number) {
    //
  }

  initUi() {
    const hp = new StatElement("HP", 100, {
      alpha: 0.8,
    });

    this.player.on("CHANGE_HP" as any, (newHp: number) => {
      hp.update(newHp);
    });

    const xp = new StatElement("XP", 0, {
      alpha: 0.8,
      valueColor: 0x8888ff,
    });

    const level = new StatElement("LEVEL", 1, {
      valueColor: 0xff00ff,
    });

    const stats = new Container();

    const skillPointText = new StatElement("SKILL POINTS", 0, {
      labelColor: 0xff00ff,
      valueColor: 0xffff00,
    });

    stats.addChild(skillPointText);

    // const statsMap = {

    // }

    skillPointText.visible = false;

    skillPointText.y -= 200;
    skillPointText.x -= 110;

    this.player.on("CHANGE_XP" as any, () => {
      const newXp = ++xp.value;

      if (newXp >= 5) {
        level.update(++level.value);
        this.player.skillPoints++;

        skillPointText.update(this.player.skillPoints);

        skillPointText.visible = true;

        xp.update(0);
      } else {
        xp.update(newXp);
      }
    });

    level.scale.set(1.5);

    level.x = window.innerWidth / 2 - level.width / 2;

    xp.y = hp.height;
    this.uiContainer.addChild(hp, xp, level);

    const onPointAdd = (el: StatElement) => {
      if (!this.player.skillPoints) return false;

      this.player.skillPoints--;

      skillPointText.update(this.player.skillPoints);

      if (!this.player.skillPoints) {
        skillPointText.visible = true;
      }

      console.warn(el.value + el.addAmount, el.label);
      // Lord forgive me, for I have absolutely no time left to refactor this before the deadline
      switch (el.label) {
        case "ATK SPD": {
          this.player.attackSpeed = el.value + el.addAmount;

          break;
        }
        case "ATK PWR": {
          this.player.attackPower = el.value + el.addAmount;

          break;
        }
        case "CRT CHC": {
          this.player.critChance = el.value + el.addAmount;

          break;
        }
        case "DEF": {
          this.player.defence = el.value + el.addAmount;

          break;
        }
        case "SPD": {
          this.player.speed = el.value + el.addAmount;

          break;
        }
        case "DDG": {
          this.player.dodge = el.value + el.addAmount;

          break;
        }
      }

      return true;
    };

    const attackPower = new StatElement(
      "ATK PWR",
      this.player.attackPower,
      {
        valueColor: 0xbb0000,
      },
      10,
      onPointAdd
    );

    const attackSpeed = new StatElement(
      "ATK SPD",
      this.player.attackSpeed,
      {
        valueColor: 0xbb0000,
      },
      0.5,
      onPointAdd
    );

    const critChance = new StatElement(
      "CRT CHC",
      this.player.critChance,
      {
        valueColor: 0xbb0000,
      },
      1,
      onPointAdd
    );

    const defence = new StatElement(
      "DEF",
      this.player.defence,
      {
        valueColor: 0xbb0000,
      },
      5,
      onPointAdd
    );

    const speed = new StatElement(
      "SPD",
      this.player.speed,
      {
        valueColor: 0xbb0000,
      },
      1,
      onPointAdd
    );

    const dodge = new StatElement(
      "DDG",
      this.player.speed,
      {
        valueColor: 0xbb0000,
      },
      1,
      onPointAdd
    );
    // have to hardcode them :(
    attackSpeed.y -= attackPower.height * 2;
    critChance.y -= attackPower.height;

    defence.y -= attackPower.height * 2;
    speed.y -= speed.height;

    dodge.x -= attackPower.width;
    speed.x -= attackPower.width;
    defence.x -= attackPower.width;
    stats.addChild(speed, critChance, dodge, attackPower, attackSpeed, defence);

    stats.scale.set(0.9);

    stats.x = window.innerWidth - 300;
    stats.y = window.innerHeight - stats.height;

    this.uiContainer.addChild(stats);
  }
}
