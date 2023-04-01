import { assert } from "console";
import { GptController } from "../api/gpt_controller";
import * as imaginaryNarrationsIncluded from "./imaginary.json";

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

export const narrationBatchSize: number = 2;
const narrationFeedSize: number = 10;

export interface Narration {
  response: string;
  audio: unknown;
  event: string;
}
export class Narrator {
  private static narratorName = "You";

  private static narrationMarkers = [
    "player performs well", // "hit" ->  plyaer, "enemy" => The player got hit by and enemy
    "player performs poorly",
  ];

  public static eventTransforms: Map<string, (a: string, b: string) => string>;

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

  private history(): string {
    let toLinearize = this.used;
    let history: string = " Here is the progress so far: ";
    if (this.used.length == 0) {
      toLinearize = this.parseNarrationListing(
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

  private parseNarrationListing(_data: any): Narration[] {
    const data = JSON.parse(_data);
    let narrations: Narration[] = [];
    for (const marker of Narrator.narrationMarkers) {
      for (const narration of data[marker]) {
        narrations.push({
          event: marker,
          response: narration,
          // TODO: Use 11Labs to produce sound for the narration.
          audio: undefined,
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
    const newFeed = this.parseNarrationListing(
      JSON.stringify(suggestedNarrations)
    );
    for (const n of newFeed) {
      this.feed.push(n);
    }
  }
}

Narrator.eventTransforms = new Map<
  string,
  (who: string, from: string) => string
>();

Narrator.eventTransforms.set("hit", (a: string, b: string) => {
  return `The ${a} got hit by the ${b}`;
});
Narrator.eventTransforms.set("dodge", (a: string, b: string) => {
  return `the ${a} dodged an attack by the ${b}`;
});
