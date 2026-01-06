"use client";

import { useArts } from "../context/ArtsContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Leaderboard() {
    const { teams } = useArts();
    const sortedTeams = [...teams].sort((a, b) => b.points - a.points);
    const leader = sortedTeams[0];

    return (
        <section id="leaderboard" className="max-w-7xl mx-auto px-6 py-24">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-[#1d1d1f]">
                        Standings
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                            Live Updates • 2026
                        </span>
                    </div>
                </div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* 🥇 The Leader (Span 8) */}
                <motion.div
                    layout
                    className="md:col-span-8 bg-black text-white rounded-[32px] p-8 md:p-12 relative overflow-hidden group min-h-[400px] flex flex-col justify-between"
                >
                    <div className="relative z-10">
                        <div className="inline-flex px-4 py-1.5 rounded-full border border-white/20 bg-white/10 text-xs font-bold uppercase tracking-widest backdrop-blur-md mb-6">
                            Current Leader
                        </div>
                        <h3 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-4">
                            {leader?.name}
                        </h3>
                    </div>

                    <div className="relative z-10 flex items-end gap-4">
                        <span className="text-9xl font-mono font-bold tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            {leader?.points}
                        </span>
                        <span className="text-xl font-bold text-gray-500 mb-4">PTS</span>
                    </div>

                    {/* Ambient Effect */}
                    <div className={`absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br ${leader?.color || "from-gray-800 to-black"} opacity-30 blur-[100px] rounded-full group-hover:scale-125 transition-transform duration-1000`} />
                </motion.div>

                {/* 🥈 The Runner Up (Span 4) */}
                {sortedTeams[1] && (
                    <motion.div
                        layout
                        className="md:col-span-4 bg-white rounded-[32px] p-8 border border-black/5 shadow-xl shadow-black/5 flex flex-col justify-between relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-6 text-[120px] font-black text-black/5 leading-none">
                            2
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Runner Up</div>
                            <h3 className="text-4xl font-black tracking-tight text-[#1d1d1f]">{sortedTeams[1].name}</h3>
                        </div>
                        <div className="text-7xl font-mono font-bold text-[#1d1d1f] tracking-tighter">
                            {sortedTeams[1].points}
                        </div>
                        <div className={`absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r ${sortedTeams[1].color}`} />
                    </motion.div>
                )}

                {/* The Rest (Span 12 - Grid) */}
                <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sortedTeams.slice(2).map((team, index) => (
                        <motion.div
                            key={team.name}
                            layout
                            whileHover={{ y: -4 }}
                            className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm flex items-center justify-between"
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-gray-400">#{index + 3}</span>
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: team.color.split(' ')[1]?.replace('to-', '') || 'gray' }}></span>
                                </div>
                                <h4 className="font-bold text-lg text-[#1d1d1f]">{team.name}</h4>
                            </div>
                            <div className="text-3xl font-mono font-bold text-[#1d1d1f]">
                                {team.points}
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}
