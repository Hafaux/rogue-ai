import { assert } from "console";
import { GptController } from "../api/gpt_controller";

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

    // TODO: The event is fixed among a couple of different actions that may happen
    //       such as 'player gets hit', 'player is silly', 'player performs well'.
    event: string;
}

export class Narrator {
    private static narratorName = "Narrator";
    
    private static narrationPromptBegin = `
        You are an enemy in a rogue-like game. Here is the progress so far.`;

    private static narrationPromptEnd = `
        Consider the following three scenarios and give suitable narration to each of them:
        1. Player performs an action well. (Cheer him or/and compare to his previous attempts)
        2. Performs performs an action poorly. (Taunt him) 
        Could you provide 3 short narrations sentences for both of them?
        Please output in JSON format but just before the meaningful part of the output write
        "NARRATIONS_BEGIN" and just after the end of it write "NARRATIONS_END".
        `;

    private used: Narration[] = [];
    private feed: Narration[] = [];

    useNarration(narration: Narration): void {
        this.used.push(narration);
    }

    assert(
      this.feed.length >= narrationBatchSize,
      "Narration feed is not big enough!"
    );

        const narrationBatch = this.feed.splice(0, narrationBatchSize);
        return narrationBatch;
    }

    private history(): string {
        let history: string = "";
        for (const u of this.used) {
            history += `*${u.event}*\n${Narrator.narratorName}: "${u.response}"\n`
        }
        return history;
    }

    private prefillFeed(): void {
        // TODO: Use OpenAI and 11Labs to acquire new feed.
        //       Prompt GPT with the history of the conversation.
        const history = this.history();
        const prompt = Narrator.narrationPromptBegin + history + Narrator.narrationPromptEnd;
        const answer = GptController.request(prompt);
        console.log("DEBUG: " + answer);

        // TODO: Parse output of GPT.
    }
}