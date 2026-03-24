"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
    });

    if (result.error) {
      setError(result.error.message ?? "Login gagal. Periksa email dan password Anda.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="relative min-h-dvh flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, oklch(0.54 0.28 270 / 0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg gradient-brand glow-brand flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-bold text-lg" style={{ color: "oklch(0.90 0.04 270)" }}>
              TokoPrompt
            </span>
          </Link>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "oklch(0.92 0.04 270)" }}>
            Masuk ke akun Anda
          </h1>
          <p className="text-sm" style={{ color: "oklch(0.52 0.05 270)" }}>
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-medium"
              style={{ color: "oklch(0.72 0.18 270)" }}
            >
              Daftar gratis
            </Link>
          </p>
        </div>

        {/* Card */}
        <div className="card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

            <div>
              <label className="label">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginTop: "0.5rem" }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Masuk...
                </span>
              ) : (
                "Masuk →"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "oklch(0.38 0.04 270)" }}>
          © 2026 TokoPrompt by PT Koneksi Jaringan Indonesia
        </p>
      </div>
    </div>
  );
}
