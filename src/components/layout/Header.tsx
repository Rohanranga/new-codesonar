import Link from "next/link";
import { Code2, Github } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
    return (
        <header className="fixed top-0 w-full z-50 glass border-b border-white/10">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Code2 className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                        CodeSonar
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-6">
                    <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Features
                    </Link>
                    <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        How it Works
                    </Link>
                    <Link
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm"
                    >
                        <Github className="w-4 h-4" />
                        <span>Star on GitHub</span>
                    </Link>
                </nav>
            </div>
        </header>
    );
}
