@AGENTS.md

# TokoPrompt — Claude-Specific Instructions

> File ini **melengkapi** `AGENTS.md`. Claude membaca keduanya.
> Semua aturan di `AGENTS.md` tetap berlaku penuh. File ini hanya menambahkan konteks perilaku khusus Claude.

---

## 🧠 Cara Claude Harus Bekerja di Repo Ini

### Urutan Kerja yang Benar

1. **Baca `AGENTS.md` penuh** sebelum menulis kode apapun
2. **Identifikasi file yang relevan** — jangan asumsikan struktur, selalu `view_file` dulu
3. **Buat rencana** sebelum menulis kode (khususnya untuk perubahan besar)
4. **Jalankan `npx tsc --noEmit`** setelah setiap perubahan signifikan
5. **Setelah schema change**, selalu usulkan:
   ```bash
   npx prisma db push && npx prisma generate
   ```
6. **Konfirmasi ke user** sebelum menghapus fitur yang sudah berjalan

---

## 💬 Konvensi Bahasa

| Konteks | Bahasa |
|---|---|
| Komentar kode (`// ...`) | **Bahasa Indonesia** |
| Pesan error yang tampil ke user | **Bahasa Indonesia** |
| Nama variabel & fungsi | **English** (camelCase / PascalCase) |
| Nama file & direktori | **English** (kebab-case untuk route, PascalCase untuk komponen) |
| Pesan commit | **English** (imperative: "Add feature", "Fix bug", "Update docs") |
| Teks UI label, placeholder, tooltip | **Bahasa Indonesia** |
| `console.log` debug | Boleh English atau Indonesia |

---

## 🔒 Prioritas Mutlak (Tidak Bisa Dikompromikan)

1. **Keamanan** — Jangan pernah expose secret/key ke client atau log
2. **Tidak merusak fitur yang sudah ada** — Selalu verify dengan tsc sebelum selesai
3. **Build harus lulus** — `exit code 0` wajib sebelum report selesai
4. **Ownership check** — Setiap DB query di tRPC WAJIB filter `userId: ctx.userId`
5. **Plan gating** — Jangan lewati `checkProjectLimit`, `checkDailyLimit`, `checkWorkspaceLimit`

---

## ⚡ Quick Reference: hal yang sering salah

### ❌ Jangan gunakan `db` langsung di router
```typescript
// ❌ SALAH
import { db } from "@/server/db";
const result = await db.project.findMany(...);

// ✅ BENAR (di dalam tRPC procedure)
const result = await ctx.db.project.findMany(...);
```

### ❌ Jangan kirim keyHash ke AI langsung
```typescript
// ❌ SALAH
const model = getModel(provider, apiKeyRecord.keyHash);

// ✅ BENAR
const decodedKey = decryptKey(apiKeyRecord.keyHash);
const model = getModel(provider, decodedKey, apiKeyRecord.baseUrl);
```

### ❌ Jangan lupa RAG saat generate
```typescript
// ❌ SALAH — context tanpa RAG
const context = buildProjectContext(project, project.workspace);

// ✅ BENAR — selalu fetch RAG dulu
const ragQuery = `judul ${project.productName} ${project.mainFeature ?? ""}`;
const ragContext = await getRelevantProductContext(ctx.db, input.projectId, ragQuery);
const context = buildProjectContext(project, project.workspace, ragContext);
```

### ❌ Jangan lupa limit check saat create
```typescript
// ❌ SALAH — project.create tanpa limit
return ctx.db.project.create({ data: input });

// ✅ BENAR
const user = await ctx.db.user.findUnique({ where: { id: ctx.userId }, select: { plan: true } });
await checkProjectLimit(ctx.db, input.workspaceId, ctx.userId, user?.plan ?? "FREE");
return ctx.db.project.create({ data: input });
```

### ❌ Jangan hardcode color hex di JSX
```tsx
// ❌ SALAH
<div style={{ color: "#8b5cf6" }}>

// ✅ BENAR — pakai oklch
<div style={{ color: "oklch(0.72 0.24 270)" }}>
```

---

## 📋 Checklist Sebelum "Done"

Sebelum bilang pekerjaan selesai, pastikan:

- [ ] `npx tsc --noEmit` → exit code 0
- [ ] Tidak ada import yang hilang atau circular
- [ ] Jika schema berubah: `npx prisma db push && npx prisma generate` sudah dijalankan
- [ ] Setiap generate mutation punya: `checkDailyLimit` + `getRelevantProductContext` + `buildProjectContext`
- [ ] Setiap create mutation punya limit check sesuai tipe (workspace/project)
- [ ] Setiap DB query di tRPC include ownership filter (`userId: ctx.userId`)
- [ ] Error message ke user dalam Bahasa Indonesia
- [ ] CSS pakai oklch, bukan hex/hsl
- [ ] Tidak ada fitur lama yang terhapus secara tidak disengaja

---

## 🔮 Konteks Khusus untuk Sesi Berikutnya

### Yang Sudah Ada dan Berjalan
- Freemium system (FREE: 2ws/3proj/15gen, PRO: unlimited)
- RAG Knowledge Base per project (keyword-based BM25-lite)
- Usage Dashboard dengan chart 7 hari
- Generate History + Clear History
- Edit Project (spec + status + danger zone delete)
- Upgrade Page (FREE vs PRO comparison)
- Plan badge di sidebar dengan generate counter harian

### Yang Belum Ada (Next Steps)
1. **Stripe Payment Webhook** → harus panggil `trpc.plan.upgradeToPro`
2. **Plan Expiry Cron Job** → cek `planExpiresAt`, downgrade ke FREE jika expired
3. **Bulk Export** → export semua konten ke JSON/CSV per workspace
4. **pgvector Semantic Search** → upgrade RAG dari keyword ke embedding
5. **Token Tracking** → Vercel AI SDK `usage` field belum di-capture ke UsageLog
6. **Multi-language Support** → generate konten dalam English

### Cara Akses DB Langsung (Prisma Studio)
```bash
cd /home/dev/project/tokoprompt
npx prisma studio
# buka browser di http://localhost:5555
```

### Environment
- App berjalan di `localhost:3001`
- Database: Neon PostgreSQL (connection string di `.env`)
- Dev server: `pnpm run dev -p 3001`
- Tunnel aktif: `TUNNEL_URL=https://... pnpm run dev -p 3001`
