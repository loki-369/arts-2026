"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";

export default function SchedulePoster() {
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, "settings", "schedule"), (doc) => {
            if (doc.exists() && doc.data().imageUrl) {
                setImageUrl(doc.data().imageUrl);
            }
        });
        return () => unsub();
    }, []);

    if (!imageUrl) return null;

    return (
        <section className="max-w-4xl mx-auto p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl p-2 shadow-sm border border-gray-100"
            >
                <div className="bg-[#1d1d1f] rounded-2xl p-4 mb-2 text-center">
                    <h2 className="text-white font-bold uppercase tracking-widest text-sm">Official Schedule</h2>
                </div>
                <img
                    src={imageUrl}
                    alt="Event Schedule"
                    className="w-full h-auto rounded-xl object-cover"
                />
            </motion.div>
        </section>
    );
}
