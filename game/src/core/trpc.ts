import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

import type { AppRouter } from "@rogueai/backend/src/router";

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:2023",
    }),
  ],
});

export default trpc;
