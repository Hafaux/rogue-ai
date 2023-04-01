import { initTRPC } from "@trpc/server";
import { openAiRequest } from "./narrator/openai_controller";
import { elevenLabsRequest, availableVoices } from './narrator/elevenlabs_controller'
import z from "zod"
import { Player} from './player'
import { Narrator, Narration } from "./narrator/narrator";

const t = initTRPC.create();

const publicProcedure = t.procedure;

// FIXME: Maybe unglobal this.
let activePlayers: Player[];

export const appRouter = t.router({
  // Mark player is begin active.
  activatePlayer: publicProcedure
    .input(z.object({
      playerId: z.string(),
      theme: z.string()
    }))
    .query((req) => {
      const input = req.input;
      const player: Player = {
        'id': input.playerId,
        'theme': input.theme,
        'narrator': new Narrator(),
      };
      activePlayers.push(player);
    }),

  deactivatePlayer: publicProcedure
    .input(z.object({
      playerId: z.string()
    }))
    .query((req) => {
      const input = req.input;
      activePlayers = activePlayers.filter(player => player.id !== input.playerId);
    }),

  // Acquire a string repr of a player by id. Useful to check whether player is initialized.
  checkPlayer: publicProcedure
    .input(z.object({
      playerId: z.string(),
    }))
    .query((req) => {
      const input = req.input;
      const player = activePlayers.find((p) => p.id === input.playerId);
      return JSON.stringify(player);
    }),

  // Returns a narration batch which includes _narationBatchSize_ elements of type _Narration_.
  getNarration: publicProcedure
    .input(z.object({
      playerId: z.string(),
    }))
    .query((req) => {
      const input = req.input;
      const player = activePlayers.find((p) => p.id === input.playerId) as Player;
      const nextBatch = player.narrator.nextBatch();
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
      const player = activePlayers.find((p) => p.id === input.playerId) as Player;
      const narration = JSON.parse(input.narrationSerial) as Narration;
      player.narrator.useNarration(narration);
    })
});

export type AppRouter = typeof appRouter;
