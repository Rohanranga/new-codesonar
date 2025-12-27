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
            // Exclude lock files, images, etc.
            if (path.endsWith(".lock") || path.endsWith(".png") || path.endsWith(".jpg") || path.endsWith(".svg")) return false;
            // Include key files
            if (path.endsWith("package.json") || path.endsWith("readme.md") || path.endsWith("tsconfig.json")) return true;
            // Include source files (limit depth or count if needed)
            if (path.startsWith("src/") || path.endsWith(".ts") || path.endsWith(".tsx") || path.endsWith(".js") || path.endsWith(".py")) return true;
            return false;
        }).slice(0, 20); // Hard limit for MVP to 20 files to prevent context overflow
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
        throw new Error("Failed to fetch repository content");
    }
}
}),
"[externals]/perf_hooks [external] (perf_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("perf_hooks", () => require("perf_hooks"));

module.exports = mod;
}),
"[externals]/node:perf_hooks [external] (node:perf_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:perf_hooks", () => require("node:perf_hooks"));

module.exports = mod;
}),
"[externals]/express [external] (express, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("express", () => require("express"));

module.exports = mod;
}),
"[externals]/fs/promises [external] (fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs/promises", () => require("fs/promises"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[externals]/async_hooks [external] (async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("async_hooks", () => require("async_hooks"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/require-in-the-middle [external] (require-in-the-middle, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("require-in-the-middle", () => require("require-in-the-middle"));

module.exports = mod;
}),
"[externals]/import-in-the-middle [external] (import-in-the-middle, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("import-in-the-middle", () => require("import-in-the-middle"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/http2 [external] (http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http2", () => require("http2"));

module.exports = mod;
}),
"[externals]/dns [external] (dns, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("dns", () => require("dns"));

module.exports = mod;
}),
"[externals]/dgram [external] (dgram, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("dgram", () => require("dgram"));

module.exports = mod;
}),
"[externals]/assert [external] (assert, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}),
"[project]/src/lib/ai.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "analyzeCodebase",
    ()=>analyzeCodebase,
    "chatWithCodebase",
    ()=>chatWithCodebase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/genkit/lib/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$genkit$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/genkit/lib/genkit.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/genkit/lib/common.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$genkit$2d$ai$2f$googleai$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@genkit-ai/googleai/lib/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$genkit$2d$ai$2f$googleai$2f$lib$2f$gemini$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@genkit-ai/googleai/lib/gemini.js [app-route] (ecmascript)");
;
;
const ai = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$genkit$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["genkit"])({
    plugins: [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$genkit$2d$ai$2f$googleai$2f$lib$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["googleAI"])()
    ],
    model: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$genkit$2d$ai$2f$googleai$2f$lib$2f$gemini$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["gemini15Flash"]
});
// Define the schema for the analysis result
const AnalysisSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
    summary: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("A high-level summary of the codebase's purpose and functionality."),
    techStack: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
        languages: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).describe("List of programming languages detected."),
        frameworks: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).describe("List of frameworks and libraries detected."),
        tools: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).describe("List of build tools, linters, etc."),
        packageManager: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("The package manager used (e.g., npm, yarn, pnpm).")
    }),
    complexity: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
        score: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number().min(1).max(10).describe("Complexity score from 1-10."),
        analysis: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("Explanation of the complexity score."),
        metrics: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
            totalFiles: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number(),
            totalLines: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number(),
            avgLinesPerFile: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number()
        })
    }),
    architecture: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("A Mermaid.js graph TD diagram string representing the high-level architecture. Do NOT include markdown code blocks (```mermaid), just the diagram code."),
    errors: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
        file: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string(),
        line: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number(),
        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string(),
        message: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string(),
        severity: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()
    })).describe("List of potential errors or bugs found."),
    warnings: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
        file: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string(),
        line: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number(),
        type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string(),
        message: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string(),
        severity: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()
    })).describe("List of code quality warnings."),
    packages: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
        outdated: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
            name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string(),
            current: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string(),
            latest: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string(),
            status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()
        })).describe("List of potentially outdated packages (based on common knowledge, not live npm check)."),
        total: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number(),
        dependencies: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()),
        devDependencies: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].record(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string())
    }),
    fileAnalysis: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
        path: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string(),
        language: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string(),
        lines: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number(),
        size: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].number(),
        purpose: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("The specific purpose of this file."),
        keyFeatures: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()).describe("Key features or functions implemented in this file."),
        preview: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string().describe("A short snippet of the code (first few lines or relevant part).")
    })).describe("Detailed analysis of the most important files (limit to top 10-15)."),
    qualityAnalysis: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].object({
        category: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string(),
        issue: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string(),
        recommendation: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string(),
        priority: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$genkit$2f$lib$2f$common$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["z"].string()
    })).describe("Actionable recommendations for code quality, security, etc.")
});
async function analyzeCodebase(files) {
    // Prepare the context from files
    // Limit context size if necessary, but Gemini 1.5 Flash has a large window.
    // We'll prioritize package.json, README, and source files.
    const fileContext = files.map((f)=>`File: ${f.path}\nContent:\n${f.content}\n---`).join("\n");
    const prompt = `
    Analyze the following codebase and provide a detailed report.
    
    Focus on:
    1. Understanding the overall purpose and architecture.
    2. Identifying the tech stack.
    3. Assessing code quality and complexity.
    4. Generating a Mermaid.js diagram for the architecture.
    5. Providing a file-by-file breakdown of the most significant files.
    6. Identifying potential errors, warnings, and security issues.
    
    Files provided:
    ${fileContext}
    `;
    try {
        const { output } = await ai.generate({
            prompt: prompt,
            output: {
                schema: AnalysisSchema
            }
        });
        if (!output) {
            throw new Error("Failed to generate analysis");
        }
        return output;
    } catch (error) {
        console.error("Genkit analysis error:", error);
        throw error;
    }
}
async function chatWithCodebase(history, message, context) {
    const historyText = history.map((h)=>`${h.role === 'user' ? 'User' : 'Model'}: ${h.content}`).join('\n');
    const chatPrompt = `
    You are CodeSonar, an expert AI code analyst.
    You have analyzed a codebase and here is the context summary:
    ${context}

    History of conversation:
    ${historyText}

    Answer the user's question based on this context.
    Be helpful, specific, and technical.
    If you need to reference specific files or code, do so.
    
    User Question: ${message}
    `;
    try {
        const { text } = await ai.generate({
            prompt: chatPrompt
        });
        return text;
    } catch (error) {
        console.error("Chat error:", error);
        return "I'm sorry, I encountered an error while processing your request.";
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
                // In the client, we send a JSON body for now because the `type` and `value` structure is used.
                // However, for real file uploads, we should ideally use FormData.
                // But looking at the frontend code (Hero.tsx -> page.tsx), it sends JSON: { type, value }.
                // If 'value' is the file content (text), we can just use it.
                // If the frontend is waiting for an update to send FormData, we should check that.
                // Based on the 'Hero' component behavior (which I haven't seen deep inside but page.tsx handles handleAnalyze),
                // page.tsx sends JSON.
                // Let's assume 'value' is the file content for a single file upload for MVP.
                // Or if we want to support multiple files/zip, we need to change frontend to send FormData.
                // Given the prompt "complete the rest of the backend", I'll stick to the current JSON contract if possible,
                // but a real "upload" usually implies FormData.
                // Let's look at page.tsx again:
                // const handleAnalyze = async (type: "url" | "file", value: string) => { ... JSON.stringify({ type, value }) ... }
                // So the frontend sends the content as a string in 'value'.
                // We can simply wrap this in a file object.
                files = [
                    {
                        path: "uploaded-file.txt",
                        content: value
                    }
                ];
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

//# sourceMappingURL=%5Broot-of-the-server%5D__1baf093e._.js.map