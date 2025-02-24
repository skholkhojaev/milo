const { slackNotification } = require('./helpers.js');
const { getOctokit, context } = require('@actions/github');

const github = getOctokit(process.env.GITHUB_TOKEN);
const owner = context.repo.owner;
const repo = context.repo.repo;

const SLACK = {
    merge: ({ html_url, number, title, prefix = '' }) =>
        `:merged: PR merged to stage: ${prefix} <${html_url}|#${number}: ${title}>.`,
};

const getMergedPRsForCommit = async () => {
    const commitSha = process.env.GITHUB_SHA;

    const { data: prs } = await github.rest.repos.listPullRequestsAssociatedWithCommit({
        owner,
        repo,
        commit_sha: commitSha,
    });

    return prs.map(pr => ({
        number: pr.number,
        title: pr.title,
        owner: pr.user.login,
        html_url: pr.html_url,
    }));
};

async function main() {
    try {
        const prs = await getMergedPRsForCommit();
        for (const pr of prs) {
            const message = SLACK.merge({
                html_url: pr.html_url,
                number: pr.number,
                title: pr.title,
                prefix: '',
            });
            console.log(`Sending notification for PR #${pr.number}: ${pr.title}`);
            await slackNotification(message, process.env.OKAN_SLACK_WEBHOOK);
        }
    } catch (error) {
        console.error(`Error fetching or notifying for PR(s):`, error);
    }
}

main().catch((error) => {
    console.error('Error in notify-merge script:', error);
});

module.exports = main;
