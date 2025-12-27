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
                className="glass-card p-6 rounded-xl"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                        <Code2 className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold">Project Summary</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                    {data.summary}
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6 rounded-xl"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                        <Layers className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold">Tech Stack</h3>
                </div>
                <div className="space-y-3">
                    {data.techStack.languages.length > 0 && (
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Languages</p>
                            <div className="flex flex-wrap gap-2">
                                {data.techStack.languages.map((tech, i) => (
                                    <span key={i} className="px-2 py-1 rounded-md bg-blue-500/20 text-xs">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {data.techStack.frameworks.length > 0 && (
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Frameworks</p>
                            <div className="flex flex-wrap gap-2">
                                {data.techStack.frameworks.map((tech, i) => (
                                    <span key={i} className="px-2 py-1 rounded-md bg-purple-500/20 text-xs">
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
                className="glass-card p-6 rounded-xl md:col-span-2"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                        <Zap className="w-5 h-5 text-orange-400" />
                    </div>
                    <h3 className="text-lg font-semibold">Complexity Analysis</h3>
                    <span className={`ml-auto px-3 py-1 rounded-full text-sm font-bold ${data.complexity.score > 7 ? 'bg-red-500/20 text-red-400' :
                            data.complexity.score > 4 ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                        }`}>
                        Score: {data.complexity.score}/10
                    </span>
                </div>
                <p className="text-muted-foreground">
                    {data.complexity.analysis}
                </p>
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
                    <div>
                        <p className="text-xs text-muted-foreground">Total Files</p>
                        <p className="text-lg font-semibold">{data.complexity.metrics.totalFiles}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Total Lines</p>
                        <p className="text-lg font-semibold">{data.complexity.metrics.totalLines.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground">Avg Lines/File</p>
                        <p className="text-lg font-semibold">{data.complexity.metrics.avgLinesPerFile}</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
