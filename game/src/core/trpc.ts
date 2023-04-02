import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";

import type { AppRouter } from "@rogueai/backend/src/router";

export const TRPC_URL = "http://localhost:2023";

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: TRPC_URL,
    }),
  ],
});

export default trpc;
