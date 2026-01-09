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
    getDocs,
    deleteDoc
} from "firebase/firestore";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    User
} from "firebase/auth";

const INITIAL_TEAMS = [
    { name: "Zoology", color: "from-green-500 to-teal-500", points: 0 },
    { name: "Botany", color: "from-green-400 to-emerald-600", points: 0 },
    { name: "Psychology", color: "from-purple-500 to-indigo-500", points: 0 },
    { name: "B.Com CA", color: "from-blue-500 to-cyan-500", points: 0 },
    { name: "English", color: "from-red-400 to-pink-500", points: 0 },
    { name: "B.Com Finance", color: "from-yellow-500 to-orange-500", points: 0 },
    { name: "Physics", color: "from-indigo-500 to-violet-500", points: 0 },
    { name: "Chemistry", color: "from-cyan-500 to-blue-600", points: 0 },
    { name: "Computer Application", color: "from-gray-700 to-gray-900", points: 0 },
    { name: "Retail Management", color: "from-rose-500 to-red-600", points: 0 },
    { name: "B.Com Self", color: "from-orange-400 to-amber-500", points: 0 },
    { name: "Optometry", color: "from-teal-400 to-cyan-600", points: 0 },
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
    publishBatchResult: (eventName: string, winners: { teamName: string; winnerName: string; position: 1 | 2 | 3 }[], itemType: 'individual' | 'group') => Promise<void>;
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

    const publishBatchResult = async (eventName: string, winners: { teamName: string; winnerName: string; position: 1 | 2 | 3 }[], itemType: 'individual' | 'group') => {
        if (!user) throw new Error("Unauthorized");

        // Define Points Scheme
        const POINTS_SCHEME = {
            'group': { 1: 10, 2: 5, 3: 3 },
            'individual': { 1: 5, 2: 3, 3: 2 }
        };

        try {
            await runTransaction(db, async (transaction) => {
                // 1. PRE-READ: Get all team docs first (Reads must be before Writes)
                const teamReads = await Promise.all(winners.map(async (winner) => {
                    const teamRef = doc(db, "leaderboard", winner.teamName);
                    const teamDoc = await transaction.get(teamRef);
                    return { winner, teamRef, teamDoc };
                }));

                // 2. WRITE: Create Result Doc
                const newResultRef = doc(collection(db, "results"));
                transaction.set(newResultRef, {
                    eventName,
                    itemType,
                    winners,
                    timestamp: serverTimestamp(),
                    addedBy: user.uid
                });

                // 3. AGGREGATE: Calculate total points per team to avoid overwrite issues
                const updates = new Map<string, number>();

                winners.forEach(w => {
                    const p = POINTS_SCHEME[itemType][w.position];
                    const current = updates.get(w.teamName) || 0;
                    updates.set(w.teamName, current + p);
                });

                // 4. WRITE: Update Leaderboard for each UNIQUE team
                updates.forEach((pointsToAdd, teamName) => {
                    // Find the pre-read doc
                    const readData = teamReads.find(r => r.winner.teamName === teamName);

                    if (readData) {
                        const { teamRef, teamDoc } = readData;
                        if (!teamDoc.exists()) {
                            transaction.set(teamRef, { teamName, points: pointsToAdd });
                        } else {
                            const newTotal = (teamDoc.data().points || 0) + pointsToAdd;
                            transaction.update(teamRef, { points: newTotal });
                        }
                    }
                });
            });
        } catch (error) {
            console.error("Batch Transaction failed: ", error);
            throw error;
        }
    };

    const resetPoints = async () => {
        if (!user) return;

        try {
            // 1. Delete ALL existing teams first (to remove old Gemstone teams)
            const lbSnapshot = await getDocs(collection(db, "leaderboard"));
            const resultsSnapshot = await getDocs(collection(db, "results"));

            // Delete loop for Leaderboard
            const lbDeletePromises = lbSnapshot.docs.map(d => deleteDoc(doc(db, "leaderboard", d.id)));

            // Delete loop for Results
            const resultsDeletePromises = resultsSnapshot.docs.map(d => deleteDoc(doc(db, "results", d.id)));

            await Promise.all([...lbDeletePromises, ...resultsDeletePromises]);

            // 2. Create NEW Team docs from INITIAL_TEAMS
            const createPromises = INITIAL_TEAMS.map(team =>
                setDoc(doc(db, "leaderboard", team.name), {
                    teamName: team.name,
                    points: 0
                })
            );
            await Promise.all(createPromises);

            console.log("Database reset and re-seeded with Departments.");
        } catch (e) {
            console.error("Error resetting db:", e);
        }
    };

    return (
        <ArtsContext.Provider value={{ teams, user, login, logout, updatePoints, publishBatchResult, resetPoints, loading }}>
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
