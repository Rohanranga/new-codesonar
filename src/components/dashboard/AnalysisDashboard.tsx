"use client";

import { AnalysisResult } from "@/types/analysis";
import { SummaryCard } from "../analysis/SummaryCard";
import { ArchitectureView } from "../analysis/ArchitectureView";
import { DetailedAnalysis } from "../analysis/DetailedAnalysis";
import { motion } from "framer-motion";

interface AnalysisDashboardProps {
    data: AnalysisResult | null;
    isLoading: boolean;
    error: string | null;
}

const loadingStages = [
    { label: "Fetching repository files", icon: "📦" },
    { label: "Identifying tech stack & languages", icon: "🔍" },
    { label: "Running AI bug detection", icon: "🐛" },
    { label: "Analyzing code quality", icon: "✅" },
    { label: "Generating architecture diagram", icon: "🏗️" },
    { label: "Writing code explanations", icon: "🤖" },
    { label: "Compiling final report", icon: "📊" },
];

export function AnalysisDashboard({ data, isLoading, error }: AnalysisDashboardProps) {
    if (isLoading) {
        return (
            <div className="w-full max-w-3xl mx-auto mt-16 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-8 border border-primary/20"
                >
                    {/* Spinner + title */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative mb-6">
                            <div className="w-20 h-20 border-4 border-primary/20 rounded-full" />
                            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-primary rounded-full animate-spin" />
                            <div className="absolute inset-3 w-14 h-14 border-4 border-transparent border-t-blue-400/60 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
                        </div>
                        <h3 className="text-xl font-bold mb-1 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Analyzing Codebase
                        </h3>
                        <p className="text-sm text-muted-foreground">This may take up to 60 seconds for large repos</p>
                    </div>

                    {/* Animated step list */}
                    <div className="space-y-2 sm:space-y-3">
                        {loadingStages.map((stage, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.15 }}
                                className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/5"
                            >
                                <span className="text-base sm:text-lg">{stage.icon}</span>
                                <span className="text-xs sm:text-sm text-muted-foreground flex-1">{stage.label}</span>
                                <motion.div
                                    className="w-2 h-2 rounded-full bg-primary flex-shrink-0"
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-2xl mx-auto mt-12 p-6 glass-card border-red-500/50 rounded-xl text-center">
                <p className="text-red-400 mb-2 font-semibold">Analysis Failed</p>
                <p className="text-muted-foreground text-sm">{error}</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-6xl mx-auto mt-8 sm:mt-12 px-3 sm:px-4 pb-16 sm:pb-20"
        >
            <SummaryCard data={data} />
            <ArchitectureView diagram={data.architecture} />
            <DetailedAnalysis data={data} />
        </motion.div>
    );
}

