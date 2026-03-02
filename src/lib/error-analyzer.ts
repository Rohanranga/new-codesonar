/**
 * Error and warning analyzer
 * Detects common issues in code
 */

export function analyzeCodeForErrors(files: { path: string; content: string }[]) {
    // Use Maps to deduplicate and count occurrences
    const errorMap = new Map<string, any>();
    const warningMap = new Map<string, any>();

    const addError = (error: any) => {
        // Create a unique key based on message and type (ignoring line number for aggregation)
        const key = `${error.type}:${error.message}`;
        if (errorMap.has(key)) {
            errorMap.get(key).count++;
            // Optionally keep track of files/lines if needed, but for now we just count
        } else {
            errorMap.set(key, { ...error, count: 1 });
        }
    };

    const addWarning = (warning: any) => {
        const key = `${warning.type}:${warning.message}`;
        if (warningMap.has(key)) {
            warningMap.get(key).count++;
        } else {
            warningMap.set(key, { ...warning, count: 1 });
        }
    };

    files.forEach(file => {
        const lines = file.content.split('\n');

        lines.forEach((line, index) => {
            const lineNum = index + 1;
            const trimmed = line.trim();

            // Check for console.log
            if (trimmed.includes('console.log') || trimmed.includes('console.error') || trimmed.includes('console.warn')) {
                addWarning({
                    file: file.path,
                    line: lineNum,
                    type: 'Code Quality',
                    message: 'Console statement found',
                    severity: 'warning',
                    suggestion: 'Remove console statements before deploying to production',
                    fixCode: '// Remove this line or use a proper logging library'
                });
            }

            // Check for TODO/FIXME
            if (trimmed.includes('TODO') || trimmed.includes('FIXME')) {
                addWarning({
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
                addError({
                    file: file.path,
                    line: lineNum,
                    type: 'Debug Code',
                    message: 'Debugger statement found',
                    severity: 'error',
                    suggestion: 'Remove debugger statements before committing',
                    fixCode: '// Remove the debugger; statement'
                });
            }

            // Check for var usage
            if (trimmed.startsWith('var ')) {
                addWarning({
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
                addWarning({
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
                addWarning({
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
                    addError({
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

            // Check for missing semicolons
            if (file.path.endsWith('.js') || file.path.endsWith('.ts')) {
                if (trimmed.length > 0 &&
                    !trimmed.endsWith(';') &&
                    !trimmed.endsWith('{') &&
                    !trimmed.endsWith('}') &&
                    !trimmed.startsWith('//') &&
                    !trimmed.startsWith('/*') &&
                    !trimmed.startsWith('*') &&
                    !trimmed.startsWith('import') &&
                    !trimmed.startsWith('export') &&
                    !trimmed.startsWith('case') &&
                    !trimmed.startsWith('default')) { // Added case/default check
                    if (trimmed.includes('=') || trimmed.includes('return')) {
                        addWarning({
                            file: file.path,
                            line: lineNum,
                            type: 'Code Style',
                            message: 'Missing semicolon',
                            severity: 'info',
                            suggestion: 'Add semicolon at the end of the statement'
                        });
                    }
                }
            }

            // Check for long lines
            if (line.length > 120) {
                addWarning({
                    file: file.path,
                    line: lineNum,
                    type: 'Readability',
                    message: `Line too long (>120 chars)`,
                    severity: 'info',
                    suggestion: 'Break long lines into multiple lines'
                });
            }

            // Check for nested ternary
            if ((trimmed.match(/\?/g) || []).length > 1) {
                addWarning({
                    file: file.path,
                    line: lineNum,
                    type: 'Complexity',
                    message: 'Nested ternary operators detected',
                    severity: 'warning',
                    suggestion: 'Consider using if-else statements'
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
                    addWarning({
                        file: file.path,
                        line: 0,
                        type: 'TypeScript',
                        message: 'Function without type annotations',
                        severity: 'warning',
                        suggestion: 'Add type annotations'
                    });
                }
            });
        }

        // Check for large files
        const lineCount = lines.length;
        if (lineCount > 300) {
            addWarning({
                file: file.path,
                line: 0,
                type: 'File Size',
                message: `Large file (${lineCount} lines)`,
                severity: 'warning',
                suggestion: 'Consider breaking this file into smaller modules'
            });
        }
    });

    // Flatten maps to arrays
    const finalizeIssues = (map: Map<string, any>) => {
        return Array.from(map.values()).map(item => ({
            ...item,
            message: item.count > 1 ? `${item.message} (${item.count} occurrences)` : item.message
        }));
    };

    const errors = finalizeIssues(errorMap);
    const warnings = finalizeIssues(warningMap);

    // Limit results
    const MAX_ERRORS = 50;
    const MAX_WARNINGS = 100;

    return {
        errors: errors.slice(0, MAX_ERRORS),
        warnings: warnings.slice(0, MAX_WARNINGS)
    };
}
