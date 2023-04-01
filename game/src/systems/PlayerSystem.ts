import Keyboard from "../core/Keyboard";
import Player from "../prefabs/Player";

export default class PlayerSystem implements System {
  private keyboard = Keyboard.getInstance();

  movementState: {
    UP: boolean;
    DOWN: boolean;
    LEFT: boolean;
    RIGHT: boolean;
  };

  constructor(private player: Player) {
    this.keyboard.onAction(({ action, buttonState }) => {
      if (buttonState === "pressed") this.onActionPress(action);
      else if (buttonState === "released") this.onActionRelease(action);
    });

    this.movementState = {
      UP: false,
      DOWN: false,
      LEFT: false,
      RIGHT: false,
    };
  }

  private onActionPress(action: keyof typeof Keyboard.actions) {
    switch (action) {
      case "LEFT":
      case "RIGHT":
      case "UP":
      case "DOWN": {
        this.movementState[action] = true;

        break;
      }

      // case "JUMP":
      // case "SHIFT":
      default:
        break;
    }
  }

  onActionRelease(action: keyof typeof Keyboard.actions) {
    switch (action) {
      case "LEFT":
      case "RIGHT":
      case "UP":
      case "DOWN": {
        this.movementState[action] = false;

        break;
      }
    }
  }

  stopMovement() {
    this.player.velocity.x = 0;
    this.player.velocity.y = 0;
  }

  update(delta: number) {
    // refactor later?
    const xMovement = this.movementState.LEFT
      ? -this.player.speed
      : this.movementState.RIGHT
      ? this.player.speed
      : 0;

    const yMovement = this.movementState.UP
      ? -this.player.speed
      : this.movementState.DOWN
      ? this.player.speed
      : 0;

    this.player.x += xMovement * delta;
    this.player.y += yMovement * delta;

    // if (this.player.x < 0) {
    //   this.player.x = 0;
    // } else if (this.player.x > window.innerWidth) {
    //   this.player.x = window.innerWidth;
    // }

    // if (this.player.y < 0) {
    //   this.player.y = 0;
    // } else if (this.player.y > window.innerHeight) {
    //   this.player.y = window.innerHeight;
    // }
  }
}
