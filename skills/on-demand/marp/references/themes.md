# Marp Theming Guide

## Built-in Themes

| Theme | Description |
|-------|-------------|
| `default` | Clean, minimal design |
| `gaia` | Bold, colorful with presets |
| `uncover` | Modern, large typography |

## Theme Classes

All built-in themes support:

- `lead` - Centered content for title slides
- `invert` - Inverted color scheme

```markdown
<!-- _class: lead -->
<!-- _class: invert -->
<!-- _class: lead invert -->
```

## Size Presets

```markdown
---
size: 16:9   <!-- 1280x720 (default) -->
size: 4:3    <!-- 960x720 -->
---
```

## Custom Theme CSS

### Basic Structure

```css
/* @theme my-theme */

section {
  width: 1280px;
  height: 720px;
  font-family: 'Helvetica Neue', sans-serif;
  font-size: 28px;
  padding: 40px;
  background: #ffffff;
  color: #333333;
}

h1 {
  font-size: 48px;
  color: #0066cc;
}

h2 {
  font-size: 36px;
}
```

### Pagination

```css
section::after {
  content: attr(data-marpit-pagination) ' / ' attr(data-marpit-pagination-total);
  font-size: 14px;
  position: absolute;
  bottom: 20px;
  right: 40px;
}
```

### Header & Footer

```css
header, footer {
  position: absolute;
  left: 40px;
  right: 40px;
  font-size: 14px;
}

header {
  top: 20px;
}

footer {
  bottom: 20px;
}
```

### Class Variants

```css
section.lead {
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

section.invert {
  background: #333;
  color: #fff;
}

section.center {
  justify-content: center;
}
```

### Size Presets in Custom Theme

```css
/* @theme my-theme */
/* @size 16:9 1280px 720px */
/* @size 4:3 960px 720px */
/* @size a4 960px 1356px */
```

### Auto-scaling

```css
/* @theme my-theme */
/* @auto-scaling true */
```

## Using Custom Themes

### CLI

```bash
marp --theme ./themes/custom.css slide.md
marp --theme-set ./themes/ slide.md
```

### Front-matter (with theme-set)

```markdown
---
marp: true
theme: my-theme
---
```

### VS Code Settings

```json
{
  "markdown.marp.themes": [
    "./themes/custom.css"
  ]
}
```

## Inline Styles

### Global (all slides)

```markdown
<style>
section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
</style>
```

### Scoped (single slide)

```markdown
<style scoped>
h1 {
  color: gold;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
}
</style>
```

## Color Schemes

### Professional Dark

```css
section {
  background: #1a1a2e;
  color: #eaeaea;
}
h1, h2 { color: #00d4ff; }
a { color: #ff6b6b; }
```

### Clean Light

```css
section {
  background: #fafafa;
  color: #333;
}
h1, h2 { color: #2563eb; }
```

### Gradient

```css
section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
```
