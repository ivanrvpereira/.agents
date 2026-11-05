# Fix commands

Pass 3 commands for approved findings. Run only what the user approved, then re-collect.

```bash
# Rulesets: default branch, then release tags (admin bypass only)
gh api -X POST repos/$R/rulesets --input - <<'EOF'
{"name":"protect-main","target":"branch","enforcement":"active",
 "conditions":{"ref_name":{"include":["~DEFAULT_BRANCH"],"exclude":[]}},
 "rules":[{"type":"deletion"},{"type":"non_fast_forward"}]}
EOF
gh api -X POST repos/$R/rulesets --input - <<'EOF'
{"name":"protect-release-tags","target":"tag","enforcement":"active",
 "conditions":{"ref_name":{"include":["refs/tags/v*"],"exclude":[]}},
 "bypass_actors":[{"actor_type":"RepositoryRole","actor_id":5,"bypass_mode":"always"}],
 "rules":[{"type":"creation"},{"type":"update"},{"type":"deletion"}]}
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

# Merge settings and surface reduction
gh api -X PATCH repos/$R -F allow_squash_merge=true -F allow_merge_commit=false -F allow_rebase_merge=false \
  -F delete_branch_on_merge=true -f squash_merge_commit_title=PR_TITLE -f squash_merge_commit_message=COMMIT_MESSAGES
gh api -X PATCH repos/$R -F has_wiki=false -F has_projects=false
```

Restricting `allowed_actions` to selected actions blocks any workflow `uses:` that is not on the list: list the actions in use first and add their owners to `patterns_allowed`.

Moving secrets into an environment re-sets each value from the source of truth (a password manager — GitHub never returns secret values), adds `environment: <name>` to the publish job, and deletes the repo-level copies; it is proven only by the next real release, so schedule it just before one.
