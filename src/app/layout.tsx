import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/lib/trpc";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TokoPrompt — AI Content Engine untuk Seller Marketplace",
    template: "%s | TokoPrompt",
  },
  description:
    "Buat judul SEO, deskripsi, slide, dan prompt gambar untuk produk Shopee, Tokopedia, dan TikTok Shop secara otomatis dengan AI.",
  keywords: ["marketplace", "SEO", "AI", "Shopee", "Tokopedia", "TikTok Shop", "UMKM", "seller"],
  authors: [{ name: "PT Koneksi Jaringan Indonesia" }],
  openGraph: {
    title: "TokoPrompt — AI Content Engine untuk Seller Marketplace",
    description: "Buat konten produk marketplace berkualitas tinggi dengan AI dalam hitungan detik.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark" data-scroll-behavior="smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
