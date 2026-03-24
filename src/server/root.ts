import { createTRPCRouter } from "@/server/trpc";
import { workspaceRouter } from "./routers/workspace";
import { projectRouter } from "./routers/project";
import { generateRouter } from "./routers/generate";
import { apiKeyRouter } from "./routers/apiKey";
import { usageRouter } from "./routers/usage";
import { planRouter } from "./routers/plan";
import { productContextRouter } from "./routers/productContext";

export const appRouter = createTRPCRouter({
  workspace: workspaceRouter,
  project: projectRouter,
  generate: generateRouter,
  apiKey: apiKeyRouter,
  usage: usageRouter,
  plan: planRouter,
  productContext: productContextRouter,
});

export type AppRouter = typeof appRouter;
