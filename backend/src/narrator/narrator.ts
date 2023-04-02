import { assert } from "console";
import {
  ElevenLabsController,
  CAVE_JOHNSON_NAME,
  WHEATLEY_NAME,
} from "../api/elevenlabs_controller";
import { GptController } from "../api/gpt_controller";
import * as imaginaryNarrationsIncluded from "./imaginary.json";
import * as voicesIncluded from "./voices.json";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

// Spec :D
// -------
// getNarrations({ playerId: id, possibleEvents: Event[] }) -> { narrationId }[]
// usedNarration(narrationId) -> dobavq kum staka s izpolzvani naracii
// array: players { usedNarration, id }
// const narrations = {}
//
// getNarrations(["hit", "dodge", "taunt"]) -> [{id: 1, "you got hit! haha!"}, {id: 2, ""}, {id: 3, "do better next time"}]
// usedNarration(1)
// buffer: [{event: "hit", answer: "you got hit! haha!"}]
// getNarrations(["hit", "dodge", "taunt"])
// chatgpt:
// Player got hit
// Narrator: you got hit! haha!
// Player got hit
// Narrator: ...
// chatgpt completes with "you got hit again!"
// -> [{id: 4, answer: "you got hit again!"}, ...]

const AUDIO_DIR_PATH = path.join("src", "narrator", "audio");

export const narrationBatchSize: number = 2;
const narrationFeedSize: number = 10;

export interface Narration {
  response: string;
  audio_file: string;
  event: string;
}

export interface Voice {
  name: string;
  id: string;
}

export class Narrator {
  private static narratorName = "Narrator (You)";

  private static narrationMarkers = ["player performs poorly"];

  public static eventTransforms: Map<string, (a: string, b: string) => string>;

  private static narrationsPerPrompt = 3;

  private static narrationPromptBegin = `
You are the announcer for an event that puts a player against multiple enemies in a fight in a rogue-like game.
The scene is a`;

  private static narrationPromptEnd = `
The player quite often performs a specific action poorly. You, as a narrator of the event, favoring his
opponents, are supposed to taunt him. What follow are a couple of events which occur during the fight.
Please, provide ${Narrator.narrationsPerPrompt} short narrations sentences for each of them. Make sure that the
responses are in 2nd person. Do not react in present tense. Please output you answers in JSON format with
the following scheme:
  {
    'hit': [ <taunting the player that the enemies hit him> ],
    'levelup': [ <the player performs somewhat ok> ],
    'dodge': [ <taunting the player who fails to hit the enemies> ]
  }
Make sure that you reference as much as possible the scene settings and the previous events. Also, even if the player is performing
somewhat well, make sure that you are not favoring him and you are showing him who is the loser.`;

  private static imaginaryNarrations = imaginaryNarrationsIncluded;

  private voice: Voice = ((voice_name: string) => {
    type VoicesKeys = keyof typeof voicesIncluded.voices;
    return {
      name: voice_name,
      id: voicesIncluded.voices[voice_name as VoicesKeys],
    };
  })(CAVE_JOHNSON_NAME);

  private used: Narration[] = [];
  private feed: Narration[] = [];
  private theme: string;

  constructor(theme: string) {
    this.theme = theme;
  }

  useNarration(narration: Narration): void {
    this.used.push(narration);
  }

  prompt(): string {
    return `${Narrator.narrationPromptBegin} ${this.theme}.
Some of the previous actions that took place include:

${this.history()}
${Narrator.narrationPromptEnd}
  `;
  }

  async nextBatch(): Promise<Narration[]> {
    console.log("Narrator: producing nextBatch()");
    if (this.feed.length <= narrationFeedSize / 2) {
      console.log("Narrator: prefilling feed");
      await this.prefillFeed();
      console.log("Narrator done prefilling");
    }

    assert(
      this.feed.length > narrationBatchSize,
      "Feed was not successfully refilled!"
    );

    const narrationBatch = this.feed.splice(0, narrationBatchSize);
    return narrationBatch;
  }

  private async history(): Promise<string> {
    let toLinearize = this.used;
    let history: string = " Here is the progress so far: ";
    if (this.used.length == 0) {
      toLinearize = await this.parseNarrationListing(
        JSON.stringify(Narrator.imaginaryNarrations)
      );
      // Shuffle so that the imaginary history isn't "good, good, ..., good, bad, bad, ... bad".
      toLinearize.sort(() => Math.random() - 0.5);
      history = ""; // It hasn't happend, you know.
    }

    for (const u of toLinearize) {
      history += `*${u.event}*\n${Narrator.narratorName}: "${u.response}"\n`;
    }
    return history;
  }

  private async parseNarrationListing(_data: any): Promise<Narration[]> {
    const data = JSON.parse(_data);
    let narrations: Narration[] = [];
    for (const marker of Narrator.narrationMarkers) {
      for (const narration of data[marker]) {
        const file_path: string = path.join(AUDIO_DIR_PATH, `${uuidv4()}.mp3`);

        const audio_stream = await ElevenLabsController.tts_stream(
          narration,
          this.voice.id
        );

        audio_stream?.pipe(fs.createWriteStream(file_path));
        console.log("File saved successfully: ", file_path);

        narrations.push({
          event: marker,
          response: narration,
          audio_file: file_path,
        });
      }
    }

    return narrations;
  }

  private async prefillFeed() {
    const history = this.history();
    const prompt =
      Narrator.narrationPromptBegin + history + Narrator.narrationPromptEnd;
    const answer = await GptController.request(prompt);
    const suggestedNarrations: object = GptController.extractJson(answer);
    const newFeed = await this.parseNarrationListing(
      JSON.stringify(suggestedNarrations)
    );
    for (const n of newFeed) {
      this.feed.push(n);
    }
  }

  get_audio() {}
}

Narrator.eventTransforms = new Map<string, (a: string, b: string) => string>();

// a is probably 'enemy' and b will most likely be 'player' or 'enemy'.
Narrator.eventTransforms.set("hit", (a: string, b: string) => {
  return `The ${a} got hit by the ${b}`;
});
// a is probably 'player' or 'enemy' (maybe could be 'chest' - "This chest got annihilated!")
// b could be 'bullet' or 'enemy'
Narrator.eventTransforms.set("dodge", (a: string, b: string) => {
  return `the ${a} dodged an attack by the ${b}`;
});
// a is probably 'player' or 'enemy'; b could be 'kill', 'chest'
Narrator.eventTransforms.set("levelup", (a: string, b: string) => {
  return `the ${a} levelled up because of the ${b}`;
});
