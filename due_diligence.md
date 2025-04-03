# [Due Diligence] Improve milo core automation guidance

We have two problems in our PR automation system: **Stale Label Interference & Notification Spam**

The Stale System Runs daily at midnight and labels PRs that did not have any Updates for the past 7 days, and after another 7 days of inactivity closes that PR. There is an interference happening with other workflows that add comments to PRs which then resets the Stale System confusing those comments as an "update" to the PR, which then resets the timer back to 0 and removed the Label from that PR.

Another issue we have is that the PRs are too cramped with all the Notification Spams that is happening from different workflows such as PR Reminders, Test (Unit/Nala), Ready for Stage label, and etc. 

## Solution proposal
In this [Ticket](https://jira.corp.adobe.com/browse/MWPW-168241) it was proposed that we implement a Unified Notification System (UNS) which is one big comment in each PR that every workflow can edit instead of creating a new comment, the UNS will contain a log and history of each workflow, failing tests, guidance on why a PR wasn't merged + how to fix failing checks

The UNS will supersede all the **Merge-Related Workflows**, **Test & Quality Workflows**, **PR Management Workflows**, **Special Notifications** (high-impact, zero-impact, etc.)

<how each workflow will be logged>

all of the notification will have a title of the workflow and a timestamp of when it was logged, then depending on the workflow it will have the necessery information of the log, for example a failing Unit Test will include the `path` of the test, `Error` message and a `fix`, or hint on how to fix it, to see more detail read this.

<detail of workflows.... this can be written in a different file and link it if the reader interests themselves in reading more>

<removed workflows>

in the UNS we wont be needing for workflows like `pr-reminders` since we will be having giving hints and fixes in the UNS on how to pass the failing checks

### Timeline fromat example:
```
// Supersedes merge-to-stage notifications and merge-to-main sync status
### Merge Status
15.03.2024: PR was not merged due to insufficient reviews (2/2 required)
16.03.2024: PR was not merged as the merge-to-stage batch is already full (8/8 PRs)
17.03.2024: PR was not merged due to failing tests
19.03.2024: PR merged to stage successfully

// Supersedes individual test failure notifications
### Test Results
15.03.2024: Unit tests failed in test/unit/test.js
    - Error: Timeout in async test
    - Fix: Rebase to stage to resolve timing issues
16.03.2024: Nala tests failed in test/nala/test.js
    - Error: MAS test timeout
    - Fix: Rebase to stage to resolve test environment issues
17.03.2024: All tests passing after rebase

// Supersedes linting and code quality notifications
### Code Quality
15.03.2024: ESLint errors in src/js/main.js
    - Error: Missing semicolon
    - Fix: Add semicolon at line 42
16.03.2024: Code compatibility warning
    - Warning: Using deprecated API
    - Fix: Update to new API version

// Supersedes PR management notifications
### PR Status
15.03.2024: Needs verification from QA team
16.03.2024: Verified by QA team
17.03.2024: Ready for stage (2/2 approvals)
18.03.2024: High impact change detected
    - Warning: Changes affect multiple components
    - Action: Review impact with team

// New feature - Branch sync recommendations
### Branch Health
15.03.2024: Branch is 5 commits behind stage
    - Recommendation: Rebase to stage to avoid conflicts
16.03.2024: Branch synced with stage
17.03.2024: No conflicts detected
```

## Conclusion
forcing all the workflows to write in UNS and not having a dedicated comment for each workflow will not only help the overview of the PR but also the Stale workflow.
