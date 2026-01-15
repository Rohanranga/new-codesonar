// Test Mermaid diagram generation
const testDiagram = `graph TD
    App["Next.js App"] --> Pages["Pages"]
    App --> Components["Components"]
    Pages --> Components`;

console.log("Test Mermaid Diagram:");
console.log(testDiagram);
console.log("\nThis should be valid Mermaid syntax.");
console.log("Copy and paste this into https://mermaid.live to verify.");
