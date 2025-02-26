const { slackNotification, getLocalConfigs } = require('./helpers.js');
const { Octokit } = require('@octokit/rest');

const SLACK = {
    merge: ({ html_url, number, title, prefix = '' }) =>
        `:merged: PR merged to stage: ${prefix} <${html_url}|#${number}: ${title}>.`,
};

const getCommitSha = () => {
    console.log('entered getCommitSha');
    const commitSha = process.env.GITHUB_SHA;
    if (!commitSha) {
        throw new Error(
            "GITHUB_SHA is not set. For local testing, please add a valid commit SHA in your .env file."
        );
    }
    return commitSha;
};

const getMergedPRs = async (github, context) => {
    console.log('entered getMergedPrs');
    let owner, repo;
    if (context && context.repo) {
        owner = context.repo.owner;
        repo = context.repo.repo;
    } else {
        [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
    }
    const commitSha = getCommitSha();
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
    let github, context;
    if (params && params.github && params.context) {
        github = params.github;
        context = params.context;
    } else {
        const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
        github = new Octokit({ auth: token });
        const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
        context = { repo: { owner, repo } };
    }

    try {
        const prs = await getMergedPRs(github, context);
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
        console.error('Error fetching or notifying for PR(s):', error);
    }
}

if (process.env.LOCAL_RUN) {
    const { github, context } = getLocalConfigs();
    main({ github, context });
} else {
    main().catch((error) => {
        console.error('Error in notify-merge script:', error);
    });
}

module.exports = main;
