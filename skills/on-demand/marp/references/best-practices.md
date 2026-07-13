# Marp Slide Best Practices

Guidelines for creating high-quality, professional presentations.

## Slide Titles (h2)

### Good
- **Concise**: 3-5 words
- **Clear**: Content understood at a glance
- **Consistent**: Same style across slides

```markdown
## Introduction
## The Problem
## Our Solution
## Results
```

### Avoid
```markdown
## This Chapter Explains the Introduction
## What Are the Challenges We Face Today
```

## Bullet Points

### Good
- **3-5 items** per slide
- **15-30 characters** per line
- **Parallel structure**: Same grammar pattern

```markdown
- Simple and clear
- Consistent design
- Effective communication
```

### Avoid
```markdown
- This is a very long explanation that doesn't fit on one line and becomes hard to read
- Short
- The next item uses a completely different sentence structure which breaks consistency
```

## Slide Structure

### Basic Flow

1. **Title slide** (`<!-- _class: lead -->`)
   - Title
   - Presenter name
   - Date

2. **Agenda slide**
   - Overview of topics
   - 3-5 items

3. **Content slides**
   - 1 slide = 1 message
   - Title summarizes content

4. **Summary slide**
   - Key takeaways
   - Thank you / Q&A

### Slide Count Guidelines

| Duration | Slides |
|----------|--------|
| 5 min | 5-8 |
| 10 min | 10-15 |
| 20 min | 15-25 |
| 30 min | 20-35 |

## Text Balance

### Good Balance

```markdown
## Product Features

- Fast processing
- Intuitive UI
- Scalable architecture
```

### Too Dense

```markdown
## About Our Product

This product was developed using the latest technology.
The main features include the following 7 points:
- Feature 1: A long detailed explanation continues...
- Feature 2: Even more detailed explanation...
(and so on)
```

## Whitespace

- **Don't overcrowd**: Leave breathing room
- **Guide the eye**: Important info stands out
- **Between slides**: Vary density for rhythm

## Image Usage

### Effective Use
- **Purpose-driven**: Aids understanding, not decoration
- **High quality**: Use high-resolution images
- **Right size**: Not too big, not too small

### Layout Pattern

```markdown
## Diagram Explanation

![bg right:40%](diagram.png)

- Point 1
- Point 2
- Point 3
```

## Font Size Guidelines

Marp themes typically use:
- h1: 48-56px (title slides only)
- h2: 36-40px (slide titles)
- h3: 24-28px (subheadings)
- Body: 20-24px

## Quality Checklist

Before delivering slides, verify:

- [ ] Titles are concise (3-5 words)
- [ ] Bullet points are 3-5 items per slide
- [ ] 1 slide = 1 message
- [ ] Text amount is appropriate
- [ ] Adequate whitespace
- [ ] Images are used effectively
- [ ] Overall consistency maintained
- [ ] Slide count matches time allocation
- [ ] Title slide uses `<!-- _class: lead -->`
- [ ] Pagination enabled if needed
