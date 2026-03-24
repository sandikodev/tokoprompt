"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";

type Platform = "SHOPEE" | "TOKOPEDIA" | "TIKTOK_SHOP" | "ALL";

const PLATFORMS: { value: Platform; label: string; icon: string }[] = [
  { value: "ALL",         label: "Semua Platform",  icon: "🌐" },
  { value: "SHOPEE",      label: "Shopee",           icon: "🛒" },
  { value: "TOKOPEDIA",   label: "Tokopedia",        icon: "🛍️" },
  { value: "TIKTOK_SHOP", label: "TikTok Shop",      icon: "🎵" },
];

const LANGUAGE_STYLES = [
  { value: "teknikal",       label: "Teknikal" },
  { value: "formal",         label: "Formal" },
  { value: "santai",         label: "Santai" },
  { value: "teknikal-formal", label: "Teknikal Semi-formal" },
];

export default function NewProjectPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = use(params);
  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: workspace } = trpc.workspace.getBySlug.useQuery({ slug: workspaceSlug });

  const [name, setName] = useState("");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [mainFeature, setMainFeature] = useState("");
  const [powerSource, setPowerSource] = useState("");
  const [compatibility, setCompatibility] = useState("");
  const [useCase, setUseCase] = useState("");
  const [platform, setPlatform] = useState<Platform>("ALL");
  const [languageStyle, setLanguageStyle] = useState("teknikal");
  const [rawSpec, setRawSpec] = useState("");
  const [error, setError] = useState("");

  const createMutation = trpc.project.create.useMutation({
    onSuccess: (project) => {
      utils.project.list.invalidate();
      router.push(`/dashboard/${workspaceSlug}/project/${project.id}`);
    },
    onError: (err) => setError(err.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!workspace) return;
    createMutation.mutate({
      workspaceId: workspace.id,
      name,
      productName,
      category: category || undefined,
      targetMarket: targetMarket || undefined,
      priceRange: priceRange || undefined,
      mainFeature: mainFeature || undefined,
      powerSource: powerSource || undefined,
      compatibility: compatibility || undefined,
      useCase: useCase || undefined,
      platform,
      languageStyle,
      rawSpec: rawSpec || undefined,
    });
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/dashboard/${workspaceSlug}`}
          className="inline-flex items-center gap-1 text-sm mb-4"
          style={{ color: "oklch(0.52 0.06 270)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {workspace?.name ?? workspaceSlug}
        </Link>
        <h1 className="text-2xl font-bold mb-1" style={{ color: "oklch(0.92 0.04 270)" }}>
          Buat Project Baru
        </h1>
        <p style={{ color: "oklch(0.52 0.05 270)" }}>
          Setiap project = 1 produk dengan konteks AI tersendiri (RAG).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <div
            className="px-4 py-3 rounded-lg text-sm"
            style={{
              background: "oklch(0.60 0.22 25 / 0.12)",
              border: "1px solid oklch(0.60 0.22 25 / 0.3)",
              color: "oklch(0.78 0.15 25)",
            }}
          >
            {error}
          </div>
        )}

        {/* Basic */}
        <div className="card flex flex-col gap-4">
          <h2 className="font-semibold" style={{ color: "oklch(0.85 0.04 270)" }}>Identitas Project</h2>

          <div>
            <label className="label">Nama Project * <span style={{ color: "oklch(0.45 0.04 270)", fontWeight: 400 }}>(untuk internal, bukan nama produk)</span></label>
            <input id="proj-name" type="text" className="input" placeholder="Multimeter Digital MX-123" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <label className="label">Nama Produk (untuk marketplace) *</label>
            <input id="proj-product-name" type="text" className="input" placeholder="Digital Multimeter Auto-Range MX-123 True RMS" value={productName} onChange={(e) => setProductName(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Kategori</label>
              <input id="proj-category" type="text" className="input" placeholder="Alat Ukur Elektronika" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div>
              <label className="label">Rentang Harga</label>
              <input id="proj-price" type="text" className="input" placeholder="Rp 150.000 – Rp 250.000" value={priceRange} onChange={(e) => setPriceRange(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Target Market</label>
            <input id="proj-market" type="text" className="input" placeholder="Teknisi, hobbyist elektronika, mahasiswa teknik" value={targetMarket} onChange={(e) => setTargetMarket(e.target.value)} />
          </div>
        </div>

        {/* Product Details */}
        <div className="card flex flex-col gap-4">
          <h2 className="font-semibold" style={{ color: "oklch(0.85 0.04 270)" }}>Detail Produk</h2>

          <div>
            <label className="label">Fitur Utama</label>
            <input id="proj-main-feature" type="text" className="input" placeholder="True RMS, Auto-range, LCD backlit, data hold" value={mainFeature} onChange={(e) => setMainFeature(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Sumber Daya</label>
              <input id="proj-power" type="text" className="input" placeholder="Baterai 9V 6F22" value={powerSource} onChange={(e) => setPowerSource(e.target.value)} />
            </div>
            <div>
              <label className="label">Kompatibilitas</label>
              <input id="proj-compat" type="text" className="input" placeholder="AC/DC, semua merk elektronik" value={compatibility} onChange={(e) => setCompatibility(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Use Case / Kegunaan</label>
            <input id="proj-usecase" type="text" className="input" placeholder="Cek tegangan listrik, troubleshooting PCB, kalibrasi baterai" value={useCase} onChange={(e) => setUseCase(e.target.value)} />
          </div>
        </div>

        {/* Platform & Style */}
        <div className="card flex flex-col gap-4">
          <h2 className="font-semibold" style={{ color: "oklch(0.85 0.04 270)" }}>Platform & Gaya Bahasa</h2>

          <div>
            <label className="label">Platform Target</label>
            <div className="grid grid-cols-2 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPlatform(p.value)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-all"
                  style={{
                    background: platform === p.value ? "oklch(0.54 0.28 270 / 0.15)" : "oklch(0.10 0.01 270)",
                    borderColor: platform === p.value ? "oklch(0.54 0.28 270 / 0.5)" : "oklch(0.22 0.04 270 / 0.6)",
                    color: platform === p.value ? "oklch(0.80 0.18 270)" : "oklch(0.60 0.05 270)",
                  }}
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Gaya Bahasa</label>
            <div className="flex gap-2 flex-wrap">
              {LANGUAGE_STYLES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setLanguageStyle(s.value)}
                  className="btn btn-sm"
                  style={{
                    background: languageStyle === s.value ? "oklch(0.54 0.28 270 / 0.20)" : "oklch(0.12 0.02 270)",
                    border: `1px solid ${languageStyle === s.value ? "oklch(0.54 0.28 270 / 0.40)" : "oklch(0.22 0.04 270 / 0.5)"}`,
                    color: languageStyle === s.value ? "oklch(0.78 0.18 270)" : "oklch(0.58 0.05 270)",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Raw Spec */}
        <div className="card flex flex-col gap-4">
          <div>
            <h2 className="font-semibold mb-0.5" style={{ color: "oklch(0.85 0.04 270)" }}>Spesifikasi Lengkap (RAG Context)</h2>
            <p className="text-xs" style={{ color: "oklch(0.48 0.04 270)" }}>
              Tempel spesifikasi produk dari supplier, manual, atau toko lain. AI akan menggunakan ini sebagai konteks utama.
            </p>
          </div>
          <textarea
            id="proj-raw-spec"
            className="input"
            placeholder="Tempel spesifikasi lengkap produk di sini: ketegangan, arus, resistansi, dll..."
            value={rawSpec}
            onChange={(e) => setRawSpec(e.target.value)}
            rows={6}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            id="create-project-submit"
            type="submit"
            className="btn btn-primary"
            disabled={createMutation.isPending || !workspace}
          >
            {createMutation.isPending ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Membuat...
              </span>
            ) : (
              "Buat Project →"
            )}
          </button>
          <Link href={`/dashboard/${workspaceSlug}`} className="btn btn-secondary">
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
