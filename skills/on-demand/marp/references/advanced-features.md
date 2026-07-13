# Marp Advanced Features

Advanced capabilities beyond basic slide creation.

## Math Typesetting

Marp Core supports Pandoc-style math using KaTeX.

### Inline Math

```markdown
The equation $E = mc^2$ changed physics.
```

### Block Math

```markdown
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

### Multi-line Equations

```markdown
$$
\begin{aligned}
  f(x) &= x^2 + 2x + 1 \\
  &= (x + 1)^2
\end{aligned}
$$
```

### Common Examples

```markdown
## Quadratic Formula

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

## Euler's Identity

$$
e^{i\pi} + 1 = 0
$$
```

**Note**: Uses KaTeX syntax (LaTeX subset). See https://katex.org/docs/supported.html

## Emoji Support

GitHub emoji shortcodes work in Marp Core:

```markdown
:smile: :heart: :+1: :sparkles:
```

Renders as: 😄 ❤️ 👍 ✨

### Useful Emoji

| Code | Result | Use |
|------|--------|-----|
| `:arrow_right:` | → | Flow |
| `:white_check_mark:` | ✅ | Done |
| `:x:` | ❌ | No |
| `:bulb:` | 💡 | Idea |
| `:warning:` | ⚠️ | Caution |
| `:rocket:` | 🚀 | Launch |

Full list: https://github.com/ikatyang/emoji-cheat-sheet

## HTML Layouts

### Centered Content

```markdown
<div style="text-align: center;">

Centered text here

</div>
```

### Two-Column Layout

```markdown
<div style="display: flex; gap: 2rem;">
<div style="flex: 1;">

## Left Side

- Point 1
- Point 2

</div>
<div style="flex: 1;">

## Right Side

- Point 3
- Point 4

</div>
</div>
```

### Styled Box

```markdown
<div style="background: #e3f2fd; padding: 20px; border-radius: 8px;">

**Important Note**

Key information goes here.

</div>
```

### Grid Layout

```markdown
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
<div>

Left content

</div>
<div>

Right content

</div>
</div>
```

## Auto-scaling

Marp auto-scales text when content overflows. To disable:

```markdown
<!-- _class: no-scaling -->

# Large content here
```

Or via CSS:

```css
section.no-scaling {
  --marpit-auto-scaling: off;
}
```

## Fragmented Lists

In HTML output with `--html` flag, lists animate step-by-step:

```markdown
* First item appears
* Second item appears
* Third item appears
```

**Note**: Only works in HTML presentation mode, not PDF/PPTX.

## VS Code Integration

### Setup

1. Install "Marp for VS Code" extension
2. Add `marp: true` to frontmatter
3. Preview: `Cmd+Shift+V` (Mac) / `Ctrl+Shift+V` (Win/Linux)

### Export

1. Command Palette (`Cmd+Shift+P`)
2. "Marp: Export slide deck..."
3. Choose format (HTML/PDF/PPTX/PNG/JPEG)

### Settings

```json
{
  "markdown.marp.enableHtml": true,
  "markdown.marp.themes": [
    "./themes/custom.css"
  ]
}
```

## GitHub Actions CI/CD

Auto-build slides on push:

```yaml
name: Marp Build

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build PDF
        uses: docker://marpteam/marp-cli:latest
        with:
          args: slides.md --pdf --allow-local-files

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: slides
          path: slides.pdf
```

### Deploy to GitHub Pages

```yaml
- name: Build HTML
  uses: docker://marpteam/marp-cli:latest
  with:
    args: slides.md -o index.html

- name: Deploy
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./
```

## Custom CSS Tips

### Progress Bar

```css
section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: calc(var(--paginate) / var(--paginate-total) * 100%);
  height: 5px;
  background: #3b82f6;
}
```

### Custom Page Numbers

```css
section::after {
  content: 'Page ' attr(data-marpit-pagination) ' of ' attr(data-marpit-pagination-total);
}
```

### Gradient Background

```markdown
---
backgroundImage: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
color: white
---
```

## Troubleshooting

### PDF Not Generating

- Ensure Chrome or Edge is installed
- Add `--allow-local-files` flag
- Check browser path: `--browser-path /path/to/chrome`

### Fonts Not Rendering

- Use `@import` for Google Fonts in `<style>` block
- For local fonts, use absolute paths
- Embed fonts in custom theme CSS

### Images Not Showing

- Check relative paths from markdown file location
- Use `--allow-local-files` for local images in PDF/PPTX
- Try absolute paths for troubleshooting

### Math Not Rendering

- Ensure using Marp Core (not just Marpit)
- Check KaTeX syntax compatibility
- Escape special characters if needed

## Official References

- **Marp**: https://marp.app/
- **Marpit Directives**: https://marpit.marp.app/directives
- **Image Syntax**: https://marpit.marp.app/image-syntax
- **Theme CSS**: https://marpit.marp.app/theme-css
- **Marp CLI**: https://github.com/marp-team/marp-cli
- **VS Code Extension**: https://marketplace.visualstudio.com/items?itemName=marp-team.marp-vscode
