const { Octokit } = require("octokit");

async function testGithub() {
    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN || "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",
    });

    try {
        const { data } = await octokit.request("GET /repos/Rohanranga/Google_Clone_App");
        console.log("Success:", data.default_branch);
    } catch (e) {
        console.error("GitHub Error:", e.status);
    }
}
testGithub();
