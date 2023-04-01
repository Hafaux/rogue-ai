import dotenv from "dotenv";

dotenv.config();

import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "./router";
import cors from "cors";
import AssetGeneratpor from "./asset_generation/asset_generator";

createHTTPServer({
  middleware: cors(),
  router: appRouter,
  createContext() {
    console.log("context");
    return {};
  },
}).listen(2023);

new AssetGeneratpor().generate("alien");
