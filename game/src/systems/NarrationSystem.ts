import { Ticker } from "@pixi/ticker";
import { Narration, Narrator } from "@rogueai/backend/src/narrator/narrator";
import {} from "@rogueai/backend/src/router";
import { assert } from "console";
import { Howl } from "howler";
import { normalize } from "path/posix";
import trpc from "../core/trpc";

export default class NarrationSystem implements System {
  playerId: string;
  fetching: boolean;
  playing: boolean;

  constructor(playerId: string, private narrations: Narration[]) {
    console.log("Constructing NarrationSystem");
    this.playerId = playerId;
    this.fetching = false;
    this.playing = false;
  }

  update(delta: number) {
    console.log(`NarrationSystem: prefetch size = ${this.narrations.length}`);
    if (this.narrations.length <= 3 && !this.fetching) {
      this.fetchNarrations();
      // console.warn("Narration system: fetching narrations");
    }

    // assert(
    //   this.narrations.length >= 3,
    //   "Narrations are not prefetched correctly."
    // );
  }

  async fetchNarrations() {
    if (this.fetching) return;
    this.fetching = true;
    const narrationsSerial: string = await trpc.getNarration.query({
      playerId: this.playerId,
    });

    for (const narration of JSON.parse(narrationsSerial)) {
      this.narrations.push(narration);
    }
    this.fetching = false;
    // assert(this.narrations.length >= 3);
  }

  grabNarration(narrationEvent: string): Narration | undefined {
    if (this.narrations.length <= 0) return;
    for (const narration of [...this.narrations]) {
      if (narration.event == narrationEvent) {
        trpc.storeNarration.query({
          playerId: this.playerId,
          narrationSerial: JSON.stringify(narration),
        });

        // FIXME: Move somewhere
        console.warn(`EXPECT VOICE (maybe)`);
        if (narration.audio_file?.length && !this.playing) {
          this.playing = true;
          const audio = new Howl({
            src: [narration.audio_file],
            html5: true, // A live stream can only be played through HTML5 Audio.
            format: ["mp3"],
          });
          audio.play();
          audio.on("stop", () => {
            this.playing = false;
            this.narrations.splice(this.narrations.indexOf(narration), 1);
          });
        }

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
