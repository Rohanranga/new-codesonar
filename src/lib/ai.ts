import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateLineByLineExplanation } from "./line-by-line-explainer";
import { analyzePackageVersions, compareVersions } from "./version-analyzer";
import { generateSimpleArchitectureDiagram } from "./simple-architecture";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- Specialized Prompts (Mini-Agents) ---

const prompts = {
    identifyTechStack: (context: string) => `
    You are an expert software architect. Analyze the following repository content and identify the tech stack used. Be as comprehensive as possible.
    
    Repository Content: ${context.slice(0, 30000)}
    
    Return ONLY a JSON object: { "languages": [], "frameworks": [], "tools": [], "packageManager": "string" }
  `,

    assessComplexity: (context: string) => `
    You are an expert software engineer tasked with assessing the complexity of code repositories. Based on the provided repository content, determine the overall complexity level (Low, Medium, or High). Provide a brief justification for your assessment.
    
    Repository Content: ${context.slice(0, 30000)}
    
    Return ONLY a JSON object: { "score": number (1-10), "level": "Low"|"Medium"|"High", "justification": "string", "metrics": { "totalFiles": number, "totalLines": number } }
  `,

    suggestImprovements: (context: string) => `
    You are an expert software engineer. Provide a list of actionable improvement suggestions. For each suggestion, include a clear title, a detailed explanation, the existing code snippet, and a concrete code snippet demonstrating the improved version.
    
    Repository Content: ${context.slice(0, 30000)}
    
    Return ONLY a JSON object: { "improvements": [{ "title": "string", "explanation": "string", "priority": "high"|"medium"|"low" }] }
  `,

    explainCode: (context: string) => `
    You are an expert software architect. Provide a high-density, concise explanation of the code files.
    Focus on: What it does, Key logic, and Interactions. Avoid fluff.
    
    Repository Content: ${context.slice(0, 40000)}
    
    Return ONLY a JSON object: 
    { "files": [{ "path": "string", "explanation": "string (markdown allowed, max 300 chars)", "keyFeatures": ["string"] }] }
  `,

    generateArchitecture: (context: string) => `
    You are an expert software architect. Generate a Mermaid.js flowchart (graph TD) of the high-level system architecture.
    
    Rules:
    - START WITH "graph TD"
    - Keep it simple: max 15-20 nodes.
    - Node names must be single words or quoted strings.
    - Avoid subgraphs if possible to prevent rendering errors.
    - NO markdown fences.
    
    Repository Content: ${context.slice(0, 40000)}
    
    Return only the raw Mermaid string.
  `,

    generateSummary: (details: any) => `
    You are an expert in summarizing software projects. Based on the following information, generate a concise project summary.
    
    Code Explanation: ${JSON.stringify(details.fileAnalysis).slice(0, 10000)}
    Tech Stack: ${JSON.stringify(details.techStack)}
    Complexity Level: ${JSON.stringify(details.complexity)}
    Potential Improvements: ${JSON.stringify(details.improvements)}
    
    Return string (Summary text).
  `
};

export async function analyzeCodebase(files: { path: string; content: string }[]) {
    // 1. Prepare minimal context
    const context = files
        .filter(f => !f.path.includes('lock'))
        .map(f => `File: ${f.path}\n\`\`\`${f.path.split('.').pop() || 'txt'}\n${f.content.slice(0, 2000)}\n\`\`\``) // Reduced context per file for aggregate prompts
        .join("\n\n");

    try {
        // 2. Run Specialized Agents in Parallel
        console.log("Starting Multi-Agent Analysis...");

        const [techStackRes, complexityRes, improvementsRes, explanationRes, architectureRes] = await Promise.all([
            model.generateContent(prompts.identifyTechStack(context)),
            model.generateContent(prompts.assessComplexity(context)),
            model.generateContent(prompts.suggestImprovements(context)),
            model.generateContent(prompts.explainCode(context)),
            model.generateContent(prompts.generateArchitecture(context))
        ]);

        // Helper to parse JSON safely
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parse = (res: any, fallback: any) => {
            try {
                const txt = res.response.text();
                const clean = txt.replace(/```json/g, '').replace(/```/g, '');
                return JSON.parse(clean);
            } catch (e) { console.error("Parse Error", e); return fallback; }
        };

        const techStack = parse(techStackRes, { languages: [], frameworks: [], tools: [], packageManager: "Unknown" });
        const complexity = parse(complexityRes, { score: 5, level: "Medium", justification: "Analysis failed", metrics: { totalFiles: files.length, totalLines: 0 } });
        const improvementsData = parse(improvementsRes, { improvements: [] });
        const explanationData = parse(explanationRes, { files: [] });
        // Clean Architecture
        const cleanArchitecture = architectureRes.response.text()
            .replace(/```mermaid/g, '')
            .replace(/```/g, '')
            .trim();

        // Merge Tech Stack
        const mergedTechnologies = [
            ...(techStack.languages || []).map((l: string) => ({ name: l, type: 'Language', version: 'Detected' })),
            ...(techStack.frameworks || []).map((f: string) => ({ name: f, type: 'Framework', version: 'Standard' })),
            ...(techStack.tools || []).map((t: string) => ({ name: t, type: 'Tool', version: 'Detected' }))
        ];

        // 3. Generate Final Summary
        const summaryRes = await model.generateContent(prompts.generateSummary({
            fileAnalysis: explanationData.files,
            techStack,
            complexity,
            improvements: improvementsData.improvements
        }));
        const summary = summaryRes.response.text();

        console.log("Analysis Complete.");

        // 4. Map to frontend schema
        return {
            summary: summary,
            techStack: techStack,
            complexity: {
                score: complexity.score,
                analysis: complexity.justification,
                metrics: {
                    totalFiles: files.length,
                    totalLines: complexity.metrics?.totalLines || 0,
                    avgLinesPerFile: Math.round((complexity.metrics?.totalLines || 0) / (files.length || 1))
                }
            },
            architecture: generateSimpleArchitectureDiagram(files),
            errors: [],
            warnings: [],
            packages: (() => {
                // Analyze package versions from package.json
                const packageInfo = analyzePackageVersions(files);

                // Update status by comparing versions
                const packagesWithStatus = packageInfo.map(pkg => ({
                    ...pkg,
                    status: compareVersions(pkg.current, pkg.latest)
                }));

                const outdated = packagesWithStatus.filter(p => p.status === 'outdated');

                return {
                    total: packagesWithStatus.length,
                    all: packagesWithStatus,
                    outdated: outdated,
                    dependencies: {},
                    devDependencies: {}
                };
            })(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fileAnalysis: files.map((f: any) => {
                const originalFile = files.find(file => file.path === f.path) || files.find(file => file.path.endsWith(f.path));
                return {
                    path: f.path,
                    language: f.path?.split('.').pop() || 'Text',
                    lines: originalFile?.content.split('\n').length || 0,
                    size: originalFile?.content.length || 0,
                    preview: originalFile?.content.slice(0, 300) || "",
                    content: originalFile?.content || "// Content not found",
                    // Use line-by-line explanation generator for complete beginner-friendly explanations
                    explanation: originalFile ? generateLineByLineExplanation(originalFile) : "No detailed explanation available.",
                    purpose: f.path?.includes('/api/') ? 'API Route' : f.path?.endsWith('.json') ? 'Configuration' : 'Source Code',
                    keyFeatures: ['See detailed explanation']
                };
            }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            qualityAnalysis: improvementsData.improvements.map((imp: any) => ({
                category: "Improvement",
                issue: imp.title,
                recommendation: imp.explanation,
                priority: imp.priority || "medium"
            }))
        };

    } catch (error) {
        console.error("Multi-Agent Analysis Failed:", error);
        // Fallback to local heuristic if AI completely fails
        return analyzeCodebaseLocal(files);
    }
}

// Keep the local version as fallback
async function analyzeCodebaseLocal(files: { path: string; content: string }[]) {
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 1. Package Analysis with Version Diff Simulation
    const packageJsonFile = files.find(f => f.path.endsWith('package.json'));
    let packageData: any = null;
    let outdatedPackages: any[] = [];
    let mergedTechnologies: any[] = [];

    const languages = new Set<string>();
    const frameworks = new Set<string>();
    const tools = new Set<string>();

    if (packageJsonFile) {
        try {
            packageData = JSON.parse(packageJsonFile.content);
            const deps = { ...packageData.dependencies || {}, ...packageData.devDependencies || {} };
            const commonUpdates: Record<string, string> = {
                'react': '18.3.0',
                'next': '14.1.0',
                'typescript': '5.4.0',
                'tailwindcss': '3.4.0'
            };

            const allPackages: any[] = [];
            Object.keys(deps).forEach(d => {
                const current = deps[d].replace(/[\^~]/, '');
                const latest = commonUpdates[d] || 'unknown';
                let status = 'unknown';
                if (latest !== 'unknown') status = current < latest ? 'outdated' : 'up-to-date';

                allPackages.push({ name: d, current: deps[d], latest: latest, status: status as any });

                if (d.includes('react')) frameworks.add('React');
                if (d.includes('next')) frameworks.add('Next.js');
                if (d.includes('vue')) frameworks.add('Vue');
                if (d.includes('tailwind')) tools.add('Tailwind CSS');
            });

            outdatedPackages = allPackages.filter(p => p.status === 'outdated');
            packageData.all = allPackages;
        } catch (e) {
            console.error('Error parsing package.json', e);
        }
    }

    // 2. Tech Stack & Framework Detection from files
    files.forEach(f => {
        const ext = f.path.split('.').pop()?.toLowerCase();
        if (ext === 'js' || ext === 'jsx') languages.add('JavaScript');
        if (ext === 'ts' || ext === 'tsx') languages.add('TypeScript');
        if (ext === 'py') languages.add('Python');
        if (ext === 'go') languages.add('Go');
        if (ext === 'java') languages.add('Java');
        if (ext === 'rs') languages.add('Rust');
        if (ext === 'css') languages.add('CSS');
        if (ext === 'html') languages.add('HTML');

        const content = f.content.toLowerCase();
        if (content.includes('import react')) frameworks.add('React');
        if (content.includes('next/')) frameworks.add('Next.js');
        if (content.includes('@nestjs')) frameworks.add('NestJS');
        if (content.includes('tailwindcss')) tools.add('Tailwind CSS');
        if (content.includes('prisma')) tools.add('Prisma');
    });

    mergedTechnologies = [
        ...Array.from(languages).map(l => ({ name: l, type: 'Language', version: 'Detected' })),
        ...Array.from(frameworks).map(f => ({ name: f, type: 'Framework', version: 'Verified' })),
        ...Array.from(tools).map(t => ({ name: t, type: 'Tool', version: 'Active' }))
    ];

    // 3. Comprehensive Error & Warning Detection with Code Fixes
    const errors: any[] = [];
    const warnings: any[] = [];

    files.forEach(f => {
        const lines = f.content.split('\n');
        lines.forEach((line, i) => {
            const trimmed = line.trim();

            // Security Issues
            if (trimmed.includes('eval(')) {
                errors.push({
                    file: f.path, line: i + 1, type: 'security',
                    message: 'Dangerous eval() usage detected',
                    severity: 'critical',
                    suggestion: 'Replace eval() with JSON.parse() for JSON data or use safer alternatives.',
                    fixCode: `// Instead of: eval(userInput)\n// Use: JSON.parse(userInput) for JSON\n// Or validate input first`
                });
            }

            if (trimmed.includes('dangerouslySetInnerHTML')) {
                errors.push({
                    file: f.path, line: i + 1, type: 'security',
                    message: 'Dangerous HTML injection risk',
                    severity: 'high',
                    suggestion: 'Sanitize HTML content using DOMPurify before rendering.',
                    fixCode: `import DOMPurify from 'dompurify';\nconst clean = DOMPurify.sanitize(html);\n<div dangerouslySetInnerHTML={{ __html: clean }} />`
                });
            }

            if (trimmed.includes('innerHTML =')) {
                errors.push({
                    file: f.path, line: i + 1, type: 'security',
                    message: 'Direct innerHTML assignment (XSS risk)',
                    severity: 'high',
                    suggestion: 'Use textContent for plain text or sanitize HTML.',
                    fixCode: `// For text: element.textContent = text;\n// For HTML: element.innerHTML = DOMPurify.sanitize(html);`
                });
            }

            // TypeScript Issues
            if ((trimmed.includes(': any') || trimmed.includes('<any>')) && !trimmed.includes('eslint')) {
                warnings.push({
                    file: f.path, line: i + 1, type: 'typescript',
                    message: 'Using "any" type defeats TypeScript benefits',
                    severity: 'medium',
                    suggestion: 'Define a proper interface or type.',
                    fixCode: `interface MyData { id: number; name: string; }\nconst data: MyData = ...`
                });
            }

            // Code Quality
            if (trimmed.includes('console.log') || trimmed.includes('console.error')) {
                warnings.push({
                    file: f.path, line: i + 1, type: 'quality',
                    message: 'Console statement in production code',
                    severity: 'low',
                    suggestion: 'Remove console logs or use a logging library.',
                    fixCode: `// Remove or use: logger.debug('message');`
                });
            }

            if (trimmed.includes('TODO') || trimmed.includes('FIXME')) {
                warnings.push({
                    file: f.path, line: i + 1, type: 'quality',
                    message: 'Incomplete code marker found',
                    severity: 'medium',
                    suggestion: 'Complete this task before production.',
                    fixCode: `// Review and implement, then remove comment`
                });
            }
        });
    });

    // 4. Complexity Analysis
    const totalLines = files.reduce((acc, f) => acc + f.content.split('\n').length, 0);
    const avgLines = Math.round(totalLines / files.length);
    const complexityScore = Math.min(10, Math.ceil(files.length / 5) + Math.ceil(errors.length / 2));

    let complexityAnalysis = "Low complexity, easy to maintain.";
    if (complexityScore > 4) complexityAnalysis = "Moderate complexity, typical for this size.";
    if (complexityScore > 7) complexityAnalysis = "High complexity, consider modularization.";

    // 5. Improved Architecture Graph Generation
    let graph = "graph TD\n";
    let edgesCount = 0;
    const nodes = new Set<string>();

    files.forEach(f => {
        if (edgesCount > 30) return; // Cap edges

        // Handle normal imports and Next.js aliases
        const imports = f.content.match(/import .* from ['"](@?[\.\\/].+)['"]/g);

        if (imports) {
            imports.forEach(imp => {
                const match = imp.match(/from ['"](.+)['"]/);
                if (match) {
                    let target = match[1];
                    let from = f.path.split('/').pop()?.split('.')[0] || 'Unknown';
                    let to = target.split('/').pop() || 'Unknown';

                    // Cleanup names
                    from = from.replace(/[^a-zA-Z0-9]/g, '');
                    to = to.replace(/[^a-zA-Z0-9]/g, '');

                    if (from && to && from !== to && from.length > 2 && to.length > 2) {
                        nodes.add(from);
                        nodes.add(to);
                        graph += `    ${from} --> ${to}\n`;
                        edgesCount++;
                    }
                }
            });
        }
    });

    // Enhanced fallback diagram with project structure
    if (edgesCount === 0 || nodes.size < 3) {
        graph = "graph TD\n";

        // Detect project type and create appropriate diagram
        const hasReact = files.some(f => f.content.includes('react'));
        const hasNext = files.some(f => f.path.includes('next.config') || f.content.includes('next/'));
        const hasAPI = files.some(f => f.path.includes('/api/'));
        const hasComponents = files.some(f => f.path.includes('/components/'));
        const hasPages = files.some(f => f.path.includes('/pages/') || f.path.includes('/app/'));

        if (hasNext) {
            graph += "    App[\"Next.js App\"] --> Pages[\"Pages/Routes\"]\n";
            graph += "    App --> Components[\"Components\"]\n";
            if (hasAPI) graph += "    App --> API[\"API Routes\"]\n";
            graph += "    Pages --> Components\n";
            if (hasAPI) graph += "    Pages --> API\n";
            graph += "    Components --> Utils[\"Utilities\"]\n";
        } else if (hasReact) {
            graph += "    App[\"React App\"] --> Components[\"Components\"]\n";
            graph += "    App --> Utils[\"Utilities\"]\n";
            graph += "    Components --> Utils\n";
        } else {
            // Generic fallback
            graph += "    Project[\"Project Root\"] --> Source[\"Source Files\"]\n";
            graph += "    Project --> Config[\"Configuration\"]\n";
            graph += "    Source --> Modules[\"Modules\"]\n";
        }
    }

    // 6. Beginner-Friendly Detailed Explanations
    const fileAnalysis = files
        .sort((a, b) => b.content.length - a.content.length)
        .map(f => {  // Analyze ALL files, not just top 15
            const lines = f.content.split('\n');
            const imports = lines.filter(l => l.trim().startsWith('import')).map(l => l.split('from')[1]?.trim().replace(/['"`;]/g, '')).filter(Boolean);
            const exports = lines.filter(l => l.includes('export const') || l.includes('export function') || l.includes('export default')).map(l => {
                const parts = l.split(/\s+/);
                const idx = parts.findIndex(p => p === 'const' || p === 'function' || p === 'default');
                return parts[idx + 1]?.split('(')[0].split('=')[0];
            }).filter(Boolean);

            const hasReact = f.content.includes('import React') || f.content.includes('from "react"') || f.content.includes("from 'react'");
            const hasUseState = f.content.includes('useState');
            const hasUseEffect = f.content.includes('useEffect');
            const isComponent = hasReact && (f.content.includes('return (') || f.content.includes('return('));
            const isAPI = f.path.includes('/api/');
            const isConfig = f.path.includes('config') || f.path.endsWith('.json') || f.path.endsWith('.config.js');

            let explanation = `## 📄 What is this file?\n\n`;

            // Beginner-friendly file type description
            if (isComponent) {
                explanation += `This is a **React Component** - think of it as a reusable piece of your website's user interface (like a button, card, or entire page section).\n\n`;
            } else if (isAPI) {
                explanation += `This is an **API Route** - it handles requests from the frontend (like when a user submits a form) and sends back data or performs actions on the server.\n\n`;
            } else if (isConfig) {
                explanation += `This is a **Configuration File** - it contains settings and options that tell your application how to behave.\n\n`;
            } else if (f.content.includes('interface') || f.content.includes('type ')) {
                explanation += `This is a **Type Definition File** - it defines the "shape" of data in TypeScript, helping catch errors before your code runs.\n\n`;
            } else {
                explanation += `This is a **Utility/Helper File** - it contains reusable functions or logic that other parts of your app can use.\n\n`;
            }

            // What does it do?
            explanation += `## 🎯 What does it do?\n\n`;
            if (isComponent && hasUseState) {
                explanation += `This component manages its own **state** (data that can change over time, like form inputs or toggle switches). When the state changes, the component automatically re-renders to show the new data.\n\n`;
            }
            if (hasUseEffect) {
                explanation += `It uses **useEffect** to perform side effects - things like fetching data from an API, setting up subscriptions, or manually changing the DOM when the component loads or updates.\n\n`;
            }
            if (exports.length > 0) {
                explanation += `It exports these main functions/components that other files can import and use:\n`;
                exports.slice(0, 5).forEach(exp => {
                    explanation += `- **\`${exp}\`** - `;
                    if (isComponent) {
                        explanation += `A UI component you can render on the page\n`;
                    } else if (exp.toLowerCase().includes('fetch') || exp.toLowerCase().includes('get')) {
                        explanation += `Fetches or retrieves data\n`;
                    } else if (exp.toLowerCase().includes('create') || exp.toLowerCase().includes('add')) {
                        explanation += `Creates or adds new data\n`;
                    } else if (exp.toLowerCase().includes('update') || exp.toLowerCase().includes('edit')) {
                        explanation += `Updates existing data\n`;
                    } else if (exp.toLowerCase().includes('delete') || exp.toLowerCase().includes('remove')) {
                        explanation += `Deletes or removes data\n`;
                    } else {
                        explanation += `A helper function for this module\n`;
                    }
                });
                explanation += `\n`;
            }

            // Dependencies
            if (imports.length > 0) {
                explanation += `## 📦 What does it depend on?\n\n`;
                explanation += `This file imports code from other places:\n`;
                imports.slice(0, 5).forEach(imp => {
                    if (imp.startsWith('.') || imp.startsWith('@/')) {
                        explanation += `- **\`${imp}\`** - Another file in this project\n`;
                    } else if (imp === 'react') {
                        explanation += `- **React** - The core library for building user interfaces\n`;
                    } else if (imp === 'next') {
                        explanation += `- **Next.js** - The framework that powers routing and server features\n`;
                    } else {
                        explanation += `- **\`${imp}\`** - An external library installed via npm\n`;
                    }
                });
                explanation += `\n`;
            }

            // How it works (simplified)
            explanation += `## 🔧 How does it work?\n\n`;
            const lineCount = lines.length;
            if (lineCount < 50) {
                explanation += `This is a **small, focused file** (${lineCount} lines). It does one specific thing well, which makes it easy to understand and maintain.\n\n`;
            } else if (lineCount < 150) {
                explanation += `This is a **medium-sized file** (${lineCount} lines) with moderate complexity. It likely handles a complete feature or component.\n\n`;
            } else {
                explanation += `This is a **large file** (${lineCount} lines). Consider breaking it into smaller, more focused modules for easier maintenance.\n\n`;
            }

            if (isComponent) {
                explanation += `**For Beginners:** React components are like LEGO blocks. Each component is a self-contained piece that you can combine with others to build your complete website. This component takes some inputs (called "props"), possibly manages some internal data (called "state"), and returns HTML-like code (called JSX) that describes what should appear on the screen.\n\n`;
            }

            // Code structure hints
            const hasAsync = f.content.includes('async ') || f.content.includes('await ');
            if (hasAsync) {
                explanation += `⚠️ This file uses **async/await** for handling asynchronous operations (like API calls). This means some functions wait for data to arrive before continuing.\n\n`;
            }

            const hasTryCatch = f.content.includes('try {') && f.content.includes('catch');
            if (hasTryCatch) {
                explanation += `✅ Good! This file includes **error handling** (try/catch blocks) to gracefully handle failures instead of crashing.\n\n`;
            }

            return {
                path: f.path,
                language: f.path.split('.').pop() || 'txt',
                lines: lines.length,
                size: f.content.length,
                purpose: isComponent ? 'React Component' : isAPI ? 'API Route' : isConfig ? 'Configuration' : 'Utility',
                keyFeatures: exports.length > 0 ? exports : ['See explanation'],
                preview: f.content.slice(0, 300),
                content: f.content,
                explanation: generateLineByLineExplanation(f)
            };
        });

    return {
        summary: `Analyzed ${files.length} files. The project is primarily built with ${Array.from(languages).join(', ')}. Found ${errors.length} issues needing attention.`,
        techStack: {
            languages: Array.from(languages),
            frameworks: Array.from(frameworks),
            tools: Array.from(tools),
            packageManager: packageData ? 'npm' : 'Detected manually'
        },
        complexity: {
            score: complexityScore,
            analysis: complexityAnalysis,
            metrics: {
                totalFiles: files.length,
                totalLines,
                avgLinesPerFile: avgLines
            }
        },
        architecture: generateSimpleArchitectureDiagram(files),
        errors,
        warnings,
        packages: (() => {
            // Analyze package versions from package.json
            const packageInfo = analyzePackageVersions(files);

            // Update status by comparing versions
            const packagesWithStatus = packageInfo.map(pkg => ({
                ...pkg,
                status: compareVersions(pkg.current, pkg.latest)
            }));

            const outdated = packagesWithStatus.filter(p => p.status === 'outdated');

            return {
                total: packagesWithStatus.length,
                all: packagesWithStatus,
                outdated: outdated,
                dependencies: packageData?.dependencies || {},
                devDependencies: packageData?.devDependencies || {}
            };
        })(),
        fileAnalysis,
        qualityAnalysis: [
            { category: "Security", issue: `${errors.length} security hotspots detected`, recommendation: "Check the Errors section for detailed remediation steps.", priority: errors.length > 0 ? "high" : "low" },
            { category: "Maintainability", issue: `Avg file size is ${avgLines} lines`, recommendation: avgLines > 200 ? "Refactor large files into smaller components." : "File sizes look healthy.", priority: "medium" }
        ]
    };
}

export async function chatWithCodebase(
    history: { role: "user" | "model"; content: string }[],
    message: string,
    context: string
) {
    try {
        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: `Context: ${context.slice(0, 50000)}` }] },
                { role: "model", parts: [{ text: "Ready." }] },
                ...history.map(m => ({ role: m.role, parts: [{ text: m.content }] }))
            ]
        });
        const result = await chat.sendMessage(message);
        return result.response.text();
    } catch (e) {
        console.error(e);
        // Fallback
        return "I can help explain the code logic, suggest improvements, or identify errors. What do you need?";
    }
}
