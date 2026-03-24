import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Platform, ProjectStatus } from "@prisma/client";
import { checkProjectLimit } from "./plan";

const projectInput = z.object({
  name: z.string().min(2).max(100),
  productName: z.string().min(2).max(200),
  category: z.string().optional(),
  targetMarket: z.string().optional(),
  priceRange: z.string().optional(),
  mainFeature: z.string().optional(),
  powerSource: z.string().optional(),
  compatibility: z.string().optional(),
  useCase: z.string().optional(),
  platform: z.nativeEnum(Platform).default("ALL"),
  languageStyle: z.string().optional(),
  notes: z.string().optional(),
  rawSpec: z.string().optional(),
});

// Helper: verify workspace ownership
async function verifyWorkspace(
  db: TRPCContext["db"],
  workspaceId: string,
  userId: string
) {
  const ws = await db.workspace.findFirst({
    where: { id: workspaceId, userId },
  });
  if (!ws) throw new TRPCError({ code: "NOT_FOUND", message: "Workspace tidak ditemukan" });
  return ws;
}

import type { TRPCContext } from "@/server/trpc";

export const projectRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      await verifyWorkspace(ctx.db, input.workspaceId, ctx.userId);
      return ctx.db.project.findMany({
        where: { workspaceId: input.workspaceId },
        include: {
          _count: {
            select: {
              titles: true,
              descriptions: true,
              slides: true,
              imagePrompts: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.id, workspace: { userId: ctx.userId } },
        include: {
          titles: { orderBy: { createdAt: "desc" } },
          descriptions: { orderBy: { createdAt: "desc" } },
          slides: { orderBy: [{ slideNumber: "asc" }, { createdAt: "desc" }] },
          imagePrompts: { orderBy: [{ slideNumber: "asc" }, { createdAt: "desc" }] },
        },
      });
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });
      return project;
    }),

  create: protectedProcedure
    .input(projectInput.extend({ workspaceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await verifyWorkspace(ctx.db, input.workspaceId, ctx.userId);

      // Enforce plan limit
      const user = await ctx.db.user.findUnique({ where: { id: ctx.userId }, select: { plan: true } });
      await checkProjectLimit(ctx.db, input.workspaceId, ctx.userId, user?.plan ?? "FREE");

      return ctx.db.project.create({ data: input });
    }),

  update: protectedProcedure
    .input(projectInput.partial().extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const project = await ctx.db.project.findFirst({
        where: { id, workspace: { userId: ctx.userId } },
      });
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.db.project.update({ where: { id }, data });
    }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.string(), status: z.nativeEnum(ProjectStatus) }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.id, workspace: { userId: ctx.userId } },
      });
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.db.project.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.id, workspace: { userId: ctx.userId } },
      });
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.db.project.delete({ where: { id: input.id } });
    }),
});
