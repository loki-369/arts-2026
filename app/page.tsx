import Hero from "./components/Hero";
import Leaderboard from "./components/Leaderboard";
import Navbar from "./components/Navbar";


export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-[#F5F5F7]">
      <Navbar />
      <Hero />

      <Leaderboard />


    </main>
  );
}
