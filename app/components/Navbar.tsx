"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const links = [
        { href: "/", label: "Home" },
        { href: "/events", label: "Schedule" },
        { href: "/results", label: "Results" },
    ];

    return (
        <>
            {/* Dynamic Island Container */}
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none"
            >
                <div className={`
                    pointer-events-auto
                    flex items-center gap-1 p-1.5 rounded-full 
                    bg-white/90 backdrop-blur-xl border border-black/5 shadow-2xl
                    transition-all duration-500 ease-[0.23,1,0.32,1]
                    ${scrolled ? "scale-90" : "scale-100"}
                `}>

                    {/* Logo Segment */}
                    <Link href="/" className="flex items-center justify-center w-10 h-10 bg-[#1d1d1f] rounded-full text-white group hover:scale-105 transition-transform">
                        <span className="font-black text-xs">K26</span>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center bg-[#F5F5F7] rounded-full px-1 py-1">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="px-5 py-2.5 rounded-full text-sm font-semibold text-gray-500 hover:text-black hover:bg-white hover:shadow-sm transition-all"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Action Button */}
                    <Link
                        href="/admin"
                        className="hidden md:flex items-center justify-center px-6 py-2.5 bg-black text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-colors"
                    >
                        Login
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="md:hidden flex flex-col gap-1.5 p-3 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <div className="w-5 h-0.5 bg-black rounded-full" />
                        <div className="w-5 h-0.5 bg-black rounded-full" />
                    </button>
                </div>
            </motion.div>

            {/* Mobile Full Screen Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed inset-0 z-[60] bg-[#F5F5F7] p-6 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-10">
                            <span className="text-2xl font-black text-[#1d1d1f]">Menu</span>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex flex-col gap-3">
                            {[...links, { href: "/admin", label: "Admin Login" }].map((link, i) => (
                                <motion.div
                                    key={link.href}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Link
                                        href={link.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block p-5 bg-white rounded-2xl text-xl font-bold text-[#1d1d1f] shadow-sm active:scale-95 transition-transform border border-black/5"
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <div className="flex items-center justify-center gap-2 text-gray-400">
                                <span className="text-[10px] font-black uppercase tracking-widest">Kalaravam Arts Fest 2026</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
