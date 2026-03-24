"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

type AiProvider = "OPENAI" | "ANTHROPIC" | "GEMINI";

const PROVIDERS: { value: AiProvider; label: string; desc: string; docsUrl: string }[] = [
  {
    value: "OPENAI",
    label: "OpenAI (ChatGPT)",
    desc: "GPT-4o Mini — model tercepat dan paling hemat untuk konten marketplace.",
    docsUrl: "https://platform.openai.com/api-keys",
  },
  {
    value: "ANTHROPIC",
    label: "Anthropic (Claude)",
    desc: "Claude 3.5 Haiku — sangat bagus untuk konten panjang dan reasoning.",
    docsUrl: "https://console.anthropic.com/settings/keys",
  },
  {
    value: "GEMINI",
    label: "Google (Gemini)",
    desc: "Gemini 1.5 Flash — gratis hingga limit tinggi, cocok untuk scale.",
    docsUrl: "https://aistudio.google.com/app/apikey",
  },
];

function ProviderCard({
  provider,
  label,
  desc,
  docsUrl,
  existingKey,
  onSaved,
}: {
  provider: AiProvider;
  label: string;
  desc: string;
  docsUrl: string;
  existingKey?: { id: string; keyPreview: string; isActive: boolean; baseUrl?: string | null } | null;
  onSaved: () => void;
}) {
  const [inputKey, setInputKey] = useState("");
  const [label_, setLabel] = useState("");
  const [baseUrl_, setBaseUrl] = useState(existingKey?.baseUrl || "");
  const [showForm, setShowForm] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const upsertMutation = trpc.apiKey.upsert.useMutation({
    onSuccess: () => {
      setInputKey("");
      setLabel("");
      setShowForm(false);
      onSaved();
    },
  });

  const toggleMutation = trpc.apiKey.toggleActive.useMutation({ onSuccess: onSaved });
  const deleteMutation = trpc.apiKey.delete.useMutation({ onSuccess: onSaved });

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    upsertMutation.mutate({
      provider,
      key: inputKey,
      label: label_ || undefined,
      baseUrl: baseUrl_ || null,
    });
  }

  const providerEmoji = provider === "OPENAI" ? "🤖" : provider === "ANTHROPIC" ? "🧠" : "✨";

  return (
    <div className="card">
      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
          style={{ background: "oklch(0.16 0.03 270)" }}
        >
          {providerEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-sm" style={{ color: "oklch(0.88 0.04 270)" }}>
              {label}
            </span>
            {existingKey ? (
              <span className={`badge ${existingKey.isActive ? "badge-green" : "badge-amber"} text-xs`}>
                {existingKey.isActive ? "Aktif" : "Nonaktif"}
              </span>
            ) : (
              <span className="badge badge-red text-xs">Belum dikonfigurasi</span>
            )}
          </div>
          <p className="text-xs mb-3" style={{ color: "oklch(0.50 0.04 270)" }}>
            {desc}
          </p>

          {existingKey ? (
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-sm px-2 py-1 rounded"
                style={{ background: "oklch(0.10 0.01 270)", color: "oklch(0.62 0.06 270)" }}
              >
                {existingKey.keyPreview}
              </span>
              <button
                onClick={() => toggleMutation.mutate({ id: existingKey.id, isActive: !existingKey.isActive })}
                className="btn btn-secondary btn-sm"
                disabled={toggleMutation.isPending}
              >
                {existingKey.isActive ? "Nonaktifkan" : "Aktifkan"}
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="btn btn-ghost btn-sm"
              >
                Ganti Key
              </button>
              <button
                onClick={() => deleteMutation.mutate({ id: existingKey.id })}
                className="btn btn-ghost btn-sm"
                disabled={deleteMutation.isPending}
                style={{ color: "oklch(0.65 0.18 25)" }}
              >
                Hapus
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary btn-sm"
            >
              + Tambah API Key
            </button>
          )}

          {existingKey && !showForm && (
            <a
              href={docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs mt-2 inline-block"
              style={{ color: "oklch(0.58 0.12 270)" }}
            >
              Buat API Key baru ↗
            </a>
          )}

          {showForm && (
            <form onSubmit={handleSave} className="mt-3 flex flex-col gap-2">
              {upsertMutation.error && (
                <div
                  className="px-3 py-2 rounded text-xs"
                  style={{
                    background: "oklch(0.60 0.22 25 / 0.12)",
                    border: "1px solid oklch(0.60 0.22 25 / 0.3)",
                    color: "oklch(0.78 0.15 25)",
                  }}
                >
                  {upsertMutation.error.message}
                </div>
              )}
              <input
                type="text"
                className="input text-sm"
                placeholder={`Label (opsional, cth: "Key utama")`}
                value={label_}
                onChange={(e) => setLabel(e.target.value)}
              />
              <input
                type="password"
                className="input text-sm font-mono"
                placeholder={
                  provider === "OPENAI" ? "sk-..." :
                  provider === "ANTHROPIC" ? "sk-ant-..." :
                  "AIza..."
                }
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                required
              />

              <div className="flex items-center gap-2 mb-1">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-[10px] uppercase tracking-wider font-bold opacity-40 hover:opacity-100 transition-opacity"
                  style={{ color: "oklch(0.72 0.18 270)" }}
                >
                  {showAdvanced ? "↑ Sembunyikan Proxy" : "↓ Gunakan Proxy (ngrok/Antigravity)"}
                </button>
              </div>

              {showAdvanced && (
                <div className="flex flex-col gap-1 mb-2">
                  <label className="text-[10px] uppercase tracking-wider font-semibold opacity-50 ml-1">Proxy Base URL</label>
                  <input
                    type="text"
                    className="input text-sm font-mono"
                    placeholder="https://xyz.ngrok.io/v1"
                    value={baseUrl_}
                    onChange={(e) => setBaseUrl(e.target.value)}
                  />
                  <p className="text-[10px] opacity-40 leading-tight ml-1">
                    Kosongkan untuk menggunakan API resmi. Contoh ngrok: <code>https://...ngrok-free.app/v1</code>
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={upsertMutation.isPending}
                >
                  {upsertMutation.isPending ? "Menyimpan..." : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setInputKey(""); }}
                  className="btn btn-ghost btn-sm"
                >
                  Batal
                </button>
                <a
                  href={docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                  style={{ color: "oklch(0.60 0.12 270)" }}
                >
                  Buat API Key ↗
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ApiKeysPage() {
  const { data: apiKeys, refetch } = trpc.apiKey.list.useQuery();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "oklch(0.92 0.04 270)" }}>
          API Keys (BYOK)
        </h1>
        <p style={{ color: "oklch(0.52 0.05 270)" }}>
          Bring Your Own Key — gunakan API key Anda sendiri. Key disimpan terenkripsi di server.
        </p>
      </div>

      {/* Info box */}
      <div
        className="flex gap-3 p-4 rounded-xl mb-6"
        style={{
          background: "oklch(0.54 0.28 270 / 0.08)",
          border: "1px solid oklch(0.54 0.28 270 / 0.20)",
        }}
      >
        <svg
          className="shrink-0 mt-0.5"
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="oklch(0.72 0.18 270)" strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
        </svg>
        <div className="text-sm" style={{ color: "oklch(0.65 0.10 270)" }}>
          API Key hanya digunakan untuk generate konten dan <strong>tidak pernah dikirim ke server ketiga</strong>.
          Cost ditanggung langsung ke akun AI Anda. Anda bisa nonaktifkan atau hapus kapan saja.
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {PROVIDERS.map((p) => {
          const existing = apiKeys?.find((k) => k.provider === p.value);
          return (
            <ProviderCard
              key={p.value}
              provider={p.value}
              label={p.label}
              desc={p.desc}
              docsUrl={p.docsUrl}
              existingKey={existing}
              onSaved={() => refetch()}
            />
          );
        })}
      </div>

      {/* Quick tip */}
      <div
        className="mt-6 p-4 rounded-xl text-sm"
        style={{ background: "oklch(0.10 0.01 270)", border: "1px solid oklch(0.18 0.03 270 / 0.6)" }}
      >
        <div className="font-medium mb-1" style={{ color: "oklch(0.78 0.08 270)" }}>
          💡 Tips Hemat Cost
        </div>
        <ul className="text-xs space-y-1" style={{ color: "oklch(0.52 0.04 270)" }}>
          <li>• Gemini 1.5 Flash gratis hingga 1500 request/hari — ideal untuk bulk generate</li>
          <li>• GPT-4o Mini ~5× lebih murah dari GPT-4o, kualitas cukup untuk deskripsi produk</li>
          <li>• Claude Haiku termurah dari Anthropic, unggul di konten panjang</li>
        </ul>
      </div>
    </div>
  );
}
