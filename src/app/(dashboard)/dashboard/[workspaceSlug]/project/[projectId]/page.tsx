"use client";

import { use, useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import GeneratorPanel from "@/components/generator/GeneratorPanel";
import ContentTabs from "@/components/generator/ContentTabs";
import ProductContextPanel from "@/components/generator/ProductContextPanel";

type AiProvider = "OPENAI" | "ANTHROPIC" | "GEMINI";
type ApiKey = { id: string; provider: string; keyPreview: string; isActive: boolean; label: string | null; createdAt: Date };

const STATUS_COLORS: Record<string, string> = {
  DRAFT:    "oklch(0.80 0.18 80)",
  ACTIVE:   "oklch(0.72 0.18 150)",
  ARCHIVED: "oklch(0.72 0.18 25)",
};
const STATUS_LABELS: Record<string, string> = { DRAFT: "Draft", ACTIVE: "Aktif", ARCHIVED: "Arsip" };

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; projectId: string }>;
}) {
  const { workspaceSlug, projectId } = use(params);

  const { data: project, isLoading, refetch } = trpc.project.getById.useQuery({ id: projectId });
  const { data: apiKeys } = trpc.apiKey.list.useQuery();

  const [activeTab, setActiveTab] = useState<"titles" | "description" | "slides" | "imagePrompts">("titles");
  const [selectedProvider, setSelectedProvider] = useState<AiProvider>("OPENAI");

  const activeKeys = (apiKeys as ApiKey[] | undefined)?.filter((k) => k.isActive) ?? [];
  const availableProviders = activeKeys.map((k) => k.provider as AiProvider);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="text-sm" style={{ color: "oklch(0.45 0.05 270)" }}>Memuat project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center">
        <p style={{ color: "oklch(0.55 0.05 270)" }}>Project tidak ditemukan.</p>
        <Link href={`/dashboard/${workspaceSlug}`} className="btn btn-secondary btn-sm mt-4">← Workspace</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Top Bar */}
      <div
        className="flex items-center gap-3 px-8 py-5 border-b"
        style={{ borderColor: "oklch(0.18 0.03 270 / 0.6)", background: "oklch(0.09 0.01 270)" }}
      >
        <Link
          href={`/dashboard/${workspaceSlug}`}
          className="flex items-center gap-1 text-sm"
          style={{ color: "oklch(0.50 0.05 270)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <span style={{ color: "oklch(0.35 0.04 270)" }}>/</span>
        <span className="text-sm font-medium truncate" style={{ color: "oklch(0.88 0.04 270)" }}>
          {project.name}
        </span>
        {/* Status badge */}
        <span
          className="badge text-xs px-2 py-0.5 rounded-full shrink-0"
          style={{
            background: `${STATUS_COLORS[project.status] ?? "oklch(0.80 0.18 80)"}18`,
            color: STATUS_COLORS[project.status] ?? "oklch(0.80 0.18 80)",
            border: `1px solid ${STATUS_COLORS[project.status] ?? "oklch(0.80 0.18 80)"}40`,
          }}
        >
          {STATUS_LABELS[project.status] ?? project.status}
        </span>
        <div className="ml-auto flex items-center gap-2">
          {availableProviders.length === 0 ? (
            <Link href="/settings/api-keys" className="btn btn-secondary btn-sm">
              ⚠️ Tambah API Key dulu
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "oklch(0.45 0.04 270)" }}>AI Engine:</span>
              <div className="flex gap-1">
                {(["OPENAI", "ANTHROPIC", "GEMINI"] as AiProvider[]).map((p) => {
                  const available = availableProviders.includes(p);
                  return (
                    <button
                      key={p}
                      onClick={() => available && setSelectedProvider(p)}
                      disabled={!available}
                      className="btn btn-sm"
                      style={{
                        background: selectedProvider === p && available ? "oklch(0.54 0.28 270 / 0.20)" : "oklch(0.12 0.02 270)",
                        border: `1px solid ${selectedProvider === p && available ? "oklch(0.54 0.28 270 / 0.40)" : "oklch(0.20 0.03 270 / 0.5)"}`,
                        color: !available ? "oklch(0.35 0.03 270)" : selectedProvider === p ? "oklch(0.78 0.18 270)" : "oklch(0.55 0.05 270)",
                        cursor: !available ? "not-allowed" : "pointer",
                        opacity: !available ? 0.5 : 1,
                      }}
                    >
                      {p === "OPENAI" ? "GPT" : p === "ANTHROPIC" ? "Claude" : "Gemini"}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left: Product Context */}
        <div
          className="w-72 shrink-0 border-r overflow-y-auto"
          style={{ borderColor: "oklch(0.18 0.03 270 / 0.6)" }}
        >
          <div className="p-6">
            <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "oklch(0.40 0.05 270)" }}>
              Konteks Produk
            </div>

            {[
              { label: "Nama Produk", value: project.productName },
              { label: "Kategori", value: project.category },
              { label: "Target Market", value: project.targetMarket },
              { label: "Harga", value: project.priceRange },
              { label: "Fitur Utama", value: project.mainFeature },
              { label: "Sumber Daya", value: project.powerSource },
              { label: "Kompatibilitas", value: project.compatibility },
              { label: "Use Case", value: project.useCase },
              { label: "Platform", value: project.platform },
              { label: "Gaya Bahasa", value: project.languageStyle },
            ]
              .filter((item) => item.value)
              .map((item) => (
                <div key={item.label} className="mb-3">
                  <div className="text-xs font-medium mb-0.5" style={{ color: "oklch(0.45 0.05 270)" }}>
                    {item.label}
                  </div>
                  <div className="text-sm" style={{ color: "oklch(0.78 0.04 270)" }}>
                    {item.value}
                  </div>
                </div>
              ))}

            {project.rawSpec && (
              <div className="mt-3 pt-3" style={{ borderTop: "1px solid oklch(0.18 0.03 270 / 0.5)" }}>
                <div className="text-xs font-medium mb-1" style={{ color: "oklch(0.45 0.05 270)" }}>
                  Spesifikasi Lengkap
                </div>
                <div
                  className="text-xs leading-relaxed line-clamp-6"
                  style={{ color: "oklch(0.60 0.04 270)" }}
                >
                  {project.rawSpec}
                </div>
              </div>
            )}

            {/* Stats summary */}
            <div
              className="grid grid-cols-2 gap-2 mt-4 pt-4"
              style={{ borderTop: "1px solid oklch(0.18 0.03 270 / 0.5)" }}
            >
              {[
                { icon: "✦", label: "Judul",    count: project.titles.length },
                { icon: "◈", label: "Deskripsi", count: project.descriptions.length },
                { icon: "⬡", label: "Slide",    count: project.slides.length },
                { icon: "◎", label: "Prompt",   count: project.imagePrompts.length },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center justify-center rounded-lg py-2"
                  style={{ background: "oklch(0.12 0.02 270)" }}
                >
                  <span style={{ fontSize: "11px", color: "oklch(0.40 0.04 270)" }}>{s.icon}</span>
                  <span className="text-lg font-bold" style={{ color: "oklch(0.82 0.12 270)", lineHeight: 1.2 }}>{s.count}</span>
                  <span style={{ fontSize: "9px", color: "oklch(0.40 0.04 270)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-3">
              <Link
                href={`/dashboard/${workspaceSlug}/project/${projectId}/edit`}
                className="btn btn-secondary btn-sm w-full justify-center"
              >
                Edit Project
              </Link>
            </div>

            {/* RAG Knowledge Base */}
            <div
              className="mt-4 pt-4"
              style={{ borderTop: "1px solid oklch(0.18 0.03 270 / 0.5)" }}
            >
              <ProductContextPanel projectId={projectId} />
            </div>
          </div>
        </div>

        {/* Right: Generator */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Tab Navigation */}
          <div
            className="flex border-b px-4 gap-1"
            style={{ borderColor: "oklch(0.18 0.03 270 / 0.6)" }}
          >
            {(
              [
                { key: "titles",       label: "✦ Judul SEO",          count: project.titles.length },
                { key: "description",  label: "◈ Deskripsi",          count: project.descriptions.length },
                { key: "slides",       label: "⬡ Slide",              count: project.slides.length },
                { key: "imagePrompts", label: "◎ Image Prompts",      count: project.imagePrompts.length },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 transition-all"
                style={{
                  borderBottomColor: activeTab === tab.key ? "oklch(0.72 0.24 270)" : "transparent",
                  color: activeTab === tab.key ? "oklch(0.80 0.18 270)" : "oklch(0.50 0.05 270)",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className="badge badge-brand"
                    style={{ fontSize: "10px", padding: "1px 6px" }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Generator + Content */}
          <div className="p-8 flex flex-col gap-8">
            <GeneratorPanel
              project={project}
              provider={selectedProvider}
              hasApiKey={availableProviders.includes(selectedProvider)}
              activeTab={activeTab}
              onSuccess={() => refetch()}
            />
            <ContentTabs
              project={project}
              activeTab={activeTab}
              onRefetch={() => refetch()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
