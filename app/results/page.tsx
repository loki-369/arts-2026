"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useArts } from '../context/ArtsContext';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';

type Winner = {
    teamName: string;
    position: 1 | 2 | 3;
};

type Result = {
    id: string;
    eventName: string;
    winners: Winner[];
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

    return (
        <div className="min-h-screen pb-20 bg-gray-50">
            <Navbar />
            <div className="max-w-5xl mx-auto p-4 pt-32 space-y-10">
                <header className="text-center space-y-2 mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase">Notice Board</h1>
                    <p className="text-gray-500 font-medium">Official Results • Kalaravam 2026</p>
                </header>

                {loading ? (
                    <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div></div>
                ) : results.length === 0 ? (
                    <div className="text-center p-20 bg-white rounded-3xl border border-dashed border-gray-300">
                        <p className="text-gray-400 font-bold">No results published yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {results.map((result, i) => (
                                <motion.div
                                    key={result.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                                >
                                    <div className="bg-[#1d1d1f] p-4">
                                        <h3 className="text-white font-bold text-center uppercase tracking-wider text-sm">
                                            {result.eventName}
                                        </h3>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col gap-4">
                                        {[1, 2, 3].map((pos) => {
                                            const winner = result.winners?.find(w => w.position === pos);
                                            return (
                                                <div key={pos} className="flex items-center gap-4">
                                                    <div className={`
                                                        w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                                                        ${pos === 1 ? 'bg-yellow-100 text-yellow-700' :
                                                            pos === 2 ? 'bg-gray-100 text-gray-600' :
                                                                'bg-orange-50 text-orange-700'}
                                                    `}>
                                                        {pos === 1 ? '1' : pos === 2 ? '2' : '3'}
                                                    </div>
                                                    {winner ? (
                                                        <span className="font-bold text-gray-800 text-lg">{winner.teamName}</span>
                                                    ) : (
                                                        <span className="text-gray-300 italic text-sm">Not Awarded</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 font-mono text-center uppercase">
                                        Published {result.timestamp?.toDate().toLocaleTimeString()}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
