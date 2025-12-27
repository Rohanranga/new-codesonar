"use client";

import { useState, useEffect } from "react";
import { Search, Upload, Github, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface RepoInputProps {
    onAnalyze: (type: "url" | "file", value: string) => void;
    isLoading: boolean;
}

export function RepoInput({ onAnalyze, isLoading }: RepoInputProps) {
    const [activeTab, setActiveTab] = useState<"url" | "upload">("url");
    const [url, setUrl] = useState("");
    const [loadingText, setLoadingText] = useState("Analyzing...");

    useEffect(() => {
        if (!isLoading) {
            setLoadingText("Analyzing...");
            return;
        }

        const steps = [
            "Fetching Repository...",
            "Identifying Tech Stack...",
            "Scanning for Errors...",
            "Generating Architecture Diagram...",
            "Writing Code Explanations...",
            "Finalizing Report..."
        ];

        let i = 0;
        setLoadingText(steps[0]);

        const interval = setInterval(() => {
            i = (i + 1) % steps.length;
            setLoadingText(steps[i]);
        }, 12000); // Cycle every 12s

        return () => clearInterval(interval);
    }, [isLoading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeTab === "url" && url) {
            onAnalyze("url", url);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-8">
                <button
                    onClick={() => setActiveTab("url")}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all",
                        activeTab === "url"
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                            : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                >
                    <Github className="w-4 h-4" />
                    GitHub URL
                </button>
                <button
                    onClick={() => setActiveTab("upload")}
                    className={cn(
                        "flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all",
                        activeTab === "upload"
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                            : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                >
                    <Upload className="w-4 h-4" />
                    Upload File
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="glass-card p-2 rounded-2xl"
            >
                {activeTab === "url" ? (
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://github.com/username/repository"
                                className="w-full bg-transparent border-none focus:ring-0 pl-12 pr-4 py-4 text-foreground placeholder:text-muted-foreground/50"
                                disabled={isLoading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !url}
                            className="px-8 py-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? loadingText : "Analyze"}
                        </button>
                    </form>
                ) : (
                    <div className="relative group">
                        <input
                            type="file"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;

                                const reader = new FileReader();
                                reader.onload = (event) => {
                                    const content = event.target?.result as string;
                                    // Send file metadata + content as JSON
                                    const payload = JSON.stringify({
                                        name: file.name,
                                        content: content
                                    });
                                    onAnalyze("file", payload);
                                };
                                reader.readAsText(file);
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.h,.css,.html,.json,.md,.go,.rs,.rb,.php"
                        />
                        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer group-hover:bg-white/5">
                            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <FileCode className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <p className="text-lg font-medium mb-2">
                                {isLoading ? "Parsing file..." : "Drop your source code here"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Click to select or drag & drop a file
                            </p>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
