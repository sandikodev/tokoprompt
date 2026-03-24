import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { checkWorkspaceLimit } from "./plan";

export const workspaceRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.workspace.findMany({
      where: { userId: ctx.userId },
      include: { _count: { select: { projects: true } } },
      orderBy: { createdAt: "desc" },
    });
  }),

  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const workspace = await ctx.db.workspace.findFirst({
        where: { slug: input.slug, userId: ctx.userId },
        include: { _count: { select: { projects: true } } },
      });
      if (!workspace) throw new TRPCError({ code: "NOT_FOUND" });
      return workspace;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100),
        slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
        description: z.string().optional(),
        brandTone: z.string().optional(),
        brandStyle: z.string().optional(),
        brandGuide: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Enforce workspace limit per plan
      const user = await ctx.db.user.findUnique({ where: { id: ctx.userId }, select: { plan: true } });
      await checkWorkspaceLimit(ctx.db, ctx.userId, user?.plan ?? "FREE");

      const exists = await ctx.db.workspace.findUnique({
        where: { slug: input.slug },
      });
      if (exists) throw new TRPCError({ code: "CONFLICT", message: "Slug sudah digunakan" });

      return ctx.db.workspace.create({
        data: { ...input, userId: ctx.userId },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).max(100).optional(),
        description: z.string().optional(),
        brandTone: z.string().optional(),
        brandStyle: z.string().optional(),
        brandGuide: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const workspace = await ctx.db.workspace.findFirst({
        where: { id, userId: ctx.userId },
      });
      if (!workspace) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.db.workspace.update({ where: { id }, data });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const workspace = await ctx.db.workspace.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });
      if (!workspace) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.db.workspace.delete({ where: { id: input.id } });
    }),
});
