/**
 * Line-by-line code explanation generator for beginners
 * Explains code in simple, beginner-friendly terms
 */

export function generateLineByLineExplanation(file: { path: string; content: string }): string {
    const lines = file.content.split('\n');
    let explanation = `## 📄 What is this file?\n\n`;

    // File type identification
    const isConfig = file.path.endsWith('.json') || file.path.includes('config');
    const isMarkdown = file.path.endsWith('.md');
    const isTypeScript = file.path.endsWith('.ts') || file.path.endsWith('.tsx');
    const isJavaScript = file.path.endsWith('.js') || file.path.endsWith('.jsx');
    const isReact = file.content.includes('import React') || file.content.includes('from "react"') || file.content.includes("from 'react'");

    if (isConfig) {
        explanation += `This is a **Configuration File** that stores settings and data for the application.\n\n`;
    } else if (isMarkdown) {
        explanation += `This is a **Documentation File** written in Markdown format to explain the project.\n\n`;
    } else if (isReact) {
        explanation += `This is a **React Component** - a reusable piece of user interface.\n\n`;
    } else if (isTypeScript || isJavaScript) {
        explanation += `This is a **${isTypeScript ? 'TypeScript' : 'JavaScript'} File** containing code logic.\n\n`;
    }

    explanation += `## 📖 Code Explanation\n\n`;
    explanation += `Here's what this code does:\n\n`;

    // For JSON files
    if (isConfig && file.path.endsWith('.json')) {
        try {
            const jsonData = JSON.parse(file.content);
            explanation += `This JSON file contains structured data:\n\n`;

            Object.keys(jsonData).slice(0, 10).forEach(key => {
                explanation += `- **\`${key}\`**: `;
                if (key === 'name') explanation += `The project name\n`;
                else if (key === 'version') explanation += `The version number\n`;
                else if (key === 'dependencies') explanation += `External packages this project needs\n`;
                else if (key === 'scripts') explanation += `Commands you can run (like npm run dev)\n`;
                else explanation += `${typeof jsonData[key]}\n`;
            });
        } catch (e) {
            explanation += `This appears to be a configuration file.\n`;
        }
        return explanation;
    }

    // For Markdown files
    if (isMarkdown) {
        explanation += `This is documentation that explains:\n`;
        explanation += `- How to use the project\n`;
        explanation += `- Installation instructions\n`;
        explanation += `- Features and examples\n`;
        return explanation;
    }

    // For code files, analyze key elements
    let importCount = 0;
    let functionCount = 0;
    let componentCount = 0;

    // Analyze imports
    const imports = lines.filter(l => l.trim().startsWith('import '));
    if (imports.length > 0) {
        explanation += `### 📦 Imports (${imports.length})\n\n`;
        imports.slice(0, 10).forEach(imp => {
            const match = imp.match(/from ['"](.+?)['"]/);
            if (match) {
                const source = match[1];
                if (source === 'react') {
                    explanation += `- Imports React library for building UI\n`;
                } else if (source.startsWith('./') || source.startsWith('@/')) {
                    explanation += `- Imports code from another file in this project\n`;
                } else {
                    explanation += `- Imports \`${source}\` library\n`;
                }
            }
        });
        explanation += `\n`;
    }

    // Analyze functions
    const functions = lines.filter(l => {
        const t = l.trim();
        return t.startsWith('function ') || t.startsWith('export function ') ||
            t.startsWith('const ') && t.includes('= (') || t.includes('=> ');
    });

    if (functions.length > 0) {
        explanation += `### ⚙️ Functions (${functions.length})\n\n`;
        explanation += `This file contains ${functions.length} function(s) that perform specific tasks.\n\n`;
    }

    // Analyze React components
    if (isReact) {
        const hasUseState = file.content.includes('useState');
        const hasUseEffect = file.content.includes('useEffect');

        explanation += `### ⚛️ React Features\n\n`;
        if (hasUseState) explanation += `- Uses **useState** to manage changing data\n`;
        if (hasUseEffect) explanation += `- Uses **useEffect** to run code when component loads\n`;
        explanation += `\n`;
    }

    // Summary
    explanation += `### 📝 Summary\n\n`;
    explanation += `This file is part of a ${isReact ? 'React' : isTypeScript ? 'TypeScript' : 'JavaScript'} project. `;
    explanation += `It ${imports.length > 0 ? 'imports ' + imports.length + ' dependencies and ' : ''}`;
    explanation += `contains ${functions.length} function(s) to handle the application logic.\n`;

    return explanation;
}
