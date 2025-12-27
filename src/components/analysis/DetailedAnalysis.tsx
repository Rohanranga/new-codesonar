"use client";

import { AnalysisResult } from "@/types/analysis";
import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, AlertTriangle, Package, FileCode, CheckCircle } from "lucide-react";

interface DetailedAnalysisProps {
    data: AnalysisResult;
}

export function DetailedAnalysis({ data }: DetailedAnalysisProps) {
    return (
        <div className="space-y-6">
            {/* Errors & Warnings */}
            {/* Errors & Warnings */}
            {(data.errors.length > 0 || data.warnings.length > 0) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 rounded-xl"
                >
                    <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        Errors & Warnings ({data.errors.length + data.warnings.length})
                    </h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {data.errors.map((error, i) => (
                            <div key={`error-${i}`} className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg space-y-3">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-red-400">{error.message}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {error.file} {error.line > 0 && `(Line ${error.line})`}
                                        </p>
                                    </div>
                                    <span className="px-2 py-0.5 bg-red-500/20 rounded text-xs text-red-300 uppercase font-bold">
                                        {error.severity}
                                    </span>
                                </div>
                                {error.suggestion && (
                                    <div className="text-sm bg-black/20 p-3 rounded text-gray-300 border-l-2 border-yellow-500">
                                        <span className="text-yellow-400 font-semibold">💡 Suggestion: </span>
                                        {error.suggestion}
                                    </div>
                                )}
                                {error.fixCode && (
                                    <div className="text-xs bg-black/40 p-3 rounded border border-green-500/20">
                                        <div className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                                            <span>✅ How to Fix:</span>
                                        </div>
                                        <pre className="text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                                            {error.fixCode}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Package Analysis */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6 rounded-xl"
            >
                <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-primary" />
                    Tech Stack & Languages ({data.packages.total})
                </h3>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-white/5">
                            <tr>
                                <th className="px-4 py-3 rounded-tl-lg">Technology</th>
                                <th className="px-4 py-3">Version/Type</th>
                                <th className="px-4 py-3 rounded-tr-lg">Latest</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data.packages.all || [])
                                .sort((a, b) => (a.status === 'outdated' ? -1 : 1))
                                .map((pkg, i) => (
                                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 font-mono text-primary flex items-center gap-2">
                                            {pkg.name}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-white/5 rounded text-xs opacity-70">
                                                {pkg.current}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 opacity-50 text-xs">
                                            {pkg.latest !== '-' ? pkg.latest : ''}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Code Explorer */}
            {data.fileAnalysis.length > 0 && (
                <CodeExplorer files={data.fileAnalysis} />
            )}

            {/* Enhanced Quality Analysis */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6 rounded-xl"
            >
                <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    Quality Recommendations ({data.qualityAnalysis.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.qualityAnalysis.map((item, i) => (
                        <div
                            key={i}
                            className={`p-4 rounded-lg border-l-4 ${item.priority === 'critical' ? 'bg-red-500/10 border-red-500' :
                                item.priority === 'high' ? 'bg-orange-500/10 border-orange-500' :
                                    item.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500' :
                                        'bg-green-500/10 border-green-500'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-sm">{item.category}</h4>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.priority === 'critical' ? 'bg-red-500/20 text-red-300' :
                                    item.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
                                        item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                            'bg-green-500/20 text-green-300'
                                    }`}>
                                    {item.priority.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                                <strong>Issue:</strong> {item.issue}
                            </p>
                            <p className="text-xs">
                                <strong>Fix:</strong> {item.recommendation}
                            </p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

function CodeExplorer({ files }: { files: AnalysisResult['fileAnalysis'] }) {
    const [selectedFile, setSelectedFile] = useState<typeof files[0] | null>(files[0]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card flex flex-col h-[600px] overflow-hidden rounded-xl"
        >
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-primary" />
                    Code Explorer
                </h3>
                <span className="text-xs text-muted-foreground">{files.length} files analyzed</span>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* File List */}
                <div className="w-1/3 border-r border-white/5 overflow-y-auto bg-black/20">
                    {files.map((file, i) => (
                        <button
                            key={i}
                            onClick={() => setSelectedFile(file)}
                            className={`w-full text-left p-3 text-sm hover:bg-white/5 transition-colors flex items-center justify-between group ${selectedFile?.path === file.path ? 'bg-primary/10 border-l-2 border-primary' : 'border-l-2 border-transparent'
                                }`}
                        >
                            <span className="truncate font-mono">{file.path}</span>
                            <span className="text-xs text-muted-foreground group-hover:text-primary">{file.language}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden bg-[#0d0d0d]">
                    {selectedFile ? (
                        <>
                            <div className="p-2 border-b border-white/5 bg-white/5 flex justify-between items-center px-4">
                                <span className="text-xs font-mono opacity-50">{selectedFile.path}</span>
                                <div className="flex gap-2 text-xs">
                                    <span className="px-2 py-0.5 rounded bg-white/5">{selectedFile.lines} lines</span>
                                    <span className="px-2 py-0.5 rounded bg-white/5">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-white/10 grid grid-rows-2 h-full">
                                {/* Code View */}
                                <div className="row-span-1 border-b border-white/5 overflow-auto bg-[#0a0a0a] relative group">
                                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 rounded text-xs text-muted-foreground z-10 pointer-events-none">
                                        Source Code
                                    </div>
                                    <pre className="p-4 text-xs font-mono leading-relaxed text-gray-300 tab-4">
                                        <code>{selectedFile.content || selectedFile.preview || "// Content not available"}</code>
                                    </pre>
                                </div>

                                {/* Explanation View */}
                                <div className="row-span-1 overflow-auto bg-[#111111] p-6">
                                    <div className="mb-2 flex items-center gap-2">
                                        <span className="text-xs uppercase tracking-wider font-bold text-primary">AI Explanation</span>
                                        <div className="h-px flex-1 bg-white/5"></div>
                                    </div>
                                    <div className="prose prose-invert prose-sm max-w-none">
                                        <p className="whitespace-pre-wrap text-gray-400 leading-relaxed font-sans">
                                            {selectedFile.explanation}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            Select a file to view content
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
