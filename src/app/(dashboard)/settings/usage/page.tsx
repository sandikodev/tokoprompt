"use client";

import { trpc } from "@/lib/trpc";

const PROVIDER_LABELS: Record<string, { label: string; color: string }> = {
  OPENAI:    { label: "GPT-4o Mini",    color: "oklch(0.72 0.18 155)" },
  ANTHROPIC: { label: "Claude Haiku",   color: "oklch(0.78 0.18 310)" },
  GEMINI:    { label: "Gemini Flash",   color: "oklch(0.80 0.18 80)"  },
};

const TYPE_ICONS: Record<string, string> = {
  TITLE:        "✦",
  DESCRIPTION:  "◈",
  SLIDE:        "⬡",
  IMAGE_PROMPT: "◎",
};

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ height: "4px", background: "oklch(0.14 0.02 270)", borderRadius: "9999px" }}>
      <div style={{
        height: "100%",
        width: `${pct}%`,
        background: color,
        borderRadius: "9999px",
        transition: "width 0.5s ease",
      }} />
    </div>
  );
}

function ActivityChart({ daily }: { daily: Record<string, number> }) {
  const entries = Object.entries(daily);
  const max = Math.max(...entries.map(([, v]) => v), 1);
  const now = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex items-end gap-1" style={{ height: "48px" }}>
      {entries.map(([date, count]) => {
        const h = Math.max((count / max) * 100, count > 0 ? 15 : 4);
        const isToday = date === now;
        const label = new Date(date + "T12:00:00").toLocaleDateString("id-ID", { weekday: "short" });
        return (
          <div key={date} className="flex flex-col items-center gap-1 flex-1" title={`${date}: ${count} generate`}>
            <div style={{
              width: "100%",
              height: `${h}%`,
              background: isToday ? "oklch(0.72 0.24 270)" : "oklch(0.35 0.08 270)",
              borderRadius: "3px 3px 0 0",
              minHeight: "3px",
              transition: "height 0.4s ease",
            }} />
            <span style={{ fontSize: "9px", color: "oklch(0.40 0.04 270)" }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function UsagePage() {
  const { data, isLoading } = trpc.usage.summary.useQuery();

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="text-sm" style={{ color: "oklch(0.45 0.05 270)" }}>Memuat data usage...</div>
      </div>
    );
  }

  if (!data) return null;

  const maxByType = Math.max(...Object.values(data.byType), 1);
  const maxByProvider = Math.max(...Object.values(data.byProvider), 1);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-1" style={{ color: "oklch(0.92 0.04 270)" }}>
        Usage Dashboard
      </h1>
      <p className="text-sm mb-8" style={{ color: "oklch(0.50 0.05 270)" }}>
        Statistik penggunaan AI generate konten Anda.
      </p>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Generate", value: data.totalGenerations.toLocaleString(), icon: "⚡", color: "oklch(0.72 0.24 270)" },
          { label: "Total Token", value: data.totalTokens > 0 ? data.totalTokens.toLocaleString() : "—", icon: "⬡", color: "oklch(0.72 0.18 155)" },
          { label: "Estimasi Biaya", value: data.totalCost > 0 ? `$${data.totalCost.toFixed(4)}` : "$0.00", icon: "◎", color: "oklch(0.80 0.18 80)" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="card flex flex-col gap-2"
            style={{ background: "oklch(0.10 0.01 270)" }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider" style={{ color: "oklch(0.48 0.06 270)" }}>
                {kpi.label}
              </span>
              <span style={{ color: kpi.color, fontSize: "16px" }}>{kpi.icon}</span>
            </div>
            <div className="text-3xl font-bold" style={{ color: kpi.color }}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Activity Chart */}
        <div className="card">
          <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "oklch(0.55 0.08 270)" }}>
            Aktivitas 7 Hari Terakhir
          </div>
          {data.totalGenerations === 0 ? (
            <div className="text-xs text-center py-4" style={{ color: "oklch(0.40 0.04 270)" }}>
              Belum ada aktivitas
            </div>
          ) : (
            <ActivityChart daily={data.dailyActivity} />
          )}
        </div>

        {/* By Provider */}
        <div className="card">
          <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "oklch(0.55 0.08 270)" }}>
            Penggunaan per AI
          </div>
          {Object.keys(data.byProvider).length === 0 ? (
            <div className="text-xs text-center py-4" style={{ color: "oklch(0.40 0.04 270)" }}>
              Belum ada data
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {Object.entries(data.byProvider).map(([provider, count]) => {
                const meta = PROVIDER_LABELS[provider] ?? { label: provider, color: "oklch(0.60 0.08 270)" };
                return (
                  <div key={provider} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: meta.color }}>{meta.label}</span>
                      <span style={{ color: "oklch(0.55 0.04 270)" }}>{count}×</span>
                    </div>
                    <MiniBar value={count} max={maxByProvider} color={meta.color} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* By Content Type */}
      <div className="card mb-6">
        <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "oklch(0.55 0.08 270)" }}>
          Rincian per Tipe Konten
        </div>
        {Object.keys(data.byType).length === 0 ? (
          <div className="text-xs text-center py-4" style={{ color: "oklch(0.40 0.04 270)" }}>
            Belum ada konten yang digenerate
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {(["TITLE", "DESCRIPTION", "SLIDE", "IMAGE_PROMPT"] as const).map((type) => {
              const count = data.byType[type] ?? 0;
              const label = type === "TITLE" ? "Judul SEO" : type === "DESCRIPTION" ? "Deskripsi" : type === "SLIDE" ? "Slide" : "Image Prompt";
              return (
                <div
                  key={type}
                  className="flex items-center gap-3 rounded-xl p-3"
                  style={{ background: "oklch(0.10 0.01 270)" }}
                >
                  <span style={{ fontSize: "18px", color: "oklch(0.54 0.20 270)" }}>
                    {TYPE_ICONS[type]}
                  </span>
                  <div className="flex-1">
                    <div className="text-xs" style={{ color: "oklch(0.48 0.04 270)" }}>{label}</div>
                    <div className="text-lg font-bold" style={{ color: "oklch(0.82 0.12 270)" }}>{count}</div>
                    <MiniBar value={count} max={maxByType} color="oklch(0.54 0.20 270)" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Logs */}
      {data.recentLogs.length > 0 && (
        <div className="card">
          <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "oklch(0.55 0.08 270)" }}>
            Riwayat Generate Terbaru
          </div>
          <div className="flex flex-col gap-1">
            {data.recentLogs.map((log, i) => {
              const meta = PROVIDER_LABELS[log.provider] ?? { label: log.provider, color: "oklch(0.60 0.08 270)" };
              const typeLabel = log.generationType === "TITLE" ? "Judul" : log.generationType === "DESCRIPTION" ? "Deskripsi" : log.generationType === "SLIDE" ? "Slide" : "Image Prompt";
              const timeAgo = (() => {
                const diff = (Date.now() - new Date(log.createdAt).getTime()) / 1000;
                if (diff < 60) return `${Math.round(diff)}s lalu`;
                if (diff < 3600) return `${Math.round(diff / 60)}m lalu`;
                if (diff < 86400) return `${Math.round(diff / 3600)}j lalu`;
                return `${Math.round(diff / 86400)}h lalu`;
              })();

              return (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs"
                  style={{ background: i % 2 === 0 ? "oklch(0.10 0.01 270)" : "transparent" }}
                >
                  <span style={{ color: "oklch(0.45 0.04 270)" }}>{TYPE_ICONS[log.generationType]}</span>
                  <span style={{ color: "oklch(0.65 0.04 270)" }}>{typeLabel}</span>
                  <span className="ml-auto" style={{ color: meta.color }}>{meta.label}</span>
                  <span style={{ color: "oklch(0.38 0.04 270)", minWidth: "60px", textAlign: "right" }}>{timeAgo}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
