import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// ─── Plan Limits ─────────────────────────────────────────────────────────────

export const PLAN_LIMITS = {
  FREE: {
    maxWorkspaces: 2,
    maxProjectsPerWorkspace: 3,
    maxGeneratesPerDay: 15,
    features: {
      byok: true,
      proxy: false,
      rag: false,
      bulkExport: false,
    },
  },
  PRO: {
    maxWorkspaces: Infinity,
    maxProjectsPerWorkspace: Infinity,
    maxGeneratesPerDay: Infinity,
    features: {
      byok: true,
      proxy: true,
      rag: true,
      bulkExport: true,
    },
  },
} as const;

// ─── Helper: check daily generate count ──────────────────────────────────────

export async function checkDailyLimit(
  db: Parameters<Parameters<typeof protectedProcedure.query>[0]>[0]["ctx"]["db"],
  userId: string,
  plan: "FREE" | "PRO"
) {
  const limit = PLAN_LIMITS[plan].maxGeneratesPerDay;
  if (limit === Infinity) return; // no limit for PRO

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const count = await db.usageLog.count({
    where: {
      project: { workspace: { userId } },
      createdAt: { gte: startOfDay },
    },
  });

  if (count >= limit) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Batas generate harian tercapai (${limit}x). Upgrade ke PRO untuk generate tanpa batas.`,
    });
  }
}

// ─── Helper: check project limit ─────────────────────────────────────────────

export async function checkProjectLimit(
  db: Parameters<Parameters<typeof protectedProcedure.query>[0]>[0]["ctx"]["db"],
  workspaceId: string,
  userId: string,
  plan: "FREE" | "PRO"
) {
  const limit = PLAN_LIMITS[plan].maxProjectsPerWorkspace;
  if (limit === Infinity) return;

  const count = await db.project.count({
    where: { workspaceId, workspace: { userId } },
  });

  if (count >= limit) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Batas project tercapai (${limit} project per workspace pada plan FREE). Upgrade ke PRO untuk project tanpa batas.`,
    });
  }
}

// ─── Helper: check workspace limit ───────────────────────────────────────────

export async function checkWorkspaceLimit(
  db: Parameters<Parameters<typeof protectedProcedure.query>[0]>[0]["ctx"]["db"],
  userId: string,
  plan: "FREE" | "PRO"
) {
  const limit = PLAN_LIMITS[plan].maxWorkspaces;
  if (limit === Infinity) return;

  const count = await db.workspace.count({ where: { userId } });

  if (count >= limit) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Batas workspace tercapai (${limit} workspace pada plan FREE). Upgrade ke PRO untuk workspace tanpa batas.`,
    });
  }
}

// ─── Plan Router ─────────────────────────────────────────────────────────────

export const planRouter = createTRPCRouter({
  // Get current user plan + usage stats for limits UI
  getMyPlan: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.userId },
      select: { plan: true, planExpiresAt: true },
    });

    const plan = user?.plan ?? "FREE";
    const limits = PLAN_LIMITS[plan];

    // Count workspaces
    const workspaceCount = await ctx.db.workspace.count({
      where: { userId: ctx.userId },
    });

    // Count projects across all workspaces
    const projectCount = await ctx.db.project.count({
      where: { workspace: { userId: ctx.userId } },
    });

    // Count today's generates
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayGenerates = await ctx.db.usageLog.count({
      where: {
        project: { workspace: { userId: ctx.userId } },
        createdAt: { gte: startOfDay },
      },
    });

    // Count total generates all time
    const totalGenerates = await ctx.db.usageLog.count({
      where: { project: { workspace: { userId: ctx.userId } } },
    });

    return {
      plan,
      planExpiresAt: user?.planExpiresAt ?? null,
      limits: {
        workspaces: {
          used: workspaceCount,
          max: limits.maxWorkspaces === Infinity ? null : limits.maxWorkspaces,
        },
        projects: {
          used: projectCount,
          max: limits.maxProjectsPerWorkspace === Infinity ? null : limits.maxProjectsPerWorkspace,
          note: "per workspace",
        },
        generatesPerDay: {
          used: todayGenerates,
          max: limits.maxGeneratesPerDay === Infinity ? null : limits.maxGeneratesPerDay,
        },
        totalGenerates,
      },
      features: limits.features,
    };
  }),

  // Admin-only: manually upgrade a user (for testing/gifting)
  upgradeToPro: protectedProcedure
    .input(z.object({ durationDays: z.number().min(1).max(365).default(30) }))
    .mutation(async ({ ctx, input }) => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + input.durationDays);

      return ctx.db.user.update({
        where: { id: ctx.userId },
        data: { plan: "PRO", planExpiresAt: expiresAt },
        select: { plan: true, planExpiresAt: true },
      });
    }),
});
