/**
 * Error and warning analyzer
 * Detects common issues in code
 */

export function analyzeCodeForErrors(files: { path: string; content: string }[]) {
    const errors: Array<{
        file: string;
        line: number;
        type: string;
        message: string;
        severity: string;
        suggestion?: string;
        fixCode?: string;
    }> = [];

    const warnings: Array<{
        file: string;
        line: number;
        type: string;
        message: string;
        severity: string;
        suggestion?: string;
        fixCode?: string;
    }> = [];

    files.forEach(file => {
        const lines = file.content.split('\n');

        lines.forEach((line, index) => {
            const lineNum = index + 1;
            const trimmed = line.trim();

            // Check for console.log (should be removed in production)
            if (trimmed.includes('console.log') || trimmed.includes('console.error') || trimmed.includes('console.warn')) {
                warnings.push({
                    file: file.path,
                    line: lineNum,
                    type: 'Code Quality',
                    message: 'Console statement found',
                    severity: 'warning',
                    suggestion: 'Remove console statements before deploying to production',
                    fixCode: '// Remove this line or use a proper logging library'
                });
            }

            // Check for TODO/FIXME comments
            if (trimmed.includes('TODO') || trimmed.includes('FIXME')) {
                warnings.push({
                    file: file.path,
                    line: lineNum,
                    type: 'Incomplete Code',
                    message: 'TODO/FIXME comment found',
                    severity: 'info',
                    suggestion: 'Complete the implementation or remove the comment'
                });
            }

            // Check for debugger statements
            if (trimmed.includes('debugger')) {
                errors.push({
                    file: file.path,
                    line: lineNum,
                    type: 'Debug Code',
                    message: 'Debugger statement found',
                    severity: 'error',
                    suggestion: 'Remove debugger statements before committing',
                    fixCode: '// Remove the debugger; statement'
                });
            }

            // Check for var usage (should use let/const)
            if (trimmed.startsWith('var ')) {
                warnings.push({
                    file: file.path,
                    line: lineNum,
                    type: 'Modern JavaScript',
                    message: 'Using "var" instead of "let" or "const"',
                    severity: 'warning',
                    suggestion: 'Use "const" for values that don\'t change, "let" for values that do',
                    fixCode: trimmed.replace('var ', 'const ')
                });
            }

            // Check for == instead of ===
            if (trimmed.includes('==') && !trimmed.includes('===') && !trimmed.includes('!==')) {
                warnings.push({
                    file: file.path,
                    line: lineNum,
                    type: 'Type Safety',
                    message: 'Using loose equality (==) instead of strict equality (===)',
                    severity: 'warning',
                    suggestion: 'Use === for strict equality checks',
                    fixCode: trimmed.replace('==', '===')
                });
            }

            // Check for missing error handling in async functions
            if (trimmed.includes('await ') && !file.content.includes('try') && !file.content.includes('catch')) {
                warnings.push({
                    file: file.path,
                    line: lineNum,
                    type: 'Error Handling',
                    message: 'Async operation without try-catch',
                    severity: 'warning',
                    suggestion: 'Wrap async operations in try-catch blocks',
                    fixCode: `try {\n  ${trimmed}\n} catch (error) {\n  console.error(error);\n}`
                });
            }

            // Check for hardcoded API keys or secrets
            const secretPatterns = [
                /api[_-]?key/i,
                /secret/i,
                /password/i,
                /token/i
            ];

            secretPatterns.forEach(pattern => {
                if (pattern.test(trimmed) && trimmed.includes('=') && !trimmed.includes('process.env')) {
                    errors.push({
                        file: file.path,
                        line: lineNum,
                        type: 'Security',
                        message: 'Potential hardcoded secret or API key',
                        severity: 'critical',
                        suggestion: 'Use environment variables instead of hardcoding secrets',
                        fixCode: 'const apiKey = process.env.API_KEY;'
                    });
                }
            });

            // Check for missing semicolons (if not using a formatter)
            if (file.path.endsWith('.js') || file.path.endsWith('.ts')) {
                if (trimmed.length > 0 &&
                    !trimmed.endsWith(';') &&
                    !trimmed.endsWith('{') &&
                    !trimmed.endsWith('}') &&
                    !trimmed.startsWith('//') &&
                    !trimmed.startsWith('/*') &&
                    !trimmed.startsWith('*') &&
                    !trimmed.startsWith('import') &&
                    !trimmed.startsWith('export')) {
                    // This is a soft warning
                    if (trimmed.includes('=') || trimmed.includes('return')) {
                        warnings.push({
                            file: file.path,
                            line: lineNum,
                            type: 'Code Style',
                            message: 'Missing semicolon',
                            severity: 'info',
                            suggestion: 'Add semicolon at the end of the statement (or use a formatter like Prettier)'
                        });
                    }
                }
            }

            // Check for long lines (>120 characters)
            if (line.length > 120) {
                warnings.push({
                    file: file.path,
                    line: lineNum,
                    type: 'Readability',
                    message: `Line too long (${line.length} characters)`,
                    severity: 'info',
                    suggestion: 'Break long lines into multiple lines for better readability'
                });
            }

            // Check for nested ternary operators
            if ((trimmed.match(/\?/g) || []).length > 1) {
                warnings.push({
                    file: file.path,
                    line: lineNum,
                    type: 'Complexity',
                    message: 'Nested ternary operators detected',
                    severity: 'warning',
                    suggestion: 'Consider using if-else statements for better readability'
                });
            }
        });

        // File-level checks
        const content = file.content;

        // Check for missing TypeScript types
        if (file.path.endsWith('.ts') || file.path.endsWith('.tsx')) {
            const functionMatches = content.match(/function\s+\w+\s*\([^)]*\)/g) || [];
            functionMatches.forEach(match => {
                if (!match.includes(':')) {
                    warnings.push({
                        file: file.path,
                        line: 0,
                        type: 'TypeScript',
                        message: 'Function without type annotations',
                        severity: 'warning',
                        suggestion: 'Add type annotations to function parameters and return types'
                    });
                }
            });
        }

        // Check for large files
        const lineCount = lines.length;
        if (lineCount > 300) {
            warnings.push({
                file: file.path,
                line: 0,
                type: 'File Size',
                message: `Large file (${lineCount} lines)`,
                severity: 'warning',
                suggestion: 'Consider breaking this file into smaller, more focused modules'
            });
        }

        // Check for duplicate code (very basic check)
        const codeBlocks = content.split('\n\n');
        const seen = new Set();
        codeBlocks.forEach(block => {
            if (block.trim().length > 50) {
                if (seen.has(block)) {
                    warnings.push({
                        file: file.path,
                        line: 0,
                        type: 'Code Duplication',
                        message: 'Potential duplicate code block detected',
                        severity: 'info',
                        suggestion: 'Extract duplicate code into reusable functions'
                    });
                }
                seen.add(block);
            }
        });
    });

    // Limit results to prevent overwhelming the system
    const MAX_ERRORS = 50;
    const MAX_WARNINGS = 100;

    return {
        errors: errors.slice(0, MAX_ERRORS),
        warnings: warnings.slice(0, MAX_WARNINGS)
    };
}
