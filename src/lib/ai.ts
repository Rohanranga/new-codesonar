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
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        temperature: 0.4,
        topP: 0.9,
        maxOutputTokens: 8192,
    }
});

// Helper: sequential delay to avoid rate-limit bursts
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// Helper: retry with backoff on 429
async function withRetry<T>(fn: () => Promise<T>, retries = 3, baseMs = 8000): Promise<T> {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (e: any) {
            const is429 = e?.message?.includes('429') || e?.status === 429;
            if (is429 && i < retries - 1) {
                const wait = baseMs * (i + 1);
                console.log(`Rate limited. Retrying in ${wait / 1000}s...`);
                await delay(wait);
            } else {
                throw e;
            }
        }
    }
    throw new Error('Max retries exceeded');
}

// --- Specialized Prompts (Mini-Agents) ---

const prompts = {
    identifyTechStack: (context: string) => `
You are an expert software architect. Identify EVERY technology, language, framework, library, and tool used.

Look at file extensions, import/require statements, config files (package.json, requirements.txt, etc.), build tools, CI/CD configs.

Repository Content:
${context.slice(0, 30000)}

Return ONLY a valid JSON object with NO markdown fences:
{ "languages": ["string"], "frameworks": ["string"], "tools": ["string"], "packageManager": "string" }
`,

    assessComplexity: (context: string) => `
You are a senior software engineer. Assess complexity based on: cyclomatic complexity, coupling, duplication, state management, error handling, test coverage signals.

Repository Content:
${context.slice(0, 30000)}

Return ONLY a valid JSON object with NO markdown fences:
{ "score": number (1-10), "level": "Low"|"Medium"|"High", "justification": "detailed paragraph", "metrics": { "totalFiles": number, "totalLines": number } }
`,

    suggestImprovements: (context: string) => `
You are a principal engineer doing a code review. Find specific, actionable improvements.

For each improvement: exact title, detailed explanation, category (complexity/performance/security/best-practice/refactoring/duplication), priority (high/medium/low), effort (low/medium/high), impact, file path, current code snippet, suggested fix.

Repository Content:
${context.slice(0, 30000)}

Return ONLY a valid JSON object with NO markdown fences:
{ "improvements": [{ "category": "complexity"|"performance"|"duplication"|"security"|"best-practice"|"refactoring", "priority": "high"|"medium"|"low", "title": "string", "description": "string", "file": "string", "line": number|null, "currentCode": "string|null", "suggestedCode": "string|null", "impact": "string", "effort": "low"|"medium"|"high" }] }
`,

    detectBugsAndExplain: (context: string) => `
You are an expert security researcher and software architect. Do TWO tasks in one pass:

TASK 1 — Bug Detection. Find:
- Security vulnerabilities (XSS, SQL injection, command injection, SSRF)
- Logic bugs (off-by-one, wrong conditions, missing awaits)
- Null/undefined dereference, memory leaks, hardcoded secrets
- Missing input validation, deprecated API usage, console statements in production

TASK 2 — File Explanation. For each file: what it does, key logic/patterns, dependencies, non-obvious behaviors (min 2 sentences each).

Repository Content:
${context.slice(0, 40000)}

Return ONLY a valid JSON object with NO markdown fences:
{
  "errors": [{ "file": "string", "line": number, "type": "string", "message": "string", "severity": "critical"|"error", "suggestion": "string", "fixCode": "string" }],
  "warnings": [{ "file": "string", "line": number, "type": "string", "message": "string", "severity": "warning"|"info", "suggestion": "string", "fixCode": "string" }],
  "files": [{ "path": "string", "explanation": "string (min 100 chars)", "keyFeatures": ["string"] }]
}
`,

    generateArchitecture: (context: string) => `
You are an expert software architect. Generate a Mermaid.js flowchart showing the complete DATA FLOW.

CRITICAL RULES:
- START WITH "flowchart TD"
- Show real components from the actual code (actual file names and route paths)
- Trace data from user input → frontend → API routes → services → external APIs → AI → results
- Include emojis: 👤 User, 🖥️ Frontend, ⚙️ API, 📦 GitHub, 🤖 AI, 📊 Results
- 12-16 nodes, label every arrow with what data flows through it

Repository Content:
${context.slice(0, 30000)}

Return ONLY raw Mermaid code, no markdown fences, no explanation text.
`,

    generateSummary: (details: any) => `
You are a technical writer. Write 3-4 paragraphs covering: what the project does, its architecture, notable features, and overall code quality.

File Analysis: ${JSON.stringify(details.fileAnalysis).slice(0, 8000)}
Tech Stack: ${JSON.stringify(details.techStack)}
Complexity: ${JSON.stringify(details.complexity)}
Key Issues: ${JSON.stringify(details.improvements?.slice(0, 3))}

Return plain text summary (markdown allowed, no JSON wrapper).
`
};

export async function analyzeCodebase(files: { path: string; content: string }[]) {
    // 1. Prepare comprehensive context — include more content per file
    const filteredFiles = files.filter(f =>
        !f.path.includes('lock') &&
        !f.path.includes('node_modules') &&
        !f.path.endsWith('.min.js') &&
        !f.path.endsWith('.map')
    );

    const context = filteredFiles
        .map(f => `File: ${f.path}\n\`\`\`${f.path.split('.').pop() || 'txt'}\n${f.content.slice(0, 4000)}\n\`\`\``)
        .join("\n\n");

    console.log(`Analyzing ${filteredFiles.length} files, context: ${context.length} chars`);

    // Helper to parse JSON safely
    const parse = (res: any, fallback: any) => {
        try {
            const txt = res.response.text();
            let clean = txt.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
            const objMatch = clean.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
            if (objMatch) clean = objMatch[1];
            clean = clean.replace(/,\s*([}\]])/g, '$1');
            return JSON.parse(clean);
        } catch (e) { console.error("Parse Error", e); return fallback; }
    };

    try {
        // Sequential calls to stay within free-tier RPM limits
        console.log("Step 1/5: Identifying tech stack...");
        const packageInfoPromise = analyzePackageVersionsAsync(files);
        const techStackRes = await withRetry(() => model.generateContent(prompts.identifyTechStack(context)));
        await delay(2000);

        console.log("Step 2/5: Assessing complexity...");
        const complexityRes = await withRetry(() => model.generateContent(prompts.assessComplexity(context)));
        await delay(2000);

        console.log("Step 3/5: Suggesting improvements...");
        const improvementsRes = await withRetry(() => model.generateContent(prompts.suggestImprovements(context)));
        await delay(2000);

        console.log("Step 4/5: Detecting bugs and explaining code...");
        const bugAndExplainRes = await withRetry(() => model.generateContent(prompts.detectBugsAndExplain(context)));
        await delay(2000);

        console.log("Parsing results and building final report...");
        const techStack = parse(techStackRes, { languages: [], frameworks: [], tools: [], packageManager: "Unknown" });
        const complexity = parse(complexityRes, { score: 5, level: "Medium", justification: "Analysis unavailable", metrics: { totalFiles: files.length, totalLines: 0 } });
        const improvementsData = parse(improvementsRes, { improvements: [] });
        const bugAndExplainData = parse(bugAndExplainRes, { errors: [], warnings: [], files: [] });

        const explanationData = { files: bugAndExplainData.files || [] };
        const detectedBugs = { errors: bugAndExplainData.errors || [], warnings: bugAndExplainData.warnings || [] };

        // Build a file explanation map for fast lookup
        const explanationMap = new Map<string, any>();
        (explanationData.files || []).forEach((f: any) => explanationMap.set(f.path, f));

        console.log("Step 5/5: Generating summary...");
        const [architectureResult, packageInfoRes] = await Promise.all([
            withRetry(async () => {
                const { generateArchitectureDiagram } = await import('./simple-architecture');
                return generateArchitectureDiagram(filteredFiles);
            }),
            packageInfoPromise,
        ]);

        const summaryRes = await withRetry(() => model.generateContent(prompts.generateSummary({
            fileAnalysis: explanationData.files?.slice(0, 10),
            techStack,
            complexity,
            improvements: improvementsData.improvements?.slice(0, 3)
        })));

        const summary = summaryRes.response.text();

        console.log("Analysis Complete.");

        // Merge static + AI errors/warnings (deduplicated)
        const staticAnalysis = analyzeCodeForErrors(filteredFiles);
        const llmErrors = detectedBugs.errors || [];
        const llmWarnings = detectedBugs.warnings || [];

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

        // Package info
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

        // Quality analysis from improvements
        const uniqueQualityMap = new Map();
        (improvementsData.improvements || []).forEach((imp: any) => {
            const key = imp.title;
            if (!uniqueQualityMap.has(key)) {
                uniqueQualityMap.set(key, {
                    category: imp.category || "Improvement",
                    issue: imp.title,
                    recommendation: imp.description || imp.explanation,
                    priority: imp.priority || "medium"
                });
            }
        });

        // File analysis — use AI explanations where available, fallback to local
        const fileAnalysis = filteredFiles.map(f => {
            const aiExplain = explanationMap.get(f.path);
            return {
                path: f.path,
                language: f.path.split('.').pop() || 'Text',
                lines: f.content.split('\n').length,
                size: f.content.length,
                preview: f.content.slice(0, 300),
                content: f.content,
                explanation: aiExplain?.explanation || generateLineByLineExplanation(f),
                purpose: f.path.includes('/api/') ? 'API Route' : f.path.endsWith('.json') ? 'Configuration' : 'Source Code',
                keyFeatures: aiExplain?.keyFeatures || ['See detailed explanation']
            };
        });

        return {
            summary,
            techStack,
            complexity: {
                score: complexity.score,
                analysis: complexity.justification,
                metrics: {
                    totalFiles: filteredFiles.length,
                    totalLines: complexity.metrics?.totalLines || filteredFiles.reduce((a, f) => a + f.content.split('\n').length, 0),
                    avgLinesPerFile: Math.round((complexity.metrics?.totalLines || 0) / (filteredFiles.length || 1))
                }
            },
            architecture: architectureResult,
            errors: Array.from(uniqueErrors.values()),
            warnings: Array.from(uniqueWarnings.values()),
            packages: {
                total: packageInfoRes.length,
                all: packageInfoRes,
                outdated: packageInfoRes.filter((p: any) => p.status === 'outdated'),
                dependencies: deps,
                devDependencies: devDeps
            },
            fileAnalysis,
            qualityAnalysis: Array.from(uniqueQualityMap.values()),
            improvements: analyzeForImprovements(filteredFiles)
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
