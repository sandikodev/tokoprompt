"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    exact: true,
  },
  {
    href: "/settings/api-keys",
    label: "API Keys",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    exact: false,
  },
  {
    href: "/settings/usage",
    label: "Usage",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 3v18h18" strokeLinecap="round" />
        <path d="M7 16l4-4 4 4 4-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    exact: false,
  },
  {
    href: "/settings/upgrade",
    label: "Upgrade",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    exact: false,
  },
];

interface DashboardSidebarProps {
  user: { id: string; name: string; email: string; image?: string | null };
}

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const { data: workspaces } = trpc.workspace.list.useQuery();
  const { data: planData } = trpc.plan.getMyPlan.useQuery();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    router.push("/login");
  }

  return (
    <aside
      className="flex flex-col glass border-r shrink-0 transition-all duration-300"
      style={{
        width: collapsed ? "64px" : "240px",
        borderColor: "oklch(0.20 0.04 270 / 0.6)",
        minHeight: "100dvh",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-4 border-b"
        style={{ borderColor: "oklch(0.20 0.04 270 / 0.4)", height: "60px" }}
      >
        <div className="w-7 h-7 rounded-md gradient-brand glow-brand flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-xs">T</span>
        </div>
        {!collapsed && (
          <span className="font-bold text-sm truncate" style={{ color: "oklch(0.90 0.04 270)" }}>
            TokoPrompt
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto btn btn-ghost p-1 rounded-md"
          style={{ minWidth: 0 }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
          >
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-1">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150"
              title={collapsed ? item.label : undefined}
              style={{
                background: active ? "oklch(0.54 0.28 270 / 0.15)" : "transparent",
                color: active ? "oklch(0.80 0.18 270)" : "oklch(0.58 0.06 270)",
                border: `1px solid ${active ? "oklch(0.54 0.28 270 / 0.25)" : "transparent"}`,
              }}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}

        {/* Workspaces */}
        {!collapsed && (
          <div className="mt-4">
            <div
              className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider"
              style={{ color: "oklch(0.40 0.05 270)" }}
            >
              Workspaces
            </div>
            {workspaces?.map((ws) => {
              const active = pathname.startsWith(`/dashboard/${ws.slug}`);
              return (
                <Link
                  key={ws.id}
                  href={`/dashboard/${ws.slug}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-150"
                  style={{
                    color: active ? "oklch(0.80 0.14 270)" : "oklch(0.55 0.05 270)",
                    background: active ? "oklch(0.54 0.28 270 / 0.10)" : "transparent",
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: "oklch(0.20 0.04 270)", color: "oklch(0.72 0.18 270)" }}
                  >
                    {ws.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate">{ws.name}</span>
                  <span
                    className="ml-auto text-xs shrink-0"
                    style={{ color: "oklch(0.40 0.04 270)" }}
                  >
                    {ws._count.projects}
                  </span>
                </Link>
              );
            })}

            <Link
              href="/dashboard/new-workspace"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-150 mt-1"
              style={{ color: "oklch(0.45 0.05 270)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              <span>Workspace baru</span>
            </Link>
          </div>
        )}
      </nav>

      {/* User + Plan */}
      <div
        className="p-2 border-t"
        style={{ borderColor: "oklch(0.20 0.04 270 / 0.4)" }}
      >
        {/* Plan badge + upgrade nudge */}
        {!collapsed && planData && (
          <div className="mb-2">
            {planData.plan === "FREE" ? (
              <Link
                href="/settings/upgrade"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all"
                style={{
                  background: "oklch(0.54 0.28 270 / 0.10)",
                  border: "1px solid oklch(0.54 0.28 270 / 0.25)",
                }}
              >
                <div className="flex flex-col gap-0.5">
                  <span style={{ color: "oklch(0.72 0.24 270)", fontWeight: 600 }}>FREE Plan</span>
                  <span style={{ color: "oklch(0.45 0.04 270)" }}>
                    {planData.limits.generatesPerDay.used}/
                    {planData.limits.generatesPerDay.max ?? "∞"} hari ini
                  </span>
                </div>
                <span style={{ color: "oklch(0.72 0.24 270)", fontSize: "11px" }}>Upgrade →</span>
              </Link>
            ) : (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                style={{ background: "oklch(0.72 0.18 150 / 0.10)", border: "1px solid oklch(0.72 0.18 150 / 0.25)" }}
              >
                <span style={{ color: "oklch(0.72 0.18 150)", fontWeight: 600 }}>✦ PRO</span>
                <span style={{ color: "oklch(0.50 0.04 270)" }}>Aktif</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 px-2 py-2">
          <div
            className="w-7 h-7 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0"
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate" style={{ color: "oklch(0.80 0.04 270)" }}>
                {user.name}
              </div>
              <div className="text-xs truncate" style={{ color: "oklch(0.45 0.04 270)" }}>
                {user.email}
              </div>
            </div>
          )}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="btn btn-ghost p-1 rounded-md shrink-0"
            title="Keluar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
