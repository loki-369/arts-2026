"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useArts } from '../context/ArtsContext';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';

type Result = {
    id: string;
    teamName: string;
    eventId: string;
    points: number;
    timestamp: any;
};

export default function ResultsPage() {
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(true);
    const { teams } = useArts();

    useEffect(() => {
        const q = query(
            collection(db, "results"),
            orderBy("timestamp", "desc"),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const liveResults: Result[] = [];
            snapshot.forEach((doc) => {
                liveResults.push({ id: doc.id, ...doc.data() } as Result);
            });
            setResults(liveResults);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Helper to get team color
    const getTeamColor = (name: string) => {
        const t = teams.find(team => team.name === name);
        return t?.color || "from-gray-500 to-gray-600";
    };

    return (
        <div className="min-h-screen pb-20">
            <Navbar />
            <div className="max-w-3xl mx-auto p-6 pt-32 space-y-10">
                <header className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black text-black tracking-tighter">Latest Results</h1>
                    <p className="text-gray-500 text-lg font-medium">Real-time score updates from the venue.</p>
                </header>

                <div className="space-y-4 relative">
                    {/* Timeline vertical line */}
                    {results.length > 0 && (
                        <div className="absolute left-8 top-4 bottom-4 w-px bg-gray-100 hidden md:block"></div>
                    )}

                    {loading ? (
                        <div className="text-center py-20 text-gray-300 font-mono text-sm animate-pulse">
                            SYNCING FEED...
                        </div>
                    ) : results.length === 0 ? (
                        <div className="text-center py-20 bento-card text-gray-400">
                            <p className="font-bold">No results published yet.</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {results.map((result) => (
                                <motion.div
                                    key={result.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bento-card p-5 flex items-center justify-between group hover:border-black/10 relative z-10"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-1.5 h-12 rounded-full bg-gradient-to-b ${getTeamColor(result.teamName)}`}></div>
                                        <div>
                                            <h3 className="font-bold text-xl text-gray-900">{result.teamName}</h3>
                                            <p className="text-sm font-medium text-gray-500 mt-0.5">{result.eventId}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-100 group-hover:bg-pink-50 group-hover:border-pink-100 transition-colors">
                                            <span className="block text-2xl font-mono font-bold text-gray-900 group-hover:text-pink-600">
                                                +{result.points}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                <div className="text-center pt-8">
                    <Link href="/" className="text-gray-400 hover:text-black font-medium transition-colors">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
