import dotenv from "dotenv";

dotenv.config();

import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "./router";
import cors from "cors";
import StableDiffusion from "./api/stable_diffusion";

createHTTPServer({
  middleware: cors(),
  router: appRouter,
  createContext() {
    console.log("context");
    return {};
  },
}).listen(2023);

(async () => {
  console.log(
    await new StableDiffusion().request({ prompt: "cute dog with a hat" })
  );
})();
