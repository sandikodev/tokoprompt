"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Title {
  id: string;
  title: string;
  seoScore: number | null;
  reasoning: string | null;
  isSelected: boolean;
  platform: string;
  createdAt: Date;
}
interface Description {
  id: string;
  content: string;
  charCount: number | null;
  isSelected: boolean;
  platform: string;
  createdAt: Date;
}
interface Slide {
  id: string;
  slideNumber: number;
  headline: string;
  subtext: string | null;
  cta: string | null;
  isSelected: boolean;
  createdAt: Date;
}
interface ImagePrompt {
  id: string;
  slideNumber: number;
  prompt: string;
  style: string | null;
  isSelected: boolean;
  createdAt: Date;
}

interface ProjectData {
  titles: Title[];
  descriptions: Description[];
  slides: Slide[];
  imagePrompts: ImagePrompt[];
}

interface ContentTabsProps {
  project: ProjectData;
  activeTab: "titles" | "description" | "slides" | "imagePrompts";
  onRefetch: () => void;
}

// ─── Platform char limits ─────────────────────────────────────────────────────
const PLATFORM_LIMITS: Record<string, { title: number; desc: number; label: string }> = {
  SHOPEE:      { title: 100, desc: 3000, label: "Shopee" },
  TOKOPEDIA:   { title: 75,  desc: 2500, label: "Tokopedia" },
  TIKTOK_SHOP: { title: 100, desc: 2000, label: "TikTok Shop" },
  ALL:         { title: 100, desc: 3000, label: "Semua Platform" },
};

// ─── Copy Button ──────────────────────────────────────────────────────────────
function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={handleCopy}
      className="btn btn-ghost btn-sm"
      title="Salin"
      style={{ display: "flex", alignItems: "center", gap: "4px" }}
    >
      {copied ? (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="oklch(0.72 0.18 150)" strokeWidth="2">
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {label && <span style={{ fontSize: "11px", color: "oklch(0.72 0.18 150)" }}>Tersalin!</span>}
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          {label && <span style={{ fontSize: "11px" }}>{label}</span>}
        </>
      )}
    </button>
  );
}

// ─── SEO Score Ring ───────────────────────────────────────────────────────────
function SeoScoreRing({ score }: { score: number | null }) {
  if (!score) return null;
  const color =
    score >= 80 ? "oklch(0.72 0.18 150)" :
    score >= 60 ? "oklch(0.80 0.18 80)" :
                  "oklch(0.75 0.18 25)";
  const label = score >= 80 ? "Bagus" : score >= 60 ? "Cukup" : "Rendah";
  return (
    <div className="flex flex-col items-center gap-0.5 shrink-0">
      <div className="relative w-10 h-10">
        <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
          <circle cx="18" cy="18" r="14" fill="none" stroke="oklch(0.18 0.03 270)" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="14"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${(score / 100) * 88} 88`}
            strokeLinecap="round"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center font-bold"
          style={{ color, fontSize: "10px" }}
        >
          {score}
        </span>
      </div>
      <span style={{ fontSize: "9px", color, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>
    </div>
  );
}

// ─── Char Limit Bar ───────────────────────────────────────────────────────────
function CharBar({ length, max, platform }: { length: number; max: number; platform: string }) {
  const pct = Math.min((length / max) * 100, 100);
  const over = length > max;
  const color = over ? "oklch(0.72 0.20 25)" : pct > 85 ? "oklch(0.80 0.18 80)" : "oklch(0.72 0.18 150)";
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between" style={{ fontSize: "10px", color: "oklch(0.45 0.04 270)" }}>
        <span>{platform}</span>
        <span style={{ color: over ? "oklch(0.72 0.20 25)" : "inherit" }}>
          {length}/{max} karakter {over && "⚠ Melebihi batas!"}
        </span>
      </div>
      <div style={{ height: "3px", background: "oklch(0.14 0.02 270)", borderRadius: "9999px" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          borderRadius: "9999px",
          transition: "width 0.3s",
        }} />
      </div>
    </div>
  );
}

// ─── Export Panel (All Titles) ────────────────────────────────────────────────
function ExportTitlePanel({ titles }: { titles: Title[] }) {
  const [open, setOpen] = useState(false);
  if (!titles.length) return null;

  const allText = titles.map((t, i) => `${i + 1}. ${t.title}`).join("\n");
  const bestTitle = titles.reduce((best, t) =>
    (t.seoScore ?? 0) > (best.seoScore ?? 0) ? t : best, titles[0]);

  return (
    <div className="card" style={{ background: "oklch(0.10 0.01 270)" }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "oklch(0.55 0.08 270)" }}>
          Export & Copy
        </span>
        <button className="btn btn-ghost btn-sm text-xs" onClick={() => setOpen(!open)}>
          {open ? "▲ Tutup" : "▼ Buka"}
        </button>
      </div>
      {open && (
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex gap-2 flex-wrap">
            <CopyButton text={allText} label="Salin Semua" />
            <CopyButton text={bestTitle.title} label="Judul Terbaik" />
            {titles.map((t, i) => (
              <CopyButton key={t.id} text={t.title} label={`Variasi ${i + 1}`} />
            ))}
          </div>
          <div
            className="text-xs p-3 rounded-lg font-mono whitespace-pre-wrap"
            style={{ background: "oklch(0.08 0.01 270)", color: "oklch(0.60 0.04 270)", border: "1px solid oklch(0.16 0.03 270 / 0.5)" }}
          >
            {allText}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Export Panel (Description) ──────────────────────────────────────────────
function ExportDescPanel({ desc, platform }: { desc: Description; platform: string }) {
  const [open, setOpen] = useState(false);
  const limits = PLATFORM_LIMITS[platform] ?? PLATFORM_LIMITS.ALL;
  const charLen = desc.charCount ?? desc.content.length;
  const plain = desc.content.replace(/[#*_`>\-]/g, "").replace(/\n+/g, "\n").trim();

  return (
    <div className="card" style={{ background: "oklch(0.10 0.01 270)" }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "oklch(0.55 0.08 270)" }}>
          Export Deskripsi
        </span>
        <button className="btn btn-ghost btn-sm text-xs" onClick={() => setOpen(!open)}>
          {open ? "▲ Tutup" : "▼ Buka"}
        </button>
      </div>

      {/* Char limit bars */}
      <div className="mt-3 flex flex-col gap-2">
        {Object.entries(PLATFORM_LIMITS).filter(([k]) => k !== "ALL").map(([plat, l]) => (
          <CharBar key={plat} length={charLen} max={l.desc} platform={l.label} />
        ))}
      </div>

      {open && (
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex gap-2 flex-wrap">
            <CopyButton text={desc.content} label="Salin (Markdown)" />
            <CopyButton text={plain} label="Salin (Plain Text)" />
          </div>
          <div
            className="text-xs p-3 rounded-lg font-mono whitespace-pre-wrap max-h-40 overflow-auto"
            style={{ background: "oklch(0.08 0.01 270)", color: "oklch(0.60 0.04 270)", border: "1px solid oklch(0.16 0.03 270 / 0.5)" }}
          >
            {plain}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Export Panel (All Slides) ────────────────────────────────────────────────
function ExportSlidesPanel({ slides }: { slides: Slide[] }) {
  const [open, setOpen] = useState(false);
  if (!slides.length) return null;

  const allText = slides
    .sort((a, b) => a.slideNumber - b.slideNumber)
    .map(s => `[SLIDE ${s.slideNumber}]\nHeadline: ${s.headline}${s.subtext ? `\nSubtext: ${s.subtext}` : ""}${s.cta ? `\nCTA: ${s.cta}` : ""}`)
    .join("\n\n");

  return (
    <div className="card" style={{ background: "oklch(0.10 0.01 270)" }}>
      <div className="flex items-center justify-between">
        <button className="btn btn-ghost btn-sm text-xs" onClick={() => setOpen(!open)}>
          {open ? "▲ Tutup Export" : "▼ Export Semua Slide"}
        </button>
        <CopyButton text={allText} label="Salin Semua Slide" />
      </div>
      {open && (
        <div
          className="mt-3 text-xs p-3 rounded-lg font-mono whitespace-pre-wrap"
          style={{ background: "oklch(0.08 0.01 270)", color: "oklch(0.60 0.04 270)", border: "1px solid oklch(0.16 0.03 270 / 0.5)" }}
        >
          {allText}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ContentTabs({ project, activeTab }: ContentTabsProps) {
  // Detect platform from first item if applicable
  const detectedPlatform =
    (project.titles[0]?.platform) ??
    (project.descriptions[0]?.platform) ??
    "ALL";

  if (activeTab === "titles") {
    if (!project.titles.length) return <EmptyState label="judul" icon="✦" />;
    return (
      <div className="flex flex-col gap-6">
        {/* Export panel at top */}
        <ExportTitlePanel titles={project.titles} />

        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "oklch(0.40 0.05 270)" }}>
          {project.titles.length} variasi judul
        </div>

        {project.titles.map((t, i) => {
          const limits = PLATFORM_LIMITS[t.platform ?? detectedPlatform] ?? PLATFORM_LIMITS.ALL;
          const overLimit = t.title.length > limits.title;
          return (
            <div
              key={t.id}
              className="card flex items-start gap-4"
              style={{ borderColor: t.isSelected ? "oklch(0.54 0.28 270 / 0.4)" : undefined }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                style={{ background: "oklch(0.18 0.04 270)", color: "oklch(0.60 0.14 270)" }}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium mb-1" style={{ color: "oklch(0.90 0.04 270)" }}>
                  {t.title}
                </div>
                {t.reasoning && (
                  <div className="text-xs mb-2" style={{ color: "oklch(0.50 0.04 270)" }}>
                    {t.reasoning}
                  </div>
                )}
                {/* Char indicator */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs" style={{ color: overLimit ? "oklch(0.72 0.20 25)" : "oklch(0.40 0.04 270)" }}>
                    {t.title.length}/{limits.title} karakter {overLimit && "⚠"}
                  </span>
                  <div
                    style={{
                      width: "60px", height: "3px",
                      background: "oklch(0.14 0.02 270)",
                      borderRadius: "9999px",
                    }}
                  >
                    <div style={{
                      height: "100%",
                      width: `${Math.min((t.title.length / limits.title) * 100, 100)}%`,
                      background: overLimit ? "oklch(0.72 0.20 25)" : "oklch(0.72 0.18 150)",
                      borderRadius: "9999px",
                    }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <SeoScoreRing score={t.seoScore} />
                <CopyButton text={t.title} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (activeTab === "description") {
    if (!project.descriptions.length) return <EmptyState label="deskripsi" icon="◈" />;
    return (
      <div className="flex flex-col gap-6">
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "oklch(0.40 0.05 270)" }}>
          {project.descriptions.length} versi deskripsi
        </div>

        {project.descriptions.map((d, i) => (
          <div key={d.id} className="flex flex-col gap-3">
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: "oklch(0.18 0.04 270)", color: "oklch(0.60 0.14 270)" }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-xs" style={{ color: "oklch(0.50 0.04 270)" }}>
                    {(d.charCount ?? d.content.length).toLocaleString()} karakter
                  </span>
                </div>
                <CopyButton text={d.content} />
              </div>
              <div className="prose prose-sm max-w-none max-h-[500px] overflow-y-auto pr-2 custom-prose">
                <ReactMarkdown>{d.content}</ReactMarkdown>
              </div>
            </div>
            <ExportDescPanel desc={d} platform={d.platform ?? detectedPlatform} />
          </div>
        ))}
      </div>
    );
  }

  if (activeTab === "slides") {
    if (!project.slides.length) return <EmptyState label="slide" icon="⬡" />;
    const grouped = project.slides.reduce<Record<number, Slide[]>>((acc, s) => {
      if (!acc[s.slideNumber]) acc[s.slideNumber] = [];
      acc[s.slideNumber].push(s);
      return acc;
    }, {});

    return (
      <div className="flex flex-col gap-6">
        <ExportSlidesPanel slides={project.slides} />

        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "oklch(0.40 0.05 270)" }}>
          {Object.keys(grouped).length} slide
        </div>

        {Object.entries(grouped).map(([num, slides]) => {
          const latest = slides[0];
          const SLIDE_PURPOSE: Record<number, string> = {
            1: "Hook / WOW",
            2: "Problem / Edukasi",
            3: "Fitur Utama",
            4: "Use Case",
            5: "CTA / Trust",
            6: "Testimoni",
            7: "Garansi",
            8: "Bonus / Bundling",
            9: "Final CTA",
          };
          const purpose = SLIDE_PURPOSE[Number(num)] ?? "";
          return (
            <div
              key={num}
              className="card"
              style={{ borderLeft: "3px solid oklch(0.54 0.28 270 / 0.5)" }}
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 text-center">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{ background: "oklch(0.54 0.28 270 / 0.15)", color: "oklch(0.80 0.18 270)" }}
                  >
                    {num}
                  </div>
                  {purpose && (
                    <div style={{ fontSize: "8px", color: "oklch(0.40 0.05 270)", marginTop: "3px", lineHeight: 1.2 }}>
                      {purpose}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold mb-1" style={{ color: "oklch(0.90 0.04 270)" }}>
                    {latest.headline}
                  </div>
                  {latest.subtext && (
                    <div className="text-sm" style={{ color: "oklch(0.62 0.04 270)" }}>
                      {latest.subtext}
                    </div>
                  )}
                  {latest.cta && (
                    <div
                      className="text-sm mt-2 font-medium"
                      style={{ color: "oklch(0.72 0.18 270)" }}
                    >
                      CTA: {latest.cta}
                    </div>
                  )}
                </div>
                <CopyButton
                  text={`Slide ${num}\nHeadline: ${latest.headline}\n${latest.subtext ? `Subtext: ${latest.subtext}\n` : ""}${latest.cta ? `CTA: ${latest.cta}` : ""}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (activeTab === "imagePrompts") {
    if (!project.imagePrompts.length) return <EmptyState label="image prompt" icon="◎" />;
    const grouped = project.imagePrompts.reduce<Record<number, ImagePrompt[]>>((acc, p) => {
      if (!acc[p.slideNumber]) acc[p.slideNumber] = [];
      acc[p.slideNumber].push(p);
      return acc;
    }, {});

    const allPrompts = project.imagePrompts
      .sort((a, b) => a.slideNumber - b.slideNumber)
      .map(p => `[Slide ${p.slideNumber}${p.style ? ` | ${p.style}` : ""}]\n${p.prompt}`)
      .join("\n\n---\n\n");

    return (
      <div className="flex flex-col gap-6">
        {/* Export all prompts */}
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "oklch(0.40 0.05 270)" }}>
            {project.imagePrompts.length} image prompts
          </div>
          <CopyButton text={allPrompts} label="Salin Semua Prompt" />
        </div>

        {Object.entries(grouped).map(([num, prompts]) => {
          const latest = prompts[0];
          return (
            <div key={num} className="card">
              <div className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: "oklch(0.46 0.26 200 / 0.15)", color: "oklch(0.78 0.20 200)" }}
                >
                  S{num}
                </div>
                <div className="flex-1 min-w-0">
                  {latest.style && (
                    <span className="badge badge-brand text-xs mb-2 inline-block">
                      {latest.style}
                    </span>
                  )}
                  <div
                    className="text-sm leading-relaxed font-mono whitespace-pre-wrap"
                    style={{
                      color: "oklch(0.72 0.04 200)",
                      background: "oklch(0.08 0.01 270)",
                      padding: "0.75rem",
                      borderRadius: "0.5rem",
                      border: "1px solid oklch(0.18 0.03 270 / 0.5)",
                    }}
                  >
                    {latest.prompt}
                  </div>
                </div>
                <CopyButton text={latest.prompt} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}

function EmptyState({ label, icon }: { label: string; icon: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 text-center rounded-xl"
      style={{ border: "1px dashed oklch(0.22 0.04 270 / 0.5)" }}
    >
      <div
        className="text-2xl mb-3"
        style={{ color: "oklch(0.35 0.05 270)" }}
      >
        {icon}
      </div>
      <div className="text-sm" style={{ color: "oklch(0.45 0.04 270)" }}>
        Belum ada {label}. Klik Generate di atas untuk mulai.
      </div>
    </div>
  );
}
