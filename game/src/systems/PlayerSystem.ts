import Keyboard from "../core/Keyboard";
import Player from "../prefabs/Player";
import trpc from "../core/trpc";

export default class PlayerSystem implements System {
  private keyboard = Keyboard.getInstance();

  private static idCounter: number = -1;

  public static idNext(): string {
    this.idCounter++;
    return this.idCounter.toString();
  }

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
    },
    private playerId: string
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

    const getMappedCoords = (
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
      let x =
        Math.floor(
          (this.player.x + xMovement * delta + width / 2) / this.worldSize.area
        ) % this.worldSize.tileSize;

      let y =
        Math.floor(
          (this.player.y + yMovement * delta + height / 2) / this.worldSize.area
        ) % this.worldSize.tileSize;

      if (x < 0) x = this.worldSize.tileSize + x;
      if (y < 0) y = this.worldSize.tileSize + y;

      return {
        x,
        y,
      };
    };

    const newCoordsCenter = getMappedCoords();

    if (
      JSON.stringify(newCoordsCenter) !==
      JSON.stringify(this.player.tileCoords.current)
    ) {
      this.player.tileCoords.previous = {
        ...this.player.tileCoords.current,
      };

      this.player.tileCoords.current = newCoordsCenter;

      this.player.emit("TILE_CHANGE" as any, newCoordsCenter);
    }

    const directions = [
      [1, 1],
      [-1, 1],
      [-1, -1],
      [1, -1],
    ];

    const colliders = directions.map(([x, y]) => {
      const coords = getMappedCoords({
        width: x * this.player.width,
        height: y * this.player.height,
      });

      return this.collisionMatrix[coords.y][coords.x];
    });

    if (colliders.find(Boolean)) return;

    this.player.x += xMovement * delta;
    this.player.y += yMovement * delta;
  }
}
