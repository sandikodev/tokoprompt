"use client";

import { trpc } from "@/lib/trpc";

const PRO_FEATURES = [
  { icon: "⚡", title: "Generate Tanpa Batas", desc: "Tidak ada restriksi harian — generate sebanyak yang Anda mau" },
  { icon: "🏢", title: "Workspace Tanpa Batas", desc: "Buat workspace untuk setiap brand/toko tanpa batas" },
  { icon: "📦", title: "Project Tanpa Batas", desc: "Kelola ratusan SKU dalam satu workspace" },
  { icon: "🔗", title: "AI Proxy Support", desc: "Gunakan proxy seperti ngrok/Antigravity Manager untuk routing kustom" },
  { icon: "🧠", title: "RAG per Produk", desc: "Upload datasheet/PDF — AI baca konteks spesifik produk Anda" },
  { icon: "📤", title: "Bulk Export", desc: "Export semua konten sekaligus ke format marketplace" },
];

function LimitBar({ label, used, max, color }: { label: string; used: number; max: number | null; color: string }) {
  const pct = max ? Math.min((used / max) * 100, 100) : 0;
  const isUnlimited = max === null;
  const isNearLimit = !isUnlimited && pct >= 80;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span style={{ color: "oklch(0.65 0.05 270)" }}>{label}</span>
        <span style={{ color: isNearLimit ? "oklch(0.72 0.20 25)" : "oklch(0.55 0.05 270)" }}>
          {isUnlimited ? (
            <span style={{ color: "oklch(0.72 0.18 150)" }}>∞ Tanpa batas</span>
          ) : (
            `${used} / ${max}`
          )}
        </span>
      </div>
      {!isUnlimited && (
        <div style={{ height: "4px", background: "oklch(0.14 0.02 270)", borderRadius: "9999px" }}>
          <div style={{
            height: "100%",
            width: `${pct}%`,
            background: isNearLimit ? "oklch(0.72 0.20 25)" : color,
            borderRadius: "9999px",
            transition: "width 0.5s ease",
          }} />
        </div>
      )}
    </div>
  );
}

export default function UpgradePage() {
  const { data: planData, isLoading } = trpc.plan.getMyPlan.useQuery();

  const isPro = planData?.plan === "PRO";

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <div
          className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
          style={{
            background: isPro ? "oklch(0.72 0.18 150 / 0.15)" : "oklch(0.54 0.28 270 / 0.15)",
            color: isPro ? "oklch(0.72 0.18 150)" : "oklch(0.72 0.24 270)",
            border: `1px solid ${isPro ? "oklch(0.72 0.18 150 / 0.4)" : "oklch(0.72 0.24 270 / 0.4)"}`,
          }}
        >
          {isPro ? "✦ Anda sudah PRO" : "Plan Saat Ini: FREE"}
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: "oklch(0.92 0.04 270)" }}>
          {isPro ? "Status Langganan Anda" : "Upgrade ke PRO"}
        </h1>
        <p className="text-sm" style={{ color: "oklch(0.52 0.05 270)" }}>
          {isPro
            ? "Nikmati semua fitur PRO tanpa batas."
            : "Buang batas — generate konten marketplace tanpa restriksi."}
        </p>
      </div>

      {/* Current Usage */}
      {!isLoading && planData && (
        <div className="card mb-8">
          <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "oklch(0.55 0.08 270)" }}>
            Penggunaan Saat Ini
          </div>
          <div className="flex flex-col gap-4">
            <LimitBar
              label="Workspace"
              used={planData.limits.workspaces.used}
              max={planData.limits.workspaces.max}
              color="oklch(0.72 0.24 270)"
            />
            <LimitBar
              label="Project (total)"
              used={planData.limits.projects.used}
              max={planData.limits.projects.max}
              color="oklch(0.72 0.24 270)"
            />
            <LimitBar
              label="Generate hari ini"
              used={planData.limits.generatesPerDay.used}
              max={planData.limits.generatesPerDay.max}
              color="oklch(0.72 0.18 150)"
            />
          </div>
          <div
            className="mt-4 pt-4 flex items-center justify-between text-xs"
            style={{ borderTop: "1px solid oklch(0.18 0.03 270 / 0.5)", color: "oklch(0.45 0.04 270)" }}
          >
            <span>Total generate semua waktu:</span>
            <span style={{ color: "oklch(0.72 0.24 270)", fontWeight: 600 }}>
              {planData.limits.totalGenerates.toLocaleString()}×
            </span>
          </div>
        </div>
      )}

      {/* Plan Comparison */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* FREE Card */}
        <div
          className="card"
          style={{
            border: !isPro ? "1px solid oklch(0.54 0.28 270 / 0.5)" : undefined,
            opacity: isPro ? 0.6 : 1,
          }}
        >
          <div className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: "oklch(0.55 0.05 270)" }}>Free</div>
          <div className="text-2xl font-bold mb-4" style={{ color: "oklch(0.88 0.04 270)" }}>Rp 0</div>
          <ul className="flex flex-col gap-2 text-sm">
            {[
              "2 Workspace",
              "3 Project per Workspace",
              "15 Generate per hari",
              "BYOK (bawa API key sendiri)",
              "Export konten ke clipboard",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2" style={{ color: "oklch(0.65 0.04 270)" }}>
                <span style={{ color: "oklch(0.72 0.18 150)" }}>✓</span> {f}
              </li>
            ))}
            {[
              "Proxy AI Support",
              "RAG per produk",
              "Bulk Export",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2" style={{ color: "oklch(0.35 0.03 270)" }}>
                <span>✗</span> {f}
              </li>
            ))}
          </ul>
        </div>

        {/* PRO Card */}
        <div
          className="card relative overflow-hidden"
          style={{
            border: isPro ? "1px solid oklch(0.72 0.24 270 / 0.6)" : "1px solid oklch(0.40 0.15 270 / 0.5)",
            background: "oklch(0.11 0.02 270)",
          }}
        >
          {/* Glow accent */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "2px",
            background: "linear-gradient(90deg, oklch(0.60 0.30 270), oklch(0.72 0.24 310))",
          }} />

          <div className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: "oklch(0.72 0.24 270)" }}>Pro</div>
          <div className="flex items-baseline gap-1 mb-4">
            <div className="text-2xl font-bold" style={{ color: "oklch(0.92 0.04 270)" }}>Hubungi Kami</div>
          </div>
          <ul className="flex flex-col gap-2 text-sm">
            {[
              "Workspace tanpa batas",
              "Project tanpa batas",
              "Generate tanpa batas harian",
              "BYOK dengan AI Proxy support",
              "Export semua format platform",
              "RAG per produk (upload datasheet)",
              "Priority support",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2" style={{ color: "oklch(0.75 0.04 270)" }}>
                <span style={{ color: "oklch(0.72 0.24 270)" }}>✦</span> {f}
              </li>
            ))}
          </ul>

          {!isPro && (
            <a
              href="mailto:support@tokoprompt.com?subject=Upgrade ke PRO"
              className="btn btn-primary w-full justify-center mt-5"
              style={{ display: "flex" }}
            >
              Upgrade ke PRO →
            </a>
          )}
          {isPro && (
            <div
              className="mt-5 text-center text-sm py-2 rounded-lg"
              style={{ background: "oklch(0.72 0.18 150 / 0.12)", color: "oklch(0.72 0.18 150)" }}
            >
              ✓ Aktif
              {planData?.planExpiresAt && (
                <span style={{ color: "oklch(0.50 0.04 270)", fontSize: "11px", display: "block" }}>
                  Hingga {new Date(planData.planExpiresAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pro Features Grid */}
      {!isPro && (
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider mb-4 text-center" style={{ color: "oklch(0.55 0.08 270)" }}>
            Semua yang Anda Dapatkan dengan PRO
          </div>
          <div className="grid grid-cols-2 gap-3">
            {PRO_FEATURES.map((f) => (
              <div
                key={f.title}
                className="card flex items-start gap-3"
                style={{ background: "oklch(0.10 0.01 270)" }}
              >
                <span style={{ fontSize: "20px", lineHeight: 1 }}>{f.icon}</span>
                <div>
                  <div className="text-sm font-semibold mb-0.5" style={{ color: "oklch(0.85 0.04 270)" }}>{f.title}</div>
                  <div className="text-xs" style={{ color: "oklch(0.50 0.04 270)" }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
