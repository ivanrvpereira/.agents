---
name: acli
description: Atlassian CLI (acli) reference for Jira Cloud. Use when the user needs to interact with Jira work items via the command line — searching, creating, viewing, editing, assigning, transitioning, commenting, linking, or bulk-operating on tickets. Triggers on mentions of "acli", "jira cli", "jira ticket", "work item", or any task involving Jira automation from the terminal.
---

# acli — Jira Cloud CLI

CLI for Jira Cloud. Commands follow `acli jira <resource> <action>` pattern.

## Command Pattern

All workitem commands share consistent flags:

| Flag | Short | Description |
|------|-------|-------------|
| `--key` | `-k` | Ticket key(s), comma-separated |
| `--jql` | `-j` | JQL query string |
| `--filter` | | Saved filter ID |
| `--fields` | `-f` | Fields to include (`*all`, `*navigable`, `-field` to exclude) |
| `--limit` | `-l` | Max results |
| `--paginate` | | Fetch all pages |
| `--json` | | Output as JSON |
| `--csv` | | Output as CSV |
| `--web` | `-w` | Open in browser |
| `--yes` | `-y` | Skip confirmation |
| `--ignore-errors` | | Continue on errors |

## Quick Reference

### Search

```bash
acli jira workitem search --jql "project = PROJ AND assignee = currentUser() AND resolution = Unresolved"
acli jira workitem search --jql "project = PROJ" --fields "key,status,summary"
acli jira workitem search --jql "project = PROJ" --limit 50 --paginate
acli jira workitem search --jql "project = PROJ" --count
acli jira workitem search --filter 10001 --web
```

Default fields: `issuetype, key, assignee, priority, status, summary`.

### View

```bash
acli jira workitem view KEY-123
acli jira workitem view KEY-123 --fields "summary,comment"
acli jira workitem view KEY-123 --fields "*all" --json
acli jira workitem view KEY-123 --web
```

### Create

```bash
acli jira workitem create --summary "New Task" --project PROJ --type Task
acli jira workitem create --summary "Bug title" --project PROJ --type Bug --assignee "user@example.com" --label "bug,cli"
acli jira workitem create --from-json workitem.json
acli jira workitem create --generate-json    # scaffold a JSON template
acli jira workitem create --editor           # open editor for summary + description
```

Types: `Epic`, `Story`, `Task`, `Bug`. Assignee: email, account ID, `@me`, or `default`.

### Edit

```bash
acli jira workitem edit --key KEY-123 --summary "New title"
acli jira workitem edit --key KEY-123 --description "New description"
acli jira workitem edit --key KEY-123 --description-file desc.txt
acli jira workitem edit --key KEY-123 --assignee "@me"
acli jira workitem edit --key KEY-123 --remove-assignee
acli jira workitem edit --key KEY-123 --labels "bug,urgent" --remove-labels "wontfix"
acli jira workitem edit --key KEY-123 --type Bug
acli jira workitem edit --jql "project = PROJ AND labels = old" --labels "new" --yes
acli jira workitem edit --from-json workitem.json
```

### Assign

```bash
acli jira workitem assign --key KEY-123 --assignee "@me"
acli jira workitem assign --jql "project = PROJ" --assignee "user@example.com"
acli jira workitem assign --filter 10001 --remove-assignee --json
```

### Transition

```bash
acli jira workitem transition --key KEY-123 --status "Done"
acli jira workitem transition --key "KEY-1,KEY-2" --status "In Progress"
acli jira workitem transition --jql "project = PROJ AND labels = ready" --status "Done" --yes
```

### Comment

```bash
acli jira workitem comment create --key KEY-123 --body "Comment text"
acli jira workitem comment create --key KEY-123 --body-file comment.txt
acli jira workitem comment create --key KEY-123 --editor
acli jira workitem comment create --key KEY-123 --edit-last
acli jira workitem comment create --jql "project = PROJ" --body "Bulk comment" --ignore-errors
```

See `references/adf.md` for ADF (Atlassian Document Format) when rich formatting is needed.

### Attachments

```bash
acli jira workitem attachment list --key KEY-123
acli jira workitem attachment delete --key KEY-123 --attachment-id 12345
```

### Links

```bash
acli jira workitem link create --key KEY-123 --link-type "blocks" --outward-key KEY-456
acli jira workitem link list-types
```

### Watchers

```bash
acli jira workitem watcher add --key KEY-123 --user "user@example.com"
acli jira workitem watcher remove --key KEY-123 --user "user@example.com"
```

### Other Workitem Actions

```bash
acli jira workitem clone --key KEY-123
acli jira workitem archive --key KEY-123
acli jira workitem unarchive --key KEY-123
acli jira workitem delete --key KEY-123
acli jira workitem create-bulk
```

## Projects

```bash
acli jira project list --recent
acli jira project view --key PROJ
acli jira project view --key PROJ --json
```

## Batch Operations

Target multiple tickets with comma-separated keys or JQL:

```bash
# Multiple keys
acli jira workitem comment create --key "KEY-1,KEY-2,KEY-3" --body "Batch update"
acli jira workitem transition --key "KEY-1,KEY-2" --status "Done" --yes

# Via JQL
acli jira workitem edit --jql "project = PROJ AND labels = old" --labels "new" --yes
```

Use `--ignore-errors` to continue when some operations fail.

## JQL Quick Reference

See `references/jql.md` for full syntax. Key rules:

- Single quotes for values with spaces: `status = 'In Progress'`
- Prefer `NOT status = 'Done'` over `!=`
- `~` is "contains" (text search)
- Functions: `currentUser()`, `now()`, `startOfDay()`, `endOfWeek()`
- Operators: `AND`, `OR`, `NOT`, `IN`, `IS`, `IS NOT`, `ORDER BY`

## Tips

- **Before creating a ticket**, search the project for duplicates using `search --jql "project = PROJ AND summary ~ 'keywords'"`. If similar issues exist, present them to the user and confirm before creating.
- Use `--web` to debug by viewing the ticket in Jira UI
- Transition errors usually mean the target status is invalid for the current workflow state
- JQL syntax errors — check quotes and escape characters
- Use `--generate-json` to scaffold create/edit payloads
