import Link from "next/link";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#0A0A0F]">
      <Navbar />
      <Hero />
      {/* VoiceForge shortcut */}
      <Link
        href="/tts"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-[#E60012] text-white text-sm font-semibold shadow-lg hover:scale-105 transition-transform pulse-glow"
      >
        🎙️ VoiceForge
      </Link>
    </main>
  );
}
