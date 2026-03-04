import Link from "next/link";
import { Code2, Github, Zap, Fingerprint, Search } from "lucide-react";

export function Header() {
    return (
        <header className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all border border-white/10">
                        <Code2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                        CodeSonar
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-3">
                    {/* Nav links */}
                    <Link href="#features" className="text-sm text-white/40 hover:text-white/80 transition-colors px-3">
                        Features
                    </Link>
                    <Link href="#dashboard" className="text-sm text-white/40 hover:text-white/80 transition-colors px-3">
                        Dashboard
                    </Link>

                    {/* Star on GitHub */}
                    <Link
                        href="https://github.com/Rohanranga/CODESONAR"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-sm text-white/60 hover:text-white"
                    >
                        <Github className="w-4 h-4" />
                        <span>Star on GitHub</span>
                    </Link>

                    {/* Analyse Now (normal analysis) */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 border border-blue-500/25 hover:border-blue-400/50 transition-all text-sm text-blue-300 hover:text-blue-200 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 font-medium"
                    >
                        <Search className="w-4 h-4" />
                        <span>Analyse Now</span>
                    </Link>

                    {/* Private Analysis */}
                    <Link
                        href="/private"
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 hover:from-violet-600/30 hover:to-fuchsia-600/30 border border-violet-500/30 hover:border-violet-400/50 transition-all text-sm text-violet-300 hover:text-violet-200 shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 font-medium"
                    >
                        <Fingerprint className="w-4 h-4" />
                        <span>Private Analysis</span>
                    </Link>

                    {/* Live badge */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-xs text-green-400 font-medium">
                        <Zap className="w-3 h-3" />
                        Live
                    </div>
                </nav>
            </div>
        </header>
    );
}
