const { slackNotification } = require('./helpers.js');

const SLACK = {
    merge: ({ html_url, number, title, prefix = '' }) =>
        `:merged: PR merged to stage: ${prefix} <${html_url}|#${number}: ${title}>.`,
};

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

// async function getAssociatedPR(commitSha, owner, repo, token) {
//     const url = `https://api.github.com/repos/${owner}/${repo}/commits/${commitSha}/pulls`;
//     const response = await fetch(url, {
//         headers: {
//             Accept: 'application/vnd.github.groot-preview+json',
//             Authorization: `token ${token}`,
//         },
//     });
//     if (!response.ok) {
//         throw new Error(`Failed to fetch associated PR for commit ${commitSha}: ${response.status}`);
//     }
//     const prs = await response.json();
//     return prs.length > 0 ? prs[0] : null;
// }

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
    // else {
    //     const commit = process.env.GITHUB_SHA;
    //     try {
    //         const associatedPR = await getAssociatedPR(commit, owner, repo, githubToken);
    //         if (associatedPR) {
    //             const message = SLACK.merge({
    //                 html_url: associatedPR.html_url,
    //                 number: associatedPR.number,
    //                 title: associatedPR.title,
    //                 prefix: '',
    //             });
    //             console.log(`Sending fallback notification using associated PR #${associatedPR.number}: ${associatedPR.title}`);
    //             await slackNotification(message, process.env.OKAN_SLACK_WEBHOOK)
    //                 .then(() => console.log('Fallback Slack notification sent successfully.'))
    //                 .catch((error) => console.error('Error sending fallback Slack notification:', error));
    //         } else {
    //             console.error('No associated PR found for commit:', commit);
    //         }
    //     } catch (error) {
    //         console.error('Error fetching associated PR:', error);
    //     }
    // }
}

main().catch((error) => {
    console.error('Error in notify-merge script:', error);
    process.exit(1);
});

module.exports = main;
