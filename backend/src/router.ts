import { initTRPC } from "@trpc/server";
import { openAiRequest } from "./narrator/openai_controller";
import { elevenLabsRequest, availableVoices } from './narrator/elevenlabs_controller'

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

// interface Narration {
//   text: string;
//   audio: unknown;
// }

const publicProcedure = t.procedure;

interface User {
  id: string;
  name: string;
}

const narrations: User[] = [
  {
    id: "1",
    name: "get rekt",
  },
];

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
  getNarration: publicProcedure
    .input((val: unknown) => {
      if (typeof val === "string") return val;
      throw new Error(`Invalid input: ${typeof val}`);
    })
    .query((req) => {
      const input = req.input;
      const user = narrations.find((it) => it.id === input);

      return user;
    }),
});

export type AppRouter = typeof appRouter;
