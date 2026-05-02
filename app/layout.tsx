import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AutoLux — Showroom Xe Hơi Cao Cấp",
  description: "Trải nghiệm mua xe đẳng cấp với công nghệ 3D immersive",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${geist.variable} antialiased`}>
      <body className="min-h-screen bg-[#0A0A0F] text-white">{children}</body>
    </html>
  );
}
