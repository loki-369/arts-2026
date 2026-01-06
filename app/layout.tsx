import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import { ArtsProvider } from "./context/ArtsContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kalaravam '26 | College Arts Portal",
  description: "Official Arts Festival Portal 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <ArtsProvider>
          <Navbar />
          <main className="min-h-screen pt-24 px-4 pb-12">
            {children}
          </main>
        </ArtsProvider>
      </body>
    </html>
  );
}
