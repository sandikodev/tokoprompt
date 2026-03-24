import Link from "next/link";

const features = [
  {
    icon: "✦",
    title: "Judul SEO Otomatis",
    desc: "Dapatkan 3–5 variasi judul yang dioptimasi untuk CTR tinggi di Shopee, Tokopedia, dan TikTok Shop.",
    color: "brand",
  },
  {
    icon: "◈",
    title: "Deskripsi Produk AI",
    desc: "Deskripsi 2500+ karakter dengan struktur Hook → Problem → Solution → CTA yang terbukti konversi.",
    color: "accent",
  },
  {
    icon: "⬡",
    title: "Slide Marketplace",
    desc: "Generate konten untuk 5–9 slide marketplace — dari hero shot sampai CTA — dalam satu klik.",
    color: "brand",
  },
  {
    icon: "◎",
    title: "Image Prompt Generator",
    desc: "Prompt siap pakai untuk Google Imagen 2 & 3 Pro, disesuaikan per slide dengan brand visual Anda.",
    color: "accent",
  },
  {
    icon: "⬢",
    title: "Project-Based (RAG)",
    desc: "Setiap produk punya konteks AI sendiri — hasil lebih konsisten, tidak generic, tidak hallucination.",
    color: "brand",
  },
  {
    icon: "◇",
    title: "BYOK Multi-Provider",
    desc: "Gunakan API key Anda sendiri: ChatGPT, Claude, atau Gemini. Cost transparan, privasi terjaga.",
    color: "accent",
  },
];

const platforms = [
  { name: "Shopee", emoji: "🛒", color: "#EE4D2D" },
  { name: "Tokopedia", emoji: "🛍️", color: "#03AC0E" },
  { name: "TikTok Shop", emoji: "🎵", color: "#FE2C55" },
];

const stats = [
  { value: "5×", label: "Lebih cepat dari manual" },
  { value: "3", label: "Platform didukung" },
  { value: "4", label: "Jenis konten otomatis" },
  { value: "BYOK", label: "Bawa API key sendiri" },
];

export default function HomePage() {
  return (
    <main className="min-h-dvh overflow-x-hidden">
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-dvh flex flex-col items-center justify-center px-4 text-center">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" />

        {/* Gradient Orbs */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, oklch(0.54 0.28 270 / 0.18) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute top-2/3 left-1/4 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, oklch(0.46 0.26 200 / 0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="animate-fade-up opacity-0" style={{ animationFillMode: "forwards" }}>
            <span className="badge badge-brand mb-6 inline-flex">
              <span>by PT Koneksi Jaringan Indonesia</span>
            </span>
          </div>

          {/* Heading */}
          <h1
            className="animate-fade-up opacity-0 text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-none delay-100"
            style={{ animationFillMode: "forwards" }}
          >
            <span className="gradient-text glow-text">AI Content Engine</span>
            <br />
            <span style={{ color: "oklch(0.85 0.05 270)" }}>
              untuk Seller Marketplace
            </span>
          </h1>

          {/* Sub */}
          <p
            className="animate-fade-up opacity-0 text-lg md:text-xl mb-10 max-w-2xl mx-auto delay-200"
            style={{
              color: "oklch(0.60 0.05 270)",
              animationFillMode: "forwards",
            }}
          >
            Buat judul SEO, deskripsi, slide, dan prompt gambar untuk produk
            Shopee, Tokopedia, dan TikTok Shop secara otomatis.{" "}
            <strong style={{ color: "oklch(0.78 0.12 270)" }}>
              Konsisten. Scalable. AI-native.
            </strong>
          </p>

          {/* CTA */}
          <div
            className="animate-fade-up opacity-0 flex flex-col sm:flex-row gap-4 justify-center delay-300"
            style={{ animationFillMode: "forwards" }}
          >
            <Link href="/register" className="btn btn-primary btn-lg animate-pulse-glow">
              Mulai Gratis →
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg">
              Masuk ke Dashboard
            </Link>
          </div>

          {/* Platform badges */}
          <div
            className="animate-fade-up opacity-0 flex flex-wrap justify-center gap-3 mt-10 delay-400"
            style={{ animationFillMode: "forwards" }}
          >
            {platforms.map((p) => (
              <span
                key={p.name}
                className="glass px-4 py-2 rounded-full text-sm font-medium"
                style={{ color: "oklch(0.78 0.06 270)" }}
              >
                {p.emoji} {p.name}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float"
          style={{ color: "oklch(0.40 0.06 270)" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 border-y" style={{ borderColor: "oklch(0.20 0.04 270 / 0.5)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-bold gradient-text mb-1">{s.value}</div>
              <div className="text-sm" style={{ color: "oklch(0.55 0.05 270)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">Semua yang Anda butuhkan</span>
            </h2>
            <p className="text-lg" style={{ color: "oklch(0.55 0.05 270)" }}>
              Dari input produk sampai konten siap upload — semua dalam satu platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="card card-hover"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className="text-3xl mb-4"
                  style={{
                    color: f.color === "brand"
                      ? "oklch(0.72 0.24 270)"
                      : "oklch(0.78 0.20 200)",
                  }}
                >
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "oklch(0.90 0.04 270)" }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "oklch(0.55 0.04 270)" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it Works ─────────────────────────────────────────────────── */}
      <section className="py-24 px-4" style={{ background: "oklch(0.08 0.01 270)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Cara kerja TokoPrompt</span>
          </h2>
          <p className="mb-16" style={{ color: "oklch(0.55 0.05 270)" }}>
            4 langkah dari nol sampai konten siap upload
          </p>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Input Produk", desc: "Masukkan nama, spesifikasi, target market, dan platform tujuan." },
              { step: "02", title: "Pilih AI", desc: "Gunakan API key Anda sendiri: ChatGPT, Claude, atau Gemini." },
              { step: "03", title: "Generate", desc: "AI menghasilkan judul, deskripsi, slide, dan image prompt sekaligus." },
              { step: "04", title: "Export & Upload", desc: "Salin konten dan upload langsung ke marketplace Anda." },
            ].map((item, i) => (
              <div key={item.step} className="relative">
                {i < 3 && (
                  <div
                    className="hidden md:block absolute top-6 left-full w-full h-px z-0"
                    style={{ background: "linear-gradient(90deg, oklch(0.46 0.20 270 / 0.4), transparent)" }}
                  />
                )}
                <div className="relative z-10">
                  <div
                    className="w-12 h-12 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-sm mx-auto mb-4 glow-brand"
                  >
                    {item.step}
                  </div>
                  <h3 className="font-semibold mb-2" style={{ color: "oklch(0.88 0.04 270)" }}>
                    {item.title}
                  </h3>
                  <p className="text-sm" style={{ color: "oklch(0.52 0.04 270)" }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Bottom ───────────────────────────────────────────────────── */}
      <section className="py-24 px-4 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, oklch(0.54 0.28 270 / 0.08) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "oklch(0.92 0.04 270)" }}>
            Siap scale toko Anda?
          </h2>
          <p className="mb-8" style={{ color: "oklch(0.55 0.05 270)" }}>
            Bergabung dengan seller UMKM yang sudah menggunakan AI untuk konten produk yang konsisten dan konversi tinggi.
          </p>
          <Link href="/register" className="btn btn-primary btn-lg">
            Daftar Sekarang — Gratis
          </Link>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <footer
        className="py-8 px-4 text-center text-sm border-t"
        style={{
          borderColor: "oklch(0.18 0.03 270 / 0.5)",
          color: "oklch(0.40 0.04 270)",
        }}
      >
        <p>© 2026 <strong style={{ color: "oklch(0.55 0.08 270)" }}>TokoPrompt</strong> by PT Koneksi Jaringan Indonesia. All rights reserved.</p>
      </footer>
    </main>
  );
}
