import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VoiceForge AI",
  description: "Chuyển đổi văn bản thành giọng nói với AI",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VoiceForge",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#E60012",
    "msapplication-TileImage": "/icons/icon-144.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${geist.variable} antialiased`}>
      <body className="min-h-screen bg-[#0A0A0F] text-white">{children}</body>
    </html>
  );
}
