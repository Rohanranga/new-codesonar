const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || "AIzaSyARyDoyUuI07BEbtPM6-78JAesOFalQ3Pk");
    try {
        // Just try to generate with a fallback to see if *any* works.
        // But listing is not directly available on client usually? 
        // SDK has: genAI.getGenerativeModel...
        // We can't list models easily with this SDK client-side auth pattern sometimes.
        // Let's just try 'gemini-1.5-flash' again but maybe print full error.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("test");
        console.log(result.response.text());
    } catch (e) {
        console.log(JSON.stringify(e, null, 2));
    }
}
listModels();
