import { initTRPC } from "@trpc/server";
import { openAiRequest } from "./narrator/openai_controller";
import { elevenLabsRequest, availableVoices } from './narrator/elevenlabs_controller'
import z from "zod"

const t = initTRPC.create();

// getNarrations({ playerId: id, possibleEvents: Event[] }) -> { narrationId }[]
// usedNarration(narrationId) -> dobavq kum staka s izpolzvani naracii
// array: players { usedNarration, id }
// const narrations = {}

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

const publicProcedure = t.procedure;

interface Narration {
  id: string;
  response: string;
  audio: unknown;

  // TODO: The event is fixed among a couple of different actions that may happen
  //       such as 'player gets hit', 'player is silly', 'player performs well'.
  event: string;
}

const narrationBatchSize: number = 2;

class Player {
  private id: string;
  private theme: string;
  private usedNarrations: Narration[] = [];
  private feed: Narration[] = [];

  constructor(id: string, theme: string) {
    this.id = id;
    this.theme = theme;
  }

  batch(): Narration[] {
    if (this.feed.length < narrationBatchSize) {
      this.prefillFeed();
    }

    const narrationBatch = this.feed.splice(0, narrationBatchSize);
    return narrationBatch;
  }

  storeNarration(narration: Narration): void {
    this.usedNarrations.push(narration);
  }

  getId(): string {
    return this.id;
  }

  private prefillFeed(): void {
    // TODO: Use OpenAI and 11Labs to acquire new feed.
    //       Prompt GPT with the history of the conversation.
    const history = this.history();
  }

  private history(): string {
    // TODO: Implement in order to call from prefillFeed()
    return "";
  }
}

// FIXME: Unglobal this.
let activePlayers: Player[];

export async function testOpenAiRequest() {
  const question = 'Hello, what is your name?'
  const answer = await openAiRequest(question);
  console.log('Q: ' + question)
  console.log('A: ' + answer);
}

export async function testElevenLabsRequest() {
  const data = 'Hello, my name is Rogue, hihi'
  const response = await elevenLabsRequest(data, availableVoices['Domi'])
  console.log(response)
}

export const appRouter = t.router({
  // Mark player is begin active.
  activatePlayer: publicProcedure
    .input(z.object({
      playerId: z.string(),
      theme: z.string()
    }))
    .query((req) => {
      const input = req.input;
      const player = new Player(input.playerId, input.theme);
      activePlayers.push(player);
    }),

  deactivatePlayer: publicProcedure
    .input(z.object({
      playerId: z.string()
    }))
    .query((req) => {
      const input = req.input;
      activePlayers = activePlayers.filter(player => player.getId() !== playerId);
    }),

  // Acquire a string repr of a player by id. Useful to check whether player is initialized.
  checkPlayer: publicProcedure
    .input(z.object({
      playerId: z.string(),
    }))
    .query((req) => {
      const input = req.input;
      const player = activePlayers.find((p) => p.getId() === input.playerId);
      return JSON.stringify(player);
    }),

  // Returns a narration batch which includes _narationBatchSize_ elements of type _Narration_.
  getNarration: publicProcedure
    .input(z.object({
      playerId: z.string(),
    }))
    .query((req) => {
      const input = req.input;
      const player = activePlayers.find((p) => p.getId() === input.playerId) as Player;
      const nextBatch = player.batch();
      return JSON.stringify(nextBatch);
    }),

  // Mark a narration as "been used".
  storeNarration: publicProcedure
    .input(z.object({
      playerId: z.string(),
      narrationSerial: z.string()
    }))
    .query((req) => {
      const input = req.input;
      const player = activePlayers.find((p) => p.getId() === input.playerId) as Player;
      const narration = JSON.parse(input.narrationSerial) as Narration;
      player.storeNarration(narration);

      return "";
    })
});

export type AppRouter = typeof appRouter;
