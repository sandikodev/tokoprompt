"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/lib/auth-client";

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="card flex items-center gap-4">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}35` }}
      >
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <div className="text-2xl font-bold" style={{ color: "oklch(0.92 0.04 270)" }}>
          {value}
        </div>
        <div className="text-xs" style={{ color: "oklch(0.50 0.05 270)" }}>
          {label}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: workspaces, isLoading } = trpc.workspace.list.useQuery();

  const totalProjects = workspaces?.reduce((sum: number, ws: { _count: { projects: number } }) => sum + ws._count.projects, 0) ?? 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Selamat pagi" : hour < 17 ? "Selamat siang" : "Selamat malam";

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "oklch(0.92 0.04 270)" }}>
          {greeting}, {session?.user.name?.split(" ")[0] ?? "Seller"} 👋
        </h1>
        <p style={{ color: "oklch(0.52 0.05 270)" }}>
          Kelola workspace dan generate konten produk Anda.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <StatCard
          label="Total Workspace"
          value={workspaces?.length ?? 0}
          color="oklch(0.72 0.24 270)"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          }
        />
        <StatCard
          label="Total Project"
          value={totalProjects}
          color="oklch(0.78 0.20 200)"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          }
        />
        <StatCard
          label="Platform Didukung"
          value="3"
          color="oklch(0.72 0.18 150)"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          }
        />
        <StatCard
          label="AI Provider"
          value="3"
          color="oklch(0.80 0.18 80)"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
          }
        />
      </div>

      {/* Workspaces Section */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold" style={{ color: "oklch(0.88 0.04 270)" }}>
          Workspaces
        </h2>
        <Link href="/dashboard/new-workspace" className="btn btn-secondary btn-sm">
          + Workspace Baru
        </Link>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse" style={{ height: "120px" }}>
              <div
                className="h-4 w-1/2 rounded mb-3"
                style={{ background: "oklch(0.18 0.03 270)" }}
              />
              <div
                className="h-3 w-3/4 rounded"
                style={{ background: "oklch(0.15 0.02 270)" }}
              />
            </div>
          ))}
        </div>
      ) : workspaces && workspaces.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {workspaces.map((ws) => (
            <Link key={ws.id} href={`/dashboard/${ws.slug}`} className="card card-hover block">
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: "oklch(0.20 0.04 270)", color: "oklch(0.72 0.18 270)" }}
                >
                  {ws.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate" style={{ color: "oklch(0.90 0.04 270)" }}>
                    {ws.name}
                  </div>
                  <div className="text-xs" style={{ color: "oklch(0.45 0.04 270)" }}>
                    /{ws.slug}
                  </div>
                </div>
              </div>
              {ws.description && (
                <p
                  className="text-sm mb-3 line-clamp-2"
                  style={{ color: "oklch(0.55 0.04 270)" }}
                >
                  {ws.description}
                </p>
              )}
              <div className="flex items-center gap-2">
                <span className="badge badge-brand text-xs">
                  {ws._count.projects} project
                </span>
                {ws.brandTone && (
                  <span className="text-xs" style={{ color: "oklch(0.42 0.04 270)" }}>
                    · {ws.brandTone}
                  </span>
                )}
              </div>
            </Link>
          ))}

          {/* Add new card */}
          <Link
            href="/dashboard/new-workspace"
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
              Tambah Workspace
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
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <div className="font-semibold mb-1" style={{ color: "oklch(0.80 0.04 270)" }}>
              Belum ada workspace
            </div>
            <div className="text-sm mb-4" style={{ color: "oklch(0.50 0.04 270)" }}>
              Buat workspace pertama untuk mulai generate konten produk
            </div>
          </div>
          <Link href="/dashboard/new-workspace" className="btn btn-primary">
            Buat Workspace Pertama →
          </Link>
        </div>
      )}
    </div>
  );
}
