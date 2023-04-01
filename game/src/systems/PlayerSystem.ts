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

  constructor(
    private player: Player,
    private collisionMatrix: Array<number>[],
    private worldSize: {
      tileSize: number;
      scale: number;
      readonly area: number;
    }
  ) {
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

    const getNewCoords = (
      {
        width,
        height,
      }: {
        width: number;
        height: number;
      } = {
        width: 0,
        height: 0,
      }
    ) => {
      return {
        x: Math.floor(
          (this.player.x + xMovement * delta + width / 2) / this.worldSize.area
        ),
        y: Math.floor(
          (this.player.y + yMovement * delta + height / 2) / this.worldSize.area
        ),
      };
    };

    const newCoords = getNewCoords(this.player);
    const newCoordsRaw = getNewCoords();
    const newCoordsMirror = getNewCoords({
      width: -this.player.width,
      height: -this.player.height,
    });

    if (
      JSON.stringify(newCoordsRaw) !==
      JSON.stringify(this.player.tileCoords.current)
    ) {
      this.player.tileCoords.previous = {
        ...this.player.tileCoords.current,
      };

      this.player.tileCoords.current = newCoordsRaw;

      this.player.emit("TILE_CHANGE" as any, newCoords);
    }

    const colliding = this.collisionMatrix[newCoords.y][newCoords.x];
    const collidingMirror =
      this.collisionMatrix[newCoordsMirror.y][newCoordsMirror.x];

    if (colliding || collidingMirror) {
      return;
    }
    this.player.x += xMovement * delta;
    this.player.y += yMovement * delta;
  }
}
