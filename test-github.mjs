import { Octokit } from "octokit";

async function testGithub() {
    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN || "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",
    });

    try {
        const { data } = await octokit.request("GET /repos/Rohanranga/Google_Clone_App");
        console.log("Success:", data.default_branch);
    } catch (e) {
        console.error("GitHub Error:", e.status, e.message);
    }
}
testGithub();
