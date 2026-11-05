# Going public

A visibility switch publishes the whole history, every branch, and every tag. Run these checks on the private repo, report them with the rest of the audit, and switch only on the user's go.

## 1. Secrets in history

Scan every commit on every ref with two methods, because one scanner can silently scan nothing:

```bash
git fetch --all
docker run --rm -v "$PWD:/repo:ro" trufflesecurity/trufflehog:latest git file:///repo \
  --results=verified,unknown,unverified --json --no-update > /tmp/th.json
jq -r '"\(.DetectorName) \(.SourceMetadata.Data.Git.file) \(.SourceMetadata.Data.Git.commit[0:8]) verified=\(.Verified)"' /tmp/th.json
```

Then grep every blob for key shapes (`BEGIN .*PRIVATE KEY`, `gh[pousr]_`, `github_pat_`, `sk-`, `GOCSPX-`, `AIza`, `xox[bpas]-`, JWTs, `op://` references) with `git rev-list --all | while read c; do git grep -I -n -E -e … "$c"; done`, and list every file name ever committed (`git log --all --name-only --format= | sort -u`) for `.env`, `.p8`, `.p12`, `.pem`, databases, logs, and app config.

Prove a scanner works before trusting a clean result: plant a fake token in a throwaway repo and confirm it is found. A scanner that reports "0 commits scanned" scanned nothing.

Classify each hit: test fixture (fake host such as `example.test`, canary value), reference (`op://` paths name an item, not a value), or real. A real secret is revoked and rotated first; rewriting history comes second and does not undo the exposure.

## 2. Personal data

```bash
git log --all --format='%ae%n%ce' | sort | uniq -c        # author/committer emails
git rev-list --all | while read c; do git grep -I -h -o -E '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' "$c"; done | sort -u
git log --all -p | rg -o '/Users/[^ )`"]+|/home/[^ )`"]+' | sort -u
```

Work emails on web-UI merge commits and local paths in old plan files are common. Removing them means a history rewrite and force push: present it as the user's decision, with "leave it" as the default when nothing secret is involved.

## 3. Self-hosted runners

Remove them, and the variables that select them, before the switch; GitHub-hosted runners are free on public repos:

```bash
gh api repos/$R/actions/runners --jq '.runners[].name'
gh variable delete <RUNNER_VAR> -R $R
```

## 4. Settings that exist only after the switch

Private repos on a free account cannot have these; apply them right after the switch and re-collect:

- rulesets on the default branch and release tags,
- fork-PR approval: `all_external_contributors`,
- secret scanning and push protection,
- code scanning (CodeQL default setup),
- private vulnerability reporting (`SECURITY.md` links to it).

## 5. The switch

```bash
gh repo edit $R --visibility public --accept-visibility-change-consequences
gh repo edit $R --description "…" --add-topic … --homepage "…"
```
