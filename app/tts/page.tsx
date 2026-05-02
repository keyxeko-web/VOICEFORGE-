"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const LANGUAGES = [
  { code: "vi", label: "🇻🇳 Tiếng Việt" },
  { code: "en", label: "🇬🇧 English" },
  { code: "zh", label: "🇨🇳 中文" },
  { code: "ja", label: "🇯🇵 日本語" },
  { code: "ko", label: "🇰🇷 한국어" },
  { code: "fr", label: "🇫🇷 Français" },
  { code: "de", label: "🇩🇪 Deutsch" },
  { code: "es", label: "🇪🇸 Español" },
];

const SAMPLES = [
  { vi: "Xin chào! VoiceForge AI sẵn sàng phục vụ bạn.", en: "Hello! VoiceForge AI is ready to serve you." },
  { vi: "Hôm nay thời tiết rất đẹp, bạn có muốn đi dạo không?", en: "The weather is beautiful today, would you like to go for a walk?" },
  { vi: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.", en: "Thank you for using our service." },
];

export default function TTSPage() {
  const [text, setText] = useState("");
  const [lang, setLang] = useState("vi");
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0.0);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ text: string; url: string; lang: string }[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const maxChars = 500;

  const generate = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        text: text.trim(),
        language: lang,
        speed: speed.toString(),
        pitch: pitch.toString(),
      });

      const res = await fetch(`${API}/api/v1/public/tts?${params}`, {
        method: "POST",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Lỗi ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      // Revoke previous URL
      if (audioUrl) URL.revokeObjectURL(audioUrl);

      setAudioUrl(url);
      setHistory((h) => [{ text: text.trim().slice(0, 60), url, lang }, ...h.slice(0, 4)]);
      setTimeout(() => audioRef.current?.play(), 150);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra, thử lại nhé");
    } finally {
      setLoading(false);
    }
  };

  const useSample = () => {
    const s = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    setText(lang === "vi" ? s.vi : s.en);
    textareaRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl bg-[#E60012] flex items-center justify-center font-black text-sm tracking-tight">
          VF
        </div>
        <div>
          <h1 className="font-bold text-base leading-tight">VoiceForge AI</h1>
          <p className="text-[11px] text-white/40">Chuyển văn bản thành giọng nói</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[11px] text-white/40">Online</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col gap-4 p-4 max-w-lg mx-auto w-full pb-8">

        {/* Language tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                lang === l.code
                  ? "bg-[#E60012] text-white shadow-lg shadow-red-900/30"
                  : "bg-white/[0.05] text-white/50 hover:text-white hover:bg-white/10"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, maxChars))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) generate();
            }}
            placeholder="Nhập văn bản cần đọc..."
            rows={6}
            className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-white placeholder-white/20 text-sm resize-none focus:outline-none focus:border-[#E60012]/40 leading-relaxed transition-colors"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span className={`text-[11px] ${text.length > maxChars * 0.9 ? "text-[#E60012]" : "text-white/25"}`}>
              {text.length}/{maxChars}
            </span>
            {text && (
              <button onClick={() => setText("")} className="text-white/25 hover:text-white/60 text-xs transition-colors">
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Sample text button */}
        <button
          onClick={useSample}
          className="self-start text-xs text-[#C9A961]/70 hover:text-[#C9A961] transition-colors flex items-center gap-1"
        >
          ✨ Dùng văn bản mẫu
        </button>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/[0.03] rounded-xl p-3">
            <div className="flex justify-between mb-2">
              <span className="text-[11px] text-white/50">Tốc độ</span>
              <span className="text-[11px] font-mono text-[#C9A961]">{speed.toFixed(1)}x</span>
            </div>
            <input type="range" min="0.5" max="2" step="0.1" value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-[#E60012] h-1" />
            <div className="flex justify-between text-[10px] text-white/20 mt-1">
              <span>Chậm</span><span>Nhanh</span>
            </div>
          </div>
          <div className="bg-white/[0.03] rounded-xl p-3">
            <div className="flex justify-between mb-2">
              <span className="text-[11px] text-white/50">Cao độ</span>
              <span className="text-[11px] font-mono text-[#C9A961]">{pitch >= 0 ? "+" : ""}{pitch.toFixed(1)}</span>
            </div>
            <input type="range" min="-1" max="1" step="0.1" value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full accent-[#E60012] h-1" />
            <div className="flex justify-between text-[10px] text-white/20 mt-1">
              <span>Trầm</span><span>Cao</span>
            </div>
          </div>
        </div>

        {/* Generate button */}
        <motion.button
          onClick={generate}
          disabled={loading || !text.trim()}
          whileTap={{ scale: 0.97 }}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-200 ${
            loading || !text.trim()
              ? "bg-white/[0.06] text-white/30 cursor-not-allowed"
              : "bg-[#E60012] text-white shadow-lg shadow-red-900/40 hover:bg-[#cc0010]"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              Đang tạo...
            </span>
          ) : (
            "🎙️ Tạo giọng nói  ·  Ctrl+Enter"
          )}
        </motion.button>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-xl px-4 py-3 bg-red-950/40 border border-red-800/40 text-sm text-red-400">
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Audio player */}
        <AnimatePresence>
          {audioUrl && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-sm font-medium">Âm thanh đã sẵn sàng</span>
                </div>
              </div>
              <audio ref={audioRef} src={audioUrl} controls className="w-full" style={{ height: 36 }} />
              <a href={audioUrl} download="voiceforge.wav"
                className="flex items-center justify-center gap-2 py-2 rounded-xl border border-[#C9A961]/30 text-[#C9A961] text-sm hover:bg-[#C9A961]/10 transition-colors">
                ⬇️ Tải xuống WAV
              </a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        {history.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-white/30 uppercase tracking-wider">Lịch sử</p>
            {history.map((h, i) => (
              <button key={i} onClick={() => {
                if (audioRef.current) { audioRef.current.src = h.url; audioRef.current.play(); }
                setAudioUrl(h.url);
              }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors text-left">
                <span className="text-base">🔊</span>
                <span className="text-xs text-white/50 truncate flex-1">{h.text}</span>
                <span className="text-[10px] text-white/25 flex-shrink-0">{h.lang.toUpperCase()}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
