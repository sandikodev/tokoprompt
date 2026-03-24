"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";

export default function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = use(params);
  const router = useRouter();

  const { data: workspace, isLoading, refetch } = trpc.workspace.getBySlug.useQuery({
    slug: workspaceSlug,
  });

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brandTone, setBrandTone] = useState("");
  const [brandStyle, setBrandStyle] = useState("");
  const [brandGuide, setBrandGuide] = useState("");
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  // Sync form when workspace loads
  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setDescription(workspace.description ?? "");
      setBrandTone(workspace.brandTone ?? "");
      setBrandStyle(workspace.brandStyle ?? "");
      setBrandGuide(workspace.brandGuide ?? "");
    }
  }, [workspace]);

  const updateMutation = trpc.workspace.update.useMutation({
    onSuccess: () => {
      setSaved(true);
      refetch();
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const deleteMutation = trpc.workspace.delete.useMutation({
    onSuccess: () => {
      router.push("/dashboard");
    },
  });

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!workspace) return;
    updateMutation.mutate({
      id: workspace.id,
      name,
      description: description || undefined,
      brandTone: brandTone || undefined,
      brandStyle: brandStyle || undefined,
      brandGuide: brandGuide || undefined,
    });
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <div className="text-sm" style={{ color: "oklch(0.45 0.05 270)" }}>Memuat settings...</div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="p-8 text-center">
        <p style={{ color: "oklch(0.55 0.05 270)" }}>Workspace tidak ditemukan.</p>
        <Link href="/dashboard" className="btn btn-secondary btn-sm mt-4">← Dashboard</Link>
      </div>
    );
  }

  const canDelete = deleteConfirm === workspace.name;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm mb-6" style={{ color: "oklch(0.45 0.04 270)" }}>
        <Link href="/dashboard" style={{ color: "oklch(0.55 0.08 270)" }}>Dashboard</Link>
        <span>/</span>
        <Link href={`/dashboard/${workspaceSlug}`} style={{ color: "oklch(0.55 0.08 270)" }}>
          {workspace.name}
        </Link>
        <span>/</span>
        <span style={{ color: "oklch(0.80 0.04 270)" }}>Settings</span>
      </div>

      <h1 className="text-2xl font-bold mb-1" style={{ color: "oklch(0.92 0.04 270)" }}>
        Workspace Settings
      </h1>
      <p className="text-sm mb-8" style={{ color: "oklch(0.50 0.05 270)" }}>
        Kelola informasi dan Brand DNA untuk workspace <strong>{workspace.name}</strong>.
      </p>

      {/* Main form */}
      <form onSubmit={handleUpdate} className="flex flex-col gap-6">
        {/* Info Card */}
        <div className="card">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: "oklch(0.60 0.08 270)" }}>
            Informasi Dasar
          </h2>

          <div className="flex flex-col gap-4">
            <div>
              <label className="label">Nama Workspace *</label>
              <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                maxLength={100}
              />
            </div>

            <div>
              <label className="label">Slug (URL)</label>
              <div
                className="input flex items-center gap-2 cursor-not-allowed"
                style={{ opacity: 0.5 }}
              >
                <span style={{ color: "oklch(0.45 0.04 270)" }}>/dashboard/</span>
                <span className="font-mono">{workspace.slug}</span>
              </div>
              <p className="text-xs mt-1" style={{ color: "oklch(0.40 0.04 270)" }}>
                Slug tidak bisa diubah setelah workspace dibuat.
              </p>
            </div>

            <div>
              <label className="label">Deskripsi</label>
              <textarea
                className="input"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi singkat tentang workspace ini..."
                style={{ resize: "vertical" }}
              />
            </div>
          </div>
        </div>

        {/* Brand DNA Card */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "oklch(0.60 0.08 270)" }}>
              Brand DNA
            </h2>
            <span className="badge badge-brand text-xs">AI Context</span>
          </div>
          <p className="text-xs mb-5" style={{ color: "oklch(0.48 0.04 270)" }}>
            AI akan menggunakan panduan ini untuk menjaga konsistensi gaya bahasa dan visual seluruh konten yang digenerate.
          </p>

          <div className="flex flex-col gap-4">
            <div>
              <label className="label">Brand Tone</label>
              <input
                type="text"
                className="input"
                value={brandTone}
                onChange={(e) => setBrandTone(e.target.value)}
                placeholder="e.g. profesional teknikal, to the point, tidak lebay"
              />
              <p className="text-xs mt-1" style={{ color: "oklch(0.40 0.04 270)" }}>
                Gaya bahasa yang diinginkan AI saat generate konten.
              </p>
            </div>

            <div>
              <label className="label">Brand Style (Visual)</label>
              <input
                type="text"
                className="input"
                value={brandStyle}
                onChange={(e) => setBrandStyle(e.target.value)}
                placeholder="e.g. clean, dark, minimalist, high contrast"
              />
              <p className="text-xs mt-1" style={{ color: "oklch(0.40 0.04 270)" }}>
                Panduan visual untuk AI saat generate image prompt.
              </p>
            </div>

            <div>
              <label className="label">Brand Guide (Opsional)</label>
              <textarea
                className="input"
                rows={6}
                value={brandGuide}
                onChange={(e) => setBrandGuide(e.target.value)}
                placeholder="Tulis panduan brand lengkap Anda di sini. AI akan menggunakan ini sebagai konteks tambahan..."
                style={{ resize: "vertical", fontFamily: "inherit" }}
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
          <Link href={`/dashboard/${workspaceSlug}`} className="btn btn-ghost">
            Batal
          </Link>
          {saved && (
            <span className="text-sm" style={{ color: "oklch(0.72 0.18 155)" }}>
              ✓ Perubahan disimpan
            </span>
          )}
          {updateMutation.error && (
            <span className="text-sm" style={{ color: "oklch(0.72 0.18 25)" }}>
              ✗ {updateMutation.error.message}
            </span>
          )}
        </div>
      </form>

      {/* Danger Zone */}
      <div
        className="mt-10 p-5 rounded-xl"
        style={{
          background: "oklch(0.60 0.22 25 / 0.05)",
          border: "1px solid oklch(0.60 0.22 25 / 0.25)",
        }}
      >
        <h2 className="text-sm font-semibold mb-1" style={{ color: "oklch(0.72 0.18 25)" }}>
          Danger Zone
        </h2>
        <p className="text-xs mb-4" style={{ color: "oklch(0.52 0.08 25)" }}>
          Menghapus workspace akan menghapus semua project dan konten yang ada secara permanen. Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex flex-col gap-2">
          <label className="text-xs" style={{ color: "oklch(0.55 0.06 25)" }}>
            Ketik <strong>{workspace.name}</strong> untuk konfirmasi:
          </label>
          <input
            type="text"
            className="input text-sm"
            placeholder={workspace.name}
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            style={{
              borderColor: canDelete ? "oklch(0.60 0.22 25 / 0.5)" : undefined,
            }}
          />
          <button
            onClick={() => deleteMutation.mutate({ id: workspace.id })}
            className="btn btn-sm"
            disabled={!canDelete || deleteMutation.isPending}
            style={{
              background: canDelete ? "oklch(0.50 0.22 25)" : "oklch(0.20 0.04 25)",
              color: "oklch(0.95 0.02 270)",
              opacity: canDelete ? 1 : 0.4,
              cursor: canDelete ? "pointer" : "not-allowed",
              alignSelf: "flex-start",
            }}
          >
            {deleteMutation.isPending ? "Menghapus..." : "Hapus Workspace Ini"}
          </button>
        </div>
      </div>
    </div>
  );
}
