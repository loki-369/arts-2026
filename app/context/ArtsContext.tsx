"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import {
    collection,
    onSnapshot,
    doc,
    runTransaction,
    query,
    orderBy,
    addDoc,
    serverTimestamp,
    setDoc,
    getDocs
} from "firebase/firestore";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    User
} from "firebase/auth";

const INITIAL_TEAMS = [
    { name: "Ruby", color: "from-red-500 to-pink-500", points: 0 },
    { name: "Emerald", color: "from-green-400 to-emerald-600", points: 0 },
    { name: "Sapphire", color: "from-blue-400 to-indigo-600", points: 0 },
    { name: "Topaz", color: "from-yellow-400 to-orange-500", points: 0 },
];

export type Team = {
    name: string;
    color: string;
    points: number;
};

type ArtsContextType = {
    teams: Team[];
    user: User | null;
    login: (email: string, pin: string) => Promise<void>;
    logout: () => Promise<void>;
    updatePoints: (teamName: string, pointsToAdd: number, eventId: string) => Promise<void>;
    resetPoints: () => Promise<void>;
    loading: boolean;
};

const ArtsContext = createContext<ArtsContextType | undefined>(undefined);

export function ArtsProvider({ children }: { children: React.ReactNode }) {
    const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Auth Subscription
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Firestore Leaderboard Subscription
    useEffect(() => {
        const q = query(collection(db, "leaderboard"), orderBy("points", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (snapshot.empty) {
                // Return initial teams with 0 points if db is empty so UI isn't blank
                const merged = INITIAL_TEAMS.map(t => ({ ...t, points: 0 }));
                setTeams(merged);
            } else {
                const liveTeams: Team[] = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    // Match color from static config if not in DB
                    const staticData = INITIAL_TEAMS.find(t => t.name === data.teamName);
                    liveTeams.push({
                        name: data.teamName,
                        points: data.points,
                        color: staticData?.color || "from-gray-500 to-gray-700"
                    });
                });
                setTeams(liveTeams);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, pin: string) => {
        await signInWithEmailAndPassword(auth, email, pin);
    };

    const logout = async () => {
        await signOut(auth);
    };

    const updatePoints = async (teamName: string, pointsToAdd: number, eventId: string) => {
        if (!user) throw new Error("Unauthorized");

        try {
            await runTransaction(db, async (transaction) => {
                // 1. Reference to Leaderboard Doc
                const teamRef = doc(db, "leaderboard", teamName);
                const teamDoc = await transaction.get(teamRef);

                // 2. Add to Results Collection
                const newResultRef = doc(collection(db, "results"));
                transaction.set(newResultRef, {
                    eventId,
                    teamName,
                    points: pointsToAdd,
                    timestamp: serverTimestamp(),
                    addedBy: user.uid
                });

                // 3. Update Leaderboard
                if (!teamDoc.exists()) {
                    transaction.set(teamRef, { teamName, points: pointsToAdd });
                } else {
                    const newTotal = (teamDoc.data().points || 0) + pointsToAdd;
                    transaction.update(teamRef, { points: newTotal });
                }
            });
        } catch (error) {
            console.error("Transaction failed: ", error);
            throw error;
        }
    };

    const resetPoints = async () => {
        if (!user) return;

        const lbSnapshot = await getDocs(collection(db, "leaderboard"));
        for (const d of lbSnapshot.docs) {
            await setDoc(doc(db, "leaderboard", d.id), { teamName: d.id, points: 0 });
        }
    };

    return (
        <ArtsContext.Provider value={{ teams, user, login, logout, updatePoints, resetPoints, loading }}>
            {children}
        </ArtsContext.Provider>
    );
}

export function useArts() {
    const context = useContext(ArtsContext);
    if (context === undefined) {
        throw new Error("useArts must be used within an ArtsProvider");
    }
    return context;
}
