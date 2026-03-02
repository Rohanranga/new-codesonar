import Link from "next/link";
import { Code2, Github, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
    return (
        <header className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5 group">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all border border-white/10">
                        <Code2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                        CodeSonar
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-6">
                    <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Features
                    </Link>
                    <Link href="#dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Dashboard
                    </Link>
                    <Link
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-sm group"
                    >
                        <Github className="w-4 h-4" />
                        <span>Star on GitHub</span>
                    </Link>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-xs text-green-400 font-medium">
                        <Zap className="w-3 h-3" />
                        Live
                    </div>
                </nav>
            </div>
        </header>
    );
}

