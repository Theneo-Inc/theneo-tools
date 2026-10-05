---
'@theneo/sdk': minor
'@theneo/cli': minor
---

Add documentation branches and preview deployments. `theneo branch list|create|delete|rebase|publish|link` manage branches from the terminal, `theneo import --branch <id>` imports a markdown directory into an existing branch, and `theneo preview --dir <dir>` publishes the directory to a temporary preview branch and prints a read-only preview link that expires (24 hours by default) together with the branch. The SDK gains `listBranches`, `createBranch`, `getBranch`, `deleteBranch`, `rebaseBranch`, `publishBranch`, `createBranchPreviewLink` and `createPreviewDeployment`.
