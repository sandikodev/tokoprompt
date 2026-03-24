"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signUp.email({
      name,
      email,
      password,
      callbackURL: "/dashboard",
    });

    if (result.error) {
      setError(result.error.message ?? "Pendaftaran gagal. Coba lagi.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="relative min-h-dvh flex items-center justify-center px-4 py-12">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, oklch(0.46 0.26 200 / 0.10) 0%, transparent 70%)",
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
            Buat akun gratis
          </h1>
          <p className="text-sm" style={{ color: "oklch(0.52 0.05 270)" }}>
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-medium"
              style={{ color: "oklch(0.72 0.18 270)" }}
            >
              Masuk
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
              <label className="label">Nama Lengkap</label>
              <input
                id="name"
                type="text"
                className="input"
                placeholder="Budi Santoso"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

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
                placeholder="Min. 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <p className="text-xs" style={{ color: "oklch(0.45 0.04 270)" }}>
              Dengan mendaftar, Anda menyetujui Syarat & Ketentuan penggunaan platform TokoPrompt.
            </p>

            <button
              id="register-submit"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Mendaftar...
                </span>
              ) : (
                "Daftar Sekarang →"
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
