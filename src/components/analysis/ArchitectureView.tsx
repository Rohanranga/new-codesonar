"use client";

import { useEffect, useRef } from "react";
import mermaid from "mermaid";
import { motion } from "framer-motion";
import { Network } from "lucide-react";

interface ArchitectureViewProps {
    diagram: string;
}

export function ArchitectureView({ diagram }: ArchitectureViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            mermaid.initialize({
                startOnLoad: true,
                theme: "dark",
                securityLevel: "loose",
                fontFamily: "inherit",
            });

            mermaid.render("mermaid-diagram", diagram).then(({ svg }) => {
                if (containerRef.current) {
                    containerRef.current.innerHTML = svg;
                }
            }).catch((error) => {
                console.error("Mermaid render error:", error);
                if (containerRef.current) {
                    containerRef.current.innerHTML = "<p class='text-red-400'>Failed to render diagram</p>";
                }
            });
        }
    }, [diagram]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 rounded-xl mb-8"
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-green-500/10">
                    <Network className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold">Visual Architecture</h3>
            </div>

            <div
                ref={containerRef}
                className="w-full overflow-x-auto flex justify-center p-4 bg-black/20 rounded-lg"
            />
        </motion.div>
    );
}
