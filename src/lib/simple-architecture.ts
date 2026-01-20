/**
 * Dynamic Architecture Generator using Gemini AI
 * Generates unique architecture diagrams for each repository
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateArchitectureDiagram(files: Array<{ path: string; content: string }>): Promise<string> {
    try {
        console.log(`🎨 Starting architecture generation for ${files.length} files...`);

        // Prepare focused context - prioritize important files
        const importantFiles = files
            .filter(f => {
                const path = f.path.toLowerCase();
                return !path.includes('lock') &&
                    !path.includes('node_modules') &&
                    (path.includes('/api/') ||
                        path.includes('/lib/') ||
                        path.includes('/components/') ||
                        path.includes('page.') ||
                        path.includes('route.') ||
                        path.includes('layout.') ||
                        path.endsWith('.ts') ||
                        path.endsWith('.tsx'));
            })
            .slice(0, 30); // Limit to 30 most important files

        const context = importantFiles
            .map(f => `File: ${f.path}\n${f.content.slice(0, 1000)}`)
            .join("\n\n");

        console.log(`📊 Analyzing ${importantFiles.length} key files (${context.length} chars)`);

        const prompt = `Analyze this codebase and create a detailed Mermaid flowchart showing the complete workflow.

START WITH: flowchart TD

Create 15-20 nodes showing:
1. User interactions
2. UI components (actual file names)
3. API routes (actual paths)
4. Services (GitHub, AI, databases)
5. Data processing steps
6. Results display

Use actual names from the code. Label all arrows clearly.

Code:
${context.slice(0, 50000)}

Example:
flowchart TD
    User["👤 User"] -->|"GitHub URL"| HomePage["🖥️ page.tsx"]
    HomePage -->|"POST"| API["⚙️ /api/analyze"]
    API -->|"fetch"| GitHub["📦 GitHub API"]
    GitHub -->|"files"| Analyzer["🤖 AI Analyzer"]
    Analyzer -->|"results"| API
    API -->|"response"| Dashboard["🖥️ Dashboard"]
    Dashboard -->|"display"| User

Return only Mermaid code.`;

        console.log("🤖 Calling Gemini AI...");
        const result = await model.generateContent(prompt);
        const rawResponse = result.response.text();

        console.log(`✅ Got response: ${rawResponse.length} chars`);

        const diagram = rawResponse
            .replace(/```mermaid/gi, '')
            .replace(/```/g, '')
            .trim();

        if (diagram.length < 50) {
            throw new Error("Generated diagram too short");
        }

        console.log("✅ Architecture generated successfully!");
        return diagram;

    } catch (error) {
        console.error("❌ Architecture generation failed:", error);
        console.error("Error details:", error instanceof Error ? error.message : String(error));

        // Better fallback with more detail
        return `flowchart TD
    User["👤 User"] -->|"GitHub Repository URL"| WebUI["🖥️ Web Interface<br/>Next.js Application"]
    WebUI -->|"Submit for Analysis"| AnalyzeAPI["⚙️ Analysis API<br/>/api/analyze"]
    AnalyzeAPI -->|"Parse URL"| URLParser["Extract Owner/Repo"]
    URLParser -->|"Fetch Repository"| GitHubAPI["📦 GitHub API<br/>Octokit Service"]
    GitHubAPI -->|"Repository Files"| FileFilter["🔄 File Processor<br/>Filter & Clean"]
    FileFilter -->|"Code Context"| AIEngine["🤖 Gemini AI<br/>Multi-Agent Analysis"]
    AIEngine -->|"Tech Stack"| TechAnalysis["📊 Tech Stack"]
    AIEngine -->|"Complexity"| ComplexityScore["⚡ Complexity"]
    AIEngine -->|"Errors"| ErrorDetection["🔍 Error Detection"]
    AIEngine -->|"Improvements"| Suggestions["💡 Suggestions"]
    TechAnalysis --> Results["📊 Result Aggregator"]
    ComplexityScore --> Results
    ErrorDetection --> Results
    Suggestions --> Results
    Results -->|"Complete Analysis"| AnalyzeAPI
    AnalyzeAPI -->|"JSON Response"| WebUI
    WebUI -->|"Visual Display"| User
    
    style User fill:#4A90E2,stroke:#2E5C8A,color:#fff
    style WebUI fill:#50C878,stroke:#2E7D4E,color:#fff
    style AnalyzeAPI fill:#FF6B6B,stroke:#C44545,color:#fff
    style GitHubAPI fill:#9B59B6,stroke:#6C3483,color:#fff
    style AIEngine fill:#F39C12,stroke:#B8730A,color:#fff`;
    }
}

// Synchronous fallback for backward compatibility
export function generateSimpleArchitectureDiagram(files: Array<{ path: string; content: string }>): string {
    console.log("⚠️ Using synchronous fallback - async generation should be used instead");
    return `flowchart TD
    User["👤 User"] -->|"Interacts"| App["🖥️ Application"]
    App -->|"Processing"| Backend["⚙️ Backend"]
    Backend -->|"Results"| App
    App -->|"Display"| User`;
}
