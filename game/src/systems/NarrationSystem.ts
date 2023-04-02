import { Ticker } from "@pixi/ticker";
import { Narration, Narrator } from "@rogueai/backend/src/narrator/narrator";
import {} from "@rogueai/backend/src/router";
import { assert } from "console";
import { Howl } from "howler";
import { normalize } from "path/posix";
import trpc from "../core/trpc";

export default class NarrationSystem implements System {
  narrations: Narration[] = [];
  playerId: string;
  fetching: boolean;
  playing: boolean;

  cooldown = false;

  currentSound: Howl | null = null;

  constructor(playerId: string) {
    console.log("Constructing NarrationSystem");
    this.playerId = playerId;
    this.fetching = false;
    this.playing = false;
  }

  update(delta: number) {
    // console.log(`NarrationSystem: prefetch size = ${this.narrations.length}`);
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

  grabNarration(narrationEvent: string) {
    if (this.currentSound?.playing) return null;

    for (const narration of [...this.narrations]) {
      console.warn(narration);

      if (narration.event == narrationEvent) {
        this.narrations.splice(this.narrations.indexOf(narration), 1);

        // trpc.storeNarration
        //   .query({
        //     playerId: this.playerId,
        //     narrationSerial: JSON.stringify(narration),
        //   })
        //   .then(() => {
        //     this.narrations.splice(this.narrations.indexOf(narration), 1);
        //   });

        // FIXME: Move somewhere
        console.warn("EXPECT VOICE (maybe)", this.currentSound, narration);
        if (narration.audio_file?.length) {
          this.playing = true;
          this.currentSound = new Howl({
            src: [narration.audio_file],
            html5: true, // A live stream can only be played through HTML5 Audio.
            format: ["mp3"],
          });

          this.currentSound.play();
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
