import Link from 'next/link';
import Navbar from '../components/Navbar';
import SchedulePoster from '../components/SchedulePoster';

export default function EventsPage() {
    return (
        <div className="min-h-screen pb-20">
            <Navbar />
            <div className="max-w-6xl mx-auto p-6 pt-32 space-y-12">
                <header className="text-center space-y-4">
                    <h1 className="text-5xl font-black text-gray-900 tracking-tight">Official Schedule</h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        View the complete timeline for Kalaravam '26.
                    </p>
                </header>

                <div className="flex justify-center">
                    <SchedulePoster />
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
