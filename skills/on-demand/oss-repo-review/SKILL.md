---
name: oss-repo-review
description: Audit and fix a GitHub repo's open-source setup — settings, workflows, secrets, rulesets, releases, community files — including going public and macOS releases.
disable-model-invocation: true
---

# OSS Repo Review

Audit a repo's configuration, not its code, then fix only what the user approves. Needs `gh` with admin access; set `R=owner/repo`.

Collect everything, then report once. Change nothing before Pass 3. Check the case list at the end before you start: some cases add a reference to read first.

## Pass 1 — Collect

A section is done when its commands ran and the result is recorded; a 404 or empty result is a finding. A private repo on a free account returns 403/404/422 or null for rulesets, branch protection, fork-PR approval, code scanning, secret scanning, and private vulnerability reporting: record those as "after going public".

### 1. Settings and security features

```bash
gh api repos/$R --jq '{visibility, owner_type: .owner.type, default_branch, description, homepage, topics,
  has_wiki, has_projects, has_discussions, allow_merge_commit, allow_squash_merge, allow_rebase_merge,
  delete_branch_on_merge, squash_merge_commit_message,
  secret_scanning: .security_and_analysis.secret_scanning.status,
  push_protection: .security_and_analysis.secret_scanning_push_protection.status}'
gh api repos/$R/vulnerability-alerts          # 404 = Dependabot alerts off
gh api repos/$R/automated-security-fixes
gh api repos/$R/code-scanning/default-setup
gh api repos/$R/private-vulnerability-reporting --jq .enabled
```

Private vulnerability reporting off while `SECURITY.md` links the advisory form leaves reporters no private channel.

### 2. Rulesets

```bash
gh api repos/$R/rulesets --jq '.[] | {id, name, target, enforcement}'
gh api repos/$R/rulesets/<id> --jq '{conditions, bypass_actors, rules: [.rules[].type]}'
gh api repos/$R/branches/$(gh api repos/$R --jq .default_branch)/protection 2>&1 | head -3
```

Expect the default branch to block force-push and deletion, and the tags that trigger publishing to have their own ruleset that only admins bypass.

### 3. Actions policy and runners

```bash
gh api repos/$R/actions/permissions            # allowed_actions "all" is a finding
gh api repos/$R/actions/permissions/workflow   # want default_workflow_permissions "read"
gh api repos/$R/actions/permissions/fork-pr-contributor-approval   # want all_external_contributors
gh api repos/$R/actions/runners --jq '.runners[] | "\(.name) \(.status) \([.labels[].name]|join(","))"'
gh api repos/$R/actions/variables --jq '.variables[] | "\(.name)=\(.value)"'
```

A self-hosted runner on a public repo is High even when `runs-on` sends fork PRs elsewhere: a fork's PR runs the fork's copy of the workflow files, so it can rewrite that guard and target the runner. Remove the runner and any variable that selects it.

### 4. Workflows

Read every file in `.github/workflows/`:

- **Triggers:** check `pull_request_target` and `workflow_run` jobs for PR code or artifacts (Critical). Publish only from tags or protected branches.
- **Permissions:** an explicit, minimal `permissions:` block.
- **Pins:** every `uses:` at a full commit SHA with a `# vX` comment; verify the publish workflow's pins with `gh api repos/<action>/commits/<tag> --jq .sha`.
- **Checkout:** `persist-credentials: false`, so repo code cannot read `GITHUB_TOKEN` from `.git/config`.
- **Secrets:** trace where each `secrets.*` could leak. Secrets only the publish job uses belong in an environment limited to the release refs. Grep workflow history too: `git log -p --all -- .github/workflows/ | rg -i 'pull_request_target|secrets\.|_TOKEN'`.
- **Publish guards:** the tag matches the manifest version and is on the default branch; a secret-free dry run of the build and packaging runs on PRs that touch the release files.
- **Lint:** CI runs `actionlint` and `shellcheck`, and installs `shellcheck` when the runner lacks it.

### 5. Credentials

```bash
gh secret list -R $R
gh api repos/$R/environments --jq '.environments[] | {name, rules: [.protection_rules[].type], policy: .deployment_branch_policy}'
gh api repos/$R/keys --jq length
gh api repos/$R/hooks --jq '.[] | {url: .config.url, events}'
gh api repos/$R/collaborators --jq '.[] | "\(.login) \(.role_name)"'
```

Target: no long-lived credentials.

### 6. Run history

```bash
gh api "repos/$R/actions/runs?per_page=50" --jq '.workflow_runs[] | "\(.created_at) \(.event) actor=\(.actor.login) \(.head_branch) \(.conclusion)"'
```

Flag runs by accounts that are not collaborators or known bots, above all on `pull_request_target` or tags.

### 7. Community files

```bash
gh api repos/$R/community/profile --jq '{health_percentage, files: (.files | map_values(if . == null then "MISSING" else "ok" end))}'
```

Expect `README.md`, `LICENSE`, `CONTRIBUTING.md` (setup, tests, contribution license), `CODE_OF_CONDUCT.md` with a private contact (an email: GitHub has no private messages), `SECURITY.md` (advisory form), issue forms, a PR template, `CODEOWNERS`, `CHANGELOG.md`, and `.github/dependabot.yml` with the `github-actions` ecosystem (`uvx check-jsonschema --builtin-schema vendor.dependabot .github/dependabot.yml`). The About box has a description and topics.

## Pass 2 — Report

One report, by severity. Start with a table of what is already good. Each finding: what, why it matters (one concrete attack path), and the fix command.

| Severity | Examples |
|---|---|
| Critical | `pull_request_target`/`workflow_run` + PR code; a publish token where OIDC exists; non-collaborator runs on privileged triggers; a secret in git history |
| High | No ruleset on the default branch or release tags; a self-hosted runner on a public repo; `allowed_actions: all`; unpinned third-party actions or unchecked downloads in a job with secrets; default token `write` |
| Medium | Dependabot, CodeQL, or secret scanning off; private vulnerability reporting off; release secrets outside an environment; `persist-credentials` unset; missing publish guards |
| Low | Missing community files or `dependabot.yml`; unused wiki or projects; merge commits allowed; `delete_branch_on_merge` off |

## Pass 3 — Fix

Apply only the approved fixes. Workflow and file changes are commits in the repo's conventions; push or merge only when asked. Afterwards re-run the collect commands for every change and show before and after: a fix counts only when the API shows it.

## Cases

- Private repo about to go public → [references/going-public.md](references/going-public.md), before Pass 1
- A workflow signs, notarizes, or ships a macOS app → [references/macos-release.md](references/macos-release.md)
- The repo publishes to a package registry or a Homebrew tap → [references/registry.md](references/registry.md)
- Applying approved fixes → [references/fixes.md](references/fixes.md)
