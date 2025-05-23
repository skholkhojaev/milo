const { slackNotification, getLocalConfigs } = require('./helpers.js');

async function main({ github, context } = {}) {
    if (!github || !context) {
        throw new Error("GitHub context is missing. Ensure you are running in the correct environment.");
    }

    if (process.env.LOCAL_RUN) {
        console.log("Local run detected. Loading local configurations...");
        const localConfigs = getLocalConfigs();
        github = localConfigs.github;
        context = localConfigs.context;
    }

    const { pull_request } = context.payload;
    if (!pull_request) {
        console.log("No pull_request found in context payload. Skipping notification.");
        return;
    }

    const { number, title, html_url, base } = pull_request;
    const isStage = base.ref === 'stage';
    const prefix = isStage
        ? ':merged: PR merged to stage:'
        : ':rocket: Production release:';

    console.log(`Sending notification for PR #${number}: ${title}`);

    await slackNotification(
        `${prefix} <${html_url}|#${number}: ${title}>.`,
        process.env.SLACK_WEBHOOK
    );
}

if (process.env.LOCAL_RUN) {
    const { github, context } = getLocalConfigs();
    main({ github, context });
}

module.exports = main;
