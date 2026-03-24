import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// ─── Text Chunker ─────────────────────────────────────────────────────────────
// Split long text into overlapping chunks for better retrieval

const CHUNK_SIZE = 600;    // chars per chunk
const CHUNK_OVERLAP = 100; // overlap between chunks

function chunkText(text: string): string[] {
  const clean = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (clean.length <= CHUNK_SIZE) return [clean];

  const chunks: string[] = [];
  let pos = 0;
  while (pos < clean.length) {
    const end = Math.min(pos + CHUNK_SIZE, clean.length);
    // Try to break at sentence/newline boundary
    let breakAt = end;
    if (end < clean.length) {
      const candidates = [
        clean.lastIndexOf("\n", end),
        clean.lastIndexOf(". ", end),
        clean.lastIndexOf("! ", end),
        clean.lastIndexOf("? ", end),
      ].filter((i) => i > pos + CHUNK_SIZE / 2);
      if (candidates.length) breakAt = Math.max(...candidates) + 1;
    }
    chunks.push(clean.slice(pos, breakAt).trim());
    pos = breakAt - CHUNK_OVERLAP;
    if (pos <= 0 || breakAt === clean.length) break;
  }
  if (pos < clean.length) chunks.push(clean.slice(pos).trim());
  return chunks.filter((c) => c.length > 20);
}

// ─── BM25-lite Relevance Scorer ───────────────────────────────────────────────
// Keyword-based relevance scoring — no embedding needed

function scoreRelevance(chunk: string, query: string): number {
  const chunkLower = chunk.toLowerCase();
  const queryTokens = query
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 2);

  let score = 0;
  for (const token of queryTokens) {
    const count = (chunkLower.match(new RegExp(token, "g")) ?? []).length;
    if (count > 0) score += 1 + Math.log(count);
  }
  return score;
}

// ─── Get Relevant Context (used by generate router) ──────────────────────────

export async function getRelevantProductContext(
  db: Parameters<Parameters<typeof protectedProcedure.query>[0]>[0]["ctx"]["db"],
  projectId: string,
  query: string,
  topN = 4
): Promise<string> {
  const chunks = await db.productContext.findMany({
    where: { projectId },
    select: { content: true, title: true, chunkIndex: true },
    orderBy: { chunkIndex: "asc" },
  });

  if (!chunks.length) return "";

  // Score and sort by relevance to the current generation query
  const scored = chunks
    .map((c) => ({
      ...c,
      score: scoreRelevance(c.content, query),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);

  if (!scored.some((c) => c.score > 0)) {
    // No keyword match — just take first N chunks (chronological)
    return chunks
      .slice(0, topN)
      .map((c) => (c.title ? `[${c.title}]\n${c.content}` : c.content))
      .join("\n\n---\n\n");
  }

  return scored
    .filter((c) => c.score > 0)
    .map((c) => (c.title ? `[${c.title}]\n${c.content}` : c.content))
    .join("\n\n---\n\n");
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const productContextRouter = createTRPCRouter({
  // List all context blocks for a project
  list: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, workspace: { userId: ctx.userId } },
        select: { id: true, productContexts: { orderBy: { createdAt: "asc" } } },
      });
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });
      return project.productContexts;
    }),

  // Add context block (paste text → auto-chunk → store)
  add: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        title: z.string().optional(),
        content: z.string().min(10).max(50000),
        source: z.enum(["manual", "upload"]).default("manual"),
        sourceName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, workspace: { userId: ctx.userId } },
      });
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      const chunks = chunkText(input.content);

      const created = await ctx.db.$transaction(
        chunks.map((chunk, i) =>
          ctx.db.productContext.create({
            data: {
              projectId: input.projectId,
              title: chunks.length > 1 ? `${input.title ?? "Konteks"} [${i + 1}/${chunks.length}]` : (input.title ?? null),
              content: chunk,
              source: input.source,
              sourceName: input.sourceName ?? null,
              chunkIndex: i,
              charCount: chunk.length,
            },
          })
        )
      );

      return { count: created.length, chunks: created };
    }),

  // Delete a specific context block
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const ctx_block = await ctx.db.productContext.findFirst({
        where: { id: input.id, project: { workspace: { userId: ctx.userId } } },
      });
      if (!ctx_block) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.db.productContext.delete({ where: { id: input.id } });
    }),

  // Clear ALL context for a project
  clearAll: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, workspace: { userId: ctx.userId } },
      });
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });
      const { count } = await ctx.db.productContext.deleteMany({ where: { projectId: input.projectId } });
      return { deleted: count };
    }),

  // Search / preview relevant chunks (for UI preview)
  search: protectedProcedure
    .input(z.object({ projectId: z.string(), query: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const chunks = await ctx.db.productContext.findMany({
        where: { projectId: input.projectId, project: { workspace: { userId: ctx.userId } } },
        select: { id: true, title: true, content: true, chunkIndex: true, charCount: true },
        orderBy: { chunkIndex: "asc" },
      });

      return chunks
        .map((c) => ({ ...c, score: scoreRelevance(c.content, input.query) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    }),
});
