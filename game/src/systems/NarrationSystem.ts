import { Ticker } from "@pixi/ticker";
import { Narration, Narrator } from "@rogueai/backend/src/narrator/narrator";
import {} from "@rogueai/backend/src/router";
import { assert } from "console";
import { normalize } from "path/posix";
import trpc from "../core/trpc";

export default class NarrationSystem implements System {
  narrations: Narration[] = [];
  playerId: string;
  waiting: boolean = false;
  startTime: number = 0;
  endTime: number = 0;

  // Limit comments to 1 each 10 seconds.
  available: boolean = true;

  constructor(playerId: string) {
    this.playerId = playerId;
    this.startTime = Ticker.shared.elapsedMS / 1000;
    this.endTime = this.startTime;

    this.update(0);
  }

  update(delta: number) {
    if (this.narrations.length <= 3) {
      this.fetchNarrations();
    }

    // assert(
    //   this.narrations.length >= 3,
    //   "Narrations are not prefetched correctly."
    // );
  }

  async fetchNarrations() {
    this.waiting = true;
    const narrationsSerial = await trpc.getNarration.query({
      playerId: this.playerId,
    });
    for (const narration of JSON.parse(narrationsSerial)) {
      this.narrations.push(narration);
    }
    this.waiting = false;
    // assert(this.narrations.length >= 3);
  }

  grabNarration(narrationEvent: string): Narration {
    for (const narration of [...this.narrations]) {
      if (narration.event == narrationEvent) {
        trpc.storeNarration
          .query({
            playerId: this.playerId,
            narrationSerial: JSON.stringify(narration),
          })
          .then(() => {
            this.narrations.splice(this.narrations.indexOf(narration), 1);
          });
        return narration;
      }
    }

    // assert(false, "unreachable");
    return {
      event: narrationEvent,
      response: "",
      audio_file: "",
      details: "",
    };
  }
}
