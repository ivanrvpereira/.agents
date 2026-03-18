# ADF — Atlassian Document Format

Jira Cloud stores descriptions and comments as ADF (JSON-based rich text).
Plain text with `\n` won't render as rich content — you must use ADF JSON.

## When to Use

Use ADF JSON via `--body-file` / `--description-file` whenever content needs:
- Headings, bold, italic, code, links
- Lists (bullet or numbered)
- Code blocks, tables, panels
- Any structured formatting

## Document Skeleton

Every ADF document wraps content in a root `doc` node:

```json
{
  "version": 1,
  "type": "doc",
  "content": [
    // top-level block nodes go here
  ]
}
```

## Block Nodes

### Paragraph

```json
{"type": "paragraph", "content": [{"type": "text", "text": "Hello world"}]}
```

### Heading (level 1–6)

```json
{"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Section Title"}]}
```

### Bullet List

```json
{
  "type": "bulletList",
  "content": [
    {"type": "listItem", "content": [
      {"type": "paragraph", "content": [{"type": "text", "text": "First item"}]}
    ]},
    {"type": "listItem", "content": [
      {"type": "paragraph", "content": [{"type": "text", "text": "Second item"}]}
    ]}
  ]
}
```

Nested lists: put a `bulletList` or `orderedList` inside a `listItem` after the paragraph.

### Ordered List

Same structure as bullet list but `"type": "orderedList"`. Optional `"attrs": {"order": 3}` to start numbering at 3.

### Code Block

```json
{
  "type": "codeBlock",
  "attrs": {"language": "python"},
  "content": [{"type": "text", "text": "def hello():\n    print('Hello')"}]
}
```

`language` uses [Prism language IDs](https://github.com/conorhastings/react-syntax-highlighter/blob/master/AVAILABLE_LANGUAGES_PRISM.MD). Use `"text"` for plain monospace.
Content must be `text` nodes **without marks** (no bold/italic inside code blocks).

### Blockquote

```json
{
  "type": "blockquote",
  "content": [
    {"type": "paragraph", "content": [{"type": "text", "text": "Quoted text"}]}
  ]
}
```

Can contain: `paragraph` (no marks), `bulletList`, `orderedList`, `codeBlock`.

### Rule (horizontal divider)

```json
{"type": "rule"}
```

### Panel (colored callout box)

```json
{
  "type": "panel",
  "attrs": {"panelType": "info"},
  "content": [
    {"type": "paragraph", "content": [{"type": "text", "text": "Important note"}]}
  ]
}
```

`panelType`: `"info"` | `"note"` | `"warning"` | `"success"` | `"error"`.
Can contain: `paragraph`, `heading` (no marks), `bulletList`, `orderedList`.

### Expand (accordion / disclosure)

```json
{
  "type": "expand",
  "attrs": {"title": "Click to expand"},
  "content": [
    {"type": "paragraph", "content": [{"type": "text", "text": "Hidden content"}]}
  ]
}
```

### Table

```json
{
  "type": "table",
  "attrs": {"isNumberColumnEnabled": false, "layout": "center"},
  "content": [
    {"type": "tableRow", "content": [
      {"type": "tableHeader", "attrs": {}, "content": [
        {"type": "paragraph", "content": [{"type": "text", "text": "Name"}]}
      ]},
      {"type": "tableHeader", "attrs": {}, "content": [
        {"type": "paragraph", "content": [{"type": "text", "text": "Value"}]}
      ]}
    ]},
    {"type": "tableRow", "content": [
      {"type": "tableCell", "attrs": {}, "content": [
        {"type": "paragraph", "content": [{"type": "text", "text": "Key"}]}
      ]},
      {"type": "tableCell", "attrs": {}, "content": [
        {"type": "paragraph", "content": [{"type": "text", "text": "123"}]}
      ]}
    ]}
  ]
}
```

- First row typically uses `tableHeader`; subsequent rows use `tableCell`.
- `tableCell` / `tableHeader` attrs: `background` (hex color), `colspan`, `rowspan`, `colwidth` (array of px).
- Cell content can include: `paragraph`, `heading`, `bulletList`, `orderedList`, `codeBlock`, `blockquote`, `panel`, `rule`, `nestedExpand`.

## Inline Nodes

Used inside `paragraph` and `heading` `content` arrays.

### Text (with marks for formatting)

```json
{"type": "text", "text": "plain text"}
```

### Hard Break (line break within a paragraph)

```json
{"type": "hardBreak"}
```

Equivalent to `<br/>`. Use between text nodes for line breaks without a new paragraph.

### Mention (@user)

```json
{"type": "mention", "attrs": {"id": "ACCOUNT_ID", "text": "@User Name"}}
```

`id` is the Atlassian account ID.

### Emoji

```json
{"type": "emoji", "attrs": {"shortName": ":thumbsup:", "text": "👍"}}
```

### Status (colored lozenge)

```json
{"type": "status", "attrs": {"text": "In Progress", "color": "yellow"}}
```

Colors: `"neutral"` (grey) | `"purple"` | `"blue"` | `"red"` | `"yellow"` | `"green"`.

### Inline Card (smart link)

```json
{"type": "inlineCard", "attrs": {"url": "https://example.com"}}
```

Renders as a rich link with icon and title.

## Marks (Text Formatting)

Apply marks to `text` nodes via the `"marks"` array. Multiple marks can be combined.

| Mark | JSON | Result |
|------|------|--------|
| **Bold** | `{"type": "strong"}` | **text** |
| *Italic* | `{"type": "em"}` | *text* |
| `Code` | `{"type": "code"}` | `text` |
| ~~Strike~~ | `{"type": "strike"}` | ~~text~~ |
| Underline | `{"type": "underline"}` | underlined text |
| Link | `{"type": "link", "attrs": {"href": "https://...", "title": "..."}}` | hyperlink |
| Color | `{"type": "textColor", "attrs": {"color": "#ff0000"}}` | colored text |

### Example: bold + italic text

```json
{"type": "text", "text": "important", "marks": [{"type": "strong"}, {"type": "em"}]}
```

### Example: hyperlink

```json
{"type": "text", "text": "Click here", "marks": [{"type": "link", "attrs": {"href": "https://example.com"}}]}
```

### Incompatible mark combinations

- `textColor` cannot combine with `code` or `link`.
- `code` blocks (`codeBlock` node) do not support marks on their text content.

## Recipes

### Structured issue description

```json
{
  "version": 1,
  "type": "doc",
  "content": [
    {"type": "heading", "attrs": {"level": 2}, "content": [
      {"type": "text", "text": "Summary"}
    ]},
    {"type": "paragraph", "content": [
      {"type": "text", "text": "Brief description of the issue."}
    ]},
    {"type": "heading", "attrs": {"level": 2}, "content": [
      {"type": "text", "text": "Steps to Reproduce"}
    ]},
    {"type": "orderedList", "content": [
      {"type": "listItem", "content": [
        {"type": "paragraph", "content": [{"type": "text", "text": "Step one"}]}
      ]},
      {"type": "listItem", "content": [
        {"type": "paragraph", "content": [{"type": "text", "text": "Step two"}]}
      ]}
    ]},
    {"type": "heading", "attrs": {"level": 2}, "content": [
      {"type": "text", "text": "Expected vs Actual"}
    ]},
    {"type": "paragraph", "content": [
      {"type": "text", "text": "Expected: ", "marks": [{"type": "strong"}]},
      {"type": "text", "text": "should work."}
    ]},
    {"type": "paragraph", "content": [
      {"type": "text", "text": "Actual: ", "marks": [{"type": "strong"}]},
      {"type": "text", "text": "it breaks."}
    ]}
  ]
}
```

### Comment with code

```json
{
  "version": 1,
  "type": "doc",
  "content": [
    {"type": "paragraph", "content": [
      {"type": "text", "text": "The fix is in "},
      {"type": "text", "text": "handler.py", "marks": [{"type": "code"}]},
      {"type": "text", "text": ":"}
    ]},
    {"type": "codeBlock", "attrs": {"language": "python"}, "content": [
      {"type": "text", "text": "def fix():\n    return True"}
    ]}
  ]
}
```

### Info panel with link

```json
{
  "version": 1,
  "type": "doc",
  "content": [
    {"type": "panel", "attrs": {"panelType": "info"}, "content": [
      {"type": "paragraph", "content": [
        {"type": "text", "text": "See the "},
        {"type": "text", "text": "documentation", "marks": [
          {"type": "link", "attrs": {"href": "https://docs.example.com"}}
        ]},
        {"type": "text", "text": " for details."}
      ]}
    ]}
  ]
}
```

## Usage with acli

### Descriptions (rich ADF) — use `--from-json`

`--description-file` only works reliably for trivial ADF (plain paragraphs). Headings, tables, lists, and other block nodes fail with `INVALID_INPUT`. Use `--from-json` instead — it passes the full ADF structure correctly to the Jira API:

```bash
# Write a workitem JSON with embedded ADF description
cat > /tmp/update.json << 'EOF'
{
  "issues": ["KEY-123"],
  "description": {
    "version": 1,
    "type": "doc",
    "content": [
      {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Summary"}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "Description text."}]}
    ]
  }
}
EOF

acli jira workitem edit --from-json /tmp/update.json --yes
```

### Comments — use `--body-file`

For comments, `--body-file` works with full ADF:

```bash
cat > /tmp/comment.json << 'EOF'
{
  "version": 1,
  "type": "doc",
  "content": [
    {"type": "paragraph", "content": [{"type": "text", "text": "Your comment"}]}
  ]
}
EOF

acli jira workitem comment create --key KEY-123 --body-file /tmp/comment.json
```

### Rules

- **Do not** pass ADF JSON inline via `--body` or `--description` — shell escaping will corrupt the JSON. Always use file-based flags.
- **Do not** use `--description-file` for rich ADF (headings, tables, lists). Use `--from-json` instead.
