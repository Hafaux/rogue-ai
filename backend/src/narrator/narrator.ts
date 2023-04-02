import { assert } from "console";
import {
  ElevenLabsController,
  CAVE_JOHNSON_NAME,
  WHEATLEY_NAME,
} from "../api/elevenlabs_controller";
import { GptController } from "../api/gpt_controller";
import * as imaginaryNarrationsIncluded from "./imaginary.json";
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
  private static narratorName = "You";

  private static narrationMarkers = [
    "player performs well",
    "player performs poorly",
  ];

  private static narrationPromptBegin = `
  You are an enemy in a rogue-like game.\n`;

  private static narrationPromptEnd = `
  Consider the following three scenarios and give suitable narration to each of them:
  1. Player performs an action well. (Cheer him or/and compare to his previous attempts)
  2. Performs performs an action poorly. (Taunt him)
  Could you provide 3 short narrations sentences for both of them? Make sure that the
  responses are in 2nd person. Do not react in present tense. Please output in JSON format
  such as 'player performs well': [...], 'player performs poorly': [...].\n`;

  private static imaginaryNarrations = imaginaryNarrationsIncluded;

  private voice: Voice = ((voice_name: string) => {
    type VoicesKeys = keyof typeof imaginaryNarrationsIncluded.voices;
    return {
      name: voice_name,
      id: imaginaryNarrationsIncluded.voices[voice_name as VoicesKeys],
    };
  })(CAVE_JOHNSON_NAME);

  private used: Narration[] = [];
  private feed: Narration[] = [];

  useNarration(narration: Narration): void {
    this.used.push(narration);
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
