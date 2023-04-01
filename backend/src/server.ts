import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "./router";
import cors from "cors";
import TexturePacker from "./texturePacker";

createHTTPServer({
  middleware: cors(),
  router: appRouter,
  createContext() {
    console.log("context");
    return {};
  },
}).listen(2023);

const a = new TexturePacker();

a.pack();
