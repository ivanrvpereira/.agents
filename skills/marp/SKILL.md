---
name: marp
description: |
  Create slide presentations from Markdown using Marp. Use when:
  (1) Creating presentation slides or decks
  (2) Converting markdown to PDF/PPTX/HTML slides
  (3) User mentions "marp", "slides", "presentation", or "deck"
  (4) Requests for speaker notes, slide themes, or presentation exports
  (5) Vague requests like "make it look good" or "make slides professional"
  Supports themes, backgrounds, math, diagrams, and multiple export formats.
---

# Marp Presentations

Create presentations from Markdown using [Marp](https://marp.app).

## Quick Start

1. Create a `.md` file with `marp: true` in front-matter
2. Separate slides with `---`
3. Export with `marp --pdf slides.md` or `npx @marp-team/marp-cli --pdf slides.md`

## Basic Structure

```markdown
---
marp: true
theme: default
paginate: true
---

<!-- _class: lead -->

# Presentation Title

Author Name

---

## Content Slide

- Point one
- Point two
- Point three
```

## Workflow

### Step 1: Understand Requirements

- Identify content: title, topics, key points
- Determine target audience
- Assess formality level

### Step 2: Select Theme

| Content Type | Recommended Theme |
|-------------|-------------------|
| General/Unsure | `default` |
| Modern/Dark | `gaia` with `invert` |
| Minimal/Clean | `uncover` |

### Step 3: Structure Content

1. **Title slide**: Use `<!-- _class: lead -->` + h1
2. **Agenda slide**: Overview with 3-5 items
3. **Content slides**: h2 title + bullet points
4. **Summary slide**: Key takeaways

### Step 4: Apply Best Practices

- **Titles**: 3-5 words, clear and concise
- **Bullets**: 3-5 items per slide
- **Text**: 15-30 characters per line
- **Rule**: 1 slide = 1 message

### Step 5: Add Images (if needed)

Common pattern:
```markdown
## Slide Title

![bg right:40%](image.png)

- Explanation point 1
- Explanation point 2
```

### Step 6: Export

```bash
marp slides.md -o output.pdf    # PDF
marp slides.md -o output.pptx   # PowerPoint
marp slides.md -o output.html   # HTML
```

## Handling "Make It Look Good" Requests

When users give vague instructions like "make it professional" or "improve the design":

1. **Infer from content**:
   - Business content → `default` theme, formal structure
   - Technical content → `gaia` with `invert`, code-friendly
   - Creative content → custom colors via `backgroundColor`

2. **Apply automatically**:
   - Shorten titles to 3-5 words
   - Limit bullet points to 3-5 items
   - Add whitespace between sections
   - Use consistent structure throughout

3. **Enhance visual hierarchy**:
   - Title slide with `<!-- _class: lead -->`
   - Section breaks with centered headings
   - Logical flow: intro → body → conclusion

## Essential Directives

| Directive | Usage |
|-----------|-------|
| `theme` | `default`, `gaia`, `uncover` |
| `paginate` | `true` for page numbers |
| `class` | `lead` (centered), `invert` (dark) |
| `_class` | Single-slide class (prefix `_`) |
| `header` | Header text for all slides |
| `footer` | Footer text for all slides |

## Image Quick Reference

```markdown
![bg](image.jpg)              <!-- Full background -->
![bg right:40%](image.jpg)    <!-- Split: image right, text left -->
![bg left:40%](image.jpg)     <!-- Split: image left, text right -->
![bg brightness:0.5](img.jpg) <!-- Darkened for text overlay -->
![w:400](image.jpg)           <!-- Inline, specific width -->
```

## Quality Checklist

Before delivering, verify:

- [ ] Title slide uses `<!-- _class: lead -->`
- [ ] All h2 titles are concise (3-5 words)
- [ ] Bullet points are 3-5 items per slide
- [ ] 1 slide = 1 message
- [ ] Adequate whitespace
- [ ] Images use proper Marp syntax
- [ ] Pagination enabled (`paginate: true`)
- [ ] File saved with `.md` extension

## References

- **Syntax & image patterns**: [references/syntax.md](references/syntax.md)
- **Best practices**: [references/best-practices.md](references/best-practices.md)
- **Advanced features** (math, HTML layouts, CI/CD): [references/advanced-features.md](references/advanced-features.md)
- **Theming guide**: [references/themes.md](references/themes.md)
- **CLI reference**: [references/cli.md](references/cli.md)

## Assets

- **Template**: Copy [assets/template.md](assets/template.md) as starting point

## Export Commands

```bash
marp slides.md              # HTML (default)
marp --pdf slides.md        # PDF
marp --pptx slides.md       # PowerPoint
marp -w slides.md           # Watch mode (auto-rebuild)
marp -s ./slides/           # Server mode (live preview)
marp -p slides.md           # Open preview window
```

Use `npx @marp-team/marp-cli` if not installed globally.
