// notify-merge.js

const fs = require('fs');
const {
  slackNotification,
  getLocalConfigs,
} = require('./helpers.js');

const SLACK = {
  merge: ({ html_url, number, title, prefix = '' }) =>
    `:merged: PR merged to stage:${prefix} <${html_url}|${number}: ${title}>.`,
};

const mergeRegex = /Merge pull request #(\d+)/i;

const main = async ({ github, context }) => {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) {
    console.error('GITHUB_EVENT_PATH is not defined. This script should run in GitHub Actions.');
    process.exit(1);
  }
  const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf8'));

  const commits = eventData.commits || [];

  const prNumbers = new Set();
  commits.forEach((commit) => {
    const message = commit.message || '';
    const match = mergeRegex.exec(message);
    if (match && match[1]) {
      prNumbers.add(match[1]);
    }
  });

  if (prNumbers.size === 0) {
    console.log('No merge commit detected in this push event.');
    return;
  }

  const { owner, repo } = context.repo;

  for (let prNumber of prNumbers) {
    try {
      const { data: pr } = await github.rest.pulls.get({
        owner,
        repo,
        pull_number: prNumber,
      });

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

  console.log('All notifications processed.');
};

if (process.env.LOCAL_RUN) {
  const { github, context } = getLocalConfigs();
  main({ github, context });
} else {
  const { getOctokit, context } = require('@actions/github');
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    console.error('GITHUB_TOKEN is not defined.');
    process.exit(1);
  }
  const octokit = getOctokit(githubToken);
  main({ github: octokit, context });
}

module.exports = main;
