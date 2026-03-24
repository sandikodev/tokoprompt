# TokoPrompt — AI Agent Instructions

> **BACA SELURUH FILE INI SEBELUM MENULIS SATU BARIS KOD PUN.**
> File ini adalah sumber kebenaran tunggal (single source of truth) untuk semua AI coding assistant
> (Antigravity, Copilot, Cursor, Claude, Codex, Gemini CLI) yang bekerja di repository ini.

---

## 🏗️ Project Overview

**TokoPrompt** adalah SaaS berbasis AI untuk seller marketplace Indonesia (Shopee, Tokopedia, TikTok Shop).
Dibangun oleh **PT Koneksi Jaringan Indonesia** — brand: **Matrix Instrument AI Commerce Engine**.

### Core Value Proposition
- Generate judul SEO, deskripsi produk, copy slide, dan image prompts secara otomatis
- Menjaga konsistensi branding via Brand DNA per workspace
- BYOK (Bring Your Own Key) — user supply API key sendiri (OpenAI, Anthropic, Gemini)
- RAG per produk — AI membaca datasheet/spesifikasi untuk output yang akurat

### Business Model
- **FREE plan:** 2 workspace, 3 project/workspace, 15 generate/hari
- **PRO plan:** unlimited segalanya + RAG + Proxy + Bulk Export

---

## ⚙️ Tech Stack

| Layer | Technology | Catatan |
|---|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) | `pnpm run dev -p 3001` |
| Language | **TypeScript 5** (strict mode) | `tsconfig.json` strict=true |
| Styling | **Tailwind CSS v4** + custom CSS variables | oklch color space |
| API Layer | **tRPC v11** + superjson transformer | No REST endpoints (kecuali auth) |
| Auth | **Better Auth v1** (email/password) | Session 30 hari |
| Database | **Prisma v7** + PostgreSQL (Neon serverless) | `@prisma/adapter-pg` |
| AI SDK | **Vercel AI SDK** (`ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`) | `generateText` only |
| UI | Custom design system | Tidak pakai shadcn/radix/headless-ui |
| Package Manager | **pnpm** | Jangan gunakan npm/yarn |

---

## 📁 Directory Structure (Lengkap)

```
tokoprompt/
├── prisma/
│   ├── schema.prisma            # Database schema (SSOT)
│   └── prisma.config.ts         # Prisma config
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx   # Login form (Better Auth signIn.email)
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/         # Route group — semua butuh auth
│   │   │   ├── layout.tsx       # Cek sesi, render DashboardSidebar
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx     # Daftar workspace → redirect jika hanya 1
│   │   │   │   ├── new-workspace/page.tsx
│   │   │   │   └── [workspaceSlug]/
│   │   │   │       ├── page.tsx              # Daftar project + search
│   │   │   │       ├── settings/page.tsx     # Edit workspace + Brand DNA
│   │   │   │       ├── new-project/page.tsx  # Form buat project baru
│   │   │   │       └── project/
│   │   │   │           └── [projectId]/
│   │   │   │               ├── page.tsx      # ⭐ Generator UI utama
│   │   │   │               └── edit/page.tsx # Edit spec + status + hapus project
│   │   │   └── settings/
│   │   │       ├── api-keys/page.tsx  # BYOK API key management
│   │   │       ├── usage/page.tsx     # Usage dashboard (stats, chart, logs)
│   │   │       └── upgrade/page.tsx   # Plan comparison + usage limits
│   │   ├── api/
│   │   │   ├── auth/[...all]/route.ts  # Better Auth handler
│   │   │   └── trpc/[trpc]/route.ts    # tRPC handler
│   │   ├── globals.css   # Design system (CSS classes + variables)
│   │   └── layout.tsx    # Root layout + TRPCProvider
│   ├── components/
│   │   ├── layout/
│   │   │   └── DashboardSidebar.tsx   # Nav + workspace list + plan badge
│   │   └── generator/
│   │       ├── GeneratorPanel.tsx     # AI parameter controls + Generate button
│   │       ├── ContentTabs.tsx        # Tab hasil: Judul/Deskripsi/Slide/Prompt
│   │       └── ProductContextPanel.tsx # RAG knowledge base UI per project
│   ├── server/
│   │   ├── db.ts          # Prisma client singleton (PrismaPg adapter)
│   │   ├── trpc.ts        # tRPC context, middleware, procedures
│   │   ├── root.ts        # Merger semua routes → appRouter
│   │   └── routers/
│   │       ├── workspace.ts      # CRUD workspace + limit check
│   │       ├── project.ts        # CRUD project + updateStatus + limit check
│   │       ├── generate.ts       # AI generation (titles/desc/slides/imagePrompts)
│   │       ├── apiKey.ts         # BYOK key management + encrypt/decrypt
│   │       ├── usage.ts          # Usage stats, content history, clear content
│   │       ├── plan.ts           # Freemium limits, getMyPlan, limit helpers
│   │       └── productContext.ts # RAG: chunker, scorer, CRUD knowledge base
│   └── lib/
│       ├── auth.ts         # Better Auth server config + buildTrustedOrigins()
│       ├── auth-client.ts  # Better Auth client (dynamic baseURL via window.location)
│       └── trpc.ts         # tRPC React client config
├── AGENTS.md   # ← File ini
├── CLAUDE.md   # Claude-specific behavioral instructions
├── next.config.ts   # allowedDevOrigins untuk tunnel support
└── .env         # JANGAN EDIT untuk keperluan tunnel
```

---

## 🗄️ Database Schema Summary

### Enums

```prisma
enum Plan           { FREE, PRO }
enum AiProvider     { OPENAI, ANTHROPIC, GEMINI }
enum Platform       { SHOPEE, TOKOPEDIA, TIKTOK_SHOP, ALL }
enum ProjectStatus  { DRAFT, ACTIVE, ARCHIVED }
enum GenerationType { TITLE, DESCRIPTION, SLIDE, IMAGE_PROMPT }
```

### Models & Relations

```
User
 ├── plan: Plan (FREE/PRO)
 ├── planExpiresAt: DateTime?
 ├── sessions[], accounts[]        ← Better Auth
 ├── apiKeys[]                     ← BYOK keys
 └── workspaces[]
      └── Workspace
           └── projects[]
                └── Project
                     ├── titles[]           → GeneratedTitle
                     ├── descriptions[]     → GeneratedDescription
                     ├── slides[]           → GeneratedSlide
                     ├── imagePrompts[]     → ImagePrompt
                     ├── usageLogs[]        → UsageLog
                     └── productContexts[]  → ProductContext  ← RAG

ApiKey ── usageLogs[]
UsageLog ─ projectId, apiKeyId, provider, generationType, inputTokens, outputTokens, costEstimate
ProductContext ─ projectId, title, content (Text), chunkIndex, charCount, source
```

---

## 🔑 Critical Rules & Conventions

### 1. Prisma v7 — Driver Adapters
- **DILARANG** menambahkan `previewFeatures = ["driverAdapters"]` ke `schema.prisma`. Deprecated di v7.
- Selalu gunakan `PrismaPg` dari `@prisma/adapter-pg` di `src/server/db.ts`.
- **Setelah setiap perubahan schema, WAJIB jalankan:**
  ```bash
  npx prisma db push && npx prisma generate
  ```
- IDE TypeScript server mungkin masih cache lama — jalankan `npx tsc --noEmit` untuk verify nyata.

### 2. API Key Encryption
- API keys disimpan sebagai **Base64** di field `keyHash` (bukan AES, bukan hash).
- **SELALU panggil `decryptKey(apiKeyRecord.keyHash)`** dari `./apiKey` sebelum dikirim ke AI model.
- **JANGAN** gunakan `apiKeyRecord.keyHash` langsung — akan gagal silently di AI provider.
- `getModel(provider, decodedKey, apiKeyRecord.baseUrl)` — parameter `baseUrl` opsional.

### 3. Freemium System (Plan Limits)
Limit didefinisikan di `src/server/routers/plan.ts` → `PLAN_LIMITS` constant:
```
FREE: workspace=2, project/workspace=3, generate/day=15
PRO:  semua Infinity
```
- **Setiap `project.create`** harus panggil `checkProjectLimit()` sebelum insert.
- **Setiap `workspace.create`** harus panggil `checkWorkspaceLimit()`.
- **Setiap `generate.*`** harus panggil `checkDailyLimit()`.
- Semua helper ada di `./plan.ts` — import dari sana, **jangan duplikasi logic**.
- Plan di-expire otomatis via `planExpiresAt` — belum ada cron job untuk ini (future work).

### 4. RAG System (productContext.ts)
- Setiap `generate.*` mutation **HARUS** memanggil `getRelevantProductContext()` sebelum `buildProjectContext()`.
- Chunk size: **600 karakter**, overlap: **100 karakter**, minimum chunk length: **20 karakter**.
- Scoring: BM25-lite TF-IDF keyword matching — **tidak ada** embedding/vector, tidak perlu pgvector.
- `buildProjectContext(project, workspace, ragContext)` — parameter ke-3 default `""` (aman diabaikan).
- Jika project belum punya `ProductContext`, RAG mengembalikan `""` — AI tetap bekerja normal.

### 5. AI Proxy Support
- User bisa konfigurasi custom `baseUrl` per API key (ngrok/Cloudflare/Antigravity Manager).
- Field ini di `ApiKey.baseUrl` column (`String?` nullable).
- `getModel(provider, key, baseUrl?)` sudah pass `baseURL` ke ketiga AI provider factory.
- Untuk development: jalankan `TUNNEL_URL=https://... pnpm dev` — **jangan edit `.env`**.

### 6. Better Auth — Trusted Origins
- `trustedOrigins` di `src/lib/auth.ts` menggunakan fungsi `buildTrustedOrigins()`.
- Localhost ports 3000–3003 selalu included.
- Tambah tunnel URL sementara: `TUNNEL_URL=https://abc.trycloudflare.com pnpm dev -p 3001`
- **JANGAN** gunakan `RegExp` di array `trustedOrigins` — Better Auth hanya accept `string[]`.

### 7. Next.js Dev Origins (Tunnel Support)
- `next.config.ts` sudah ada `allowedDevOrigins` untuk ngrok, Cloudflare Tunnel, dan localtunnel.
- **Jangan hapus** entries ini.

### 8. CSS Design System
- Semua warna pakai **oklch()** — jangan pernah ganti ke hex/hsl kecuali migrasi disengaja.
- CSS class yang tersedia di `globals.css`:
  - **Layout:** `.card`, `.glass`
  - **Forms:** `.input`, `.label`, `.textarea`
  - **Buttons:** `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-sm`
  - **Badges:** `.badge`
  - **Animations:** `.animate-pulse-glow`, `.gradient-brand`
- **JANGAN** tambahkan global reset `* { margin: 0; padding: 0 }` — merusak layout.
- Tailwind v4 tidak butuh konfigurasi plugin — langsung gunakan utility class.

### 9. tRPC Patterns
- Di dalam tRPC procedures: gunakan `ctx.db`, **bukan** `import { db } from "@/server/db"`.
- Session user ID di dalam procedure: `ctx.userId` (string, tidak nullable di `protectedProcedure`).
- `superjson` sebagai transformer — `Date`, `BigInt`, `Map`, `Set` aman di-pass over tRPC.
- Untuk query yang butuh guard: selalu `findFirst` dengan `where: { ..., workspace: { userId: ctx.userId } }`.

### 10. Auth Client
- `src/lib/auth-client.ts` menggunakan `window.location.origin` sebagai `baseURL` dinamis.
- Auth bekerja di semua port dan tunnel URL **tanpa ubah `.env`**.

---

## 🚫 Common Mistakes — JANGAN LAKUKAN

| ❌ Anti-Pattern | ✅ Yang Benar |
|---|---|
| `import { db } from "@/server/db"` di tRPC router | Gunakan `ctx.db` |
| `previewFeatures` di schema.prisma | Hapus — deprecated di Prisma v7 |
| `apiKeyRecord.keyHash` langsung ke AI | `decryptKey(apiKeyRecord.keyHash)` dulu |
| Hardcode `localhost:3000` di auth.ts | Gunakan `buildTrustedOrigins()` |
| Global CSS reset `* {}` | Tidak pernah. Gunakan utility class yang ada. |
| `import { signOut } from "next-auth"` | Import dari `@/lib/auth-client` |
| Edit `.env` untuk tunnel URL | `TUNNEL_URL=... pnpm dev` |
| Duplikasi limit logic | Import dari `./plan.ts` (checkProjectLimit dll) |
| Lupakan RAG context saat generate | Panggil `getRelevantProductContext()` sebelum build prompt |
| `npm install` atau `yarn add` | Selalu `pnpm add` |
| `npm run dev` | Selalu `pnpm run dev` |
| Ubah schema tanpa `db push && generate` | Wajib push lalu generate |
| Commit langsung ke main | Buat branch, PR, review |

---

## 🛠️ Commands Reference

```bash
# ── Development ───────────────────────────────────────────
pnpm run dev                               # Port otomatis
pnpm run dev -p 3001                       # Port spesifik

# Dengan tunnel (tanpa edit .env)
TUNNEL_URL=https://abc.trycloudflare.com pnpm run dev -p 3001

# ── Database ──────────────────────────────────────────────
npx prisma db push                         # Sync schema → Neon DB
npx prisma generate                        # Regenerate Prisma client
npx prisma db push && npx prisma generate  # Selalu keduanya setelah schema change
npx prisma studio                          # GUI untuk lihat/edit data DB

# ── Type Check & Build ───────────────────────────────────
npx tsc --noEmit                           # Type check (NO build output)
pnpm run build                             # Production build (harus pass sebelum deploy)
pnpm lint                                  # ESLint check

# ── Tunnel Tools ─────────────────────────────────────────
cloudflared tunnel --url http://localhost:3001   # Cloudflare Tunnel (gratis, cepat)
ngrok http 3001                                  # ngrok (butuh akun)
lt --port 3001                                   # localtunnel (no signup)
```

---

## 🌐 Route Map (Lengkap)

| Route | Auth | Deskripsi |
|---|---|---|
| `/` | ❌ | Landing page marketing |
| `/login` | ❌ | Form login (Better Auth email) |
| `/register` | ❌ | Form register |
| `/dashboard` | ✅ | Daftar workspace user |
| `/dashboard/new-workspace` | ✅ | Buat workspace baru (limit: 2 FREE) |
| `/dashboard/[workspaceSlug]` | ✅ | Daftar project di workspace |
| `/dashboard/[workspaceSlug]/settings` | ✅ | Edit workspace + Brand DNA |
| `/dashboard/[workspaceSlug]/new-project` | ✅ | Buat project baru (limit: 3/ws FREE) |
| `/dashboard/[workspaceSlug]/project/[id]` | ✅ | ⭐ Generator UI utama |
| `/dashboard/[workspaceSlug]/project/[id]/edit` | ✅ | Edit spec + status + danger zone |
| `/settings/api-keys` | ✅ | BYOK API key management |
| `/settings/usage` | ✅ | Usage dashboard (stats, chart 7 hari, logs) |
| `/settings/upgrade` | ✅ | Halaman plan FREE vs PRO + limit bars |
| `/api/auth/[...all]` | — | Better Auth handler |
| `/api/trpc/[trpc]` | — | tRPC handler |

---

## 🤖 tRPC Router Reference

### `trpc.workspace.*`
| Procedure | Type | Deskripsi |
|---|---|---|
| `list` | query | List workspace milik user |
| `getBySlug` | query | Get workspace by slug |
| `create` | mutation | Buat workspace (cek limit plan) |
| `update` | mutation | Edit workspace + Brand DNA |
| `delete` | mutation | Hapus workspace + semua project |

### `trpc.project.*`
| Procedure | Type | Deskripsi |
|---|---|---|
| `list` | query | List project dalam workspace |
| `getById` | query | Get detail project (include all generated content) |
| `create` | mutation | Buat project (cek limit plan) |
| `update` | mutation | Edit spesifikasi produk |
| `updateStatus` | mutation | Ubah status DRAFT/ACTIVE/ARCHIVED |
| `delete` | mutation | Hapus project |

### `trpc.generate.*` (semua protected, cek daily limit, fetch RAG)
| Procedure | Type | Deskripsi |
|---|---|---|
| `titles` | mutation | Generate SEO titles (1–5 variasi) |
| `description` | mutation | Generate deskripsi (short/medium/long) |
| `slides` | mutation | Generate slide copy (3–9 slides) |
| `imagePrompts` | mutation | Generate AI image prompts (1–9) |

### `trpc.apiKey.*`
| Procedure | Type | Deskripsi |
|---|---|---|
| `list` | query | List API keys user |
| `add` | mutation | Tambah key baru (encrypt → Base64) |
| `delete` | mutation | Hapus key |
| `updateStatus` | mutation | Aktif/nonaktifkan key |

### `trpc.usage.*`
| Procedure | Type | Deskripsi |
|---|---|---|
| `summary` | query | Stats total + 7-day activity + byType + byProvider |
| `byProject` | query | Stats per project |
| `contentHistory` | query | Riwayat konten per tipe |
| `clearContent` | mutation | Hapus konten per tipe (atau semua) |

### `trpc.plan.*`
| Procedure | Type | Deskripsi |
|---|---|---|
| `getMyPlan` | query | Plan + semua limit counters |
| `upgradeToPro` | mutation | Set user ke PRO (N hari) |

### `trpc.productContext.*` (RAG)
| Procedure | Type | Deskripsi |
|---|---|---|
| `list` | query | List semua chunks knowledge project |
| `add` | mutation | Tambah knowledge (auto-chunk + store) |
| `delete` | mutation | Hapus satu chunk |
| `clearAll` | mutation | Hapus semua knowledge project |
| `search` | query | Preview relevance scoring per query |

---

## 📦 Component Reference

### `<GeneratorPanel />` (`src/components/generator/GeneratorPanel.tsx`)
Props: `project`, `onSuccess`, `activeTab`, `setActiveTab`
- Kontrol: provider selector, count/length/style config
- Generate button + Hapus Riwayat button (double-confirm)
- Memanggil `trpc.generate.*` dan `trpc.usage.clearContent`

### `<ContentTabs />` (`src/components/generator/ContentTabs.tsx`)
Props: `project`
- Tab: Judul SEO | Deskripsi | Slide | Image Prompts
- Fitur: Platform char-limit bars, SEO score ring, Export panel (copy per variasi), Slide purpose labels

### `<ProductContextPanel />` (`src/components/generator/ProductContextPanel.tsx`)
Props: `projectId`
- Template picker (4 template: Spec Teknis, Supplier, Keunggulan, Target)
- Auto-chunk estimation preview
- Status badge "RAG AKTIF ✓" saat ada knowledge
- Memanggil `trpc.productContext.*`

### `<DashboardSidebar />` (`src/components/layout/DashboardSidebar.tsx`)
Props: `user`
- Nav items: Dashboard, API Keys, Usage, Upgrade
- Workspace list dengan project count
- Plan badge (FREE/PRO) + daily generate progress + link Upgrade

---

## 🔐 Security Rules

1. **Jangan expose `keyHash`** ke client — selalu decrypt di server (`decryptKey()`)
2. **Setiap query DB** di tRPC harus include `workspace: { userId: ctx.userId }` untuk ownership check
3. **Rate limiting** dilakukan via `checkDailyLimit()` per generate mutation
4. **Plan gating** dilakukan server-side — tidak bisa di-bypass dari client
5. **`NEXTAUTH_SECRET`** / Better Auth secret jangan dicommit ke repository
6. **Jangan log** API keys ke console walaupun dalam decrypted form

---

## 🔮 Roadmap & Known TODOs

| Feature | Status | Catatan |
|---|---|---|
| Freemium limits | ✅ Done | Plan expiry cron job belum ada |
| RAG per produk | ✅ Done | Keyword-based, siap upgrade ke pgvector |
| Usage Dashboard | ✅ Done | Token tracking belum (AI SDK belum return usage) |
| Generate History | ✅ Done | Versioning dengan timestamp |
| Bulk Export | 🔜 Planned | Export semua konten ke JSON/CSV |
| Stripe Payment | 🔜 Planned | Webhook → `upgradeToPro()` |
| pgvector Embedding | 🔜 Planned | Upgrade dari keyword ke semantic search |
| Multi-language | 🔜 Planned | English content support |
| Template Library | 🔜 Planned | Preset Brand DNA per kategori produk |
