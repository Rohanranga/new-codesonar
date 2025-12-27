const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY || "AIzaSyARyDoyUuI07BEbtPM6-78JAesOFalQ3Pk"); // Hardcoding for test script safely
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = "Analyze this code: console.log('Hello World')";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("Success:", text);
    } catch (error) {
        console.error("Gemini Error:", error);
    }
}

testGemini();
