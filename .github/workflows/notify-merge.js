const { slackNotification } = require('./helpers.js');

let owner;
let repo;

const SLACK = {
    merge: ({ html_url, number, title, prefix = '' }) =>
        `:merged: PR merged to stage: ${prefix} <${html_url}|#${number}: ${title}>.`,
};

const getMergedPRsForCommit = async (github) => {
    const commitSha = process.env.GITHUB_SHA;
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');

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

async function main(params) {
    const github = params.github;
    owner = params.context.repo.owner;
    repo = params.context.repo.repo;

    try {
        const prs = await getMergedPRsForCommit(github);
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
    process.exit(1);
});

module.exports = main;
