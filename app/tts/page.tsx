"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const LANGUAGES = [
  { code: "vi", label: "🇻🇳 Tiếng Việt" },
  { code: "en", label: "🇬🇧 English" },
  { code: "zh", label: "🇨🇳 中文" },
  { code: "ja", label: "🇯🇵 日本語" },
  { code: "ko", label: "🇰🇷 한국어" },
  { code: "fr", label: "🇫🇷 Français" },
];

export default function TTSPage() {
  const [text, setText] = useState("");
  const [lang, setLang] = useState("vi");
  const [speed, setSpeed] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);

  const login = async () => {
    try {
      const res = await fetch(`${API}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `username=${encodeURIComponent(loginEmail)}&password=${encodeURIComponent(loginPass)}`,
      });
      const data = await res.json();
      if (data.access_token) {
        setToken(data.access_token);
        setLoggedIn(true);
        setError(null);
      } else {
        setError("Sai email hoặc mật khẩu");
      }
    } catch {
      setError("Không kết nối được server");
    }
  };

  const generate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setAudioUrl(null);

    try {
      const params = new URLSearchParams({
        text: text.trim(),
        language: lang,
        speed: speed.toString(),
      });

      const res = await fetch(`${API}/api/v1/generations/quick?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Lỗi ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setTimeout(() => audioRef.current?.play(), 100);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const charCount = text.length;
  const maxChars = 500;

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#E60012] flex items-center justify-center font-black text-sm">VF</div>
            <div>
              <h1 className="font-bold text-lg">VoiceForge AI</h1>
              <p className="text-xs text-white/40">Đăng nhập để sử dụng</p>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E60012]/50"
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E60012]/50"
            />
            {error && <p className="text-[#E60012] text-xs">{error}</p>}
            <button
              onClick={login}
              className="w-full py-3 rounded-xl bg-[#E60012] text-white font-semibold text-sm hover:bg-[#cc0010] transition-colors"
            >
              Đăng nhập
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#E60012] flex items-center justify-center font-black text-xs">VF</div>
          <span className="font-bold text-sm">VoiceForge AI</span>
        </div>
        <button
          onClick={() => { setLoggedIn(false); setToken(""); }}
          className="text-xs text-white/40 hover:text-white transition-colors"
        >
          Đăng xuất
        </button>
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4 max-w-lg mx-auto w-full">

        {/* Language selector */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                lang === l.code
                  ? "bg-[#E60012] text-white"
                  : "glass text-white/60 hover:text-white"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Text input */}
        <div className="relative flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, maxChars))}
            placeholder="Nhập văn bản cần chuyển thành giọng nói..."
            className="w-full h-48 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-white placeholder-white/25 text-sm resize-none focus:outline-none focus:border-[#E60012]/40 leading-relaxed"
          />
          <span className={`absolute bottom-3 right-3 text-xs ${charCount > maxChars * 0.9 ? "text-[#E60012]" : "text-white/30"}`}>
            {charCount}/{maxChars}
          </span>
        </div>

        {/* Speed control */}
        <div className="glass rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-white/60">Tốc độ đọc</span>
            <span className="text-xs font-mono text-[#C9A961]">{speed.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-full accent-[#E60012]"
          />
          <div className="flex justify-between text-[10px] text-white/30 mt-1">
            <span>Chậm 0.5x</span>
            <span>Bình thường 1x</span>
            <span>Nhanh 2x</span>
          </div>
        </div>

        {/* Generate button */}
        <motion.button
          onClick={generate}
          disabled={loading || !text.trim()}
          whileTap={{ scale: 0.97 }}
          className={`w-full py-4 rounded-2xl font-semibold text-base transition-all ${
            loading || !text.trim()
              ? "bg-white/10 text-white/30 cursor-not-allowed"
              : "bg-[#E60012] text-white pulse-glow"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
              Đang tạo âm thanh...
            </span>
          ) : (
            "🎙️ Tạo giọng nói"
          )}
        </motion.button>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-red rounded-xl px-4 py-3 text-sm text-[#E60012]"
            >
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Audio player */}
        <AnimatePresence>
          {audioUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm text-white/70">Audio đã sẵn sàng</span>
              </div>
              <audio
                ref={audioRef}
                src={audioUrl}
                controls
                className="w-full"
                style={{ height: 40 }}
              />
              <a
                href={audioUrl}
                download="voiceforge.wav"
                className="block text-center py-2 rounded-xl border border-[#C9A961]/40 text-[#C9A961] text-sm hover:bg-[#C9A961]/10 transition-colors"
              >
                ⬇️ Tải xuống WAV
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
