import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/server/db";

// Build dynamic trusted origins list.
// To add a tunnel: set TUNNEL_URL=https://xxx.trycloudflare.com before running pnpm dev.
// Example: TUNNEL_URL=https://abc.trycloudflare.com pnpm dev
function buildTrustedOrigins(): string[] {
  const origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
  ];

  if (process.env.NEXT_PUBLIC_APP_URL) {
    origins.push(process.env.NEXT_PUBLIC_APP_URL);
  }

  // Optional: set TUNNEL_URL when using ngrok/cloudflare without editing .env
  if (process.env.TUNNEL_URL) {
    origins.push(process.env.TUNNEL_URL);
  }

  return origins;
}

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
  },
  trustedOrigins: buildTrustedOrigins(),
});

export type Auth = typeof auth;
