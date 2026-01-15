/**
 * Simple, guaranteed-to-work architecture diagram generator
 */

export function generateSimpleArchitectureDiagram(files: Array<{ path: string; content: string }>): string {
    // Detect project type
    const hasReact = files.some(f => f.content.includes('react'));
    const hasNext = files.some(f => f.path.includes('next.config') || f.content.includes('next/'));
    const hasAPI = files.some(f => f.path.includes('/api/'));

    // Generate simple Mermaid diagram
    let diagram = 'graph TD\n';

    if (hasNext) {
        diagram += '    A["App"] --> B["Pages"]\n';
        diagram += '    A --> C["Components"]\n';
        if (hasAPI) {
            diagram += '    A --> D["API"]\n';
            diagram += '    B --> D\n';
        }
        diagram += '    B --> C\n';
    } else if (hasReact) {
        diagram += '    A["App"] --> B["Components"]\n';
        diagram += '    A --> C["Utils"]\n';
        diagram += '    B --> C\n';
    } else {
        diagram += '    A["Project"] --> B["Source"]\n';
        diagram += '    A --> C["Config"]\n';
        diagram += '    B --> C\n';
    }

    return diagram;
}
