import { initTRPC } from "@trpc/server";
import z from "zod";
import { Player } from "./player";
import { Narrator, Narration } from "./narrator/narrator";
import { platform } from "os";
import AssetGenerator from "./asset_generation/asset_generator";

const t = initTRPC.create();

const publicProcedure = t.procedure;

// FIXME: Maybe unglobal this.
let activePlayers: Player[] = [];
// FIXME: ditto
let assetGenerator = new AssetGenerator();

export const appRouter = t.router({
  // Mark player is active.
  generateAssets: publicProcedure
    .input(
      z.object({
        playerId: z.string(),
        theme: z.string(),
      })
    )
    .query(async (req) => {
      const input = req.input;

      // console.log("called generateAssets");

      return await assetGenerator.generate(input.theme);
    }),

  activatePlayer: publicProcedure
    .input(
      z.object({
        playerId: z.string(),
        theme: z.string(),
      })
    )
    .query((req) => {
      const input = req.input;
      const player: Player = {
        id: input.playerId,
        theme: input.theme,
        narrator: new Narrator(input.theme),
      };
      activePlayers.push(player);
      console.log(`Activating player ${JSON.stringify(player, null, 2)}`);
    }),

  deactivatePlayer: publicProcedure
    .input(
      z.object({
        playerId: z.string(),
      })
    )
    .query((req) => {
      const input = req.input;
      activePlayers = activePlayers.filter(
        (player) => player.id !== input.playerId
      );
      console.log(`Deactivating player with id=${input.playerId}`);
    }),

  // Acquire a string repr of a player by id. Useful to check whether player is initialized.
  checkPlayer: publicProcedure
    .input(
      z.object({
        playerId: z.string(),
      })
    )
    .query((req) => {
      const input = req.input;
      const player = activePlayers.find((p) => p.id === input.playerId);
      console.log(`Checking player ${JSON.stringify(player, null, 2)}`);
      return JSON.stringify(player);
    }),

  // Returns a narration batch which includes _narationBatchSize_ elements of type _Narration_.
  getNarration: publicProcedure
    .input(
      z.object({
        playerId: z.string(),
      })
    )
    .query(async (req) => {
      const input = req.input;
      console.log("getNarration called: %s", JSON.stringify(input, null, 2));
      const maybe_player: unknown = activePlayers.find(
        (p) => p.id === input.playerId
      );
      // console.log(maybe_player);
      if (maybe_player === undefined) {
        throw new Error(
          `getNarration: No such player with id=${input.playerId}`
        );
      }

      const player = maybe_player as Player;
      const nextBatch = await player.narrator.nextBatch();
      console.log(
        `Player ${player.id} gets new narration batch: '${JSON.stringify(
          nextBatch,
          null,
          2
        )}'`
      );
      return JSON.stringify(nextBatch);
    }),

  // Mark a narration as "been used".
  storeNarration: publicProcedure
    .input(
      z.object({
        playerId: z.string(),
        narrationSerial: z.string(),
      })
    )
    .query((req) => {
      const input = req.input;
      const player = activePlayers.find(
        (p) => p.id === input.playerId
      ) as Player;
      const narration = JSON.parse(input.narrationSerial) as Narration;
      player.narrator.useNarration(narration);
      console.log(`Player ${player.id} uses narration '${narration}'`);
    }),
});

export type AppRouter = typeof appRouter;
