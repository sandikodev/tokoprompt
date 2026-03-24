import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { z } from "zod";

export const usageRouter = createTRPCRouter({
  // Summary stats for the current user
  summary: protectedProcedure.query(async ({ ctx }) => {
    const logs = await ctx.db.usageLog.findMany({
      where: { project: { workspace: { userId: ctx.userId } } },
      select: {
        provider: true,
        generationType: true,
        inputTokens: true,
        outputTokens: true,
        costEstimate: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const totalGenerations = logs.length;
    const totalCost = logs.reduce((sum, l) => sum + (l.costEstimate ?? 0), 0);
    const totalTokens = logs.reduce(
      (sum, l) => sum + (l.inputTokens ?? 0) + (l.outputTokens ?? 0),
      0
    );

    const byType = logs.reduce<Record<string, number>>((acc, l) => {
      acc[l.generationType] = (acc[l.generationType] ?? 0) + 1;
      return acc;
    }, {});

    const byProvider = logs.reduce<Record<string, number>>((acc, l) => {
      acc[l.provider] = (acc[l.provider] ?? 0) + 1;
      return acc;
    }, {});

    // Last 7 days activity
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentLogs = logs.filter((l) => l.createdAt >= sevenDaysAgo);

    const dailyActivity: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dailyActivity[key] = 0;
    }
    for (const l of recentLogs) {
      const key = l.createdAt.toISOString().slice(0, 10);
      if (key in dailyActivity) dailyActivity[key]++;
    }

    return {
      totalGenerations,
      totalCost,
      totalTokens,
      byType,
      byProvider,
      dailyActivity,
      recentLogs: logs.slice(0, 20),
    };
  }),

  // Per-project usage
  byProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const logs = await ctx.db.usageLog.findMany({
        where: {
          projectId: input.projectId,
          project: { workspace: { userId: ctx.userId } },
        },
        select: {
          id: true,
          provider: true,
          generationType: true,
          inputTokens: true,
          outputTokens: true,
          costEstimate: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      const totalRuns = logs.length;
      const byType = logs.reduce<Record<string, number>>((acc, l) => {
        acc[l.generationType] = (acc[l.generationType] ?? 0) + 1;
        return acc;
      }, {});

      return { logs, totalRuns, byType };
    }),

  // Content history per project + type (for versioning UI)
  contentHistory: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        type: z.enum(["titles", "descriptions", "slides", "imagePrompts"]),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const where = {
        projectId: input.projectId,
        project: { workspace: { userId: ctx.userId } },
      };

      if (input.type === "titles") {
        return ctx.db.generatedTitle.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: input.limit,
        });
      }
      if (input.type === "descriptions") {
        return ctx.db.generatedDescription.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: input.limit,
          select: {
            id: true,
            platform: true,
            charCount: true,
            isSelected: true,
            createdAt: true,
            content: true,
          },
        });
      }
      if (input.type === "slides") {
        return ctx.db.generatedSlide.findMany({
          where,
          orderBy: [{ slideNumber: "asc" }, { createdAt: "desc" }],
          take: input.limit,
        });
      }
      return ctx.db.imagePrompt.findMany({
        where,
        orderBy: [{ slideNumber: "asc" }, { createdAt: "desc" }],
        take: input.limit,
      });
    }),

  // Clear (delete) all generated content of a type for a project
  clearContent: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        type: z.enum(["titles", "descriptions", "slides", "imagePrompts", "all"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const verify = await ctx.db.project.findFirst({
        where: { id: input.projectId, workspace: { userId: ctx.userId } },
      });
      if (!verify) throw new Error("NOT_FOUND");

      if (input.type === "titles" || input.type === "all") {
        await ctx.db.generatedTitle.deleteMany({ where: { projectId: input.projectId } });
      }
      if (input.type === "descriptions" || input.type === "all") {
        await ctx.db.generatedDescription.deleteMany({ where: { projectId: input.projectId } });
      }
      if (input.type === "slides" || input.type === "all") {
        await ctx.db.generatedSlide.deleteMany({ where: { projectId: input.projectId } });
      }
      if (input.type === "imagePrompts" || input.type === "all") {
        await ctx.db.imagePrompt.deleteMany({ where: { projectId: input.projectId } });
      }

      return { success: true };
    }),
});
