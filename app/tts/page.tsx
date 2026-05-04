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

// lang = BCP-47 tag passed to Web Speech API; pitchDelta adjusts pitch for playback
const VI_VOICES = [
  { id: "vi",         label: "Bắc",    speechLang: "vi-VN",           pitchDelta: 0 },
  { id: "vi-central", label: "Trung",  speechLang: "vi-VN-x-central", pitchDelta: 0 },
  { id: "vi-south",   label: "Nam bộ", speechLang: "vi-VN-x-south",   pitchDelta: 0 },
  { id: "vi+m1",      label: "Nam 1",  speechLang: "vi-VN",           pitchDelta: -0.3 },
  { id: "vi+m2",      label: "Nam 2",  speechLang: "vi-VN",           pitchDelta: -0.5 },
  { id: "vi+f1",      label: "Nữ 1",   speechLang: "vi-VN",           pitchDelta: 0.3 },
  { id: "vi+f2",      label: "Nữ 2",   speechLang: "vi-VN",           pitchDelta: 0.5 },
];

const STYLE_PRESETS = [
  { id: "normal",   label: "Bình thường", speed: 1.0, pitch: 1.0 },
  { id: "cheerful", label: "Vui tươi",    speed: 1.15, pitch: 1.3 },
  { id: "gentle",   label: "Nhẹ nhàng",  speed: 0.85, pitch: 1.1 },
  { id: "firm",     label: "Mạnh mẽ",    speed: 1.1,  pitch: 0.8 },
  { id: "fast",     label: "Nhanh",       speed: 1.5,  pitch: 1.0 },
  { id: "slow",     label: "Chậm",        speed: 0.7,  pitch: 0.95 },
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
  const [viVoice, setViVoice] = useState("vi");
  const [activePreset, setActivePreset] = useState("normal");
  const [downloading, setDownloading] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState("");
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  const maxChars = 1000;
  const isVietnamese = lang === "vi-VN";

  const loadVoices = useCallback(() => {
    if (!window.speechSynthesis) return;
    setVoices(window.speechSynthesis.getVoices());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.speechSynthesis) { setSupported(false); return; }
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, [loadVoices]);

  useEffect(() => {
    const matching = voices.filter((v) => v.lang.startsWith(lang.split("-")[0]));
    if (matching.length > 0) {
      setSelectedVoice(matching.find((v) => v.lang === lang) ?? matching[0]);
    } else {
      setSelectedVoice(null);
    }
  }, [lang, voices]);

  const applyPreset = (preset: typeof STYLE_PRESETS[number]) => {
    setSpeed(preset.speed);
    setPitch(preset.pitch);
    setActivePreset(preset.id);
  };

  const speak = () => {
    if (!text.trim() || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text.trim());

    if (isVietnamese) {
      const viConf = VI_VOICES.find((v) => v.id === viVoice) ?? VI_VOICES[0];
      utter.lang = viConf.speechLang;
      utter.pitch = Math.max(0, Math.min(2, pitch + viConf.pitchDelta));
      // pick a matching voice if available, else let the engine choose
      const match = voices.find((v) => v.lang === viConf.speechLang)
        ?? voices.find((v) => v.lang.startsWith("vi"));
      if (match) utter.voice = match;
    } else {
      utter.lang = lang;
      utter.pitch = pitch;
      if (selectedVoice) utter.voice = selectedVoice;
    }
    utter.rate = speed;
    utter.onstart = () => { setSpeaking(true); setPaused(false); };
    utter.onend = () => { setSpeaking(false); setPaused(false); };
    utter.onerror = () => { setSpeaking(false); setPaused(false); };
    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
  };

  const togglePause = () => {
    if (!window.speechSynthesis) return;
    if (paused) { window.speechSynthesis.resume(); setPaused(false); }
    else { window.speechSynthesis.pause(); setPaused(true); }
  };

  const stop = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setPaused(false);
  };

  const downloadAudio = async () => {
    if (!text.trim()) return;
    setDownloading(true);
    setDownloadMsg("");

    // 1. Try local API route (works when running next dev / next start)
    try {
      const langCode = lang.split("-")[0];
      const voice = isVietnamese ? viVoice : langCode;
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), voice, speed, pitch }),
        signal: AbortSignal.timeout(12000),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "voiceforge.mp3";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setDownloadMsg("✅ Đã tải xuống!");
        setDownloading(false);
        setTimeout(() => setDownloadMsg(""), 4000);
        return;
      }
    } catch {
      // fall through to Google TTS fallback
    }

    // 2. Fallback: open Google Translate TTS URL (browser handles download/playback)
    const trimmed = text.trim();
    if (trimmed.length > 200) {
      setDownloadMsg("⚠️ Rút gọn còn ≤200 ký tự để tải, hoặc chạy app cục bộ");
      setDownloading(false);
      setTimeout(() => setDownloadMsg(""), 5000);
      return;
    }
    const langCode = lang.split("-")[0];
    const ttsUrl = new URL("https://translate.google.com/translate_tts");
    ttsUrl.searchParams.set("ie", "UTF-8");
    ttsUrl.searchParams.set("q", trimmed);
    ttsUrl.searchParams.set("tl", langCode);
    ttsUrl.searchParams.set("client", "tw-ob");
    ttsUrl.searchParams.set("ttsspeed", String(Math.min(speed, 1.5)));
    window.open(ttsUrl.toString(), "_blank");
    setDownloadMsg("✅ Đang mở — nhấn tải xuống trong trình duyệt");
    setDownloading(false);
    setTimeout(() => setDownloadMsg(""), 5000);
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
                lang === l.code
                  ? "bg-[#E60012] text-white shadow-lg shadow-red-900/30"
                  : "bg-white/[0.05] text-white/50 hover:text-white"
              }`}>
              {l.label}
            </button>
          ))}
        </div>

        {/* Vietnamese voice variants */}
        {isVietnamese && (
          <div>
            <p className="text-[11px] text-white/40 mb-2">Giọng đọc</p>
            <div className="flex gap-2 flex-wrap">
              {VI_VOICES.map((v) => (
                <button key={v.id} onClick={() => setViVoice(v.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    viVoice === v.id
                      ? "bg-[#C9A961] text-black"
                      : "bg-white/[0.05] text-white/50 hover:text-white"
                  }`}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Non-Vietnamese Web Speech voice selector */}
        {!isVietnamese && langVoices.length > 1 && (
          <select
            value={selectedVoice?.name ?? ""}
            onChange={(e) => setSelectedVoice(voices.find((v) => v.name === e.target.value) ?? null)}
            className="w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs focus:outline-none">
            {langVoices.map((v) => (
              <option key={v.name} value={v.name}>{v.name} {v.localService ? "🔵" : "☁️"}</option>
            ))}
          </select>
        )}

        {/* Style presets */}
        <div>
          <p className="text-[11px] text-white/40 mb-2">Phong cách giọng</p>
          <div className="flex gap-2 flex-wrap">
            {STYLE_PRESETS.map((p) => (
              <button key={p.id} onClick={() => applyPreset(p)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activePreset === p.id
                    ? "bg-white/20 text-white ring-1 ring-white/30"
                    : "bg-white/[0.05] text-white/50 hover:text-white"
                }`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

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
        <button onClick={() => setText(SAMPLES[lang] ?? SAMPLES["en-US"])}
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
              onChange={(e) => { setSpeed(parseFloat(e.target.value)); setActivePreset(""); }}
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
              onChange={(e) => { setPitch(parseFloat(e.target.value)); setActivePreset(""); }}
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
              !text.trim()
                ? "bg-white/[0.06] text-white/30 cursor-not-allowed"
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

        {/* Download button */}
        <motion.button
          onClick={downloadAudio}
          disabled={!text.trim() || downloading}
          whileTap={{ scale: 0.97 }}
          className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
            !text.trim() || downloading
              ? "bg-white/[0.04] text-white/25 cursor-not-allowed"
              : "bg-white/[0.08] text-white/80 hover:bg-white/[0.12] border border-white/10"
          }`}>
          {downloading
            ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full" /> Đang tạo...</>
            : "⬇️ Tải MP3"}
        </motion.button>

        {/* Download status message */}
        <AnimatePresence>
          {downloadMsg && (
            <motion.p
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-center text-xs text-white/50">
              {downloadMsg}
            </motion.p>
          )}
        </AnimatePresence>

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
          Phát giọng qua trình duyệt · Tải MP3 qua Google TTS (≤200 ký tự)
        </p>
      </div>
    </div>
  );
}
