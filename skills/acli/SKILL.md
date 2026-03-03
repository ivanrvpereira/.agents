---
name: acli
description: Atlassian CLI (acli) reference for Jira Cloud. Use when the user needs to interact with Jira work items via the command line — searching, creating, viewing, editing, assigning, transitioning, commenting, linking, or bulk-operating on tickets. Triggers on mentions of "acli", "jira cli", "jira ticket", "work item", or any task involving Jira automation from the terminal.
---

# Atlassian CLI (acli) — Jira Reference

## Search

```bash
acli jira workitem search --jql "project = <PROJECT> AND assignee = currentUser() AND resolution = Unresolved"
acli jira workitem search --jql "project = <PROJECT>" --fields "key,status,summary"
acli jira workitem search --jql "project = <PROJECT>" --limit 50 --paginate
acli jira workitem search --jql "project = <PROJECT>" --count
acli jira workitem search --filter 10001 --web
```

Flags: `--jql` / `-j`, `--filter`, `--fields` / `-f`, `--limit` / `-l`, `--paginate`, `--count`, `--json`, `--csv`, `--web` / `-w`

Default fields: `issuetype,key,assignee,priority,status,summary`

## View

```bash
acli jira workitem view KEY-123
acli jira workitem view KEY-123 --fields "summary,comment"
acli jira workitem view KEY-123 --fields "*all" --json
acli jira workitem view KEY-123 --web
```

Fields: `*all`, `*navigable`, `-fieldname` (exclude), comma-separated list.

## Create

```bash
acli jira workitem create --summary "New Task" --project "TEAM" --type "Task"
acli jira workitem create --summary "Bug" --project "PROJ" --type "Bug" --assignee "user@example.com" --label "bug,cli"
acli jira workitem create --from-json workitem.json
acli jira workitem create --generate-json   # scaffold a JSON template
acli jira workitem create --editor          # open editor for summary + description
```

Types: `Epic`, `Story`, `Task`, `Bug`. Assignee: email, account ID, `@me`, or `default`.

## Edit

```bash
acli jira workitem edit --key <KEY> --summary "New title"
acli jira workitem edit --key <KEY> --description "New description"
acli jira workitem edit --key <KEY> --description-file desc.txt
acli jira workitem edit --key <KEY> --assignee "@me"
acli jira workitem edit --key <KEY> --remove-assignee
acli jira workitem edit --key <KEY> --labels "bug,urgent" --remove-labels "wontfix"
acli jira workitem edit --key <KEY> --type "Bug"
acli jira workitem edit --jql "project = <PROJECT> AND labels = old" --labels "new" --yes
acli jira workitem edit --from-json workitem.json
acli jira workitem edit --generate-json
```

## Assign

```bash
acli jira workitem assign --key "KEY-1" --assignee "@me"
acli jira workitem assign --jql "project = TEAM" --assignee "user@example.com"
acli jira workitem assign --filter 10001 --assignee "default"
acli jira workitem assign --from-file issues.txt --remove-assignee --json
```

## Transition

```bash
acli jira workitem transition --key <KEY> --status "Done"
acli jira workitem transition --key "<KEY1>,<KEY2>" --status "<status>"
acli jira workitem transition --jql "project = <PROJECT> AND labels = ready" --status "Done" --yes
acli jira workitem transition --filter 10001 --status "To Do" --yes
```

## Comment

```bash
acli jira workitem comment create --key <KEY> --body "Comment text"
acli jira workitem comment create --key <KEY> --body-file comment.txt
acli jira workitem comment create --jql "project = <PROJECT>" --body "Bulk comment" --ignore-errors
acli jira workitem comment create --key <KEY> --edit-last
acli jira workitem comment create --key <KEY> --editor
```

See `references/adf.md` for ADF (Atlassian Document Format) JSON syntax when rich formatting is needed.

## Other Commands

```bash
# Attachments
acli jira workitem attachment list --key <KEY>
acli jira workitem attachment delete --key <KEY> --attachment-id 12345

# Links
acli jira workitem link create --key <KEY> --link-type "blocks" --outward-key <OTHER-KEY>
acli jira workitem link list-types

# Watchers
acli jira workitem watcher add --key <KEY> --user "user@example.com"
acli jira workitem watcher remove --key <KEY> --user "user@example.com"

# Misc
acli jira workitem clone --key <KEY>
acli jira workitem archive --key <KEY>
acli jira workitem unarchive --key <KEY>
acli jira workitem delete --key <KEY>
acli jira workitem create-bulk  # bulk creation
```

## Project Commands

```bash
acli jira project list --recent
acli jira project view --key <PROJECT>
acli jira project view --key <PROJECT> --json
```

## Common Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--key` | `-k` | Ticket key(s), comma-separated |
| `--jql` | `-j` | JQL query string |
| `--filter` | | Saved filter ID |
| `--json` | | Output as JSON |
| `--csv` | | Output as CSV |
| `--web` | `-w` | Open in browser |
| `--yes` | `-y` | Skip confirmation |
| `--limit` | `-l` | Max results |
| `--paginate` | | Fetch all pages |
| `--fields` | `-f` | Fields to include |
| `--ignore-errors` | | Continue on errors |

## JQL Patterns

See `references/jql.md` for full JQL syntax and common patterns.

Quick reference:
- Single quotes for values with spaces: `status = 'In Progress'`
- Prefer `NOT status = 'Done'` over `!=`
- Functions: `currentUser()`, `now()`, `startOfDay()`, `endOfWeek()`
- Operators: `AND`, `OR`, `NOT`, `IN`, `IS`, `IS NOT`, `~` (contains), `ORDER BY`

## Batch Operations

```bash
# Multiple keys
acli jira workitem comment create --key "KEY-1,KEY-2,KEY-3" --body "Batch update"
acli jira workitem transition --key "KEY-1,KEY-2" --status "Done" --yes

# Via JQL
acli jira workitem edit --jql "project = PROJ AND labels = old" --labels "new" --yes
```

## Error Handling

- Use `--ignore-errors` to continue when some operations fail
- JQL syntax errors — check quotes and escape characters
- Transition errors — target status may be invalid for the current workflow state
- Use `--web` to debug by viewing in Jira UI
