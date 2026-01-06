"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

export default function Hero() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });

    // Parallax
    const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const rotate = useTransform(scrollYProgress, [0, 1], [-5, 5]);

    return (
        <section ref={containerRef} className="relative flex flex-col items-center justify-center min-h-[95vh] overflow-hidden bg-[#FAFAFA] pt-28 md:pt-20">

            {/* 1. Architectural Grid Background */}
            <div className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(#e5e5e5 1px, transparent 1px), linear-gradient(90deg, #e5e5e5 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}>
            </div>

            {/* 2. Metadata (Visible on Mobile now too, but subtle) */}
            <div className="absolute top-24 left-6 z-10 opacity-50 md:opacity-100">
                <p className="text-[10px] md:text-xs font-mono text-gray-400 rotate-90 origin-left">EST. 2026</p>
            </div>
            <div className="absolute top-24 right-6 z-10 opacity-50 md:opacity-100">
                <p className="text-[10px] md:text-xs font-mono text-gray-400 -rotate-90 origin-right">KERALA</p>
            </div>

            {/* 3. Main Composition */}
            <div className="relative z-10 flex flex-col items-center justify-center w-full">

                {/* Badge: Floating "New" Indicator */}
                <motion.div
                    initial={{ y: -50, opacity: 0, rotate: -5 }}
                    animate={{ y: 0, opacity: 1, rotate: -3 }}
                    className="absolute top-[-30px] right-[5%] md:top-[-40px] md:right-[30%] z-30 bg-yellow-300 text-black px-3 py-1 md:px-4 md:py-2 font-black uppercase tracking-widest text-[10px] md:text-xs shadow-lg transform rotate-3"
                >
                    Official '26
                </motion.div>

                {/* Logo Card - Responsive Sizing */}
                <motion.div
                    style={{ y: y1, rotate: rotate }}
                    initial={{ scale: 0.8, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0, rotate: -6 }}
                    transition={{ duration: 0.8, ease: "backOut" }}
                    className="relative z-20 mb-[-50px] md:mb-[-100px]"
                >
                    {/* Mobile: 240px, Desktop: 420px */}
                    <div className="relative w-[240px] h-[240px] md:w-[420px] md:h-[420px] bg-white p-4 md:p-6 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] border-4 border-white transform hover:scale-105 transition-transform duration-500 rounded-sm">
                        {/* Polaroid/Poster Effect */}
                        <div className="w-full h-full relative border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-multiply"></div>
                            <Image
                                src="/assets/kalaravam-logo.png"
                                alt="Logo"
                                fill
                                className="object-contain p-6 md:p-8 mix-blend-multiply"
                                priority
                            />
                        </div>
                        {/* Tape effect */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 md:w-32 h-6 md:h-8 bg-white/40 backdrop-blur-sm shadow-sm transform -rotate-2"></div>
                    </div>
                </motion.div>

                {/* Massive Typography - Tighter Line Height for Mobile */}
                <div className="relative z-10 flex flex-col items-center mix-blend-darken mt-8 md:mt-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-[20vw] md:text-[14rem] font-black leading-[0.8] tracking-tighter text-[#1d1d1f] select-none"
                    >
                        ARTS
                    </motion.h1>
                    <motion.h1
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-[20vw] md:text-[14rem] font-black leading-[0.8] tracking-tighter text-transparent select-none relative"
                        style={{ WebkitTextStroke: "1px #1d1d1f" }}
                    >
                        FEST
                    </motion.h1>
                </div>

                {/* Bottom CTA - Pulsing on Mobile */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-16 md:mt-4 z-30"
                >
                    <a href="#leaderboard" className="flex items-center gap-3 text-xs md:text-sm font-bold tracking-widest uppercase hover:gap-6 transition-all duration-300 group">
                        <span className="w-8 md:w-12 h-[1px] bg-black group-hover:w-20 transition-all"></span>
                        Scroll for Results
                        <span className="md:hidden animate-bounce text-lg">↓</span>
                    </a>
                </motion.div>

            </div>
        </section>
    );
}
