/**
 * Dynamic Architecture Generator using Gemini AI
 * Generates unique architecture diagrams for each repository
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

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

// Synchronous fallback that dynamically generates based on file list
export function generateSimpleArchitectureDiagram(files: Array<{ path: string }>): string {
    console.log("⚠️ Generative dynamic fallback architecture");

    const components = files.filter(f => f.path.includes('/components/')).slice(0, 5);
    const pages = files.filter(f => f.path.includes('page.tsx') || f.path.includes('page.js'));
    const apiRoutes = files.filter(f => f.path.includes('/api/') || f.path.includes('route.ts'));
    const libs = files.filter(f => f.path.includes('/lib/') || f.path.includes('/utils/') || f.path.includes('/services/')).slice(0, 5);
    const styles = files.filter(f => f.path.endsWith('.css'));

    let diagram = `flowchart TD\n`;
    diagram += `    User["👤 User"]\n`;

    // 1. Pages Layer
    if (pages.length > 0) {
        diagram += `    subgraph UI ["🖥️ User Interface"]\n`;
        pages.forEach((p, i) => {
            const name = p.path.split('/').slice(-2, -1)[0] || 'Home';
            const node = `Page${i}`;
            diagram += `        ${node}["📄 ${name}"]\n`;
            if (i === 0) diagram += `        User --> ${node}\n`;
        });
        diagram += `    end\n`;
    } else {
        diagram += `    User --> App["🖥️ Application"]\n`;
    }

    // 2. Components Layer
    if (components.length > 0) {
        diagram += `    subgraph Components ["🧩 Components"]\n`;
        components.forEach((c, i) => {
            const name = c.path.split('/').pop()?.split('.')[0] || 'Comp';
            const node = `Comp${i}`;
            diagram += `        ${node}["🧱 ${name}"]\n`;
            // Link Pages to Components (Approximation)
            diagram += `        Page0 -.-> ${node}\n`;
        });
        diagram += `    end\n`;
    }

    // 3. API/Backend Layer
    if (apiRoutes.length > 0) {
        diagram += `    subgraph API ["⚙️ API Layer"]\n`;
        apiRoutes.forEach((r, i) => {
            const name = r.path.includes('/api/')
                ? r.path.split('/api/')[1].split('/')[0]
                : 'Route';
            const node = `API${i}`;
            diagram += `        ${node}["🔌 /api/${name}"]\n`;
            diagram += `        Page0 --> ${node}\n`;
        });
        diagram += `    end\n`;
    }

    // 4. Lib/Service Layer
    if (libs.length > 0) {
        diagram += `    subgraph Lib ["📚 Core Logic"]\n`;
        libs.forEach((l, i) => {
            const name = l.path.split('/').pop()?.split('.')[0] || 'Lib';
            const node = `Lib${i}`;
            diagram += `        ${node}["🛠️ ${name}"]\n`;
            // Connect API to Libs
            if (apiRoutes.length > 0) diagram += `        API0 --> ${node}\n`;
            // Connect UI to Libs if no API
            else if (pages.length > 0) diagram += `        Page0 --> ${node}\n`;
        });
        diagram += `    end\n`;
    }

    // 5. Stylings
    if (styles.length > 0) {
        diagram += `    subgraph Styles ["🎨 Styles"]\n`;
        styles.forEach((s, i) => {
            const name = s.path.split('/').pop();
            diagram += `        Style${i}["💅 ${name}"]\n`;
        });
        diagram += `    end\n`;
    }

    // Fallback if no structure detected
    if (pages.length === 0 && components.length === 0 && apiRoutes.length === 0) {
        diagram += `    User --> Code["📂 Source Code"]\n`;
        diagram += `    Code --> Logic["⚙️ Logic"]\n`;
    }

    // Styling
    diagram += `    style User fill:#333,stroke:#fff,stroke-width:2px,color:#fff\n`;

    return diagram;
}
