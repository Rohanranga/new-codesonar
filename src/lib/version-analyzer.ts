/**
 * Package version analyzer
 * Extracts version information from package.json and determines if packages are outdated
 */

export interface PackageInfo {
    name: string;
    current: string;
    latest: string;
    status: 'latest' | 'outdated' | 'unknown';
    type: 'dependency' | 'devDependency' | 'framework' | 'language';
}

/**
 * Analyzes package.json to extract version information
 */
export function analyzePackageVersions(files: Array<{ path: string; content: string }>): PackageInfo[] {
    const packages: PackageInfo[] = [];

    // Find package.json
    const packageJsonFile = files.find(f => f.path.endsWith('package.json'));

    if (packageJsonFile) {
        try {
            const packageJson = JSON.parse(packageJsonFile.content);

            // Extract dependencies
            const dependencies = packageJson.dependencies || {};
            const devDependencies = packageJson.devDependencies || {};

            // Process regular dependencies
            Object.entries(dependencies).forEach(([name, version]) => {
                packages.push({
                    name,
                    current: cleanVersion(version as string),
                    latest: getLatestVersionHint(name),
                    status: 'unknown', // We'll mark as unknown since we can't fetch real-time data
                    type: 'dependency'
                });
            });

            // Process dev dependencies (limit to important ones)
            const importantDevDeps = ['typescript', 'eslint', 'prettier', 'jest', 'vitest', '@types/node', '@types/react'];
            Object.entries(devDependencies).forEach(([name, version]) => {
                if (importantDevDeps.some(dep => name.includes(dep))) {
                    packages.push({
                        name,
                        current: cleanVersion(version as string),
                        latest: getLatestVersionHint(name),
                        status: 'unknown',
                        type: 'devDependency'
                    });
                }
            });
        } catch (error) {
            console.error('Error parsing package.json:', error);
        }
    }

    // Detect languages and frameworks from file extensions
    const detectedTech = detectTechnologies(files);
    packages.push(...detectedTech);

    return packages;
}

/**
 * Cleans version string (removes ^, ~, etc.)
 */
function cleanVersion(version: string): string {
    return version.replace(/[\^~>=<]/g, '').trim();
}

/**
 * Provides hints about latest versions for common packages
 * Note: In a real application, you'd fetch this from npm registry API
 */
function getLatestVersionHint(packageName: string): string {
    // Common package latest versions (as of 2024)
    const knownVersions: Record<string, string> = {
        'react': '18.3.1',
        'react-dom': '18.3.1',
        'next': '15.1.0',
        'typescript': '5.7.2',
        'tailwindcss': '3.4.1',
        '@types/react': '18.3.12',
        '@types/node': '22.10.2',
        'eslint': '9.17.0',
        'framer-motion': '11.15.0',
        'lucide-react': '0.468.0',
        'axios': '1.7.9',
        'express': '4.21.2',
        'vue': '3.5.13',
        'svelte': '5.15.1',
        'angular': '19.1.3',
        'prisma': '6.2.1',
        'zod': '3.24.1',
        'vite': '6.0.7',
        'webpack': '5.97.1'
    };

    return knownVersions[packageName] || '-';
}

/**
 * Detects technologies from file extensions and content
 */
function detectTechnologies(files: Array<{ path: string; content: string }>): PackageInfo[] {
    const technologies: PackageInfo[] = [];
    const detectedLangs = new Set<string>();
    const detectedFrameworks = new Set<string>();

    files.forEach(file => {
        // Detect languages
        if (file.path.endsWith('.ts') || file.path.endsWith('.tsx')) {
            detectedLangs.add('TypeScript');
        }
        if (file.path.endsWith('.js') || file.path.endsWith('.jsx')) {
            detectedLangs.add('JavaScript');
        }
        if (file.path.endsWith('.py')) {
            detectedLangs.add('Python');
        }
        if (file.path.endsWith('.go')) {
            detectedLangs.add('Go');
        }
        if (file.path.endsWith('.rs')) {
            detectedLangs.add('Rust');
        }
        if (file.path.endsWith('.java')) {
            detectedLangs.add('Java');
        }
        if (file.path.endsWith('.css') || file.path.endsWith('.scss')) {
            detectedLangs.add('CSS');
        }

        // Detect frameworks from imports
        if (file.content.includes('from "react"') || file.content.includes("from 'react'")) {
            detectedFrameworks.add('React');
        }
        if (file.content.includes('from "next') || file.content.includes("from 'next")) {
            detectedFrameworks.add('Next.js');
        }
        if (file.content.includes('from "vue"') || file.content.includes("from 'vue'")) {
            detectedFrameworks.add('Vue.js');
        }
        if (file.content.includes('tailwindcss') || file.content.includes('tailwind')) {
            detectedFrameworks.add('Tailwind CSS');
        }
        if (file.content.includes('framer-motion')) {
            detectedFrameworks.add('Framer Motion');
        }
    });

    // Add detected languages
    detectedLangs.forEach(lang => {
        technologies.push({
            name: lang,
            current: 'Detected',
            latest: '-',
            status: 'unknown',
            type: 'language'
        });
    });

    // Add detected frameworks
    detectedFrameworks.forEach(framework => {
        technologies.push({
            name: framework,
            current: 'Active',
            latest: '-',
            status: 'unknown',
            type: 'framework'
        });
    });

    return technologies;
}

/**
 * Compares version strings to determine if a package is outdated
 */
export function compareVersions(current: string, latest: string): 'latest' | 'outdated' | 'unknown' {
    if (latest === '-' || current === 'Detected' || current === 'Active') {
        return 'unknown';
    }

    try {
        const currentParts = current.split('.').map(Number);
        const latestParts = latest.split('.').map(Number);

        // Compare major version
        if (currentParts[0] < latestParts[0]) return 'outdated';
        if (currentParts[0] > latestParts[0]) return 'latest';

        // Compare minor version
        if (currentParts[1] < latestParts[1]) return 'outdated';
        if (currentParts[1] > latestParts[1]) return 'latest';

        // Compare patch version
        if (currentParts[2] < latestParts[2]) return 'outdated';

        return 'latest';
    } catch (error) {
        return 'unknown';
    }
}
