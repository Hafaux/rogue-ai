
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

export interface Narration {
    id: string;
    response: string;
    audio: unknown;

    // TODO: The event is fixed among a couple of different actions that may happen
    //       such as 'player gets hit', 'player is silly', 'player performs well'.
    event: string;
}

export class Narrator {
    private used: Narration[] = [];
    private feed: Narration[] = [];

    useNarration(narration: Narration): void {
        this.used.push(narration);
    }

    nextBatch(): Narration[] {
        if (this.feed.length < narrationBatchSize) {
            this.prefillFeed();
        }

        const narrationBatch = this.feed.splice(0, narrationBatchSize);
        return narrationBatch;
    }

    private history(): string {
        // TODO: Implement in order to call from prefillFeed()
        return "";
    }

    private prefillFeed(): void {
        // TODO: Use OpenAI and 11Labs to acquire new feed.
        //       Prompt GPT with the history of the conversation.
        const history = this.history();
    }
}