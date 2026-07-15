---
name: oss-repo-review
description: Audit a GitHub repository's configuration against open-source security best practices — settings, workflows, credentials, rulesets, publishing pipeline — and apply fixes on approval.
disable-model-invocation: true
---

# OSS Repo Best-Practices Review

Audit a repository's *configuration* (not its code) for security posture, then fix what the user approves. Requires `gh` authenticated with admin access to the repo. Set `R=owner/repo` once and reuse it.

Run the audit in two passes: **collect** everything first, **report** once with severities. Never change a setting during the collect pass.

## Pass 1 — Collect

Work through every section; a section is done when its commands ran and the result is recorded (a 404/empty result is a finding, not a failure).

### 1. Repo settings & security features

```bash
gh api repos/$R --jq '{private, default_branch, has_wiki, has_projects, delete_branch_on_merge,
  secret_scanning: .security_and_analysis.secret_scanning.status,
  push_protection: .security_and_analysis.secret_scanning_push_protection.status,
  dependabot_security_updates: .security_and_analysis.dependabot_security_updates.status}'
gh api repos/$R/vulnerability-alerts          # 404 = Dependabot alerts disabled
gh api repos/$R/code-scanning/default-setup   # CodeQL state
gh api repos/$R/private-vulnerability-reporting --jq .enabled 2>/dev/null
```

### 2. Rulesets & branch protection

```bash
gh api repos/$R/rulesets --jq '.[] | {name, target, enforcement}'
gh api repos/$R/branches/$(gh api repos/$R --jq .default_branch)/protection 2>&1 | head -3
```

Expect: default branch blocks force-push + deletion; release tags (`v*` or whatever triggers publishing) have their own ruleset. A tag that triggers a publish workflow deserves the same protection as `main`.

### 3. Actions policy

```bash
gh api repos/$R/actions/permissions            # allowed_actions: "all" is a finding
gh api repos/$R/actions/permissions/workflow   # default_workflow_permissions: want "read"
gh api repos/$R/actions/permissions/fork-pr-contributor-approval
```

### 4. Workflow files

Read every file in `.github/workflows/` and check each against:

- **Triggers**: `pull_request_target` anywhere is a critical finding unless the job provably never checks out PR code. Publish workflows should trigger only on maintainer-controlled refs (tags, protected branches).
- **Permissions**: explicit `permissions:` block per workflow, minimal scopes.
- **Pinning**: every `uses:` pinned to a full commit SHA with a `# vX` comment. Verify at least the publish workflow's SHAs against the upstream tag: `gh api repos/<action-repo>/commits/<tag> --jq .sha`.
- **Checkout**: `persist-credentials: false` — otherwise `GITHUB_TOKEN` sits in `.git/config` where repo-controlled code (`npm ci`, tests, postinstall) can read it.
- **Secrets**: any `secrets.*` reference is a lead — trace where the secret could leak. Also grep workflow *git history*: `git log -p --all -- .github/workflows/ | rg -i 'pull_request_target|secrets\.|_TOKEN'` — a secret dropped from the file may still exist in settings or on the registry.
- **Publish guards**: tag→manifest version match, and tag-is-on-default-branch check (`git merge-base --is-ancestor`).

### 5. Credential inventory

Every stored credential is attack surface; the target state is zero long-lived credentials.

```bash
gh secret list -R $R
gh api repos/$R/keys --jq length          # deploy keys
gh api repos/$R/hooks --jq '.[] | {url: .config.url, events}'
gh api repos/$R/environments --jq .total_count
gh api repos/$R/collaborators --jq '.[] | "\(.login) \(.role_name)"'
```

### 6. Run-history sanity (is CI already compromised?)

```bash
gh api "repos/$R/actions/runs?per_page=50" --jq '.workflow_runs[] |
  "\(.created_at) \(.event) actor=\(.actor.login) \(.head_branch) \(.conclusion)"'
```

Flag runs triggered by accounts that are not collaborators or known bots, especially on `pull_request_target` or against tags.

### 7. Registry / publishing pipeline

For npm (adapt for PyPI/crates/etc.):

```bash
npm view <pkg> version dist-tags maintainers
npm whoami && npm token list --json    # if logged in as maintainer: want []
```

If publishing uses OIDC trusted publishing, the trust policy must be scoped to the exact repo **and** exact workflow file (verify on the registry's settings page — screenshot or user confirmation). Prefer "require 2FA and disallow tokens". Any leftover publish token from a pre-OIDC era must be revoked.

### 8. Community files

`SECURITY.md` (private reporting instructions), `LICENSE`, `.github/dependabot.yml` (include the `github-actions` ecosystem — it's what keeps SHA pins fresh). Missing dependabot config means pinned SHAs rot silently.

## Pass 2 — Report

One report, findings ordered by severity. For each: **what**, **why it matters** (one line, concrete attack path), **the fix command**. Lead with a table of what's already good — an audit that only lists faults reads as noise and erodes trust in the real findings.

Severity guide:

| Severity | Examples |
|---|---|
| Critical | `pull_request_target` + PR checkout; live publish token where OIDC exists; non-collaborator runs on privileged triggers |
| High | No ruleset on default branch or release tags; `allowed_actions: all`; unpinned third-party actions; default token `write` |
| Medium | Dependabot/CodeQL/secret-scanning off; `persist-credentials` unset; missing publish guards |
| Low | Missing SECURITY.md/dependabot.yml; unused wiki/projects enabled; `delete_branch_on_merge` off |

Weigh findings against the repo's reality: a solo-maintainer repo shouldn't require PR reviews (constant self-bypass), and a fork-PR token on a public repo is read-only — say so instead of inflating severity.

## Pass 3 — Fix (only what the user approves)

Apply approved fixes; each is one command or one small file edit:

```bash
# Rulesets (block force-push + deletion; add the tag one when tags trigger publishing)
gh api -X POST repos/$R/rulesets --input - <<'EOF'
{"name":"protect-main","target":"branch","enforcement":"active",
 "conditions":{"ref_name":{"include":["~DEFAULT_BRANCH"],"exclude":[]}},
 "rules":[{"type":"deletion"},{"type":"non_fast_forward"}]}
EOF

# Security features
gh api -X PUT repos/$R/vulnerability-alerts
gh api -X PUT repos/$R/automated-security-fixes
gh api -X PUT repos/$R/private-vulnerability-reporting
gh api -X PATCH repos/$R/code-scanning/default-setup --input - <<< '{"state":"configured"}'

# Actions policy
gh api -X PUT repos/$R/actions/permissions --input - <<< '{"enabled":true,"allowed_actions":"selected"}'
gh api -X PUT repos/$R/actions/permissions/selected-actions \
  --input - <<< '{"github_owned_allowed":true,"verified_allowed":true,"patterns_allowed":[]}'
gh api -X PUT repos/$R/actions/permissions/fork-pr-contributor-approval \
  --input - <<< '{"approval_policy":"all_external_contributors"}'

# Surface reduction
gh api -X PATCH repos/$R -F has_wiki=false -F has_projects=false
```

Workflow-file fixes (SHA pins, `persist-credentials: false`, `permissions:` blocks) and new files (`SECURITY.md`, `dependabot.yml`) are commits — follow the repo's commit conventions and leave pushing/merging to the user's instruction.

Close the engagement by re-running the collect commands for everything you changed and showing the before/after — a fix is claimed only when the API reflects it.
