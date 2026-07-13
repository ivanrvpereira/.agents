# JQL Reference

## Syntax Rules

- Single quotes for values with spaces: `status = 'Some Status'`
- Avoid `!=` with backslash — use `NOT status = 'Done'` instead
- String comparison is case-insensitive
- `~` is "contains" (text search), `!~` is "does not contain"

## Operators

| Operator | Description |
|----------|-------------|
| `=`, `!=` | Exact match |
| `>`, `>=`, `<`, `<=` | Comparison (dates, numbers) |
| `IN`, `NOT IN` | Multiple values |
| `IS`, `IS NOT` | NULL checks |
| `~`, `!~` | Text contains / not contains |
| `AND`, `OR`, `NOT` | Boolean logic |
| `ORDER BY` | Sort results |

## Functions

| Function | Description |
|----------|-------------|
| `currentUser()` | Current logged-in user |
| `now()` | Current datetime |
| `startOfDay()`, `endOfDay()` | Day boundaries |
| `startOfWeek()`, `endOfWeek()` | Week boundaries |
| `startOfMonth()`, `endOfMonth()` | Month boundaries |

## Date Syntax

- Relative: `-7d` (7 days ago), `-2w`, `-1M`
- Absolute: `"2024-01-01"`

## Common Patterns

```jql
# My open tickets
assignee = currentUser() AND resolution = Unresolved

# Project tickets by status
project = <PROJECT> AND status = '<status>'
project = <PROJECT> AND statusCategory = 'In Progress'
project = <PROJECT> AND statusCategory = Done

# Recent activity
project = <PROJECT> AND updated >= -7d ORDER BY updated DESC

# Sprint
project = <PROJECT> AND Sprint = '<sprint-name>'
project = <PROJECT> AND Sprint in openSprints()

# Labels and components
project = <PROJECT> AND labels = <label>
project = <PROJECT> AND component = <component>

# Issue type
project = <PROJECT> AND issuetype = Bug

# Priority
project = <PROJECT> AND priority in (High, Critical) AND resolution = Unresolved

# Epics
project = <PROJECT> AND issuetype = Epic AND status != Done

# Stories in an epic
"Epic Link" = <EPIC-KEY>
```
