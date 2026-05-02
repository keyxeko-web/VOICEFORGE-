"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LANGUAGES = [
  { code: "vi-VN", label: "🇻🇳 Tiếng Việt" },
  { code: "en-US", label: "🇬🇧 English" },
  { code: "zh-CN", label: "🇨🇳 中文" },
  { code: "ja-JP", label: "🇯🇵 日本語" },
  { code: "ko-KR", label: "🇰🇷 한국어" },
  { code: "fr-FR", label: "🇫🇷 Français" },
  { code: "de-DE", label: "🇩🇪 Deutsch" },
  { code: "es-ES", label: "🇪🇸 Español" },
];

const SAMPLES: Record<string, string> = {
  "vi-VN": "Xin chào! Tôi là VoiceForge AI, ứng dụng chuyển văn bản thành giọng nói miễn phí.",
  "en-US": "Hello! I am VoiceForge AI, a free text-to-speech application powered by your browser.",
  "zh-CN": "你好！我是VoiceForge AI，一个免费的文字转语音应用程序。",
  "ja-JP": "こんにちは！私はVoiceForge AIです。無料のテキスト読み上げアプリです。",
  "ko-KR": "안녕하세요! 저는 VoiceForge AI입니다. 무료 텍스트 음성 변환 앱입니다.",
  "fr-FR": "Bonjour ! Je suis VoiceForge AI, une application de synthèse vocale gratuite.",
  "de-DE": "Hallo! Ich bin VoiceForge AI, eine kostenlose Text-zu-Sprache-Anwendung.",
  "es-ES": "¡Hola! Soy VoiceForge AI, una aplicación gratuita de texto a voz.",
};

export default function TTSPage() {
  const [text, setText] = useState("");
  const [lang, setLang] = useState("vi-VN");
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [supported, setSupported] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  const maxChars = 1000;

  // Load voices
  const loadVoices = useCallback(() => {
    if (!window.speechSynthesis) return;
    const all = window.speechSynthesis.getVoices();
    setVoices(all);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.speechSynthesis) { setSupported(false); return; }
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, [loadVoices]);

  // Auto-select best voice for language
  useEffect(() => {
    const matching = voices.filter((v) => v.lang.startsWith(lang.split("-")[0]));
    if (matching.length > 0) {
      const preferred = matching.find((v) => v.lang === lang) || matching[0];
      setSelectedVoice(preferred);
    } else {
      setSelectedVoice(null);
    }
  }, [lang, voices]);

  const speak = () => {
    if (!text.trim() || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text.trim());
    utter.lang = lang;
    utter.rate = speed;
    utter.pitch = pitch;
    if (selectedVoice) utter.voice = selectedVoice;

    utter.onstart = () => { setSpeaking(true); setPaused(false); };
    utter.onend = () => { setSpeaking(false); setPaused(false); };
    utter.onerror = () => { setSpeaking(false); setPaused(false); };

    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
  };

  const togglePause = () => {
    if (!window.speechSynthesis) return;
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  };

  const stop = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setPaused(false);
  };

  const langVoices = voices.filter((v) => v.lang.startsWith(lang.split("-")[0]));

  if (!supported) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-4xl mb-4">😔</p>
          <p className="text-white/70">Trình duyệt của bạn không hỗ trợ Text-to-Speech.</p>
          <p className="text-white/40 text-sm mt-2">Vui lòng dùng Chrome trên Android.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06] safe-top">
        <div className="w-9 h-9 rounded-xl bg-[#E60012] flex items-center justify-center font-black text-sm">VF</div>
        <div>
          <h1 className="font-bold text-base leading-tight">VoiceForge AI</h1>
          <p className="text-[11px] text-white/40">Chuyển văn bản thành giọng nói</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[11px] text-white/40">Sẵn sàng</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col gap-4 p-4 max-w-lg mx-auto w-full pb-8">

        {/* Language tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {LANGUAGES.map((l) => (
            <button key={l.code} onClick={() => { setLang(l.code); stop(); }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                lang === l.code ? "bg-[#E60012] text-white shadow-lg shadow-red-900/30"
                  : "bg-white/[0.05] text-white/50 hover:text-white"
              }`}>
              {l.label}
            </button>
          ))}
        </div>

        {/* Voice selector (if multiple voices available) */}
        {langVoices.length > 1 && (
          <select
            value={selectedVoice?.name || ""}
            onChange={(e) => {
              const v = voices.find((v) => v.name === e.target.value);
              setSelectedVoice(v || null);
            }}
            className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none"
          >
            {langVoices.map((v) => (
              <option key={v.name} value={v.name}>{v.name} {v.localService ? "🔵" : "☁️"}</option>
            ))}
          </select>
        )}

        {/* Textarea */}
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, maxChars))}
            placeholder="Nhập văn bản cần đọc..."
            rows={7}
            className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-white placeholder-white/20 text-sm resize-none focus:outline-none focus:border-[#E60012]/40 leading-relaxed transition-colors"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <span className={`text-[11px] ${text.length > maxChars * 0.9 ? "text-[#E60012]" : "text-white/25"}`}>
              {text.length}/{maxChars}
            </span>
            {text && <button onClick={() => { setText(""); stop(); }} className="text-white/25 hover:text-white/60 text-xs">✕</button>}
          </div>
        </div>

        {/* Sample */}
        <button onClick={() => setText(SAMPLES[lang] || SAMPLES["en-US"])}
          className="self-start text-xs text-[#C9A961]/70 hover:text-[#C9A961] transition-colors">
          ✨ Văn bản mẫu
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
              <span className="text-[11px] font-mono text-[#C9A961]">{pitch.toFixed(1)}</span>
            </div>
            <input type="range" min="0" max="2" step="0.1" value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full accent-[#E60012] h-1" />
            <div className="flex justify-between text-[10px] text-white/20 mt-1">
              <span>Trầm</span><span>Cao</span>
            </div>
          </div>
        </div>

        {/* Play / Pause / Stop buttons */}
        {!speaking ? (
          <motion.button onClick={speak} disabled={!text.trim()} whileTap={{ scale: 0.97 }}
            className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
              !text.trim() ? "bg-white/[0.06] text-white/30 cursor-not-allowed"
                : "bg-[#E60012] text-white shadow-lg shadow-red-900/40"
            }`}>
            🎙️ Đọc ngay
          </motion.button>
        ) : (
          <div className="flex gap-3">
            <motion.button onClick={togglePause} whileTap={{ scale: 0.96 }}
              className="flex-1 py-4 rounded-2xl font-bold text-base bg-[#C9A961] text-black">
              {paused ? "▶️ Tiếp tục" : "⏸ Tạm dừng"}
            </motion.button>
            <motion.button onClick={stop} whileTap={{ scale: 0.96 }}
              className="px-6 py-4 rounded-2xl font-bold text-base bg-white/[0.08] text-white">
              ⏹ Dừng
            </motion.button>
          </div>
        )}

        {/* Speaking wave animation */}
        <AnimatePresence>
          {speaking && !paused && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-1 py-2">
              {[...Array(5)].map((_, i) => (
                <motion.div key={i} className="w-1 rounded-full bg-[#E60012]"
                  animate={{ height: ["8px", "24px", "8px"] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }} />
              ))}
              <span className="ml-3 text-xs text-white/40">Đang đọc...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info note */}
        <p className="text-center text-[11px] text-white/25 mt-2">
          Sử dụng giọng đọc tích hợp của trình duyệt · Không cần internet
        </p>
      </div>
    </div>
  );
}
