import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { AiProvider } from "@prisma/client";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { db } from "@/server/db";
import type { Project } from "@prisma/client";
import { decryptKey } from "./apiKey";
import { checkDailyLimit } from "./plan";
import { getRelevantProductContext } from "./productContext";

// ─── AI Provider Factory ────────────────────────────────────────────────────

function getModel(provider: AiProvider, apiKey: string, baseUrl?: string | null) {
  switch (provider) {
    case "OPENAI":
      return createOpenAI({ apiKey, baseURL: baseUrl ?? undefined })("gpt-4o-mini");
    case "ANTHROPIC":
      return createAnthropic({ apiKey, baseURL: baseUrl ?? undefined })("claude-3-5-haiku-20241022");
    case "GEMINI":
      return createGoogleGenerativeAI({ apiKey, baseURL: baseUrl ?? undefined })("gemini-1.5-flash");
    default:
      throw new TRPCError({ code: "BAD_REQUEST", message: "Provider tidak dikenal" });
  }
}

// ─── Get Active API Key ────────────────────────────────────────────────────

async function getApiKey(userId: string, provider: AiProvider) {
  const key = await db.apiKey.findFirst({
    where: { userId, provider, isActive: true },
  });
  if (!key) {
    throw new TRPCError({
      code: "PRECONDITION_FAILED",
      message: `API Key ${provider} tidak ditemukan. Tambahkan di Settings → API Keys.`,
    });
  }
  return key;
}

// ─── Build Project Context ──────────────────────────────────────────────────

function buildProjectContext(
  project: Project,
  workspace: { brandTone?: string | null; brandStyle?: string | null; brandGuide?: string | null },
  ragContext = ""
) {
  return `
KONTEKS PRODUK:
- Nama Produk: ${project.productName}
- Kategori: ${project.category ?? "-"}
- Target Market: ${project.targetMarket ?? "-"}
- Rentang Harga: ${project.priceRange ?? "-"}
- Fitur Utama: ${project.mainFeature ?? "-"}
- Sumber Daya: ${project.powerSource ?? "-"}
- Kompatibilitas: ${project.compatibility ?? "-"}
- Use Case: ${project.useCase ?? "-"}
- Platform: ${project.platform}
- Gaya Bahasa: ${project.languageStyle ?? "teknikal"}
${project.rawSpec ? `\nSPESIFIKASI LENGKAP:\n${project.rawSpec}` : ""}
${ragContext ? `\n\nKNOWLEDGE BASE PRODUK (Gunakan ini sebagai referensi utama):\n${ragContext}` : ""}

BRAND GUIDELINES:
- Tone: ${workspace.brandTone ?? "profesional teknikal"}
- Style: ${workspace.brandStyle ?? "clean, dark, minimalist"}
${workspace.brandGuide ? `\nBRAND GUIDE:\n${workspace.brandGuide}` : ""}
`.trim();
}

// ─── Generate Router ────────────────────────────────────────────────────────

export const generateRouter = createTRPCRouter({
  // 1. Generate SEO Titles
  titles: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        provider: z.nativeEnum(AiProvider),
        count: z.number().min(1).max(5).default(3),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, workspace: { userId: ctx.userId } },
        include: { workspace: true },
      });
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      // Check daily limit
      const userPlan = await ctx.db.user.findUnique({ where: { id: ctx.userId }, select: { plan: true } });
      await checkDailyLimit(ctx.db, ctx.userId, userPlan?.plan ?? "FREE");

      const apiKeyRecord = await getApiKey(ctx.userId, input.provider);
      const decodedKey = decryptKey(apiKeyRecord.keyHash);
      const model = getModel(input.provider, decodedKey, apiKeyRecord.baseUrl);

      // RAG: fetch relevant product knowledge
      const ragQuery = `judul SEO ${project.productName} ${project.category ?? ""} ${project.mainFeature ?? ""}`;
      const ragContext = await getRelevantProductContext(ctx.db, input.projectId, ragQuery);
      const context = buildProjectContext(project, project.workspace, ragContext);

      const platform = project.platform === "ALL" ? "Shopee, Tokopedia, dan TikTok Shop" : project.platform;

      const { text } = await generateText({
        model,
        prompt: `${context}

TUGAS: Buat ${input.count} variasi judul produk untuk platform ${platform}.

ATURAN JUDUL:
- Maksimal 100 karakter per judul
- Sertakan keyword utama di awal
- Tidak spam keyword
- Natural dan readable
- Optimized untuk CTR

FORMAT RESPON (JSON only, no markdown):
{
  "titles": [
    {
      "title": "...",
      "seoScore": 85,
      "reasoning": "Alasan singkat kenapa judul ini bagus"
    }
  ]
}`,
      });

      let parsed: { titles: { title: string; seoScore: number; reasoning: string }[] };
      try {
        parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI response format tidak valid" });
      }

      const created = await ctx.db.$transaction(
        parsed.titles.map((t) =>
          ctx.db.generatedTitle.create({
            data: {
              projectId: input.projectId,
              platform: project.platform,
              title: t.title,
              seoScore: t.seoScore,
              reasoning: t.reasoning,
            },
          })
        )
      );

      // Log usage
      await ctx.db.usageLog.create({
        data: {
          projectId: input.projectId,
          apiKeyId: apiKeyRecord.id,
          provider: input.provider,
          generationType: "TITLE",
        },
      });

      return created;
    }),

  // 2. Generate Description
  description: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        provider: z.nativeEnum(AiProvider),
        length: z.enum(["short", "medium", "long"]).default("long"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, workspace: { userId: ctx.userId } },
        include: { workspace: true },
      });
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      // Check daily limit
      const userPlanDesc = await ctx.db.user.findUnique({ where: { id: ctx.userId }, select: { plan: true } });
      await checkDailyLimit(ctx.db, ctx.userId, userPlanDesc?.plan ?? "FREE");

      const apiKeyRecord = await getApiKey(ctx.userId, input.provider);
      const decodedKey = decryptKey(apiKeyRecord.keyHash);
      const model = getModel(input.provider, decodedKey, apiKeyRecord.baseUrl);

      // RAG: fetch relevant product knowledge
      const ragQueryDesc = `deskripsi ${project.productName} ${project.useCase ?? ""} ${project.mainFeature ?? ""}`;
      const ragContextDesc = await getRelevantProductContext(ctx.db, input.projectId, ragQueryDesc);
      const context = buildProjectContext(project, project.workspace, ragContextDesc);

      const targetLength = {
        short: "800–1200 karakter",
        medium: "1500–2000 karakter",
        long: "2500–3000 karakter",
      }[input.length];

      const { text } = await generateText({
        model,
        prompt: `${context}

TUGAS: Buat deskripsi produk marketplace dengan panjang ${targetLength}.

SASARAN: Deskripsi harus sangat persuasif, SEO-friendly, dan terlihat profesional.

STRUKTUR DESKRIPSI (Gunakan Markdown):
1. [Hook] Kalimat pembuka yang emosional atau menarik perhatian.
2. [Problem & Solution] Bahas pain point user dan bagaimana produk ini menyelesaikannya.
3. [Fitur Utama] Gunakan bullet points ( * ) untuk fitur teknis dan manfaatnya.
4. [Spesifikasi] Tabel atau list spesifikasi jika ada konteks teknis.
5. [Use Case] Skenario penggunaan nyata.
6. [CTA] Ajakan bertindak yang halus.

ATURAN FORMATTING:
- Gunakan **Markdown** sepenuhnya.
- Gunakan DOUBLE NEWLINE (Enter 2x) untuk setiap paragraf baru agar spacing rapi.
- Gunakan Bold ( **teks** ) untuk poin penting.
- Gunakan Bullet Points ( * ) untuk list.
- Bahasa Indonesia ${project.languageStyle ?? "teknikal semi-formal"}.
- JANGAN sertakan penjelasan tambahan, langsung mulai dari Hook.`,
      });

      const created = await ctx.db.generatedDescription.create({
        data: {
          projectId: input.projectId,
          platform: project.platform,
          content: text.trim(),
          charCount: text.trim().length,
        },
      });

      await ctx.db.usageLog.create({
        data: {
          projectId: input.projectId,
          apiKeyId: apiKeyRecord.id,
          provider: input.provider,
          generationType: "DESCRIPTION",
        },
      });

      return created;
    }),

  // 3. Generate Slides
  slides: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        provider: z.nativeEnum(AiProvider),
        count: z.number().min(3).max(9).default(5),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, workspace: { userId: ctx.userId } },
        include: { workspace: true },
      });
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      // Check daily limit
      const userPlanSlide = await ctx.db.user.findUnique({ where: { id: ctx.userId }, select: { plan: true } });
      await checkDailyLimit(ctx.db, ctx.userId, userPlanSlide?.plan ?? "FREE");

      const apiKeyRecord = await getApiKey(ctx.userId, input.provider);
      const decodedKey = decryptKey(apiKeyRecord.keyHash);
      const model = getModel(input.provider, decodedKey, apiKeyRecord.baseUrl);

      // RAG: fetch relevant product knowledge
      const ragQuerySlide = `slide konten ${project.productName} ${project.useCase ?? ""} ${project.targetMarket ?? ""}`;
      const ragContextSlide = await getRelevantProductContext(ctx.db, input.projectId, ragQuerySlide);
      const context = buildProjectContext(project, project.workspace, ragContextSlide);

      const slideGuide = [
        "Slide 1 (Hero): Hook kuat, pain point utama, headline bold",
        "Slide 2 (Problem): Visual masalah yang dirasakan user",
        "Slide 3 (Solution): Produk sebagai solusi",
        "Slide 4 (Feature): Fitur unggulan",
        "Slide 5 (Use Case): Contoh penggunaan nyata",
        "Slide 6 (Comparison): Vs produk lain/cara lama (optional)",
        "Slide 7 (Detail Shot): Detail teknis (optional)",
        "Slide 8 (Lifestyle): Lifestyle shot (optional)",
        "Slide 9 (CTA): Call to action + trust signal (optional)",
      ].slice(0, input.count).join("\n");

      const { text } = await generateText({
        model,
        prompt: `${context}

TUGAS: Buat ${input.count} slide konten marketplace.

PANDUAN SLIDE:
${slideGuide}

ATURAN:
- Minimal teks, maksimal impact
- Headline bold dan singkat (max 8 kata)
- Subtext pendek tapi informatif (max 2 kalimat)
- CTA hanya di slide terakhir

FORMAT RESPON (JSON only):
{
  "slides": [
    {
      "slideNumber": 1,
      "headline": "...",
      "subtext": "...",
      "cta": null
    }
  ]
}`,
      });

      let parsed: { slides: { slideNumber: number; headline: string; subtext: string; cta?: string | null }[] };
      try {
        parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI response format tidak valid" });
      }

      const created = await ctx.db.$transaction(
        parsed.slides.map((s) =>
          ctx.db.generatedSlide.create({
            data: {
              projectId: input.projectId,
              slideNumber: s.slideNumber,
              headline: s.headline,
              subtext: s.subtext,
              cta: s.cta ?? null,
            },
          })
        )
      );

      await ctx.db.usageLog.create({
        data: {
          projectId: input.projectId,
          apiKeyId: apiKeyRecord.id,
          provider: input.provider,
          generationType: "SLIDE",
        },
      });

      return created;
    }),

  // 4. Generate Image Prompts
  imagePrompts: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        provider: z.nativeEnum(AiProvider),
        style: z.enum(["banana2", "banana3pro", "general"]).default("banana3pro"),
        count: z.number().min(1).max(9).default(5),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: { id: input.projectId, workspace: { userId: ctx.userId } },
        include: { workspace: true },
      });
      if (!project) throw new TRPCError({ code: "NOT_FOUND" });

      // Check daily limit
      const userPlanImg = await ctx.db.user.findUnique({ where: { id: ctx.userId }, select: { plan: true } });
      await checkDailyLimit(ctx.db, ctx.userId, userPlanImg?.plan ?? "FREE");

      const apiKeyRecord = await getApiKey(ctx.userId, input.provider);
      const decodedKey = decryptKey(apiKeyRecord.keyHash);
      const model = getModel(input.provider, decodedKey, apiKeyRecord.baseUrl);

      // RAG: fetch relevant product knowledge
      const ragQueryImg = `image prompt visual ${project.productName} ${project.mainFeature ?? ""}`;
      const ragContextImg = await getRelevantProductContext(ctx.db, input.projectId, ragQueryImg);
      const context = buildProjectContext(project, project.workspace, ragContextImg);

      const styleGuide = {
        banana2: "Google Imagen 2 — photorealistic, clean studio, product photography style",
        banana3pro: "Google Imagen 3 Pro — ultra HD, dramatic lighting, cinematic, tech product aesthetic",
        general: "Universal AI image style — balanced detail, professional e-commerce",
      }[input.style];

      const { text } = await generateText({
        model,
        prompt: `${context}

TUGAS: Buat ${input.count} prompt gambar untuk AI image generator.

TARGET TOOL: ${styleGuide}

BRAND VISUAL:
- Dark/gradient background
- High contrast, strong lighting
- Center focus pada produk
- Clean, minimalist, no clutter
- Tech-forward aesthetic
- Professional e-commerce feel
- Ratio 1:1

SLIDE YANG DIBUATKAN PROMPT:
${Array.from({ length: input.count }, (_, i) => `Slide ${i + 1}`).join(", ")}

ATURAN PROMPT GAMBAR:
- Deskriptif dan spesifik
- Sertakan detail pencahayaan
- Sertakan mood/atmosphere
- Bahasa Inggris (untuk AI image generator)
- Tidak perlu caption/text dalam gambar

FORMAT RESPON (JSON only):
{
  "prompts": [
    {
      "slideNumber": 1,
      "prompt": "A detailed English prompt here...",
      "slideContext": "Slide 1: Hero shot"
    }
  ]
}`,
      });

      let parsed: { prompts: { slideNumber: number; prompt: string; slideContext: string }[] };
      try {
        parsed = JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "AI response format tidak valid" });
      }

      const created = await ctx.db.$transaction(
        parsed.prompts.map((p) =>
          ctx.db.imagePrompt.create({
            data: {
              projectId: input.projectId,
              slideNumber: p.slideNumber,
              prompt: p.prompt,
              style: input.style,
            },
          })
        )
      );

      await ctx.db.usageLog.create({
        data: {
          projectId: input.projectId,
          apiKeyId: apiKeyRecord.id,
          provider: input.provider,
          generationType: "IMAGE_PROMPT",
        },
      });

      return created;
    }),
});
