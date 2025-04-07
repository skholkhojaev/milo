# [Due Diligence] Improve milo core automation guidance

We have two problems in our PR automation system: **Stale Label Interference & Notification Spam**

The Stale System Runs daily at midnight and labels PRs that did not have any Updates for the past 7 days, and after another 7 days of inactivity closes that PR. There is an interference happening with other workflows that add comments to PRs which then resets the Stale System confusing those comments as an "update" to the PR, the Stale workflow then resets the timer back to 0 and removes the Label from that PR.

Another issue we have is that the PRs are too cramped with all the Notification Spams that are happening from different workflows. The PR Reminders workflow for example posts a comment on the PR that has a failing check, and these checks can be anything between failing a UnitTest, eslint or a psi-check.\
The two other workflows that post a comment independent on the `pr-reminders.js` are, `merge-stage` and `label-zero-impact`.

outside of the workflows the review dog can get incredibly spammy and annoying on bigger PRs. [example ](https://github.com/adobecom/milo/pull/3899#discussion_r2027375469) 👈

## Solution proposal
In this [Ticket](https://jira.corp.adobe.com/browse/MWPW-168241) it was proposed that we implement a **Unified Notification System (UNS)** which is one big comment in each PR that every workflow can edit instead of creating a new comment everytime. The UNS will contain a log and history of each workflow, failing tests, guidance on why a PR wasn't merged + how to fix failing checks, this will help with the readability and not interfere with the `Stale` workflow.

When moving to UNS we only need to modify three workflwos that post comments in the github PRs, `pr-reminders`, `label-zero-impact`, `merge-to-stage`.
the rest of the worfklows such as testing workflows as an example will check for failling tests and if any found it will call the [pr-reminders.js](https://github.com/adobecom/milo/pull/3899#issuecomment-2777355886) to write a comment and inform that not all the checks are passing.

As for the formatting of the UNS and how it will look like, we should agree on workflows that will be shown in the UNS regardless if they pass or fail the check such as Merge Status, and leave the other workflows to be shown only if they raise an issue, this will help to have a clear overview and keep the UNS clean. By default the workflows will have a title and a timestamp of when it was logged, and depending on the workflow it shoudl show more informations. For example a failing Unit Test will include the `path` of the test, `Error` message and a `fix` or hint on how to fix the unit test. 

### Timeline fromat example:
```md
Merge Status
<!-- Supersedes merge-to-stage notifications and merge-to-main sync status-->
15.03.2024: PR was not merged due to insufficient reviews (2/2 required)
16.03.2024: PR was not merged as the merge-to-stage batch is already full (8/8 PRs)
17.03.2024: PR was not merged due to failing tests
19.03.2024: PR merged to stage successfully

<!-- Supersedes individual test failure notifications -->
Test Results
15.03.2024: Unit tests failed in test/unit/test.js
Error: Timeout in async test
Fix: Rebase to stage to resolve timing issues

16.03.2024: Nala tests failed in test/nala/test.js
Error: MAS test timeout
Fix: Rebase to stage to resolve test environment issues
17.03.2024: All tests passing after rebase

<!-- Supersedes linting and code quality notifications -->
Code Quality
ESLint errors in src/js/main.js
Error: Missing semicolon
Fix: Add semicolon at line 42

<!-- Supersedes PR management notifications -->
PR Status
15.03.2024: Needs verification from QA team
16.03.2024: Verified by QA team
17.03.2024: Ready for stage (2/2 approvals)
18.03.2024: High impact change detected
Warning: Changes affect multiple components
Action: Review impact with team

<!-- Branch sync recommendations -->
Branch Health
15.03.2024: Branch is 5 commits behind stage
Recommendation: Rebase to stage to avoid conflicts

16.03.2024: Branch synced with stage
17.03.2024: No conflicts detected
if you want to read more about formatting and details of the log please refer to [link].

<!-- For presistent or repetitive issues to not overwhelm the UNS -->
According to [workflow](https://link-to-workflow) there are several issues that need to be addressed. Check the workflow to gather details or run X locally...
```

## Conclusion
Forcing all the workflows to write into the UNS will not only help the overview of the PR but also the Stale workflow. We will have a strong framework to add future checks and guidance to contributors to milo to ensure developer velocity.
