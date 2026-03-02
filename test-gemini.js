const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
    try {
        const apiKey = process.env.GOOGLE_GENAI_API_KEY || "AIzaSyBvjH534TGHT_MHLTmEmY8UmicPv6jwnfo";
        // console.log("Using Key:", apiKey); // Security risk to log, but good for local debug if needed.

        // Fetch available models
        // Note: The SDK doesn't have a direct listModels on the client instance in some versions, 
        // strictly speaking it's on the GoogleAIFileManager or via REST. 
        // But let's try a simple generation with a fallback model.

        const models = ["gemini-pro"];

        for (const modelName of models) {
            try {
                console.log(`\nTesting model: ${modelName}...`);
                const genAI = new GoogleGenerativeAI(apiKey);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Test");
                console.log(`✅ Success with ${modelName}:`, (await result.response).text().slice(0, 50));
                return; // Exit on first success
            } catch (e) {
                console.log(`❌ Failed ${modelName}: ${e.status || e.message}`);
            }
        }
        console.error("\nAll models failed.");
    } catch (error) {
        console.error("Global Error:", error);
    }
}

testGemini();
