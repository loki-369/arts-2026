import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="py-12 border-t border-gray-100 mt-auto bg-white">
            <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
                <div className="flex justify-center items-center gap-2">
                    <span className="font-black text-xl tracking-tighter text-[#1d1d1f]">K26</span>
                </div>

                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                    Engineered for Kalaravam 2026
                </p>

                <div className="pt-4">
                    <a
                        href="https://www.linkedin.com/in/ishal-ahammed-a75851286/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors group"
                    >
                        <span className="text-xs font-medium text-gray-500 group-hover:text-gray-900 transition-colors">
                            Made by 👾
                        </span>
                    </a>
                </div>
            </div>
        </footer>
    );
}
