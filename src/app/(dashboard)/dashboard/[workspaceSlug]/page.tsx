"use client";

import { use } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

type ProjectStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

const STATUS_BADGE: Record<ProjectStatus, { label: string; cls: string }> = {
  DRAFT:    { label: "Draft",  cls: "badge-amber" },
  ACTIVE:   { label: "Aktif", cls: "badge-green"  },
  ARCHIVED: { label: "Arsip", cls: "badge-red"    },
};

const PLATFORM_ICON: Record<string, string> = {
  SHOPEE:      "🛒",
  TOKOPEDIA:   "🛍️",
  TIKTOK_SHOP: "🎵",
  ALL:         "🌐",
};

type Project = {
  id: string;
  name: string;
  productName: string;
  category: string | null;
  platform: string;
  status: ProjectStatus;
  _count: {
    titles: number;
    descriptions: number;
    slides: number;
    imagePrompts: number;
  };
};

export default function WorkspacePage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = use(params);

  const { data: workspace, isLoading: wsLoading } = trpc.workspace.getBySlug.useQuery({
    slug: workspaceSlug,
  });

  const { data: projects, isLoading: projLoading } = trpc.project.list.useQuery(
    { workspaceId: workspace?.id ?? "" },
    { enabled: !!workspace?.id }
  );

  // Cast to our local type for type safety
  const typedProjects = (projects as Project[] | undefined);

  if (wsLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="text-sm" style={{ color: "oklch(0.45 0.05 270)" }}>Memuat workspace...</div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="p-6 text-center">
        <p style={{ color: "oklch(0.55 0.05 270)" }}>Workspace tidak ditemukan.</p>
        <Link href="/dashboard" className="btn btn-secondary btn-sm mt-4">← Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm mb-6" style={{ color: "oklch(0.45 0.04 270)" }}>
        <Link href="/dashboard" style={{ color: "oklch(0.55 0.08 270)" }}>Dashboard</Link>
        <span>/</span>
        <span style={{ color: "oklch(0.80 0.04 270)" }}>{workspace.name}</span>
      </div>

      {/* Workspace header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shrink-0"
            style={{ background: "oklch(0.18 0.04 270)", color: "oklch(0.72 0.22 270)" }}
          >
            {workspace.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "oklch(0.92 0.04 270)" }}>
              {workspace.name}
            </h1>
            {workspace.description && (
              <p className="text-sm" style={{ color: "oklch(0.50 0.04 270)" }}>
                {workspace.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1">
              {workspace.brandTone && (
                <span className="badge badge-brand text-xs">{workspace.brandTone}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/dashboard/${workspaceSlug}/settings`} className="btn btn-secondary btn-sm">
            Settings
          </Link>
          <Link href={`/dashboard/${workspaceSlug}/new-project`} className="btn btn-primary btn-sm">
            + Project Baru
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div
        className="grid grid-cols-3 gap-4 mb-8 p-4 rounded-xl"
        style={{ background: "oklch(0.10 0.01 270)", border: "1px solid oklch(0.18 0.03 270 / 0.6)" }}
      >
        {[
          { label: "Total Project", value: typedProjects?.length ?? 0 },
          { label: "Aktif",         value: typedProjects?.filter((p) => p.status === "ACTIVE").length ?? 0 },
          { label: "Draft",         value: typedProjects?.filter((p) => p.status === "DRAFT").length ?? 0 },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-2xl font-bold gradient-text">{s.value}</div>
            <div className="text-xs" style={{ color: "oklch(0.48 0.05 270)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Projects header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold" style={{ color: "oklch(0.85 0.04 270)" }}>
          Projects / Produk
        </h2>
      </div>

      {/* Project list */}
      {projLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse h-36" />
          ))}
        </div>
      ) : typedProjects && typedProjects.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {typedProjects.map((project) => {
            const badge = STATUS_BADGE[project.status] ?? STATUS_BADGE.DRAFT;
            const totalContent =
              project._count.titles +
              project._count.descriptions +
              project._count.slides +
              project._count.imagePrompts;

            return (
              <Link
                key={project.id}
                href={`/dashboard/${workspaceSlug}/project/${project.id}`}
                className="card card-hover block"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate mb-0.5" style={{ color: "oklch(0.90 0.04 270)" }}>
                      {project.name}
                    </div>
                    <div className="text-xs truncate" style={{ color: "oklch(0.48 0.04 270)" }}>
                      {project.productName}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2 shrink-0">
                    <span className="text-base">{PLATFORM_ICON[project.platform] ?? "🌐"}</span>
                    <span className={`badge ${badge.cls} text-xs`}>{badge.label}</span>
                  </div>
                </div>

                {project.category && (
                  <div className="text-xs mb-3" style={{ color: "oklch(0.50 0.05 270)" }}>
                    {project.category}
                  </div>
                )}

                {/* Content counts */}
                <div
                  className="flex items-center gap-3 pt-3 border-t text-xs"
                  style={{ borderColor: "oklch(0.18 0.03 270 / 0.5)", color: "oklch(0.45 0.04 270)" }}
                >
                  <span title="Judul">✦ {project._count.titles}</span>
                  <span title="Deskripsi">◈ {project._count.descriptions}</span>
                  <span title="Slide">⬡ {project._count.slides}</span>
                  <span title="Image Prompt">◎ {project._count.imagePrompts}</span>
                  {totalContent > 0 && (
                    <span className="ml-auto badge badge-green" style={{ fontSize: "10px" }}>
                      {totalContent} konten
                    </span>
                  )}
                </div>
              </Link>
            );
          })}

          {/* Add project card */}
          <Link
            href={`/dashboard/${workspaceSlug}/new-project`}
            className="card card-hover flex flex-col items-center justify-center text-center gap-2 min-h-[120px]"
            style={{ borderStyle: "dashed" }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "oklch(0.16 0.03 270)", color: "oklch(0.50 0.08 270)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-sm" style={{ color: "oklch(0.48 0.05 270)" }}>
              Tambah Project Baru
            </span>
          </Link>
        </div>
      ) : (
        /* Empty state */
        <div
          className="card flex flex-col items-center justify-center text-center py-16 gap-4"
          style={{ borderStyle: "dashed" }}
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{ background: "oklch(0.16 0.03 270)" }}
          >
            <svg
              width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="oklch(0.54 0.20 270)" strokeWidth="1.5"
            >
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <div className="font-semibold mb-1" style={{ color: "oklch(0.80 0.04 270)" }}>
              Belum ada project
            </div>
            <div className="text-sm mb-4" style={{ color: "oklch(0.50 0.04 270)" }}>
              Buat project pertama untuk mulai generate konten produk
            </div>
          </div>
          <Link href={`/dashboard/${workspaceSlug}/new-project`} className="btn btn-primary">
            Buat Project Pertama →
          </Link>
        </div>
      )}
    </div>
  );
}
