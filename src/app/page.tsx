"use client";

import { useState } from "react";
import { Hero } from "@/components/home/Hero";
import { AnalysisDashboard } from "@/components/dashboard/AnalysisDashboard";
import { AnalysisResult } from "@/types/analysis";

import { ChatInterface } from "@/components/chat/ChatInterface";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  // We need to store the raw context (file contents) to pass to the chat
  // For MVP, we'll just stringify the analysis result as a proxy for context if we don't have raw files easily accessible here without refactoring.
  // BETTER: Let's modify the API to return the context summary or we can just use the analysis result as context.
  // Ideally, we should return the file context from the API, but for now, let's use the analysis summary + tech stack + complexity as context.

  const [chatContext, setChatContext] = useState("");

  const handleAnalyze = async (type: "url" | "file", value: string) => {
    setIsLoading(true);
    setError(null);
    setAnalysisData(null);
    setChatContext("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, value }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      console.log("Analysis Data Received:", data);
      setAnalysisData(data);

      // Construct a comprehensive context string from the analysis result
      const contextStr = `
        Summary: ${data.summary}
        
        Tech Stack:
        - Languages: ${data.techStack.languages.join(", ")}
        - Frameworks: ${data.techStack.frameworks.join(", ")}
        - Tools: ${data.techStack.tools.join(", ")}
        
        Complexity: Score ${data.complexity.score}/10
        ${data.complexity.analysis}
        Metrics: ${data.complexity.metrics.totalFiles} files, ${data.complexity.metrics.totalLines} lines
        
        Errors: ${data.errors.length} critical issues
        Warnings: ${data.warnings.length} warnings
        
        Packages: ${data.packages.total} total (${data.packages.outdated.length} potentially outdated)
        
        Quality Issues:
        ${data.qualityAnalysis.map((q: any) => `- ${q.category}: ${q.issue} (${q.priority})`).join("\n")}
        
        Files Analyzed: ${data.fileAnalysis.length} files with detailed breakdown
      `;
      setChatContext(contextStr);

      // Scroll to dashboard
      setTimeout(() => {
        document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" });
      }, 100);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Hero onAnalyze={handleAnalyze} isLoading={isLoading} />

      <div id="dashboard">
        {(isLoading || analysisData || error) && (
          <AnalysisDashboard
            data={analysisData}
            isLoading={isLoading}
            error={error}
          />
        )}
      </div>

      {analysisData && (
        <ChatInterface context={chatContext} />
      )}

      {!analysisData && !isLoading && !error && (
        <section id="features" className="py-20 bg-secondary/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why CodeSonar?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Leveraging the power of Google Gemini to provide deep, actionable insights into your codebase.
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
