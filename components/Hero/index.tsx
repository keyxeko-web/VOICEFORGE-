"use client";
import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useAnimationControls, type Variants } from "framer-motion";

const CarScene = dynamic(() => import("./CarScene"), { ssr: false });

const stats = [
  { value: "500+", label: "Xe cao cấp" },
  { value: "15+", label: "Năm kinh nghiệm" },
  { value: "10K+", label: "Khách hài lòng" },
];

export default function Hero() {
  const controls = useAnimationControls();

  useEffect(() => {
    controls.start("visible");
  }, [controls]);

  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  return (
    <section className="relative w-full h-screen overflow-hidden flex items-center">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[#0A0A0F]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 60% 50%, rgba(230,0,18,0.07) 0%, transparent 70%), radial-gradient(ellipse 50% 50% at 20% 50%, rgba(201,169,97,0.05) 0%, transparent 60%)",
          }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* 3D Canvas — fills right half on desktop, full background on mobile */}
      <div className="absolute inset-0 md:left-[38%]">
        <CarScene />
      </div>

      {/* Left overlay gradient to blend canvas into bg */}
      <div
        className="absolute inset-y-0 left-0 w-2/3 pointer-events-none hidden md:block"
        style={{
          background:
            "linear-gradient(to right, #0A0A0F 35%, rgba(10,10,15,0.8) 60%, transparent 100%)",
        }}
      />
      {/* Bottom gradient */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: "linear-gradient(to top, #0A0A0F 0%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-16">
        <motion.div
          className="max-w-xl"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-5">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-red text-sm font-medium tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-[#E60012] pulse-glow" />
              Showroom 3D · Công nghệ mới
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl lg:text-7xl font-bold leading-tight tracking-tight"
          >
            Lái xe{" "}
            <span className="text-gradient-red">đẳng cấp</span>
            <br />
            sống cuộc đời{" "}
            <span className="text-gradient-gold">sang trọng</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-5 text-lg text-white/60 leading-relaxed max-w-md"
          >
            Khám phá bộ sưu tập xe hơi cao cấp với trải nghiệm xem 360° độc đáo.
            Tìm chiếc xe hoàn hảo ngay từ màn hình của bạn.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="mt-8 flex flex-wrap gap-4">
            <button className="group relative px-8 py-3.5 rounded-full bg-[#E60012] text-white font-semibold text-base overflow-hidden transition-all duration-300 hover:scale-105 pulse-glow">
              <span className="relative z-10">Xem Showroom 3D</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#E60012] to-[#ff3333] opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button className="px-8 py-3.5 rounded-full glass text-white font-semibold text-base border border-white/20 hover:border-[#C9A961]/60 hover:text-[#C9A961] transition-all duration-300 hover:scale-105">
              Đặt lịch lái thử
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="mt-12 flex gap-8">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col">
                <span className="text-3xl font-bold text-gradient-gold">{s.value}</span>
                <span className="text-sm text-white/40 mt-0.5">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <span className="text-xs text-white/30 tracking-widest uppercase">Cuộn để khám phá</span>
        <motion.div
          className="w-px h-10 bg-gradient-to-b from-[#E60012] to-transparent"
          animate={{ scaleY: [1, 0, 1], originY: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
