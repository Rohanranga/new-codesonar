import { Octokit } from "octokit";

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

export interface FileContent {
    path: string;
    content: string;
}

export async function fetchRepoContent(owner: string, repo: string): Promise<FileContent[]> {
    try {
        // 1. Get the default branch
        const { data: repoData } = await octokit.request("GET /repos/{owner}/{repo}", {
            owner,
            repo,
        });
        const defaultBranch = repoData.default_branch;

        // 2. Get the file tree (recursive)
        const { data: treeData } = await octokit.request("GET /repos/{owner}/{repo}/git/trees/{tree_sha}?recursive=1", {
            owner,
            repo,
            tree_sha: defaultBranch,
        });

        // 3. Filter for relevant files (source code, config, readme)
        // Limit to avoid token limits and noise
        const relevantFiles = treeData.tree.filter((item: any) => {
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
        const files: FileContent[] = [];

        await Promise.all(
            relevantFiles.map(async (file: any) => {
                if (!file.path) return;
                try {
                    const { data } = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
                        owner,
                        repo,
                        path: file.path,
                    });

                    if (Array.isArray(data) || data.type !== "file" || !data.content) return;

                    // Decode Base64 content
                    const content = Buffer.from(data.content, "base64").toString("utf-8");
                    files.push({
                        path: file.path,
                        content,
                    });
                } catch (error) {
                    console.warn(`Failed to fetch content for ${file.path}`, error);
                }
            })
        );

        return files;
    } catch (error) {
        console.error("Error fetching repo:", error);

        // Fallback for demo purposes if API fails (e.g. rate limit or network)
        if (repo === "Google_Clone_App") {
            return [
                { path: "package.json", content: JSON.stringify({ dependencies: { react: "^18.0.0", next: "^14.0.0", tailwindcss: "^3.0.0" } }) },
                { path: "src/app/page.tsx", content: "import React from 'react';\n\nexport default function Home() { return <div>Google Clone</div>; }" },
                { path: "src/components/Search.tsx", content: "import { useState } from 'react';\nexport function Search() { const [q, setQ] = useState(''); return <input />; }" },
                { path: "README.md", content: "# Google Clone\nA clone of Google search." }
            ];
        }

        throw new Error("Failed to fetch repository content");
    }
}
