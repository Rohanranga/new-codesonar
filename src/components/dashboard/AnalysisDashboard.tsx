"use client";

import { AnalysisResult } from "@/types/analysis";
import { SummaryCard } from "../analysis/SummaryCard";
import { ArchitectureView } from "../analysis/ArchitectureView";
import { DetailedAnalysis } from "../analysis/DetailedAnalysis";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface AnalysisDashboardProps {
    data: AnalysisResult | null;
    isLoading: boolean;
    error: string | null;
}

const loadingStages = [
    { label: "Fetching repository files", icon: "📦", step: 1 },
    { label: "Identifying tech stack & languages", icon: "🔍", step: 2 },
    { label: "Running AI bug detection", icon: "🐛", step: 3 },
    { label: "Analyzing code quality", icon: "✅", step: 4 },
    { label: "Generating architecture diagram", icon: "🏗️", step: 5 },
    { label: "Writing code explanations", icon: "🤖", step: 6 },
    { label: "Compiling final report", icon: "📊", step: 7 },
];

function LoadingScreen() {
    const [activeStep, setActiveStep] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Advance steps every ~8s to roughly match real analysis time
        const stepInterval = setInterval(() => {
            setActiveStep(s => Math.min(s + 1, loadingStages.length - 1));
        }, 8000);

        // Smooth progress bar — fills to 90% over ~55s, holds until done
        const start = Date.now();
        const progressInterval = setInterval(() => {
            const elapsed = Date.now() - start;
            const p = Math.min(90, (elapsed / 55000) * 90);
            setProgress(p);
        }, 200);

        return () => {
            clearInterval(stepInterval);
            clearInterval(progressInterval);
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl mx-auto mt-16 px-4"
        >
            <div className="glass-card rounded-2xl p-8 border border-primary/20 overflow-hidden relative">
                {/* Background pulse */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-transparent pointer-events-none"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                />

                {/* Spinner */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative mb-6">
                        {/* Outer ring */}
                        <motion.div
                            className="w-20 h-20 rounded-full border-4 border-transparent"
                            style={{ borderTopColor: '#6366f1' }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        {/* Inner ring */}
                        <motion.div
                            className="absolute inset-3 w-14 h-14 rounded-full border-4 border-transparent"
                            style={{ borderTopColor: '#60a5fa' }}
                            animate={{ rotate: -360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                        />
                        {/* Center dot */}
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <div className="w-3 h-3 rounded-full bg-primary" />
                        </motion.div>
                    </div>

                    <motion.h3
                        className="text-xl font-bold mb-1 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        Analyzing Codebase
                    </motion.h3>
                    <p className="text-sm text-muted-foreground">AI is reading your code — this takes 1–3 minutes</p>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-white/5 rounded-full mb-6 overflow-hidden">
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${progress}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                </div>

                {/* Step list */}
                <div className="space-y-2">
                    {loadingStages.map((stage, i) => {
                        const isDone = i < activeStep;
                        const isActive = i === activeStep;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1, duration: 0.4 }}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-500 ${
                                    isActive
                                        ? 'bg-primary/10 border-primary/30'
                                        : isDone
                                        ? 'bg-green-500/5 border-green-500/20'
                                        : 'bg-white/3 border-white/5 opacity-40'
                                }`}
                            >
                                <span className="text-base w-5 text-center">{stage.icon}</span>
                                <span className={`text-xs flex-1 transition-colors duration-300 ${
                                    isActive ? 'text-white' : isDone ? 'text-green-400' : 'text-muted-foreground'
                                }`}>
                                    {stage.label}
                                </span>

                                {isDone && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="text-green-400 text-xs font-bold"
                                    >
                                        ✓
                                    </motion.span>
                                )}
                                {isActive && (
                                    <motion.div
                                        className="w-2 h-2 rounded-full bg-primary"
                                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}

export function AnalysisDashboard({ data, isLoading, error }: AnalysisDashboardProps) {
    return (
        <AnimatePresence mode="wait">
            {isLoading && <LoadingScreen key="loading" />}

            {error && !isLoading && (
                <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full max-w-2xl mx-auto mt-12 p-6 glass-card border border-red-500/30 rounded-xl text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="text-4xl mb-3"
                    >
                        ⚠️
                    </motion.div>
                    <p className="text-red-400 mb-2 font-semibold">Analysis Failed</p>
                    <p className="text-muted-foreground text-sm">{error}</p>
                </motion.div>
            )}

            {data && !isLoading && (
                <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-6xl mx-auto mt-8 sm:mt-12 px-3 sm:px-4 pb-16 sm:pb-20"
                >
                    {/* "Analysis complete" toast */}
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-2 mb-6 px-4 py-2.5 rounded-full bg-green-500/10 border border-green-500/20 w-fit"
                    >
                        <motion.span
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            ✅
                        </motion.span>
                        <span className="text-sm text-green-400 font-medium">Analysis complete</span>
                    </motion.div>

                    <SummaryCard data={data} />
                    <ArchitectureView diagram={data.architecture} />
                    <DetailedAnalysis data={data} />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
