import dotenv from "dotenv";

dotenv.config();

import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "./router";
import cors from "cors";

createHTTPServer({
  middleware: cors(),
  router: appRouter,
  createContext() {
    console.log("context");
    return {};
  },
}).listen(2023);
