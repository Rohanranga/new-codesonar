import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateLineByLineExplanation } from "./line-by-line-explainer";
import { analyzePackageVersionsAsync, compareVersions } from "./version-analyzer";
import { analyzeCodeForErrors } from "./error-analyzer";
import { analyzeForImprovements } from "./improvement-analyzer";
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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

    detectBugs: (context: string) => `
    You are an expert code security and quality analyst. Analyze the provided code for BUGS, SECURITY VULNERABILITIES, and LOGIC ERRORS.
    Focus on issues that regex cannot find, such as:
    - Infinite loops or recursion
    - Race conditions
    - Memory leaks
    - Security flaws (XSS, SQL Injection, Command Injection)
    - Logic errors (off-by-one, incorrect boolean logic)
    - Unhandled edge cases
    - Performance bottlenecks
    
    Repository Content: ${context.slice(0, 40000)}
    
    Return ONLY a JSON object: 
    { 
        "errors": [{ "file": "string", "line": number, "message": "string", "severity": "critical"|"error"|"warning", "suggestion": "string", "fixCode": "string" }],
        "warnings": [{ "file": "string", "line": number, "message": "string", "severity": "warning"|"info", "suggestion": "string", "fixCode": "string" }]
    }
  `,

    explainCode: (context: string) => `
    You are an expert software architect. Provide a high-density, concise explanation of the code files.
    Focus on: What it does, Key logic, and Interactions. Avoid fluff.
    
    Repository Content: ${context.slice(0, 40000)}
    
    Return ONLY a JSON object: 
    { "files": [{ "path": "string", "explanation": "string (markdown allowed, max 300 chars)", "keyFeatures": ["string"] }] }
  `,

    generateArchitecture: (context: string) => `
    You are an expert software architect. Analyze the provided codebase and generate a Mermaid.js flowchart showing the DATA FLOW through the system.
    
    CRITICAL RULES:
    - START WITH "flowchart TD" (not "graph TD")
    - Show how data moves through the application (User → Frontend → Backend → Services → Database → AI → Results)
    - Identify actual components from the code (API routes, services, database, external APIs)
    - Use descriptive node labels that reflect the actual project
    - Include emojis for visual appeal (👤 User, 🖥️ Frontend, ⚙️ Backend, 📦 Service, 🤖 AI, 💾 Database)
    - Maximum 20 nodes
    - Use proper Mermaid syntax: NodeID["Label"] --> NodeID2["Label"]
    - Add styling classes at the end
    
    ANALYZE THE CODE FOR:
    1. Entry points (pages, routes)
    2. API endpoints (/api/* files)
    3. External services (GitHub, OpenAI, databases)
    4. Data processing (lib/* files)
    5. State management
    6. AI/ML components
    
    Repository Content: ${context.slice(0, 50000)}
    
    Return ONLY the raw Mermaid flowchart code, no markdown fences, no explanations.
    
    Example format:
    flowchart TD
        User["👤 User"] -->|"Input"| Frontend["🖥️ Frontend"]
        Frontend -->|"Request"| API["⚙️ API"]
        API -->|"Fetch"| Service["📦 Service"]
        Service -->|"Data"| AI["🤖 AI"]
        AI -->|"Results"| API
        API -->|"Response"| Frontend
        Frontend -->|"Display"| User
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
    // 1. Prepare comprehensive context from ALL files
    const context = files
        .filter(f => !f.path.includes('lock'))
        .map(f => `File: ${f.path}\n\`\`\`${f.path.split('.').pop() || 'txt'}\n${f.content.slice(0, 3000)}\n\`\`\``)
        .join("\n\n");

    try {
        // Run AI tasks and npm outdated in parallel
        const [techStackRes, complexityRes, improvementsRes, explanationRes, architectureRes, packageInfoRes, bugRes] = await Promise.all([
            model.generateContent(prompts.identifyTechStack(context)),
            model.generateContent(prompts.assessComplexity(context)),
            model.generateContent(prompts.suggestImprovements(context)),
            model.generateContent(prompts.explainCode(context)),
            model.generateContent(prompts.generateArchitecture(context)),
            analyzePackageVersionsAsync(files),
            model.generateContent(prompts.detectBugs(context))
        ]);

        // Helper to parse JSON safely
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
        const detectedBugs = parse(bugRes, { errors: [], warnings: [] });



        // 3. Generate Final Summary
        const summaryRes = await model.generateContent(prompts.generateSummary({
            fileAnalysis: explanationData.files,
            techStack,
            complexity,
            improvements: improvementsData.improvements
        }));
        const summary = summaryRes.response.text();

        console.log("Analysis Complete.");

        // Deduplicate Quality Analysis
        const uniqueQualityMap = new Map();
        improvementsData.improvements.forEach((imp: any) => {
            const key = imp.title;
            if (!uniqueQualityMap.has(key)) {
                uniqueQualityMap.set(key, {
                    category: "Improvement",
                    issue: imp.title,
                    recommendation: imp.explanation,
                    priority: imp.priority || "medium"
                });
            }
        });
        const qualityAnalysis = Array.from(uniqueQualityMap.values());

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
            architecture: await (async () => {
                try {
                    console.log("🎨 Generating detailed architecture diagram...");
                    const { generateArchitectureDiagram } = await import('./simple-architecture');
                    const diagram = await generateArchitectureDiagram(files);
                    return diagram;
                } catch (err) {
                    console.error("❌ Architecture generation error:", err);
                    return `flowchart TD
    User["👤 User"] -->|"GitHub URL"| WebUI["🖥️ Web Interface"]
    WebUI -->|"Submit"| API["⚙️ Analysis API"]
    API -->|"Fetch"| GitHub["📦 GitHub Service"]
    GitHub -->|"Files"| Processor["🔄 File Processor"]
    Processor -->|"Context"| AI["🤖 Gemini AI"]
    AI -->|"Analysis"| Aggregator["📊 Result Aggregator"]
    Aggregator -->|"JSON"| API
    API -->|"Results"| WebUI
    WebUI -->|"Display"| User`;
                }
            })(),
            ...(() => {
                const staticAnalysis = analyzeCodeForErrors(files);
                const llmErrors = detectedBugs.errors || [];
                const llmWarnings = detectedBugs.warnings || [];

                // Deduplicate and Merge
                const uniqueErrors = new Map();
                [...staticAnalysis.errors, ...llmErrors].forEach(e => {
                    const key = `${e.file}:${e.line}:${e.message}`;
                    if (!uniqueErrors.has(key)) uniqueErrors.set(key, e);
                });

                const uniqueWarnings = new Map();
                [...staticAnalysis.warnings, ...llmWarnings].forEach(w => {
                    const key = `${w.file}:${w.line}:${w.message}`;
                    if (!uniqueWarnings.has(key)) uniqueWarnings.set(key, w);
                });

                return {
                    errors: Array.from(uniqueErrors.values()),
                    warnings: Array.from(uniqueWarnings.values())
                };
            })(),
            packages: (() => {
                const packageJsonFile = files.find(f => f.path.endsWith('package.json'));
                let deps = {};
                let devDeps = {};
                try {
                    if (packageJsonFile) {
                        const json = JSON.parse(packageJsonFile.content);
                        deps = json.dependencies || {};
                        devDeps = json.devDependencies || {};
                    }
                } catch (e) { }

                // Use the async result
                const outdated = packageInfoRes.filter(p => p.status === 'outdated');
                return {
                    total: packageInfoRes.length,
                    all: packageInfoRes,
                    outdated: outdated,
                    dependencies: deps,
                    devDependencies: devDeps
                };
            })(),
            fileAnalysis: files.map((f: any) => {
                const originalFile = files.find(file => file.path === f.path) || files.find(file => file.path.endsWith(f.path));
                return {
                    path: f.path,
                    language: f.path?.split('.').pop() || 'Text',
                    lines: originalFile?.content.split('\n').length || 0,
                    size: originalFile?.content.length || 0,
                    preview: originalFile?.content.slice(0, 300) || "",
                    content: originalFile?.content || "// Content not found",
                    explanation: originalFile ? generateLineByLineExplanation(originalFile) : "No detailed explanation available.",
                    purpose: f.path?.includes('/api/') ? 'API Route' : f.path?.endsWith('.json') ? 'Configuration' : 'Source Code',
                    keyFeatures: ['See detailed explanation']
                };
            }),
            qualityAnalysis: qualityAnalysis,
            improvements: analyzeForImprovements(files)
        };

    } catch (error) {
        console.error("Multi-Agent Analysis Failed:", error);
        return analyzeCodebaseLocal(files);
    }
}

// Keep the local version as fallback
async function analyzeCodebaseLocal(files: { path: string; content: string }[]) {
    // 1. Package Analysis with npm outdated
    const packageJsonFile = files.find(f => f.path.endsWith('package.json'));
    let packageData: any = null;
    let allPackages: any[] = [];
    const languages = new Set<string>();
    const frameworks = new Set<string>();
    const tools = new Set<string>();

    if (packageJsonFile) {
        try {
            packageData = JSON.parse(packageJsonFile.content);
            const deps = { ...packageData.dependencies || {}, ...packageData.devDependencies || {} };

            // Initial map from package.json
            const packageMap = new Map();
            Object.entries(deps).forEach(([name, version]) => {
                packageMap.set(name, {
                    name,
                    current: version,
                    latest: 'Checking...',
                    status: 'unknown'
                });
            });

            // Run npm outdated to get real versions
            try {
                // We use process.cwd() as we assume the app is running in the project root
                const { stdout } = await execAsync('npm outdated --json', { encoding: 'utf8' }).catch(e => e);
                if (stdout) {
                    const outdatedData = JSON.parse(stdout);
                    Object.entries(outdatedData).forEach(([name, info]: [string, any]) => {
                        if (packageMap.has(name)) {
                            packageMap.set(name, {
                                ...packageMap.get(name),
                                current: info.current || packageMap.get(name).current,
                                latest: info.latest,
                                status: 'outdated'
                            });
                        }
                    });
                }
            } catch (err) {
                console.warn("Failed to run npm outdated:", err);
            }

            // Mark others as up-to-date or unknown
            allPackages = Array.from(packageMap.values()).map(pkg => ({
                ...pkg,
                latest: pkg.latest === 'Checking...' ? pkg.current : pkg.latest,
                status: pkg.status === 'unknown' ? 'up-to-date' : pkg.status
            }));

            // Detect Tech Stack
            Object.keys(deps).forEach(d => {
                if (d.includes('react')) frameworks.add('React');
                if (d.includes('next')) frameworks.add('Next.js');
                if (d.includes('vue')) frameworks.add('Vue');
                if (d.includes('tailwind')) tools.add('Tailwind CSS');
                if (d.includes('typescript')) languages.add('TypeScript');
            });

        } catch (e) { console.error('Error parsing package.json', e); }
    }

    // 2. Tech Stack from files
    files.forEach(f => {
        const ext = f.path.split('.').pop()?.toLowerCase();
        if (ext === 'js' || ext === 'jsx') languages.add('JavaScript');
        if (ext === 'ts' || ext === 'tsx') languages.add('TypeScript');
        if (ext === 'css') languages.add('CSS');

        const content = f.content.toLowerCase();
        if (content.includes('import react')) frameworks.add('React');
        if (content.includes('next/')) frameworks.add('Next.js');
    });

    // 3. Simple Errors/Warnings & Quality Analysis
    const errors: any[] = [];
    const warnings: any[] = [];

    // Use Maps for deduplication
    const qualityMap = new Map<string, any>();
    const improvementMap = new Map<string, any>();

    files.forEach(f => {
        const lines = f.content.split('\n');

        // Error Checks
        if (f.content.includes('eval(')) {
            const key = "eval-usage";
            if (!qualityMap.has(key)) {
                errors.push({ file: f.path, line: 0, message: "Avoid eval() - Security Risk", severity: "high", fixCode: "Remove eval() usage" });
                qualityMap.set(key, { category: "Security", issue: "Usage of eval() detected", recommendation: "Remove eval() to prevent code injection", priority: "critical", count: 1 });
            } else {
                qualityMap.get(key).count++;
            }
        }

        // Warning Checks & Quality
        let anyCount = 0;
        lines.forEach((line, idx) => {
            if (line.includes('console.log')) {
                warnings.push({ file: f.path, line: idx + 1, message: "Console log left in code", severity: "low", fixCode: "// Remove console.log" });
            }
            if (line.includes(': any') || line.includes('as any')) {
                anyCount++;
            }
        });

        if (anyCount > 0) {
            const key = "type-safety-any";
            if (!qualityMap.has(key)) {
                qualityMap.set(key, {
                    category: "Type Safety",
                    issue: "Usage of 'any' type",
                    recommendation: "Use specific types (interface/type) instead of 'any' to ensure type safety.",
                    priority: "medium",
                    count: anyCount
                });
            } else {
                qualityMap.get(key).count += anyCount;
            }
        }

        // Improvement Checks
        if (lines.length > 300) {
            improvementMap.set(f.path, {
                title: "Large File Detected",
                description: `File **${f.path.split('/').pop()}** is ${lines.length} lines long. Consider splitting it into smaller components.`,
                file: f.path,
                category: "complexity",
                priority: "medium",
                currentCode: `// ${lines.length} lines of code`,
                suggestedCode: `// Split into sub-components`,
                effort: "medium",
                impact: "Improves maintainability"
            });
        }
    });

    // Convert Maps to Arrays and format issues
    const qualityAnalysis = Array.from(qualityMap.values()).map(item => ({
        ...item,
        issue: item.count > 1 ? `${item.issue} (${item.count} occurrences)` : item.issue
    }));

    const improvements = Array.from(improvementMap.values());

    const totalLines = files.reduce((acc, f) => acc + f.content.split('\n').length, 0);
    const avgLines = Math.round(totalLines / files.length);

    // 4. File Analysis
    const fileAnalysis = files.map(f => {
        const originalFile = files.find(file => file.path === f.path);
        return {
            path: f.path,
            language: f.path.split('.').pop() || 'Text',
            lines: originalFile?.content.split('\n').length || 0,
            size: originalFile?.content.length || 0, // Using 0 as fallback if undefined
            preview: originalFile?.content.slice(0, 300) || "",
            content: originalFile?.content || "",
            explanation: originalFile ? generateLineByLineExplanation(originalFile) : "No detailed explanation available.",
            purpose: 'Source Code',
            keyFeatures: ['Local Analysis']
        };
    });

    // Default Tech Stack Fallback
    if (frameworks.size === 0) frameworks.add('Unknown Framework');
    if (languages.size === 0) languages.add('JavaScript');

    return {
        summary: `Analyzed ${files.length} files. Detected ${languages.size} languages and ${frameworks.size} frameworks. Found ${qualityAnalysis.length} quality insights.`,
        techStack: {
            languages: Array.from(languages),
            frameworks: Array.from(frameworks),
            tools: Array.from(tools),
            packageManager: packageData ? 'npm' : 'Detected manually'
        },
        complexity: {
            score: 5,
            analysis: "Local analysis fallback triggered.",
            metrics: { totalFiles: files.length, totalLines, avgLinesPerFile: avgLines }
        },
        // Force detailed diagram
        architecture: await (async () => {
            const { generateSimpleArchitectureDiagram } = await import('./simple-architecture');
            return generateSimpleArchitectureDiagram(files);
        })(),
        errors,
        warnings,
        packages: {
            total: allPackages.length,
            all: allPackages,
            outdated: allPackages.filter(p => p.status === 'outdated'),
            dependencies: packageData?.dependencies || {},
            devDependencies: packageData?.devDependencies || {}
        },
        fileAnalysis,
        qualityAnalysis: qualityAnalysis.slice(0, 10),
        improvements: improvements.slice(0, 5),
        isFallback: true
    };
}

export async function chatWithCodebase(
    history: { role: "user" | "model"; content: string }[],
    message: string,
    context: string
) {
    try {
        const systemPrompt = `You are an expert code assistant analyzing a codebase. You have access to the complete codebase context.

Your capabilities:
- Explain code logic and architecture
- Suggest improvements and optimizations
- Identify bugs and security issues
- Answer questions about the codebase
- Provide code examples and fixes
- Explain dependencies and relationships

Guidelines:
- Be specific and reference actual code when possible
- Provide actionable suggestions
- Explain technical concepts clearly
- Use code examples to illustrate points
- Be concise but thorough

Codebase Context:
${context.slice(0, 50000)}

Now, help the user with their questions about this codebase.`;

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: "I've analyzed the codebase and I'm ready to help! I can explain code, suggest improvements, identify issues, or answer any questions about the project. What would you like to know?" }] },
                ...history.map(m => ({ role: m.role, parts: [{ text: m.content }] }))
            ],
            generationConfig: {
                temperature: 0.7,
                topP: 0.8,
                topK: 40,
                maxOutputTokens: 2048,
            }
        });

        const result = await chat.sendMessage(message);
        return result.response.text();
    } catch (e) {
        console.error("Chat error:", e);
        return "I'm having trouble processing your request. Please try rephrasing your question or ask about:\n- Code explanations\n- Improvement suggestions\n- Bug identification\n- Architecture questions\n- Best practices";
    }
}
