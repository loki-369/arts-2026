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
    const { teams, updatePoints, resetPoints, publishBatchResult, login, logout } = useArts();
    const [user, setUser] = useState<User | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(true);

    // Batch Result State
    const [eventName, setEventName] = useState("");
    const [itemType, setItemType] = useState<'individual' | 'group'>('individual');
    const [firstPlace, setFirstPlace] = useState("");
    const [firstPlaceName, setFirstPlaceName] = useState("");
    const [secondPlace, setSecondPlace] = useState("");
    const [secondPlaceName, setSecondPlaceName] = useState("");
    const [thirdPlace, setThirdPlace] = useState("");
    const [thirdPlaceName, setThirdPlaceName] = useState("");

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
            await login(email, password); // Use context login
        } catch (error) {
            alert("Login Failed: " + (error as any).message);
        }
    };

    const handleLogout = async () => {
        await logout();
    };

    const handleBatchPublish = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventName || !firstPlace || !secondPlace || !thirdPlace) {
            alert("Please fill in Event Name and all 3 positions.");
            return;
        }

        // Prevent duplicate teams in podium
        if (new Set([firstPlace, secondPlace, thirdPlace]).size !== 3) {
            alert("A team cannot win multiple positions in the same event!");
            return;
        }

        try {
            // Use the batch function we added to context
            await publishBatchResult(eventName, [
                { teamName: firstPlace, winnerName: firstPlaceName, position: 1 },
                { teamName: secondPlace, winnerName: secondPlaceName, position: 2 },
                { teamName: thirdPlace, winnerName: thirdPlaceName, position: 3 }
            ], itemType);

            alert("Leaderboard Updated & Result Published!");
            setEventName("");
            setFirstPlace("");
            setFirstPlaceName("");
            setSecondPlace("");
            setSecondPlaceName("");
            setThirdPlace("");
            setThirdPlaceName("");
        } catch (error: any) {
            console.error(error);
            alert("Error publishing result: " + (error.message || error));
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
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900">Result Publisher</h1>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full tracking-wider">v2.1</span>
                        </div>
                        <p className="text-sm text-gray-500">Logged in as {user.email}</p>
                    </div>
                    <button onClick={handleLogout} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-red-50 hover:text-red-500 text-sm font-bold transition-colors">
                        Logout
                    </button>
                </header>

                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
                    <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Publish 3-Position Result</h2>

                    <form onSubmit={handleBatchPublish} className="space-y-8">

                        {/* Event Type Selection */}
                        <div className="flex gap-4 p-1">
                            <label className={`flex-1 cursor-pointer p-4 rounded-xl border-2 transition-all ${itemType === 'individual' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="itemType"
                                        value="individual"
                                        checked={itemType === 'individual'}
                                        onChange={(e) => setItemType(e.target.value as 'individual')}
                                        className="w-5 h-5 accent-black"
                                    />
                                    <div>
                                        <p className="font-bold text-gray-900">Individual Item</p>
                                        <p className="text-xs text-gray-400">1st: 5pts • 2nd: 3pts • 3rd: 2pts</p>
                                    </div>
                                </div>
                            </label>

                            <label className={`flex-1 cursor-pointer p-4 rounded-xl border-2 transition-all ${itemType === 'group' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="itemType"
                                        value="group"
                                        checked={itemType === 'group'}
                                        onChange={(e) => setItemType(e.target.value as 'group')}
                                        className="w-5 h-5 accent-black"
                                    />
                                    <div>
                                        <p className="font-bold text-gray-900">Group Item</p>
                                        <p className="text-xs text-gray-400">1st: 10pts • 2nd: 5pts • 3rd: 3pts</p>
                                    </div>
                                </div>
                            </label>
                        </div>

                        <div className="space-y-6">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Event Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Oppana, Margamkali, Recitation..."
                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none font-bold text-lg"
                                value={eventName}
                                onChange={(e) => setEventName(e.target.value)}
                            />
                        </div>

                        {/* Podium Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* 1st Place */}
                            <div className="space-y-2 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                                <label className="flex items-center gap-2 text-xs font-bold text-yellow-600 uppercase tracking-widest">
                                    <span className="text-lg">🥇</span> 1st Place (10 pts)
                                </label>
                                <select
                                    className="w-full p-3 bg-white border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none font-medium mb-2"
                                    value={firstPlace}
                                    onChange={(e) => setFirstPlace(e.target.value)}
                                >
                                    <option value="">Select Team</option>
                                    {teams.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Winner Name(s)"
                                    className="w-full p-3 bg-white border border-yellow-200 rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none text-sm placeholder-gray-400"
                                    value={firstPlaceName}
                                    onChange={(e) => setFirstPlaceName(e.target.value)}
                                />
                            </div>

                            {/* 2nd Place */}
                            <div className="space-y-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    <span className="text-lg">🥈</span> 2nd Place (5 pts)
                                </label>
                                <select
                                    className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 outline-none font-medium mb-2"
                                    value={secondPlace}
                                    onChange={(e) => setSecondPlace(e.target.value)}
                                >
                                    <option value="">Select Team</option>
                                    {teams.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Winner Name(s)"
                                    className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 outline-none text-sm placeholder-gray-400"
                                    value={secondPlaceName}
                                    onChange={(e) => setSecondPlaceName(e.target.value)}
                                />
                            </div>

                            {/* 3rd Place */}
                            <div className="space-y-2 p-4 bg-orange-50 rounded-xl border border-orange-100">
                                <label className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-widest">
                                    <span className="text-lg">🥉</span> 3rd Place (3 pts)
                                </label>
                                <select
                                    className="w-full p-3 bg-white border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none font-medium mb-2"
                                    value={thirdPlace}
                                    onChange={(e) => setThirdPlace(e.target.value)}
                                >
                                    <option value="">Select Team</option>
                                    {teams.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Winner Name(s)"
                                    className="w-full p-3 bg-white border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none text-sm placeholder-gray-400"
                                    value={thirdPlaceName}
                                    onChange={(e) => setThirdPlaceName(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-5 bg-black text-white rounded-xl font-bold text-lg hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg hover:shadow-2xl flex items-center justify-center gap-2"
                        >
                            <span>Publish Full Result</span>
                            <span className="text-xl">🚀</span>
                        </button>
                    </form>
                </div>

                {/* Schedule Manager */}
                <ScheduleManager />

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100">
                    <p className="text-gray-500 mb-4 text-sm">This will PERMANENTLY DELETE ALL RESULTS and reset points to 0.</p>
                    <button
                        onClick={() => {
                            if (confirm("⚠️ ERASING EVERYTHING! \n\nThis will delete all past results and reset the leaderboard. Are you sure?")) resetPoints();
                        }}
                        className="px-6 py-3 border-2 border-red-100 text-red-500 rounded-xl font-bold hover:bg-red-50 transition-colors"
                    >
                        Erase All Data & Reset
                    </button>
                </div>
            </div>
        </div>
    );
}

function ScheduleManager() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    async function handleUpload() {
        if (!file) return;
        setUploading(true);
        try {
            // Dynamic import to avoid SSR issues if any, or just standard import
            const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
            const { doc, setDoc } = await import("firebase/firestore");
            const { storage, db } = await import("@/lib/firebase");

            const storageRef = ref(storage, 'schedules/latest_poster');
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);

            await setDoc(doc(db, "settings", "schedule"), {
                imageUrl: url,
                updatedAt: new Date()
            });

            alert("Schedule Poster Updated!");
            setFile(null);
        } catch (e) {
            console.error(e);
            alert("Upload failed. Check console.");
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Manage Schedule Poster</h2>
            <div className="space-y-4">
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50 hover:bg-blue-700 transition-colors w-full md:w-auto"
                >
                    {uploading ? "Uploading..." : "Upload New Poster"}
                </button>
            </div>
        </div>
    )
}
