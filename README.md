<div align="center">
  <br />
  <h1>🚀 TokoPrompt</h1>
  <p><strong>AI-Powered Commerce Engine untuk Seller Marketplace Indonesia</strong></p>
  <p>Generate Judul SEO, Deskripsi Persuasif, Copy Slide, dan Prompt Gambar secara otomatis untuk Shopee, Tokopedia, dan TikTok Shop.</p>

  <p align="center">
    <a href="https://github.com/sandikodev/tokoprompt/stargazers"><img src="https://img.shields.io/github/stars/sandikodev/tokoprompt?style=for-the-badge&color=8b5cf6" alt="Stars Badge"/></a>
    <a href="https://github.com/sandikodev/tokoprompt/network/members"><img src="https://img.shields.io/github/forks/sandikodev/tokoprompt?style=for-the-badge&color=10b981" alt="Forks Badge"/></a>
    <a href="https://github.com/sandikodev/tokoprompt/issues"><img src="https://img.shields.io/github/issues/sandikodev/tokoprompt?style=for-the-badge&color=ef4444" alt="Issues Badge"/></a>
    <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js Badge"/>
    <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript Badge"/>
  </p>
  <br />
</div>

---

## 🌟 Fitur Utama

TokoPrompt dirancang khusus untuk memangkas waktu *copywriting* ratusan SKU produk untuk seller marketplace.

- 🤖 **Multi-Model AI Support** — BYOK (*Bring Your Own Key*). Dukung OpenAI (GPT-4o), Anthropic (Claude 3.5 Sonnet/Haiku), dan Google (Gemini 1.5).
- 🧠 **Product RAG Knowledge Base** — AI membaca *datasheet*, spesifikasi teknis, atau deskripsi supplier (tanpa halusinasi) sebelum mengenerate konten.
- 🎯 **Marketplace Optimized** — Format teks, panjang karakter, dan struktur kalimat disesuaikan otomatis untuk:
  - 🛒 Shopee
  - 🟢 Tokopedia
  - 🎵 TikTok Shop
- 🎨 **Konsistensi Brand DNA** — Sesuaikan *tone of voice* (ToV) dan gaya bahasa untuk seluruh workspace toko Anda.
- 📊 **Usage Dashboard** — Pantau pemakaian token AI, biaya estimasi, dan riwayat *generate* dalam grafik 7-hari yang interaktif.
- 🏢 **Multi-Workspace & Project Management** — Kelola banyak toko atau brand sekaligus dalam *dashboard* yang rapi.
- 💎 **Sistem Freemium Bawaan** — Batasan plan FREE vs PRO sudah ter-integerasi langsung ke level backend API.

## 🛠️ Tech Stack & Arsitektur

Dibangun dengan *state-of-the-art* teknologi *web modern*:

*   **Framework:** Next.js 16 (App Router + Turbopack)
*   **Language:** TypeScript 5 (Strict Mode)
*   **Styling:** Tailwind CSS v4 + OKLCH Color Space (Glassmorphism Design)
*   **API & State:** tRPC v11 + React Query (TanStack)
*   **Authentication:** Better Auth v1 (Email/Password, Session 30 hari)
*   **Database ORM:** Prisma v7
*   **Database Engine:** PostgreSQL Serverless (Neon) via `@prisma/adapter-pg`
*   **AI Integration:** Vercel AI SDK (`ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`)

---

## 📸 Screnshots

> *(Tambahkan screenshot aplikasi Anda di directory `/public/docs/` lalu update link gambar di bawah ini)*

| Dashboard Workspace | Generator UI |
| :---: | :---: |
| <img src="https://placehold.co/600x400/1e1e2f/8b5cf6?text=Dashboard+Workspace" alt="Dashboard" width="100%"/> | <img src="https://placehold.co/600x400/1e1e2f/10b981?text=Generator+UI" alt="Generator UI" width="100%"/> |

| Usage Metrics | RAG Knowledge Base |
| :---: | :---: |
| <img src="https://placehold.co/600x400/1e1e2f/3b82f6?text=Usage+Dashboard" alt="Usage Metrics" width="100%"/> | <img src="https://placehold.co/600x400/1e1e2f/f59e0b?text=RAG+Panel" alt="RAG Config" width="100%"/> |

---

## 🚦 Cara Install & Run Local

TokoPrompt siap dijalankan di local machine Anda. 

### 1. Clone Repository
```bash
git clone https://github.com/sandikodev/tokoprompt.git
cd tokoprompt
```

### 2. Install Dependencies
Pastikan menggunakan `pnpm` (jangan gunakan npm atau yarn).
```bash
pnpm install
```

### 3. Setup Environment Variables
Copy file env (jika ada, atau buat baru `.env`) dan isi credential database Neon PostgreSQL Anda:
```bash
DATABASE_URL="postgres://user:password@ep-xxxxx.neon.tech/neondb?sslmode=require"
BETTER_AUTH_SECRET="your-super-secret-key-32-chars-long"
```

### 4. Sinkronisasi Database (Prisma)
Jalankan perintah ini untuk push schema ke database dan generate Prisma client (harus selalu dua command ini):
```bash
npx prisma db push && npx prisma generate
```

### 5. Start Development Server
Jalankan *local server*. Akan otomatis berjalan di port yang terbuka (misal: 3000 atau 3001).
```bash
pnpm run dev
```

> **Catatan Tunneling:** Jika Anda menggunakan *Ngrok* atau *Cloudflare Tunnel* untuk bypass auth origins, **jangan** ubah URL di `.env`. Gunakan flag terminal langsung:
> `TUNNEL_URL=https://your-tunnel.trycloudflare.com pnpm run dev`

---

## 🤖 Perhatian Untuk AI Coder (Copilot/Cursor/Claude)
Jika Anda adalah *AI Coding Assistant* yang akan ikut berkolaborasi di repository ini, Anda **WAJIB** membaca file referensi utama:
- 📖 [`AGENTS.md`](./AGENTS.md) — Panduan utama arsitektur, konvensi, dan referensi *router*.
- 📖 [`CLAUDE.md`](./CLAUDE.md) — Instruksi perilaku, bahasa, dan prioritas perbaikan *(do's and don'ts)*.

---

## 📦 Roadmap (What's Next?)

- [x] Content Generator (Judul, Deskripsi, Slide, Prompt)
- [x] Usage Tracking & Dashboard Analytics
- [x] Limit & Freemium Gating (FREE vs PRO)
- [x] RAG System (Per-product specification injection)
- [ ] Stripe Webhook (Automatic PRO plan mapping)
- [ ] Bulk Export to CSV/JSON format marketplace
- [ ] Vector Database Migration (pgvector) for semantic RAG
- [ ] Multi-language Support (EN/ID)

---

## 🤝 Berkontribusi

Ingin berkontribusi? Selalu *welcome*! 

1. Fork repository ini
2. Buat branch fitur Anda (`git checkout -b feature/AmazingFeature`)
3. Lakukan commit perubahan Anda (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push ke branch branch (`git push origin feature/AmazingFeature`)
5. Buka **Pull Request**

> Pastikan kode Anda lolos TypeScript check (`npx tsc --noEmit`) sebelum push.

---

<div align="center">
  Dibuat dengan ❤️ oleh Sandiko Dev — <a href="https://github.com/sandikodev">@sandikodev</a><br>
  Didukung oleh <strong>Matrix Instrument AI Commerce Engine</strong>
</div>
