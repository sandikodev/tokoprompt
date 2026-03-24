"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";

const PLATFORMS = [
  { value: "SHOPEE",      label: "Shopee",      icon: "🛒" },
  { value: "TOKOPEDIA",   label: "Tokopedia",   icon: "🛍️" },
  { value: "TIKTOK_SHOP", label: "TikTok Shop", icon: "🎵" },
  { value: "ALL",         label: "Semua Platform", icon: "🌐" },
] as const;

const STATUSES = [
  { value: "DRAFT",    label: "Draft",   color: "oklch(0.80 0.18 80)" },
  { value: "ACTIVE",   label: "Aktif",   color: "oklch(0.72 0.18 150)" },
  { value: "ARCHIVED", label: "Arsip",   color: "oklch(0.72 0.18 25)" },
] as const;

export default function EditProjectPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; projectId: string }>;
}) {
  const { workspaceSlug, projectId } = use(params);
  const router = useRouter();

  const { data: project, isLoading } = trpc.project.getById.useQuery({ id: projectId });

  const [name, setName] = useState("");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [mainFeature, setMainFeature] = useState("");
  const [powerSource, setPowerSource] = useState("");
  const [compatibility, setCompatibility] = useState("");
  const [useCase, setUseCase] = useState("");
  const [platform, setPlatform] = useState<"SHOPEE" | "TOKOPEDIA" | "TIKTOK_SHOP" | "ALL">("ALL");
  const [languageStyle, setLanguageStyle] = useState("");
  const [rawSpec, setRawSpec] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "ACTIVE" | "ARCHIVED">("DRAFT");
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    if (project) {
      setName(project.name);
      setProductName(project.productName);
      setCategory(project.category ?? "");
      setTargetMarket(project.targetMarket ?? "");
      setPriceRange(project.priceRange ?? "");
      setMainFeature(project.mainFeature ?? "");
      setPowerSource(project.powerSource ?? "");
      setCompatibility(project.compatibility ?? "");
      setUseCase(project.useCase ?? "");
      setPlatform(project.platform as typeof platform);
      setLanguageStyle(project.languageStyle ?? "");
      setRawSpec(project.rawSpec ?? "");
      setStatus(project.status as typeof status);
    }
  }, [project]);

  const updateMutation = trpc.project.update.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const updateStatusMutation = trpc.project.updateStatus.useMutation();

  const deleteMutation = trpc.project.delete.useMutation({
    onSuccess: () => {
      router.push(`/dashboard/${workspaceSlug}`);
    },
  });

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateMutation.mutate({
      id: projectId,
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
      languageStyle: languageStyle || undefined,
      rawSpec: rawSpec || undefined,
    });
    if (status !== project?.status) {
      updateStatusMutation.mutate({ id: projectId, status });
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="text-sm" style={{ color: "oklch(0.45 0.05 270)" }}>Memuat project...</div>
      </div>
    );
  }
  if (!project) {
    return (
      <div className="p-8 text-center">
        <p style={{ color: "oklch(0.55 0.05 270)" }}>Project tidak ditemukan.</p>
        <Link href={`/dashboard/${workspaceSlug}`} className="btn btn-secondary btn-sm mt-4">← Workspace</Link>
      </div>
    );
  }

  const inputCls = "input w-full";
  const canDelete = deleteConfirm === project.name;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm mb-6" style={{ color: "oklch(0.45 0.04 270)" }}>
        <Link href="/dashboard" style={{ color: "oklch(0.55 0.08 270)" }}>Dashboard</Link>
        <span>/</span>
        <Link href={`/dashboard/${workspaceSlug}`} style={{ color: "oklch(0.55 0.08 270)" }}>{workspaceSlug}</Link>
        <span>/</span>
        <Link href={`/dashboard/${workspaceSlug}/project/${projectId}`} style={{ color: "oklch(0.55 0.08 270)" }}>{project.name}</Link>
        <span>/</span>
        <span style={{ color: "oklch(0.80 0.04 270)" }}>Edit</span>
      </div>

      <h1 className="text-2xl font-bold mb-1" style={{ color: "oklch(0.92 0.04 270)" }}>Edit Project</h1>
      <p className="text-sm mb-8" style={{ color: "oklch(0.50 0.05 270)" }}>
        Ubah informasi produk — perubahan akan digunakan untuk generate konten berikutnya.
      </p>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Status */}
        <div className="card">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: "oklch(0.60 0.08 270)" }}>
            Status Project
          </h2>
          <div className="flex gap-2">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setStatus(s.value)}
                className="btn btn-sm"
                style={{
                  background: status === s.value ? `${s.color}20` : "oklch(0.12 0.02 270)",
                  border: `1px solid ${status === s.value ? `${s.color}60` : "oklch(0.22 0.04 270 / 0.4)"}`,
                  color: status === s.value ? s.color : "oklch(0.55 0.05 270)",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Basic Info */}
        <div className="card">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: "oklch(0.60 0.08 270)" }}>
            Informasi Dasar
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="label">Nama Project *</label>
              <input type="text" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="label">Nama Produk *</label>
              <input type="text" className={inputCls} value={productName} onChange={(e) => setProductName(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Kategori</label>
                <input type="text" className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Alat Ukur / Elektronika" />
              </div>
              <div>
                <label className="label">Target Market</label>
                <input type="text" className={inputCls} value={targetMarket} onChange={(e) => setTargetMarket(e.target.value)} placeholder="Engineer, Teknisi, DIY" />
              </div>
            </div>
            <div>
              <label className="label">Platform</label>
              <div className="flex gap-2 flex-wrap">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPlatform(p.value)}
                    className="btn btn-sm"
                    style={{
                      background: platform === p.value ? "oklch(0.54 0.28 270 / 0.20)" : "oklch(0.12 0.02 270)",
                      border: `1px solid ${platform === p.value ? "oklch(0.54 0.28 270 / 0.40)" : "oklch(0.22 0.04 270 / 0.4)"}`,
                      color: platform === p.value ? "oklch(0.78 0.18 270)" : "oklch(0.55 0.05 270)",
                    }}
                  >
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Detail */}
        <div className="card">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: "oklch(0.60 0.08 270)" }}>
            Detail Produk
          </h2>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Range Harga</label>
                <input type="text" className={inputCls} value={priceRange} onChange={(e) => setPriceRange(e.target.value)} placeholder="Rp 250.000 – Rp 500.000" />
              </div>
              <div>
                <label className="label">Sumber Daya</label>
                <input type="text" className={inputCls} value={powerSource} onChange={(e) => setPowerSource(e.target.value)} placeholder="Baterai 9V / USB-C" />
              </div>
            </div>
            <div>
              <label className="label">Fitur Utama</label>
              <input type="text" className={inputCls} value={mainFeature} onChange={(e) => setMainFeature(e.target.value)} placeholder="Akurasi ±0.5%, Auto-range, Backlit LCD" />
            </div>
            <div>
              <label className="label">Kompatibilitas</label>
              <input type="text" className={inputCls} value={compatibility} onChange={(e) => setCompatibility(e.target.value)} placeholder="AC/DC Voltage, Current, Resistance" />
            </div>
            <div>
              <label className="label">Use Case</label>
              <textarea className="input" rows={2} value={useCase} onChange={(e) => setUseCase(e.target.value)} placeholder="Teknisi elektronik, panel listrik, otomotif" style={{ resize: "vertical" }} />
            </div>
            <div>
              <label className="label">Gaya Bahasa</label>
              <input type="text" className={inputCls} value={languageStyle} onChange={(e) => setLanguageStyle(e.target.value)} placeholder="Teknikal, profesional, informatif" />
            </div>
            <div>
              <label className="label">Spesifikasi Lengkap (Opsional)</label>
              <textarea
                className="input font-mono text-xs"
                rows={6}
                value={rawSpec}
                onChange={(e) => setRawSpec(e.target.value)}
                placeholder="Paste spesifikasi teknis lengkap dari datasheet / supplier..."
                style={{ resize: "vertical" }}
              />
              <p className="text-xs mt-1" style={{ color: "oklch(0.40 0.04 270)" }}>
                Semakin detail spesifikasi, semakin akurat output AI.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
          <Link href={`/dashboard/${workspaceSlug}/project/${projectId}`} className="btn btn-ghost">
            Batal
          </Link>
          {saved && (
            <span className="text-sm" style={{ color: "oklch(0.72 0.18 155)" }}>✓ Tersimpan</span>
          )}
          {updateMutation.error && (
            <span className="text-sm" style={{ color: "oklch(0.72 0.18 25)" }}>✗ {updateMutation.error.message}</span>
          )}
        </div>
      </form>

      {/* Danger Zone */}
      <div
        className="mt-10 p-5 rounded-xl"
        style={{ background: "oklch(0.60 0.22 25 / 0.05)", border: "1px solid oklch(0.60 0.22 25 / 0.25)" }}
      >
        <h2 className="text-sm font-semibold mb-1" style={{ color: "oklch(0.72 0.18 25)" }}>Danger Zone</h2>
        <p className="text-xs mb-4" style={{ color: "oklch(0.52 0.08 25)" }}>
          Menghapus project akan menghapus semua konten yang digenerate secara permanen.
        </p>
        <div className="flex flex-col gap-2">
          <label className="text-xs" style={{ color: "oklch(0.55 0.06 25)" }}>
            Ketik <strong>{project.name}</strong> untuk konfirmasi:
          </label>
          <input
            type="text"
            className="input text-sm"
            placeholder={project.name}
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
          />
          <button
            type="button"
            onClick={() => deleteMutation.mutate({ id: projectId })}
            disabled={!canDelete || deleteMutation.isPending}
            className="btn btn-sm"
            style={{
              background: canDelete ? "oklch(0.50 0.22 25)" : "oklch(0.20 0.04 25)",
              color: "oklch(0.95 0.02 270)",
              opacity: canDelete ? 1 : 0.4,
              cursor: canDelete ? "pointer" : "not-allowed",
              alignSelf: "flex-start",
            }}
          >
            {deleteMutation.isPending ? "Menghapus..." : "Hapus Project Ini"}
          </button>
        </div>
      </div>
    </div>
  );
}
