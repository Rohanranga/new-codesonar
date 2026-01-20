/**
 * Enhanced line-by-line code explanation generator
 * Provides COMPREHENSIVE, DETAILED explanations for beginners
 */

export function generateLineByLineExplanation(file: { path: string; content: string }): string {
    const lines = file.content.split('\n');
    let explanation = `# 📄 Complete Code Analysis\n\n`;

    // File type identification
    const isConfig = file.path.endsWith('.json') || file.path.includes('config');
    const isMarkdown = file.path.endsWith('.md');
    const isTypeScript = file.path.endsWith('.ts') || file.path.endsWith('.tsx');
    const isJavaScript = file.path.endsWith('.js') || file.path.endsWith('.jsx');
    const isCSS = file.path.endsWith('.css') || file.path.endsWith('.scss');
    const isReact = file.content.includes('import React') || file.content.includes('from "react"') || file.content.includes("from 'react'");

    // File overview
    explanation += `## 🎯 File Overview\n\n`;
    explanation += `**File:** \`${file.path}\`\n`;
    explanation += `**Type:** `;

    if (isConfig) {
        explanation += `Configuration File\n`;
        explanation += `**Purpose:** Stores settings and configuration data for the application\n\n`;
    } else if (isMarkdown) {
        explanation += `Documentation File\n`;
        explanation += `**Purpose:** Contains documentation, instructions, or explanations in Markdown format\n\n`;
    } else if (isReact) {
        explanation += `React Component\n`;
        explanation += `**Purpose:** A reusable UI component that renders part of the user interface\n\n`;
    } else if (isTypeScript || isJavaScript) {
        explanation += `${isTypeScript ? 'TypeScript' : 'JavaScript'} Module\n`;
        explanation += `**Purpose:** Contains code logic and functionality\n\n`;
    } else if (isCSS) {
        explanation += `Stylesheet\n`;
        explanation += `**Purpose:** Defines visual styling (colors, layouts, animations)\n\n`;
    }

    // For JSON files
    if (isConfig && file.path.endsWith('.json')) {
        try {
            const jsonData = JSON.parse(file.content);
            explanation += `## 📦 Configuration Structure\n\n`;
            explanation += `This JSON file contains ${Object.keys(jsonData).length} configuration sections:\n\n`;

            Object.keys(jsonData).forEach((key, index) => {
                const value = jsonData[key];
                explanation += `### ${index + 1}. \`${key}\`\n\n`;

                if (key === 'name') {
                    explanation += `- **What it is:** The project/package name\n`;
                    explanation += `- **Value:** "${value}"\n`;
                    explanation += `- **Why it matters:** Identifies this project uniquely\n\n`;
                } else if (key === 'version') {
                    explanation += `- **What it is:** Current version number\n`;
                    explanation += `- **Value:** ${value}\n`;
                    explanation += `- **Format:** Usually follows semantic versioning (MAJOR.MINOR.PATCH)\n\n`;
                } else if (key === 'dependencies') {
                    explanation += `- **What it is:** External packages this project needs to run\n`;
                    explanation += `- **Count:** ${Object.keys(value).length} dependencies\n`;
                    explanation += `- **Why it matters:** These must be installed for the app to work\n\n`;
                } else if (key === 'devDependencies') {
                    explanation += `- **What it is:** Packages needed only during development\n`;
                    explanation += `- **Count:** ${Object.keys(value).length} dev dependencies\n`;
                    explanation += `- **Why it matters:** Used for building, testing, and development\n\n`;
                } else if (key === 'scripts') {
                    explanation += `- **What it is:** Commands you can run with npm/yarn\n`;
                    explanation += `- **Available commands:** ${Object.keys(value).length}\n`;
                    explanation += `- **Usage:** Run with \`npm run <script-name>\`\n\n`;
                } else {
                    explanation += `- **Type:** ${typeof value}\n`;
                    if (typeof value === 'object' && value !== null) {
                        explanation += `- **Contains:** ${Object.keys(value).length} items\n\n`;
                    } else {
                        explanation += `- **Value:** ${JSON.stringify(value).substring(0, 100)}\n\n`;
                    }
                }
            });
        } catch (e) {
            explanation += `This appears to be a configuration file with structured data.\n\n`;
        }
        return explanation;
    }

    // For Markdown files
    if (isMarkdown) {
        explanation += `## 📝 Documentation Content\n\n`;
        explanation += `This Markdown file contains:\n\n`;

        const hasHeaders = file.content.includes('#');
        const hasLinks = file.content.includes('[') && file.content.includes('](');
        const hasCode = file.content.includes('```');
        const hasLists = file.content.includes('- ') || file.content.includes('* ');

        if (hasHeaders) explanation += `- ✅ **Headers** - Organized sections and titles\n`;
        if (hasLinks) explanation += `- ✅ **Links** - References to other resources\n`;
        if (hasCode) explanation += `- ✅ **Code blocks** - Example code snippets\n`;
        if (hasLists) explanation += `- ✅ **Lists** - Organized information\n`;

        explanation += `\n**Purpose:** Documentation to help users understand and use the project\n\n`;
        return explanation;
    }

    // For code files - DETAILED ANALYSIS
    explanation += `## 🔍 Detailed Code Analysis\n\n`;

    // Analyze imports
    const imports = lines.filter(l => l.trim().startsWith('import '));
    if (imports.length > 0) {
        explanation += `### 📦 Imports (${imports.length} total)\n\n`;
        explanation += `This file imports ${imports.length} external dependencies:\n\n`;

        imports.forEach((imp, index) => {
            const match = imp.match(/import\s+(.+?)\s+from\s+['"](.+?)['"]/);
            if (match) {
                const [, imports, source] = match;
                explanation += `**${index + 1}. Import from \`${source}\`**\n`;
                explanation += `   - **What's imported:** \`${imports.trim()}\`\n`;

                if (source === 'react') {
                    explanation += `   - **Purpose:** Core React library for building user interfaces\n`;
                    explanation += `   - **Why needed:** Provides essential React functionality\n`;
                } else if (source.startsWith('./') || source.startsWith('../')) {
                    explanation += `   - **Purpose:** Local file from this project\n`;
                    explanation += `   - **Type:** Internal module/component\n`;
                } else if (source.startsWith('@/')) {
                    explanation += `   - **Purpose:** Project file using path alias\n`;
                    explanation += `   - **Type:** Internal module (@ is a shortcut to src/)\n`;
                } else {
                    explanation += `   - **Purpose:** External npm package\n`;
                    explanation += `   - **Type:** Third-party library\n`;
                }
                explanation += `\n`;
            }
        });
    }

    // Analyze functions
    const functionLines = lines.filter((l, i) => {
        const t = l.trim();
        return t.startsWith('function ') || t.startsWith('export function ') ||
            t.startsWith('async function ') || (t.startsWith('const ') && t.includes('= (')) ||
            (t.startsWith('export const ') && t.includes('= ('));
    });

    if (functionLines.length > 0) {
        explanation += `### ⚙️ Functions (${functionLines.length} total)\n\n`;
        explanation += `This file defines ${functionLines.length} function(s):\n\n`;

        functionLines.forEach((line, index) => {
            const funcMatch = line.match(/(?:export\s+)?(?:async\s+)?(?:function|const)\s+(\w+)/);
            if (funcMatch) {
                const funcName = funcMatch[1];
                explanation += `**${index + 1}. \`${funcName}()\`**\n`;

                if (line.includes('async')) {
                    explanation += `   - **Type:** Async function (handles asynchronous operations)\n`;
                    explanation += `   - **Behavior:** Can use \`await\` to wait for promises\n`;
                    explanation += `   - **Use case:** API calls, file operations, delays\n`;
                } else if (line.includes('export')) {
                    explanation += `   - **Type:** Exported function\n`;
                    explanation += `   - **Visibility:** Can be imported and used in other files\n`;
                    explanation += `   - **Purpose:** Shared functionality\n`;
                } else {
                    explanation += `   - **Type:** Regular function\n`;
                    explanation += `   - **Visibility:** Private to this file\n`;
                    explanation += `   - **Purpose:** Internal helper function\n`;
                }

                if (line.includes('=> {')) {
                    explanation += `   - **Syntax:** Arrow function (modern ES6 syntax)\n`;
                }

                explanation += `\n`;
            }
        });
    }

    // Analyze React hooks
    if (isReact) {
        explanation += `### ⚛️ React Features\n\n`;

        const hasUseState = file.content.includes('useState');
        const hasUseEffect = file.content.includes('useEffect');
        const hasUseContext = file.content.includes('useContext');
        const hasUseRef = file.content.includes('useRef');
        const hasUseMemo = file.content.includes('useMemo');
        const hasUseCallback = file.content.includes('useCallback');

        if (hasUseState) {
            explanation += `**useState Hook**\n`;
            explanation += `- **Purpose:** Manages component state (data that can change)\n`;
            explanation += `- **How it works:** Returns [currentValue, setterFunction]\n`;
            explanation += `- **Example:** \`const [count, setCount] = useState(0)\`\n`;
            explanation += `- **When to use:** When you need data that triggers re-renders\n\n`;
        }

        if (hasUseEffect) {
            explanation += `**useEffect Hook**\n`;
            explanation += `- **Purpose:** Runs code when component mounts/updates\n`;
            explanation += `- **How it works:** Executes side effects (API calls, subscriptions)\n`;
            explanation += `- **Timing:** After render completes\n`;
            explanation += `- **When to use:** Data fetching, subscriptions, manual DOM updates\n\n`;
        }

        if (hasUseContext) {
            explanation += `**useContext Hook**\n`;
            explanation += `- **Purpose:** Accesses global/shared state\n`;
            explanation += `- **How it works:** Reads values from React Context\n`;
            explanation += `- **Benefit:** Avoids prop drilling\n\n`;
        }

        if (hasUseRef) {
            explanation += `**useRef Hook**\n`;
            explanation += `- **Purpose:** Creates a mutable reference that persists\n`;
            explanation += `- **Common uses:** DOM element references, storing values without re-render\n\n`;
        }

        if (hasUseMemo) {
            explanation += `**useMemo Hook**\n`;
            explanation += `- **Purpose:** Memoizes expensive calculations\n`;
            explanation += `- **Benefit:** Performance optimization\n\n`;
        }

        if (hasUseCallback) {
            explanation += `**useCallback Hook**\n`;
            explanation += `- **Purpose:** Memoizes function references\n`;
            explanation += `- **Benefit:** Prevents unnecessary re-renders\n\n`;
        }
    }

    // Analyze variables
    const varLines = lines.filter(l => {
        const t = l.trim();
        return t.startsWith('const ') || t.startsWith('let ') || t.startsWith('var ');
    });

    if (varLines.length > 0) {
        explanation += `### 📊 Variables (${varLines.length} total)\n\n`;

        varLines.slice(0, 10).forEach((line, index) => {
            const varMatch = line.match(/(const|let|var)\s+(\w+)/);
            if (varMatch) {
                const [, keyword, varName] = varMatch;
                explanation += `**${index + 1}. \`${varName}\`**\n`;

                if (keyword === 'const') {
                    explanation += `   - **Type:** Constant (cannot be reassigned)\n`;
                    explanation += `   - **Best practice:** Use for values that won't change\n`;
                } else if (keyword === 'let') {
                    explanation += `   - **Type:** Variable (can be reassigned)\n`;
                    explanation += `   - **Scope:** Block-scoped\n`;
                } else {
                    explanation += `   - **Type:** Variable (old syntax, avoid using)\n`;
                    explanation += `   - **Scope:** Function-scoped\n`;
                }

                if (line.includes('= []')) {
                    explanation += `   - **Initial value:** Empty array\n`;
                } else if (line.includes('= {}')) {
                    explanation += `   - **Initial value:** Empty object\n`;
                } else if (line.includes('useState')) {
                    explanation += `   - **Initial value:** React state\n`;
                }

                explanation += `\n`;
            }
        });

        if (varLines.length > 10) {
            explanation += `*...and ${varLines.length - 10} more variables*\n\n`;
        }
    }

    // Code patterns
    explanation += `### 🎨 Code Patterns\n\n`;

    const hasAsyncAwait = file.content.includes('async') && file.content.includes('await');
    const hasPromises = file.content.includes('.then(') || file.content.includes('.catch(');
    const hasArrowFunctions = file.content.includes('=>');
    const hasDestructuring = file.content.includes('const {') || file.content.includes('const [');
    const hasSpreadOperator = file.content.includes('...');
    const hasTemplateStrings = file.content.includes('`');

    if (hasAsyncAwait) {
        explanation += `**Async/Await Pattern**\n`;
        explanation += `- Modern way to handle asynchronous operations\n`;
        explanation += `- Makes async code look synchronous\n`;
        explanation += `- Easier to read than promises\n\n`;
    }

    if (hasPromises) {
        explanation += `**Promise Pattern**\n`;
        explanation += `- Handles asynchronous operations\n`;
        explanation += `- Uses .then() for success, .catch() for errors\n\n`;
    }

    if (hasArrowFunctions) {
        explanation += `**Arrow Functions**\n`;
        explanation += `- Modern ES6 syntax: \`() => {}\`\n`;
        explanation += `- Shorter syntax than traditional functions\n`;
        explanation += `- Lexical 'this' binding\n\n`;
    }

    if (hasDestructuring) {
        explanation += `**Destructuring**\n`;
        explanation += `- Extracts values from objects/arrays\n`;
        explanation += `- Example: \`const { name, age } = person\`\n`;
        explanation += `- Makes code cleaner and more readable\n\n`;
    }

    if (hasSpreadOperator) {
        explanation += `**Spread Operator (...)**\n`;
        explanation += `- Expands arrays/objects\n`;
        explanation += `- Used for copying, merging, or passing arguments\n\n`;
    }

    if (hasTemplateStrings) {
        explanation += `**Template Literals**\n`;
        explanation += `- String interpolation with backticks\n`;
        explanation += `- Example: \`Hello \${name}\`\n`;
        explanation += `- Supports multi-line strings\n\n`;
    }

    // Summary
    explanation += `## 📝 Summary\n\n`;
    explanation += `This ${isReact ? 'React component' : isTypeScript ? 'TypeScript' : 'JavaScript'} file:\n\n`;
    explanation += `- **Imports:** ${imports.length} dependencies\n`;
    explanation += `- **Functions:** ${functionLines.length} defined\n`;
    explanation += `- **Variables:** ${varLines.length} declared\n`;
    explanation += `- **Lines of code:** ${lines.length}\n`;
    explanation += `- **Complexity:** ${lines.length > 200 ? 'High' : lines.length > 100 ? 'Medium' : 'Low'}\n\n`;

    if (isReact) {
        explanation += `**React Component Purpose:**\n`;
        explanation += `This component is a reusable piece of UI that can be rendered in the application. `;
        explanation += `It manages its own state and lifecycle, and can receive data through props.\n`;
    }

    return explanation;
}
