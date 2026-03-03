# ADF (Atlassian Document Format)

Jira Cloud uses ADF (JSON-based rich text) for descriptions and comments. Plain `\n` newlines don't create paragraph breaks.

## Limitations with acli

- **Supported:** paragraphs, bullet/ordered lists, code blocks
- **Not supported / stripped:** headings, bold, italic, inline code, code block syntax highlighting

## Basic Templates

### Paragraph

```json
{
  "version": 1,
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [{"type": "text", "text": "Your text here"}]
    }
  ]
}
```

### Bullet List

```json
{
  "version": 1,
  "type": "doc",
  "content": [
    {
      "type": "bulletList",
      "content": [
        {
          "type": "listItem",
          "content": [
            {"type": "paragraph", "content": [{"type": "text", "text": "Item one"}]}
          ]
        },
        {
          "type": "listItem",
          "content": [
            {"type": "paragraph", "content": [{"type": "text", "text": "Item two"}]}
          ]
        }
      ]
    }
  ]
}
```

### Code Block

```json
{
  "version": 1,
  "type": "doc",
  "content": [
    {
      "type": "codeBlock",
      "attrs": {"language": "python"},
      "content": [{"type": "text", "text": "def hello():\n    print('Hello')"}]
    }
  ]
}
```

### Multiple Paragraphs

```json
{
  "version": 1,
  "type": "doc",
  "content": [
    {"type": "paragraph", "content": [{"type": "text", "text": "First paragraph."}]},
    {"type": "paragraph", "content": [{"type": "text", "text": "Second paragraph."}]}
  ]
}
```

## Usage with acli

```bash
# Inline (escape carefully)
acli jira workitem comment create --key KEY-1 --body '{"version":1,"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Your text"}]}]}'

# From file (recommended for longer content)
acli jira workitem comment create --key KEY-1 --body-file comment.json
acli jira workitem edit --key KEY-1 --description-file description.json
```
