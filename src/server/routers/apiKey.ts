import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { AiProvider } from "@prisma/client";

// Simple encrypt/decrypt using base64 (replace with proper encryption in production)
// In production: use crypto.subtle or a library like @noble/ciphers
function encryptKey(key: string): string {
  return Buffer.from(key).toString("base64");
}

export function decryptKey(encrypted: string): string {
  return Buffer.from(encrypted, "base64").toString("utf8");
}

export function maskKey(key: string): string {
  if (key.length <= 8) return "••••••••";
  return `••••••••${key.slice(-4)}`;
}

export const apiKeyRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    const keys = await ctx.db.apiKey.findMany({
      where: { userId: ctx.userId },
      select: {
        id: true,
        provider: true,
        keyPreview: true,
        baseUrl: true,
        label: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return keys;
  }),

  upsert: protectedProcedure
    .input(
      z.object({
        provider: z.nativeEnum(AiProvider),
        key: z.string().min(10),
        baseUrl: z.string().optional().nullable(),
        label: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const encrypted = encryptKey(input.key);
      const preview = maskKey(input.key);

      return ctx.db.apiKey.upsert({
        where: {
          userId_provider: {
            userId: ctx.userId,
            provider: input.provider,
          },
        },
        create: {
          userId: ctx.userId,
          provider: input.provider,
          keyHash: encrypted,
          keyPreview: preview,
          baseUrl: input.baseUrl || null,
          label: input.label,
        },
        update: {
          keyHash: encrypted,
          keyPreview: preview,
          baseUrl: input.baseUrl || null,
          label: input.label,
          isActive: true,
        },
        select: {
          id: true,
          provider: true,
          keyPreview: true,
          isActive: true,
        },
      });
    }),

  toggleActive: protectedProcedure
    .input(z.object({ id: z.string(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const key = await ctx.db.apiKey.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });
      if (!key) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.db.apiKey.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
        select: { id: true, isActive: true },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const key = await ctx.db.apiKey.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });
      if (!key) throw new TRPCError({ code: "NOT_FOUND" });

      return ctx.db.apiKey.delete({ where: { id: input.id } });
    }),
});
