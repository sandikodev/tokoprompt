"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

type AiProvider = "OPENAI" | "ANTHROPIC" | "GEMINI";

interface GeneratorPanelProps {
  project: {
    id: string;
    platform: string;
  };
  provider: AiProvider;
  hasApiKey: boolean;
  activeTab: "titles" | "description" | "slides" | "imagePrompts";
  onSuccess: () => void;
}

type ImageStyle = "banana2" | "banana3pro" | "general";
type DescLength = "short" | "medium" | "long";

export default function GeneratorPanel({
  project,
  provider,
  hasApiKey,
  activeTab,
  onSuccess,
}: GeneratorPanelProps) {
  const [count, setCount] = useState(3);
  const [slidesCount, setSlidesCount] = useState(5);
  const [imageCount, setImageCount] = useState(5);
  const [imageStyle, setImageStyle] = useState<ImageStyle>("banana3pro");
  const [descLength, setDescLength] = useState<DescLength>("long");

  const titleMutation = trpc.generate.titles.useMutation({ onSuccess });
  const descMutation = trpc.generate.description.useMutation({ onSuccess });
  const slidesMutation = trpc.generate.slides.useMutation({ onSuccess });
  const imageMutation = trpc.generate.imagePrompts.useMutation({ onSuccess });
  const clearMutation = trpc.usage.clearContent.useMutation({ onSuccess });

  const [confirmClear, setConfirmClear] = useState(false);

  const typeMap: Record<typeof activeTab, "titles" | "descriptions" | "slides" | "imagePrompts"> = {
    titles: "titles",
    description: "descriptions",
    slides: "slides",
    imagePrompts: "imagePrompts",
  };

  function handleClear() {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3500);
      return;
    }
    clearMutation.mutate({ projectId: project.id, type: typeMap[activeTab] });
    setConfirmClear(false);
  }

  const isPending =
    titleMutation.isPending ||
    descMutation.isPending ||
    slidesMutation.isPending ||
    imageMutation.isPending;

  function handleGenerate() {
    if (!hasApiKey) return;

    if (activeTab === "titles") {
      titleMutation.mutate({ projectId: project.id, provider, count });
    } else if (activeTab === "description") {
      descMutation.mutate({ projectId: project.id, provider, length: descLength });
    } else if (activeTab === "slides") {
      slidesMutation.mutate({ projectId: project.id, provider, count: slidesCount });
    } else if (activeTab === "imagePrompts") {
      imageMutation.mutate({ projectId: project.id, provider, style: imageStyle, count: imageCount });
    }
  }

  const currentError =
    titleMutation.error?.message ||
    descMutation.error?.message ||
    slidesMutation.error?.message ||
    imageMutation.error?.message;

  return (
    <div
      className="card flex flex-col gap-6"
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium" style={{ color: "oklch(0.75 0.08 270)" }}>
          Generate dengan{" "}
          <span style={{ color: "oklch(0.80 0.20 270)" }}>
            {provider === "OPENAI" ? "ChatGPT" : provider === "ANTHROPIC" ? "Claude" : "Gemini"}
          </span>
        </div>

        {/* Tab-specific options */}
        <div className="flex items-center gap-3">
          {activeTab === "titles" && (
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "oklch(0.45 0.04 270)" }}>Jumlah variasi:</span>
              <div className="flex gap-1">
                {[3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    className="btn btn-sm"
                    style={{
                      background: count === n ? "oklch(0.54 0.28 270 / 0.20)" : "oklch(0.12 0.02 270)",
                      border: `1px solid ${count === n ? "oklch(0.54 0.28 270 / 0.40)" : "oklch(0.22 0.04 270 / 0.4)"}`,
                      color: count === n ? "oklch(0.78 0.18 270)" : "oklch(0.55 0.05 270)",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "description" && (
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "oklch(0.45 0.04 270)" }}>Panjang:</span>
              <div className="flex gap-1">
                {(["short", "medium", "long"] as DescLength[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setDescLength(l)}
                    className="btn btn-sm"
                    style={{
                      background: descLength === l ? "oklch(0.54 0.28 270 / 0.20)" : "oklch(0.12 0.02 270)",
                      border: `1px solid ${descLength === l ? "oklch(0.54 0.28 270 / 0.40)" : "oklch(0.22 0.04 270 / 0.4)"}`,
                      color: descLength === l ? "oklch(0.78 0.18 270)" : "oklch(0.55 0.05 270)",
                    }}
                  >
                    {l === "short" ? "Pendek" : l === "medium" ? "Sedang" : "Panjang"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "slides" && (
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "oklch(0.45 0.04 270)" }}>Slide:</span>
              <div className="flex gap-1">
                {[3, 5, 7, 9].map((n) => (
                  <button
                    key={n}
                    onClick={() => setSlidesCount(n)}
                    className="btn btn-sm"
                    style={{
                      background: slidesCount === n ? "oklch(0.54 0.28 270 / 0.20)" : "oklch(0.12 0.02 270)",
                      border: `1px solid ${slidesCount === n ? "oklch(0.54 0.28 270 / 0.40)" : "oklch(0.22 0.04 270 / 0.4)"}`,
                      color: slidesCount === n ? "oklch(0.78 0.18 270)" : "oklch(0.55 0.05 270)",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "imagePrompts" && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "oklch(0.45 0.04 270)" }}>Style:</span>
                <div className="flex gap-1">
                  {(["banana2", "banana3pro", "general"] as ImageStyle[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setImageStyle(s)}
                      className="btn btn-sm"
                      style={{
                        background: imageStyle === s ? "oklch(0.54 0.28 270 / 0.20)" : "oklch(0.12 0.02 270)",
                        border: `1px solid ${imageStyle === s ? "oklch(0.54 0.28 270 / 0.40)" : "oklch(0.22 0.04 270 / 0.4)"}`,
                        color: imageStyle === s ? "oklch(0.78 0.18 270)" : "oklch(0.55 0.05 270)",
                      }}
                    >
                      {s === "banana2" ? "Imagen 2" : s === "banana3pro" ? "Imagen 3 Pro" : "General"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "oklch(0.45 0.04 270)" }}>Jumlah:</span>
                <div className="flex gap-1">
                  {[3, 5, 7, 9].map((n) => (
                    <button
                      key={n}
                      onClick={() => setImageCount(n)}
                      className="btn btn-sm"
                      style={{
                        background: imageCount === n ? "oklch(0.54 0.28 270 / 0.20)" : "oklch(0.12 0.02 270)",
                        border: `1px solid ${imageCount === n ? "oklch(0.54 0.28 270 / 0.40)" : "oklch(0.22 0.04 270 / 0.4)"}`,
                        color: imageCount === n ? "oklch(0.78 0.18 270)" : "oklch(0.55 0.05 270)",
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {currentError && (
        <div
          className="px-4 py-2.5 rounded-lg text-sm"
          style={{
            background: "oklch(0.60 0.22 25 / 0.12)",
            border: "1px solid oklch(0.60 0.22 25 / 0.3)",
            color: "oklch(0.78 0.15 25)",
          }}
        >
          {currentError}
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleGenerate}
          disabled={isPending || !hasApiKey}
          className="btn btn-primary animate-pulse-glow"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Generating...
            </span>
          ) : !hasApiKey ? (
            "⚠️ API Key tidak tersedia"
          ) : (
            <>
              ✦ Generate{" "}
              {activeTab === "titles"
                ? "Judul SEO"
                : activeTab === "description"
                ? "Deskripsi"
                : activeTab === "slides"
                ? "Slide"
                : "Image Prompts"}
            </>
          )}
        </button>

        {/* Clear history button with double-confirm */}
        <button
          onClick={handleClear}
          disabled={clearMutation.isPending}
          className="btn btn-ghost btn-sm"
          style={{
            color: confirmClear ? "oklch(0.72 0.20 25)" : "oklch(0.40 0.04 270)",
            border: confirmClear ? "1px solid oklch(0.60 0.22 25 / 0.4)" : "1px solid oklch(0.22 0.04 270 / 0.3)",
            transition: "all 0.2s",
          }}
        >
          {clearMutation.isPending
            ? "Menghapus..."
            : confirmClear
            ? "⚠ Klik lagi untuk hapus semua"
            : "Hapus Riwayat"}
        </button>
      </div>
    </div>
  );
}
