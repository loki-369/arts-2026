"use client";

import { useState, useEffect } from "react";
import { useArts } from "../context/ArtsContext";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged, User, signOut } from "firebase/auth";
import Navbar from "../components/Navbar";

// Synced with Events Page
const EVENTS_LIST = [
    { id: 1, name: "Mohiniyattam", category: "Dance", maxPoints: 10 },
    { id: 2, name: "Oppana", category: "Dance", maxPoints: 10 },
    { id: 3, name: "Mappilapattu", category: "Music", maxPoints: 10 },
    { id: 4, name: "Thiruvathira", category: "Dance", maxPoints: 10 },
    { id: 5, name: "Elocution (Mal)", category: "Literary", maxPoints: 5 },
    { id: 6, name: "Light Music", category: "Music", maxPoints: 5 },
    { id: 7, name: "Folk Dance", category: "Dance", maxPoints: 10 },
    { id: 8, name: "Recitation", category: "Literary", maxPoints: 5 },
];

export default function AdminPage() {
    const { teams, updatePoints, resetPoints } = useArts();
    const [user, setUser] = useState<User | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(true);

    const [selectedTeam, setSelectedTeam] = useState(teams[0]?.name || "");
    const [selectedEventId, setSelectedEventId] = useState(EVENTS_LIST[0].id.toString());
    const [position, setPosition] = useState("1"); // 1, 2, 3

    // Auto-calculate points based on position and event max points (Simplified logic for now)
    // In this system: 1st = 10/5, 2nd = 5/3, 3rd = 3/1 based on maxPoints
    const calculatePoints = () => {
        const event = EVENTS_LIST.find(e => e.id.toString() === selectedEventId);
        if (!event) return 0;

        switch (position) {
            case "1": return event.maxPoints; // Full points
            case "2": return Math.ceil(event.maxPoints / 2); // Half
            case "3": return Math.ceil(event.maxPoints / 5); // Consolation/Third
            default: return 0;
        }
    };

    const calculatedPoints = calculatePoints();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            alert("Login Failed: " + (error as any).message);
        }
    };

    const handleLogout = () => signOut(auth);

    const handlePublish = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedTeam) {
            const eventName = EVENTS_LIST.find(ev => ev.id.toString() === selectedEventId)?.name || "Unknown Event";
            await updatePoints(selectedTeam, calculatedPoints, eventName);
            alert(`✅ Published: ${calculatedPoints} points to ${selectedTeam} for ${eventName} (${position === "1" ? "1st" : position === "2" ? "2nd" : "3rd"} Place)`);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">Loading...</div>;

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <h1 className="text-3xl font-black text-gray-900 mb-2 text-center">Admin Access</h1>
                    <p className="text-center text-gray-500 mb-8">Login to publish results</p>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-gray-900 transition-shadow"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black text-gray-900 transition-shadow"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button type="submit" className="w-full bg-black text-white p-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]">
                            Login
                        </button>
                    </form>
                </div>
                <div className="mt-8">
                    <Navbar />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />
            <div className="max-w-4xl mx-auto p-6 pt-32 space-y-8">
                <header className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Result Publisher</h1>
                        <p className="text-sm text-gray-500">Logged in as {user.email}</p>
                    </div>
                    <button onClick={handleLogout} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-500 text-sm font-bold transition-colors">
                        Logout
                    </button>
                </header>

                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
                    <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Publish New Score</h2>
                    <form onSubmit={handlePublish} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Event</label>
                                <select
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none appearance-none text-gray-900 font-medium"
                                    value={selectedEventId}
                                    onChange={(e) => setSelectedEventId(e.target.value)}
                                >
                                    {EVENTS_LIST.map(ev => (
                                        <option key={ev.id} value={ev.id}>{ev.name} ({ev.category})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Team</label>
                                <select
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none appearance-none text-gray-900 font-medium"
                                    value={selectedTeam}
                                    onChange={(e) => setSelectedTeam(e.target.value)}
                                >
                                    {teams.map(t => (
                                        <option key={t.name} value={t.name}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Position</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {["1", "2", "3"].map((pos) => (
                                        <button
                                            key={pos}
                                            type="button"
                                            onClick={() => setPosition(pos)}
                                            className={`p-3 rounded-xl font-bold border-2 transition-all ${position === pos ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'}`}
                                        >
                                            {pos === "1" ? "🥇 1st" : pos === "2" ? "🥈 2nd" : "🥉 3rd"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Points Awarded</label>
                                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
                                    <span className="text-gray-500 font-medium">Auto-calculated</span>
                                    <span className="text-2xl font-black text-gray-900">{calculatedPoints}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-5 bg-black text-white rounded-xl font-bold text-lg hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg hover:shadow-2xl"
                        >
                            Publish Result 🚀
                        </button>
                    </form>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100">
                    <h2 className="text-lg font-bold text-red-600 mb-4">Danger Zone</h2>
                    <p className="text-gray-500 mb-4 text-sm">This will reset all points for all teams to zero. This action cannot be undone.</p>
                    <button
                        onClick={() => {
                            if (confirm("ARE YOU SURE? This will wipe the leaderboard.")) resetPoints();
                        }}
                        className="px-6 py-3 border-2 border-red-100 text-red-500 rounded-xl font-bold hover:bg-red-50 transition-colors"
                    >
                        Reset Leaderboard
                    </button>
                </div>
            </div>
        </div>
    );
}
