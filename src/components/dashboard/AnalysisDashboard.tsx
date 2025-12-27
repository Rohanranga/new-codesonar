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

export function AnalysisDashboard({ data, isLoading, error }: AnalysisDashboardProps) {
    if (isLoading) {
        return (
            <div className="w-full max-w-5xl mx-auto mt-12 text-center">
                <div className="inline-block w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-muted-foreground animate-pulse">Analyzing codebase... This may take a minute.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-2xl mx-auto mt-12 p-6 glass-card border-red-500/50 rounded-xl text-center">
                <p className="text-red-400 mb-2">Analysis Failed</p>
                <p className="text-muted-foreground">{error}</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-6xl mx-auto mt-12 px-4 pb-20"
        >
            <SummaryCard data={data} />
            <ArchitectureView diagram={data.architecture} />
            <DetailedAnalysis data={data} />
        </motion.div>
    );
}
