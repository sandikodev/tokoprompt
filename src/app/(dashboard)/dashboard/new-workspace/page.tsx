"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 50);
}

export default function NewWorkspacePage() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [brandTone, setBrandTone] = useState("");
  const [brandStyle, setBrandStyle] = useState("");
  const [brandGuide, setBrandGuide] = useState("");
  const [error, setError] = useState("");

  const createMutation = trpc.workspace.create.useMutation({
    onSuccess: (ws) => {
      utils.workspace.list.invalidate();
      router.push(`/dashboard/${ws.slug}`);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  function handleNameChange(val: string) {
    setName(val);
    if (!slugEdited) setSlug(slugify(val));
  }

  function handleSlugChange(val: string) {
    setSlug(val.replace(/[^a-z0-9-]/g, ""));
    setSlugEdited(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!slug) return setError("Slug tidak boleh kosong");
    createMutation.mutate({ name, slug, description, brandTone, brandStyle, brandGuide });
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm mb-4"
          style={{ color: "oklch(0.52 0.06 270)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Kembali ke Dashboard
        </Link>
        <h1 className="text-2xl font-bold mb-1" style={{ color: "oklch(0.92 0.04 270)" }}>
          Buat Workspace Baru
        </h1>
        <p style={{ color: "oklch(0.52 0.05 270)" }}>
          Workspace mewakili satu brand atau toko. Setiap workspace punya Brand DNA sendiri.
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

        {/* Basic Info */}
        <div className="card flex flex-col gap-4">
          <h2 className="font-semibold" style={{ color: "oklch(0.85 0.04 270)" }}>
            Informasi Dasar
          </h2>

          <div>
            <label className="label">Nama Workspace *</label>
            <input
              id="ws-name"
              type="text"
              className="input"
              placeholder="Matrix Instrument"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Slug (URL) *</label>
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: "oklch(0.45 0.04 270)", whiteSpace: "nowrap" }}>
                /dashboard/
              </span>
              <input
                id="ws-slug"
                type="text"
                className="input"
                placeholder="matrix-instrument"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                required
                pattern="[a-z0-9-]+"
              />
            </div>
            <p className="text-xs mt-1" style={{ color: "oklch(0.42 0.04 270)" }}>
              Hanya huruf kecil, angka, dan tanda hubung (-)
            </p>
          </div>

          <div>
            <label className="label">Deskripsi</label>
            <textarea
              id="ws-description"
              className="input"
              placeholder="Toko resmi alat ukur dan elektronika Matrix Instrument..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {/* Brand DNA */}
        <div className="card flex flex-col gap-4">
          <div>
            <h2 className="font-semibold mb-0.5" style={{ color: "oklch(0.85 0.04 270)" }}>
              Brand DNA
            </h2>
            <p className="text-xs" style={{ color: "oklch(0.48 0.04 270)" }}>
              Digunakan oleh AI untuk menjaga konsistensi gaya bahasa dan visual seluruh konten.
            </p>
          </div>

          <div>
            <label className="label">Brand Tone</label>
            <input
              id="ws-brand-tone"
              type="text"
              className="input"
              placeholder="profesional teknikal, to the point, tidak lebay"
              value={brandTone}
              onChange={(e) => setBrandTone(e.target.value)}
            />
            <p className="text-xs mt-1" style={{ color: "oklch(0.42 0.04 270)" }}>
              Gaya bahasa yang diinginkan AI saat generate konten
            </p>
          </div>

          <div>
            <label className="label">Brand Style (Visual)</label>
            <input
              id="ws-brand-style"
              type="text"
              className="input"
              placeholder="clean, dark, minimalist, high contrast, tech-forward"
              value={brandStyle}
              onChange={(e) => setBrandStyle(e.target.value)}
            />
            <p className="text-xs mt-1" style={{ color: "oklch(0.42 0.04 270)" }}>
              Panduan visual untuk AI saat generate image prompt
            </p>
          </div>

          <div>
            <label className="label">Brand Guide (opsional)</label>
            <textarea
              id="ws-brand-guide"
              className="input"
              placeholder="Tulis panduan brand lengkap Anda di sini. AI akan menggunakan ini sebagai konteks tambahan..."
              value={brandGuide}
              onChange={(e) => setBrandGuide(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="create-workspace-submit"
            type="submit"
            className="btn btn-primary"
            disabled={createMutation.isPending}
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
              "Buat Workspace →"
            )}
          </button>
          <Link href="/dashboard" className="btn btn-secondary">
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
