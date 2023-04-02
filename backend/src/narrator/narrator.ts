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

export const narrationBatchSize: number = 3;
const narrationFeedSize: number = 6;

export interface Narration {
  response: string;
  audio_file: string;
  event: string;
  details: string;
}

export interface Voice {
  name: string;
  id: string;
}

export class Narrator {
  private static narratorName = "Narrator (You)";

  private static narrationMarkers = ["player performs poorly"];

  public static eventTransforms: Map<string, () => string>;

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
    if (this.feed.length <= narrationFeedSize) {
      console.log("Narrator: prefilling feed");
      await this.prefillFeed();
      console.log("Narrator done prefilling");
    }

    assert(
      this.feed.length > narrationBatchSize,
      "Feed was not successfully refilled!"
    );

    let narrationBatch: Narration[] = [];
    for (const marker of Narrator.eventTransforms.keys()) {
      const index = this.feed.findIndex((nar) => nar.event === marker);
      assert(index !== -1);
      const nar: Narration = this.feed[index];
      narrationBatch.push(nar);
      this.feed.splice(index, 1);
    }

    return narrationBatch;
  }

  private async history(): Promise<string> {
    let used = this.used;
    if (this.used.length == 0) {
      used = await this.parseNarrationListing(
        JSON.stringify(Narrator.imaginaryNarrations)
      );
    }

    let history: string = "";
    for (const u of used) {
      const contextGen: () => string = Narrator.eventTransforms.get(
        u.event
      ) as () => string;
      u.details = contextGen();
      // if (!u.details.includes("storeNarration")) context.concat(u.details);
      history += `*${u.event}.${u.details}*\n${Narrator.narratorName}: "${u.response}"\n`;
    }
    return history;
  }

  private async parseNarrationListing(_data: any): Promise<Narration[]> {
    const data = JSON.parse(_data);
    let narrations: Narration[] = [];
    for (const marker of Narrator.eventTransforms.keys()) {
      // console.log(`marker: ${marker}`);
      // console.log(`data[marker]: ${data[marker]}`);
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
          details: "[fill on storeNarration()]", // Initially empty.
        });
      }
    }

    return narrations;
  }

  private async prefillFeed() {
    const history = await this.history();
    console.log(`History: ${history}`);
    const prompt =
      Narrator.narrationPromptBegin + history + Narrator.narrationPromptEnd;
    const answer = await GptController.request(prompt);
    const suggestedNarrations: object = GptController.extractJson(answer);
    // console.log(suggestedNarrations);
    const newFeed = await this.parseNarrationListing(
      JSON.stringify(suggestedNarrations)
    );
    for (const n of newFeed) {
      this.feed.push(n);
    }
  }

  get_audio() {}
}

Narrator.eventTransforms = new Map<string, () => string>();

// a is probably 'enemy' and b will most likely be 'player' or 'enemy'.
Narrator.eventTransforms.set("hit", () => {
  return `The player got hit by the enemy.`;
});
// a is probably 'player' or 'enemy' (maybe could be 'chest' - "This chest got annihilated!")
// b could be 'bullet' or 'enemy'
Narrator.eventTransforms.set("dodge", () => {
  return `The enemy dodged an attack by the player`;
});
// a is probably 'player' or 'enemy'; b could be 'kill', 'chest'
Narrator.eventTransforms.set("levelup", () => {
  return `the player did something ok`;
});
