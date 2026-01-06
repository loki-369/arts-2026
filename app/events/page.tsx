import Link from 'next/link';
import Navbar from '../components/Navbar';

const EVENTS = [
    { id: 1, name: "Mohiniyattam", category: "Dance", maxPoints: 10 },
    { id: 2, name: "Oppana", category: "Dance", maxPoints: 10 },
    { id: 3, name: "Mappilapattu", category: "Music", maxPoints: 10 },
    { id: 4, name: "Thiruvathira", category: "Dance", maxPoints: 10 },
    { id: 5, name: "Elocution (Mal)", category: "Literary", maxPoints: 5 },
    { id: 6, name: "Light Music", category: "Music", maxPoints: 5 },
    { id: 7, name: "Folk Dance", category: "Dance", maxPoints: 10 },
    { id: 8, name: "Recitation", category: "Literary", maxPoints: 5 },
];

export default function EventsPage() {
    return (
        <div className="min-h-screen pb-20">
            <Navbar />
            <div className="max-w-6xl mx-auto p-6 pt-32 space-y-12">
                <header className="text-center space-y-4">
                    <h1 className="text-5xl font-black text-gray-900 tracking-tight">Stage Events</h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        The complete lineup of competitions for Arts Fest '24.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {EVENTS.map((event) => (
                        <div key={event.id} className="glass-card hover:translate-y-[-4px] group cursor-default bg-white border border-gray-100">
                            <div className="flex justify-between items-start mb-6">
                                <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider
                                    ${event.category === 'Dance' ? 'bg-purple-100 text-purple-700' :
                                        event.category === 'Music' ? 'bg-pink-100 text-pink-700' :
                                            'bg-blue-100 text-blue-700'}`}
                                >
                                    {event.category}
                                </span>
                                <span className="text-gray-300 font-bold text-sm">#{event.id}</span>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors">
                                {event.name}
                            </h3>

                            <div className="flex items-center gap-2 pt-4 border-t border-gray-100 mt-4">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                <span className="text-sm font-medium text-gray-500">
                                    Max Points: <span className="text-gray-900">{event.maxPoints}</span>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center pt-12 border-t border-gray-200">
                    <Link href="/" className="inline-flex items-center text-gray-500 hover:text-black font-semibold transition-colors">
                        ← Back to Leaderboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
