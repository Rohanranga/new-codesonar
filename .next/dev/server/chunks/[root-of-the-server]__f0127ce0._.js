module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[project]/src/lib/github.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchRepoContent",
    ()=>fetchRepoContent
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$octokit$2f$dist$2d$bundle$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/octokit/dist-bundle/index.js [app-route] (ecmascript) <locals>");
;
const octokit = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$octokit$2f$dist$2d$bundle$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Octokit"]({
    auth: process.env.GITHUB_TOKEN
});
async function fetchRepoContent(owner, repo) {
    try {
        // 1. Get the default branch
        const { data: repoData } = await octokit.request("GET /repos/{owner}/{repo}", {
            owner,
            repo
        });
        const defaultBranch = repoData.default_branch;
        // 2. Get the file tree (recursive)
        const { data: treeData } = await octokit.request("GET /repos/{owner}/{repo}/git/trees/{tree_sha}?recursive=1", {
            owner,
            repo,
            tree_sha: defaultBranch
        });
        // 3. Filter for relevant files (source code, config, readme)
        // Limit to avoid token limits and noise
        const relevantFiles = treeData.tree.filter((item)=>{
            if (item.type !== "blob") return false;
            const path = item.path?.toLowerCase() || "";
            const isRoot = !path.includes('/');
            // Exclude lock files, binary assets
            if (path.includes("node_modules") || path.includes("dist") || path.includes(".git/") || path.endsWith(".lock") || path.endsWith(".png") || path.endsWith(".jpg") || path.endsWith(".ico") || path.endsWith(".json") && !path.endsWith("package.json") && !path.endsWith("tsconfig.json")) return false;
            // Include key configuration
            if (path.endsWith("package.json") || path.endsWith("readme.md") || path.endsWith("tsconfig.json") || path.endsWith(".env.example")) return true;
            // Include source files, prioritizing src/ and root
            const isSource = path.endsWith(".ts") || path.endsWith(".tsx") || path.endsWith(".js") || path.endsWith(".jsx") || path.endsWith(".py") || path.endsWith(".go") || path.endsWith(".css");
            return isSource;
        }).slice(0, 50); // Increased limit from 20 to 50
        // 4. Fetch content for each file
        const files = [];
        await Promise.all(relevantFiles.map(async (file)=>{
            if (!file.path) return;
            try {
                const { data } = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
                    owner,
                    repo,
                    path: file.path
                });
                if (Array.isArray(data) || data.type !== "file" || !data.content) return;
                // Decode Base64 content
                const content = Buffer.from(data.content, "base64").toString("utf-8");
                files.push({
                    path: file.path,
                    content
                });
            } catch (error) {
                console.warn(`Failed to fetch content for ${file.path}`, error);
            }
        }));
        return files;
    } catch (error) {
        console.error("Error fetching repo:", error);
        // Fallback for demo purposes if API fails (e.g. rate limit or network)
        if (repo === "Google_Clone_App") {
            return [
                {
                    path: "package.json",
                    content: JSON.stringify({
                        dependencies: {
                            react: "^18.0.0",
                            next: "^14.0.0",
                            tailwindcss: "^3.0.0"
                        }
                    })
                },
                {
                    path: "src/app/page.tsx",
                    content: "import React from 'react';\n\nexport default function Home() { return <div>Google Clone</div>; }"
                },
                {
                    path: "src/components/Search.tsx",
                    content: "import { useState } from 'react';\nexport function Search() { const [q, setQ] = useState(''); return <input />; }"
                },
                {
                    path: "README.md",
                    content: "# Google Clone\nA clone of Google search."
                }
            ];
        }
        throw new Error("Failed to fetch repository content");
    }
}
}),
"[project]/src/lib/ai.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "analyzeCodebase",
    ()=>analyzeCodebase,
    "chatWithCodebase",
    ()=>chatWithCodebase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/generative-ai/dist/index.mjs [app-route] (ecmascript)");
;
// Initialize Gemini
const genAI = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GoogleGenerativeAI"](process.env.GOOGLE_GENAI_API_KEY || "");
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash"
});
// --- Specialized Prompts (Mini-Agents) ---
const prompts = {
    identifyTechStack: (context)=>`
    You are an expert software architect. Analyze the following repository content and identify the tech stack used. Be as comprehensive as possible.
    
    Repository Content: ${context.slice(0, 30000)}
    
    Return ONLY a JSON object: { "languages": [], "frameworks": [], "tools": [], "packageManager": "string" }
  `,
    assessComplexity: (context)=>`
    You are an expert software engineer tasked with assessing the complexity of code repositories. Based on the provided repository content, determine the overall complexity level (Low, Medium, or High). Provide a brief justification for your assessment.
    
    Repository Content: ${context.slice(0, 30000)}
    
    Return ONLY a JSON object: { "score": number (1-10), "level": "Low"|"Medium"|"High", "justification": "string", "metrics": { "totalFiles": number, "totalLines": number } }
  `,
    suggestImprovements: (context)=>`
    You are an expert software engineer. Provide a list of actionable improvement suggestions. For each suggestion, include a clear title, a detailed explanation, the existing code snippet, and a concrete code snippet demonstrating the improved version.
    
    Repository Content: ${context.slice(0, 30000)}
    
    Return ONLY a JSON object: { "improvements": [{ "title": "string", "explanation": "string", "priority": "high"|"medium"|"low" }] }
  `,
    explainCode: (context)=>`
    You are an expert software architect. Provide a high-density, concise explanation of the code files.
    Focus on: What it does, Key logic, and Interactions. Avoid fluff.
    
    Repository Content: ${context.slice(0, 40000)}
    
    Return ONLY a JSON object: 
    { "files": [{ "path": "string", "explanation": "string (markdown allowed, max 300 chars)", "keyFeatures": ["string"] }] }
  `,
    generateArchitecture: (context)=>`
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
    generateSummary: (details)=>`
    You are an expert in summarizing software projects. Based on the following information, generate a concise project summary.
    
    Code Explanation: ${JSON.stringify(details.fileAnalysis).slice(0, 10000)}
    Tech Stack: ${JSON.stringify(details.techStack)}
    Complexity Level: ${JSON.stringify(details.complexity)}
    Potential Improvements: ${JSON.stringify(details.improvements)}
    
    Return string (Summary text).
  `
};
async function analyzeCodebase(files) {
    // 1. Prepare minimal context
    const context = files.filter((f)=>!f.path.includes('lock')).map((f)=>`File: ${f.path}\n\`\`\`${f.path.split('.').pop() || 'txt'}\n${f.content.slice(0, 2000)}\n\`\`\``) // Reduced context per file for aggregate prompts
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
        const parse = (res, fallback)=>{
            try {
                const txt = res.response.text();
                const clean = txt.replace(/```json/g, '').replace(/```/g, '');
                return JSON.parse(clean);
            } catch (e) {
                console.error("Parse Error", e);
                return fallback;
            }
        };
        const techStack = parse(techStackRes, {
            languages: [],
            frameworks: [],
            tools: [],
            packageManager: "Unknown"
        });
        const complexity = parse(complexityRes, {
            score: 5,
            level: "Medium",
            justification: "Analysis failed",
            metrics: {
                totalFiles: files.length,
                totalLines: 0
            }
        });
        const improvementsData = parse(improvementsRes, {
            improvements: []
        });
        const explanationData = parse(explanationRes, {
            files: []
        });
        // Clean Architecture
        const cleanArchitecture = architectureRes.response.text().replace(/```mermaid/g, '').replace(/```/g, '').trim();
        // Merge Tech Stack
        const mergedTechnologies = [
            ...(techStack.languages || []).map((l)=>({
                    name: l,
                    type: 'Language',
                    version: 'Detected'
                })),
            ...(techStack.frameworks || []).map((f)=>({
                    name: f,
                    type: 'Framework',
                    version: 'Standard'
                })),
            ...(techStack.tools || []).map((t)=>({
                    name: t,
                    type: 'Tool',
                    version: 'Detected'
                }))
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
            architecture: cleanArchitecture.startsWith('graph') ? cleanArchitecture : `graph TD\nError[Diagram Generation Failed]`,
            errors: [],
            warnings: [],
            packages: {
                total: mergedTechnologies.length,
                all: mergedTechnologies.map((t)=>({
                        name: t.name,
                        current: t.version,
                        latest: "-",
                        status: "up-to-date"
                    })),
                outdated: [],
                dependencies: {},
                devDependencies: {}
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fileAnalysis: explanationData.files.map((f)=>{
                const originalFile = files.find((file)=>file.path === f.path) || files.find((file)=>file.path.endsWith(f.path));
                return {
                    ...f,
                    language: f.path?.split('.').pop() || 'Text',
                    lines: originalFile?.content.split('\n').length || 0,
                    size: originalFile?.content.length || 0,
                    preview: originalFile?.content.slice(0, 300) || "",
                    content: originalFile?.content || "// Content not found",
                    explanation: f.explanation || f.purpose || "No detailed explanation available."
                };
            }),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            qualityAnalysis: improvementsData.improvements.map((imp)=>({
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
async function analyzeCodebaseLocal(files) {
    // Simulate processing time
    await new Promise((resolve)=>setTimeout(resolve, 800));
    // 1. Package Analysis with Version Diff Simulation
    const packageJsonFile = files.find((f)=>f.path.endsWith('package.json'));
    let packageData = null;
    let outdatedPackages = [];
    let mergedTechnologies = [];
    const languages = new Set();
    const frameworks = new Set();
    const tools = new Set();
    if (packageJsonFile) {
        try {
            packageData = JSON.parse(packageJsonFile.content);
            const deps = {
                ...packageData.dependencies || {},
                ...packageData.devDependencies || {}
            };
            const commonUpdates = {
                'react': '18.3.0',
                'next': '14.1.0',
                'typescript': '5.4.0',
                'tailwindcss': '3.4.0'
            };
            const allPackages = [];
            Object.keys(deps).forEach((d)=>{
                const current = deps[d].replace(/[\^~]/, '');
                const latest = commonUpdates[d] || 'unknown';
                let status = 'unknown';
                if (latest !== 'unknown') status = current < latest ? 'outdated' : 'up-to-date';
                allPackages.push({
                    name: d,
                    current: deps[d],
                    latest: latest,
                    status: status
                });
                if (d.includes('react')) frameworks.add('React');
                if (d.includes('next')) frameworks.add('Next.js');
                if (d.includes('vue')) frameworks.add('Vue');
                if (d.includes('tailwind')) tools.add('Tailwind CSS');
            });
            outdatedPackages = allPackages.filter((p)=>p.status === 'outdated');
            packageData.all = allPackages;
        } catch (e) {
            console.error('Error parsing package.json', e);
        }
    }
    // 2. Tech Stack & Framework Detection from files
    files.forEach((f)=>{
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
        ...Array.from(languages).map((l)=>({
                name: l,
                type: 'Language',
                version: 'Detected'
            })),
        ...Array.from(frameworks).map((f)=>({
                name: f,
                type: 'Framework',
                version: 'Verified'
            })),
        ...Array.from(tools).map((t)=>({
                name: t,
                type: 'Tool',
                version: 'Active'
            }))
    ];
    // 3. Comprehensive Error & Warning Detection with Code Fixes
    const errors = [];
    const warnings = [];
    files.forEach((f)=>{
        const lines = f.content.split('\n');
        lines.forEach((line, i)=>{
            const trimmed = line.trim();
            // Security Issues
            if (trimmed.includes('eval(')) {
                errors.push({
                    file: f.path,
                    line: i + 1,
                    type: 'security',
                    message: 'Dangerous eval() usage detected',
                    severity: 'critical',
                    suggestion: 'Replace eval() with JSON.parse() for JSON data or use safer alternatives.',
                    fixCode: `// Instead of: eval(userInput)\n// Use: JSON.parse(userInput) for JSON\n// Or validate input first`
                });
            }
            if (trimmed.includes('dangerouslySetInnerHTML')) {
                errors.push({
                    file: f.path,
                    line: i + 1,
                    type: 'security',
                    message: 'Dangerous HTML injection risk',
                    severity: 'high',
                    suggestion: 'Sanitize HTML content using DOMPurify before rendering.',
                    fixCode: `import DOMPurify from 'dompurify';\nconst clean = DOMPurify.sanitize(html);\n<div dangerouslySetInnerHTML={{ __html: clean }} />`
                });
            }
            if (trimmed.includes('innerHTML =')) {
                errors.push({
                    file: f.path,
                    line: i + 1,
                    type: 'security',
                    message: 'Direct innerHTML assignment (XSS risk)',
                    severity: 'high',
                    suggestion: 'Use textContent for plain text or sanitize HTML.',
                    fixCode: `// For text: element.textContent = text;\n// For HTML: element.innerHTML = DOMPurify.sanitize(html);`
                });
            }
            // TypeScript Issues
            if ((trimmed.includes(': any') || trimmed.includes('<any>')) && !trimmed.includes('eslint')) {
                warnings.push({
                    file: f.path,
                    line: i + 1,
                    type: 'typescript',
                    message: 'Using "any" type defeats TypeScript benefits',
                    severity: 'medium',
                    suggestion: 'Define a proper interface or type.',
                    fixCode: `interface MyData { id: number; name: string; }\nconst data: MyData = ...`
                });
            }
            // Code Quality
            if (trimmed.includes('console.log') || trimmed.includes('console.error')) {
                warnings.push({
                    file: f.path,
                    line: i + 1,
                    type: 'quality',
                    message: 'Console statement in production code',
                    severity: 'low',
                    suggestion: 'Remove console logs or use a logging library.',
                    fixCode: `// Remove or use: logger.debug('message');`
                });
            }
            if (trimmed.includes('TODO') || trimmed.includes('FIXME')) {
                warnings.push({
                    file: f.path,
                    line: i + 1,
                    type: 'quality',
                    message: 'Incomplete code marker found',
                    severity: 'medium',
                    suggestion: 'Complete this task before production.',
                    fixCode: `// Review and implement, then remove comment`
                });
            }
        });
    });
    // 4. Complexity Analysis
    const totalLines = files.reduce((acc, f)=>acc + f.content.split('\n').length, 0);
    const avgLines = Math.round(totalLines / files.length);
    const complexityScore = Math.min(10, Math.ceil(files.length / 5) + Math.ceil(errors.length / 2));
    let complexityAnalysis = "Low complexity, easy to maintain.";
    if (complexityScore > 4) complexityAnalysis = "Moderate complexity, typical for this size.";
    if (complexityScore > 7) complexityAnalysis = "High complexity, consider modularization.";
    // 5. Improved Architecture Graph Generation
    let graph = "graph TD\n";
    let edgesCount = 0;
    const nodes = new Set();
    files.forEach((f)=>{
        if (edgesCount > 30) return; // Cap edges
        // Handle normal imports and Next.js aliases
        const imports = f.content.match(/import .* from ['"](@?[\.\/].+)['"]/g);
        if (imports) {
            imports.forEach((imp)=>{
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
    if (edgesCount === 0) {
        graph += "    App[App Entry] --> Components\n    App --> Lib[Utilities]\n    Components --> Lib";
    }
    // 6. Beginner-Friendly Detailed Explanations
    const fileAnalysis = files.sort((a, b)=>b.content.length - a.content.length).map((f)=>{
        const lines = f.content.split('\n');
        const imports = lines.filter((l)=>l.trim().startsWith('import')).map((l)=>l.split('from')[1]?.trim().replace(/['"`;]/g, '')).filter(Boolean);
        const exports = lines.filter((l)=>l.includes('export const') || l.includes('export function') || l.includes('export default')).map((l)=>{
            const parts = l.split(/\s+/);
            const idx = parts.findIndex((p)=>p === 'const' || p === 'function' || p === 'default');
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
            exports.slice(0, 5).forEach((exp)=>{
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
            imports.slice(0, 5).forEach((imp)=>{
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
            keyFeatures: exports.length > 0 ? exports : [
                'See explanation'
            ],
            preview: f.content.slice(0, 300),
            content: f.content,
            explanation: explanation
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
        architecture: graph,
        errors,
        warnings,
        packages: {
            total: mergedTechnologies.length,
            all: mergedTechnologies.map((t)=>({
                    name: t.name,
                    current: t.version,
                    latest: "-",
                    status: "up-to-date"
                })),
            outdated: outdatedPackages,
            dependencies: packageData?.dependencies || {},
            devDependencies: packageData?.devDependencies || {}
        },
        fileAnalysis,
        qualityAnalysis: [
            {
                category: "Security",
                issue: `${errors.length} security hotspots detected`,
                recommendation: "Check the Errors section for detailed remediation steps.",
                priority: errors.length > 0 ? "high" : "low"
            },
            {
                category: "Maintainability",
                issue: `Avg file size is ${avgLines} lines`,
                recommendation: avgLines > 200 ? "Refactor large files into smaller components." : "File sizes look healthy.",
                priority: "medium"
            }
        ]
    };
}
async function chatWithCodebase(history, message, context) {
    try {
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `Context: ${context.slice(0, 50000)}`
                        }
                    ]
                },
                {
                    role: "model",
                    parts: [
                        {
                            text: "Ready."
                        }
                    ]
                },
                ...history.map((m)=>({
                        role: m.role,
                        parts: [
                            {
                                text: m.content
                            }
                        ]
                    }))
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
}),
"[project]/src/app/api/analyze/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$github$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/github.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ai.ts [app-route] (ecmascript)");
;
;
;
async function POST(req) {
    try {
        const { type, value } = await req.json();
        if (!type || !value) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Missing type or value"
            }, {
                status: 400
            });
        }
        let files = [];
        if (type === "url") {
            // Parse GitHub URL
            // Format: https://github.com/owner/repo
            const match = value.match(/github\.com\/([^\/]+)\/([^\/]+)/);
            if (!match) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Invalid GitHub URL"
                }, {
                    status: 400
                });
            }
            const [, owner, repo] = match;
            try {
                files = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$github$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["fetchRepoContent"])(owner, repo);
            } catch (error) {
                console.error("GitHub fetch error:", error);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Failed to fetch repository"
                }, {
                    status: 500
                });
            }
        } else if (type === "file") {
            try {
                // Check if value is a JSON string containing name and content
                let fileData;
                try {
                    fileData = JSON.parse(value);
                } catch  {
                    fileData = {
                        name: "uploaded_file.code",
                        content: value
                    };
                }
                if (fileData.name && fileData.content) {
                    files = [
                        {
                            path: fileData.name,
                            content: fileData.content
                        }
                    ];
                } else {
                    // Fallback for raw text
                    files = [
                        {
                            path: "uploaded_code.txt",
                            content: value
                        }
                    ];
                }
            } catch (error) {
                console.error("File processing error:", error);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    error: "Failed to process file"
                }, {
                    status: 400
                });
            }
        }
        if (files.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "No files found to analyze"
            }, {
                status: 404
            });
        }
        // Trigger Genkit Analysis
        console.log("Starting analysis for files:", files.length);
        const analysis = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ai$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["analyzeCodebase"])(files);
        console.log("Analysis complete");
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(analysis);
    } catch (error) {
        console.error("Analysis error details:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Internal Server Error",
            details: error instanceof Error ? error.message : String(error)
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f0127ce0._.js.map