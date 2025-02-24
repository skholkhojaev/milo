const { slackNotification } = require('./helpers.js');

const SLACK = {
    merge: ({ html_url, number, title, prefix = '' }) =>
        `:merged: PR merged to stage: ${prefix} <${html_url}|#${number}: ${title}>.`,
};
// Test

function getRepoInfo() {
    const repoFull = process.env.GITHUB_REPOSITORY;
    if (!repoFull) {
        throw new Error("GITHUB_REPOSITORY is not defined in the environment.");
    }
    const [owner, repo] = repoFull.split('/');
    return { owner, repo };
}

async function getPR(prNumber, owner, repo, token) {
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;
    const response = await fetch(url, {
        headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `token ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch PR ${prNumber}: ${response.status}`);
    }
    return response.json();
}

async function main() {
    const { owner, repo } = getRepoInfo();

    const githubToken = process.env.GITHUB_TOKEN;

    if (prNumbers.size > 0) {
        for (let prNumber of prNumbers) {
            try {
                const pr = await getPR(prNumber, owner, repo, githubToken);
                const message = SLACK.merge({
                    html_url: pr.html_url,
                    number: pr.number,
                    title: pr.title,
                    prefix: '',
                });
                console.log(`Sending notification for PR #${pr.number}: ${pr.title}`);
                await slackNotification(message, process.env.OKAN_SLACK_WEBHOOK);
            } catch (error) {
                console.error(`Error fetching or notifying for PR #${prNumber}:`, error);
            }
        }
    }
}

main().catch((error) => {
    console.error('Error in notify-merge script:', error);
    process.exit(1);
});

module.exports = main;
