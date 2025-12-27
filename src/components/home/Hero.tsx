"use client";

import { motion } from "framer-motion";
import { RepoInput } from "@/components/input/RepoInput";

interface HeroProps {
    onAnalyze: (type: "url" | "file", value: string) => void;
    isLoading: boolean;
}

export function Hero({ onAnalyze, isLoading }: HeroProps) {
    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-32 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="container relative z-10 px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-sm font-medium text-muted-foreground">Powered by Gemini 1.5 Pro</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                        Understand any codebase <br />
                        <span className="text-gradient">in seconds</span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
                        CodeSonar uses advanced AI to analyze repositories, visualize architecture,
                        and explain complex logic instantly.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <RepoInput onAnalyze={onAnalyze} isLoading={isLoading} />
                </motion.div>

                {/* Feature Grid Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left"
                >
                    {[
                        { title: "Deep Analysis", desc: "Get comprehensive breakdowns of logic and flow." },
                        { title: "Visual Architecture", desc: "Auto-generated UML and architecture diagrams." },
                        { title: "Security & Quality", desc: "Identify bugs and vulnerabilities automatically." },
                    ].map((item, i) => (
                        <div key={i} className="glass-card p-6 rounded-xl">
                            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
