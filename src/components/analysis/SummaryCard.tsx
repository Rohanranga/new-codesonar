"use client";

import { AnalysisResult } from "@/types/analysis";
import { motion } from "framer-motion";
import { Code2, Layers, Zap } from "lucide-react";

interface SummaryCardProps {
    data: AnalysisResult;
}

export function SummaryCard({ data }: SummaryCardProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-6 rounded-xl bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 shadow-lg">
                        <Code2 className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Project Summary</h3>
                </div>
                <p className="text-gray-300 leading-relaxed text-sm">
                    {data.summary}
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6 rounded-xl bg-gradient-to-br from-purple-500/5 to-transparent border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 shadow-lg">
                        <Layers className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Tech Stack</h3>
                </div>
                <div className="space-y-3">
                    {data.techStack.languages.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-blue-400 mb-2">Languages</p>
                            <div className="flex flex-wrap gap-2">
                                {data.techStack.languages.map((tech, i) => (
                                    <span key={i} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-xs font-medium text-blue-300 border border-blue-500/30 hover:border-blue-400/50 hover:shadow-md hover:shadow-blue-500/20 transition-all duration-200">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {data.techStack.frameworks.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-purple-400 mb-2">Frameworks</p>
                            <div className="flex flex-wrap gap-2">
                                {data.techStack.frameworks.map((tech, i) => (
                                    <span key={i} className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-xs font-medium text-purple-300 border border-purple-500/30 hover:border-purple-400/50 hover:shadow-md hover:shadow-purple-500/20 transition-all duration-200">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6 rounded-xl md:col-span-2 bg-gradient-to-br from-orange-500/5 to-transparent border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10"
            >
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <div className="p-2 sm:p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-600/10 shadow-lg flex-shrink-0">
                        <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">Complexity Analysis</h3>
                    <span className={`ml-auto px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-lg flex-shrink-0 ${data.complexity.score > 7
                            ? 'bg-gradient-to-r from-red-500/30 to-rose-500/30 text-red-300 border border-red-500/50'
                            : data.complexity.score > 4
                                ? 'bg-gradient-to-r from-yellow-500/30 to-amber-500/30 text-yellow-300 border border-yellow-500/50'
                                : 'bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-300 border border-green-500/50'
                        }`}>
                        Score: {data.complexity.score}/10
                    </span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                    {data.complexity.analysis}
                </p>
                <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/10">
                    <div className="text-center p-2 sm:p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <p className="text-xs font-semibold text-blue-400 mb-1">Total Files</p>
                        <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{data.complexity.metrics.totalFiles}</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <p className="text-xs font-semibold text-purple-400 mb-1">Total Lines</p>
                        <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{data.complexity.metrics.totalLines.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-2 sm:p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <p className="text-xs font-semibold text-orange-400 mb-1">Avg/File</p>
                        <p className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">{data.complexity.metrics.avgLinesPerFile}</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
