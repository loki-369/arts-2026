import Hero from "./components/Hero";
import Leaderboard from "./components/Leaderboard";
import Navbar from "./components/Navbar";


export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-[#F5F5F7]">
      <Navbar />
      <Hero />

      <Leaderboard />

      <footer className="py-24 text-center">
        <div className="mb-4">
          <span className="font-black text-2xl tracking-tighter text-[#1d1d1f]">K26</span>
        </div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
          Engineered for Kalaravam 2026
        </p>
      </footer>
    </main>
  );
}
