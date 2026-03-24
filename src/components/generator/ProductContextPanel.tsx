"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

interface ProductContextPanelProps {
  projectId: string;
}

const SOURCE_TEMPLATES = [
  {
    label: "Spesifikasi Teknis",
    placeholder: "Contoh:\nVoltage: AC/DC 600V\nCurrent: 10A\nResistance: 40MΩ\nAccuracy: ±0.5%\nDimensions: 175×89×42mm\nWeight: 320g\nBattery: 9V alkaline",
  },
  {
    label: "Deskripsi Supplier",
    placeholder: "Paste deskripsi produk dari supplier/datasheet di sini...",
  },
  {
    label: "Keunggulan & Diferensiasi",
    placeholder: "Contoh:\n- Satu-satunya di kelasnya dengan auto-range\n- Lulus uji drop test 1.5 meter\n- Garansi resmi 2 tahun",
  },
  {
    label: "Target Pelanggan",
    placeholder: "Contoh:\nTeknis: Teknisi panel listrik, auto mechanic, drone engineer\nDIY: Hobbyist elektronik, mahasiswa teknik\nPain point: Alat murah tidak akurat, alat mahal sulit digunakan",
  },
];

export default function ProductContextPanel({ projectId }: ProductContextPanelProps) {
  const { data: contexts, refetch } = trpc.productContext.list.useQuery({ projectId });
  const addMutation = trpc.productContext.add.useMutation({ onSuccess: () => { refetch(); setContent(""); setTitle(""); setOpen(false); } });
  const deleteMutation = trpc.productContext.delete.useMutation({ onSuccess: () => refetch() });
  const clearMutation = trpc.productContext.clearAll.useMutation({ onSuccess: () => refetch() });

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [template, setTemplate] = useState<number | null>(null);

  const totalChars = contexts?.reduce((s, c) => s + (c.charCount ?? c.content.length), 0) ?? 0;
  const chunkCount = contexts?.length ?? 0;

  function fillTemplate(i: number) {
    setTemplate(i);
    setTitle(SOURCE_TEMPLATES[i].label);
    setContent("");
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    addMutation.mutate({ projectId, title: title || undefined, content: content.trim() });
  }

  function handleClear() {
    if (!confirmClear) { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 3000); return; }
    clearMutation.mutate({ projectId });
    setConfirmClear(false);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "oklch(0.40 0.05 270)" }}>
          Knowledge Base RAG
        </div>
        <button
          className="btn btn-ghost btn-sm text-xs"
          onClick={() => setOpen(!open)}
          style={{ color: "oklch(0.72 0.24 270)" }}
        >
          {open ? "✕ Tutup" : "+ Tambah"}
        </button>
      </div>

      {/* Stats bar */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3 text-xs"
        style={{ background: chunkCount > 0 ? "oklch(0.72 0.24 270 / 0.08)" : "oklch(0.12 0.02 270)", border: `1px solid ${chunkCount > 0 ? "oklch(0.72 0.24 270 / 0.25)" : "oklch(0.20 0.03 270 / 0.5)"}` }}
      >
        {chunkCount > 0 ? (
          <>
            <span style={{ color: "oklch(0.72 0.24 270)" }}>🧠</span>
            <span style={{ color: "oklch(0.65 0.05 270)" }}>
              {chunkCount} chunk · {totalChars.toLocaleString()} karakter tersimpan
            </span>
            <span
              className="ml-auto"
              style={{ color: "oklch(0.72 0.18 150)", fontWeight: 600, fontSize: "10px" }}
            >
              RAG AKTIF ✓
            </span>
          </>
        ) : (
          <span style={{ color: "oklch(0.38 0.04 270)" }}>
            Belum ada knowledge base — AI hanya pakai form spec
          </span>
        )}
      </div>

      {/* Add Form */}
      {open && (
        <form onSubmit={handleAdd} className="flex flex-col gap-3 mb-4 p-3 rounded-xl" style={{ background: "oklch(0.10 0.01 270)", border: "1px solid oklch(0.20 0.04 270 / 0.5)" }}>
          {/* Template Picker */}
          <div>
            <div className="text-xs mb-2" style={{ color: "oklch(0.45 0.04 270)" }}>Template cepat:</div>
            <div className="flex gap-1 flex-wrap">
              {SOURCE_TEMPLATES.map((t, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => fillTemplate(i)}
                  className="btn btn-sm text-xs"
                  style={{
                    background: template === i ? "oklch(0.54 0.28 270 / 0.20)" : "oklch(0.14 0.02 270)",
                    border: `1px solid ${template === i ? "oklch(0.54 0.28 270 / 0.40)" : "oklch(0.22 0.04 270 / 0.4)"}`,
                    color: template === i ? "oklch(0.78 0.18 270)" : "oklch(0.50 0.05 270)",
                    padding: "2px 8px",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label" style={{ fontSize: "11px" }}>Judul (opsional)</label>
            <input
              type="text"
              className="input text-xs"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Spesifikasi Teknis, Keunggulan Produk, dll."
            />
          </div>

          <div>
            <label className="label" style={{ fontSize: "11px" }}>
              Konten Knowledge {content.length > 0 && <span style={{ color: "oklch(0.50 0.04 270)" }}>({content.length} kar)</span>}
            </label>
            <textarea
              className="input font-mono text-xs"
              rows={7}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                template !== null
                  ? SOURCE_TEMPLATES[template].placeholder
                  : "Paste spesifikasi, deskripsi supplier, keunggulan produk, atau informasi apapun yang ingin diketahui AI..."
              }
              style={{ resize: "vertical" }}
              required
            />
            <p className="text-xs mt-1" style={{ color: "oklch(0.38 0.04 270)" }}>
              Teks panjang akan di-chunk otomatis ({Math.ceil(content.length / 600)} chunk estimasi)
            </p>
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary btn-sm" disabled={addMutation.isPending || !content.trim()}>
              {addMutation.isPending ? "Menyimpan..." : "Simpan ke Knowledge Base"}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setOpen(false); setContent(""); setTitle(""); setTemplate(null); }}>
              Batal
            </button>
          </div>

          {addMutation.error && (
            <div className="text-xs" style={{ color: "oklch(0.72 0.18 25)" }}>{addMutation.error.message}</div>
          )}
          {addMutation.data && (
            <div className="text-xs" style={{ color: "oklch(0.72 0.18 150)" }}>
              ✓ {addMutation.data.count} chunk berhasil disimpan
            </div>
          )}
        </form>
      )}

      {/* Stored Chunks List */}
      {(contexts ?? []).length > 0 && (
        <div className="flex flex-col gap-2">
          {contexts!.map((ctx, i) => (
            <div
              key={ctx.id}
              className="px-3 py-2 rounded-lg"
              style={{ background: "oklch(0.11 0.01 270)", border: "1px solid oklch(0.18 0.03 270 / 0.5)" }}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <div>
                  <span className="text-xs font-medium" style={{ color: "oklch(0.72 0.08 270)" }}>
                    {ctx.title ?? `Chunk ${i + 1}`}
                  </span>
                  <span className="text-xs ml-2" style={{ color: "oklch(0.38 0.04 270)" }}>
                    {(ctx.charCount ?? ctx.content.length).toLocaleString()} kar
                  </span>
                </div>
                <button
                  onClick={() => deleteMutation.mutate({ id: ctx.id })}
                  disabled={deleteMutation.isPending}
                  className="btn btn-ghost p-0.5 rounded shrink-0"
                  title="Hapus chunk ini"
                  style={{ color: "oklch(0.40 0.05 270)" }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <p
                className="text-xs line-clamp-2"
                style={{ color: "oklch(0.50 0.04 270)", fontFamily: "monospace", lineHeight: 1.4 }}
              >
                {ctx.content}
              </p>
            </div>
          ))}

          {/* Clear All */}
          <button
            onClick={handleClear}
            disabled={clearMutation.isPending}
            className="btn btn-ghost btn-sm text-xs w-full mt-1"
            style={{
              color: confirmClear ? "oklch(0.72 0.20 25)" : "oklch(0.35 0.04 270)",
              border: `1px solid ${confirmClear ? "oklch(0.60 0.22 25 / 0.4)" : "oklch(0.20 0.04 270 / 0.3)"}`,
            }}
          >
            {clearMutation.isPending ? "Menghapus..." : confirmClear ? "⚠ Klik lagi untuk hapus semua" : "Hapus Semua Knowledge"}
          </button>
        </div>
      )}
    </div>
  );
}
