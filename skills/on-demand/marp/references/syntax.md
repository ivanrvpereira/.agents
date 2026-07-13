# Marp Markdown Syntax Reference

## Slide Structure

Separate slides with horizontal rules:

```markdown
# Slide 1
Content

---

# Slide 2
More content
```

Alternative rulers: `___`, `***`, `- - -`

## Front-matter

```markdown
---
marp: true
theme: default
paginate: true
header: 'Header text'
footer: 'Footer text'
---
```

## Directives

### Global (deck-wide)

| Directive | Values | Description |
|-----------|--------|-------------|
| `marp` | `true` | Enable Marp |
| `theme` | `default`, `gaia`, `uncover` | Set theme |
| `paginate` | `true`, `false` | Page numbers |
| `headingDivider` | `1-6` | Auto-split at heading level |
| `size` | `16:9`, `4:3` | Slide dimensions |
| `math` | `katex`, `mathjax` | Math library |
| `style` | CSS | Custom styles |

### Local (per-slide, cascades forward)

| Directive | Description |
|-----------|-------------|
| `paginate` | `true`, `false`, `hold`, `skip` |
| `header` | Header content |
| `footer` | Footer content |
| `class` | CSS class (`lead`, `invert`) |
| `backgroundColor` | Background color |
| `backgroundImage` | `url('path')` |
| `color` | Text color |

### Spot (single slide only)

Prefix with `_` for single-slide application:

```markdown
<!-- _backgroundColor: aqua -->
<!-- _class: lead -->
<!-- _paginate: skip -->
```

## Images

### Basic

```markdown
![Alt text](image.jpg)
```

### Sizing

```markdown
![width:200px](image.jpg)
![height:300px](image.jpg)
![w:200 h:150](image.jpg)
![w:50%](image.jpg)
```

### Background Images

```markdown
![bg](background.jpg)
![bg cover](image.jpg)      <!-- Fill (default) -->
![bg contain](image.jpg)    <!-- Fit -->
![bg 80%](image.jpg)        <!-- Scale -->
```

### Split Backgrounds

```markdown
![bg left](image.jpg)       <!-- Image left, content right -->
![bg right:40%](image.jpg)  <!-- Image right 40%, content 60% -->
```

### Multiple Backgrounds

```markdown
![bg](image1.jpg)
![bg](image2.jpg)
<!-- Horizontal arrangement -->

![bg vertical](image1.jpg)
![bg](image2.jpg)
<!-- Vertical arrangement -->
```

### Image Filters

```markdown
![blur:5px](image.jpg)
![brightness:1.5](image.jpg)
![grayscale:1](image.jpg)
![sepia:0.5](image.jpg)
![opacity:0.8](image.jpg)
![brightness:0.8 sepia:50%](image.jpg)  <!-- Combined -->
```

## Math

Inline: `$E = mc^2$`

Block:
```markdown
$$
\int_{-\infty}^\infty e^{-x^2} dx = \sqrt{\pi}
$$
```

## Fitting Header

```markdown
# <!-- fit --> This heading auto-scales to fit
```

## Speaker Notes

```markdown
# Slide Title

Content here

<!--
Speaker notes go in HTML comments
that aren't directives.
-->
```

## Scoped Styles

```markdown
<style scoped>
h1 { color: red; }
</style>

# This heading is red (this slide only)
```

## Global Styles

```markdown
<style>
section {
  background: #f5f5f5;
}
h1 {
  color: #0066cc;
}
</style>
```

## Theme Classes

```markdown
<!-- _class: lead -->         <!-- Centered -->
<!-- _class: invert -->        <!-- Dark mode -->
<!-- _class: lead invert -->   <!-- Combined -->
```

## Practical Image Patterns

### Pattern 1: Text Left, Image Right

```markdown
## Product Overview

![bg right:40%](product.png)

- Feature 1
- Feature 2
- Feature 3
```

### Pattern 2: Hero Image with Overlay Text

```markdown
![bg brightness:0.5](hero.png)

# Bold Statement

Subtitle text here
```

Darkened background makes white text readable.

### Pattern 3: Before/After Comparison

```markdown
![bg left:50%](before.png)
![bg right:50%](after.png)
```

### Pattern 4: Vertical Image Stack

```markdown
![bg vertical](image1.png)
![bg](image2.png)
```

### Pattern 5: Centered Diagram

```markdown
## Architecture

![w:600px](diagram.png)

The diagram above shows...
```

### Pattern 6: Three-Image Grid

```markdown
![bg](image1.png)
![bg](image2.png)
![bg](image3.png)
```

### Pattern 7: Blurred Background with Focus

```markdown
![bg blur:5px brightness:0.7](background.png)

# Clear Text

Blur de-emphasizes background
```

## Notes

- `![bg]` images go to background layer, don't overlap text
- Multiple backgrounds arrange left-to-right (or top-to-bottom with `vertical`)
- Image paths are relative to the markdown file
