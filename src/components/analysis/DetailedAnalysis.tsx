"use client";

import { AnalysisResult } from "@/types/analysis";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertCircle, AlertTriangle, Package, FileCode, CheckCircle } from "lucide-react";
import { PotentialChanges } from "./PotentialChanges";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from "@/components/ui/CodeBlock";

interface DetailedAnalysisProps {
    data: AnalysisResult;
}

export function DetailedAnalysis({ data }: DetailedAnalysisProps) {
    return (
        <div className="space-y-6">
            {/* Errors & Warnings */}
            {data.isFallback && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-4 rounded-xl bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-500/30 flex items-center gap-4 mb-6"
                >
                    <div className="p-2 bg-red-500/20 rounded-full">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-red-200">Analysis Incomplete (Fallback Mode)</h3>
                        <p className="text-sm text-red-300/80">
                            The AI analysis failed (likely due to an expired API key). Showing limited local results. Please update your API key for dynamic insights.
                        </p>
                    </div>
                </motion.div>
            )}

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

                        {/* Warnings */}
                        {data.warnings.map((warning, i) => (
                            <div key={`warning-${i}`} className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg space-y-3">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-yellow-400">{warning.message}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {warning.file} {warning.line > 0 && `(Line ${warning.line})`}
                                        </p>
                                    </div>
                                    <span className="px-2 py-0.5 bg-yellow-500/20 rounded text-xs text-yellow-300 uppercase font-bold">
                                        {warning.severity}
                                    </span>
                                </div>
                                {warning.suggestion && (
                                    <div className="text-sm bg-black/20 p-3 rounded text-gray-300 border-l-2 border-blue-500">
                                        <span className="text-blue-400 font-semibold">💡 Suggestion: </span>
                                        {warning.suggestion}
                                    </div>
                                )}
                                {warning.fixCode && (
                                    <div className="text-xs bg-black/40 p-3 rounded border border-green-500/20">
                                        <div className="text-green-400 font-semibold mb-2 flex items-center gap-2">
                                            <span>✅ How to Fix:</span>
                                        </div>
                                        <pre className="text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                                            {warning.fixCode}
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

            {/* Potential Changes Widget */}
            {data.improvements && data.improvements.length > 0 && (
                <PotentialChanges improvements={data.improvements} />
            )}

            {/* Code Explorer */}
            <CodeExplorer files={data.fileAnalysis} />
        </div>
    );
}

function CodeExplorer({ files }: { files: AnalysisResult['fileAnalysis'] }) {
    const [selectedFile, setSelectedFile] = useState<typeof files[0] | null>(files[0]);
    const [currentExplanation, setCurrentExplanation] = useState<string>('');

    // Regenerate explanation when selected file changes
    useEffect(() => {
        if (selectedFile) {
            // Import the explanation generator
            import('@/lib/line-by-line-explainer').then(({ generateLineByLineExplanation }) => {
                const newExplanation = generateLineByLineExplanation({
                    path: selectedFile.path,
                    content: selectedFile.content || selectedFile.preview || ''
                });
                setCurrentExplanation(newExplanation);
            });
        }
    }, [selectedFile]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card flex flex-col h-[700px] overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500/5 to-transparent border border-indigo-500/20"
        >
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/10 shadow-lg">
                        <FileCode className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Code Explorer</h3>
                </div>
                <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-sm font-semibold text-indigo-300 border border-indigo-500/30">{files.length} files analyzed</span>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* File List */}
                <div className="w-1/3 border-r border-white/10 overflow-y-auto bg-gradient-to-b from-black/40 to-black/20">
                    {files.map((file, i) => (
                        <button
                            key={i}
                            onClick={() => setSelectedFile(file)}
                            className={`w-full text-left p-4 text-sm hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-purple-500/10 transition-all duration-200 flex items-center justify-between group border-b border-white/5 ${selectedFile?.path === file.path
                                ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-l-4 border-indigo-400 shadow-lg shadow-indigo-500/10'
                                : 'border-l-4 border-transparent hover:border-indigo-500/50'
                                }`}
                        >
                            <span className="truncate font-mono text-gray-300 group-hover:text-indigo-300 transition-colors">{file.path}</span>
                            <span className={`text-xs px-2 py-1 rounded-md font-medium ${selectedFile?.path === file.path
                                ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/50'
                                : 'bg-white/5 text-gray-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300'
                                }`}>{file.language}</span>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden bg-[#0d0d0d]">
                    {selectedFile ? (
                        <>
                            <div className="p-3 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 flex justify-between items-center px-5">
                                <span className="text-sm font-mono text-indigo-300 font-semibold">{selectedFile.path}</span>
                                <div className="flex gap-2 text-xs">
                                    <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30 font-medium">{selectedFile.lines} lines</span>
                                    <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 font-medium">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-white/10 grid grid-rows-2 h-full">
                                {/* Code View */}
                                <div className="row-span-1 border-b border-white/10 overflow-auto bg-[#0a0a0a] relative group">
                                    <div className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg text-xs font-semibold text-green-300 z-10 pointer-events-none shadow-lg">
                                        📄 Source Code
                                    </div>
                                    <pre className="p-6 text-xs font-mono leading-relaxed text-gray-300 tab-4">
                                        <code>{selectedFile.content || selectedFile.preview || "// Content not available"}</code>
                                    </pre>
                                </div>

                                {/* Explanation View */}
                                <div className="row-span-1 overflow-auto bg-gradient-to-b from-[#111111] to-[#0a0a0a] p-6">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20">
                                            <span className="text-lg">🤖</span>
                                        </div>
                                        <span className="text-sm uppercase tracking-wider font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AI Explanation</span>
                                        <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/50 to-transparent"></div>
                                    </div>
                                    <div className="prose prose-invert prose-sm max-w-none prose-p:text-gray-400 prose-headings:text-indigo-300 prose-strong:text-white prose-code:text-indigo-200">
                                        <div className="prose prose-invert prose-sm max-w-none prose-p:text-gray-400 prose-headings:text-indigo-300 prose-strong:text-white prose-code:text-indigo-200">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    code: ({ node, inline, className, children, ...props }: any) => {
                                                        return (
                                                            <CodeBlock inline={inline} className={className} {...props}>
                                                                {children}
                                                            </CodeBlock>
                                                        );
                                                    }
                                                }}
                                            >
                                                {currentExplanation || selectedFile.explanation || 'Generating explanation...'}
                                            </ReactMarkdown>
                                        </div>
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
