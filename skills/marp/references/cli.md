# Marp CLI Reference

## Installation

```bash
# npm (global)
npm install -g @marp-team/marp-cli

# npx (no install)
npx @marp-team/marp-cli slide.md

# Homebrew
brew install marp-cli

# Docker
docker run --rm -v $PWD:/home/marp/app marpteam/marp-cli slide.md
```

## Export Commands

```bash
# HTML (default)
marp slide.md
marp slide.md -o output.html

# PDF
marp --pdf slide.md
marp slide.md -o output.pdf

# PowerPoint
marp --pptx slide.md
marp slide.md -o output.pptx

# PNG (first slide)
marp --image png slide.md

# PNG (all slides)
marp --images png slide.md

# JPEG
marp --image jpeg slide.md
marp --images jpeg slide.md
```

## Common Options

| Option | Description |
|--------|-------------|
| `-o, --output <file>` | Output file path |
| `--pdf` | Convert to PDF |
| `--pptx` | Convert to PowerPoint |
| `--image <png\|jpeg>` | First slide to image |
| `--images <png\|jpeg>` | All slides to images |
| `--image-scale <n>` | Scale factor (default: 1) |
| `-w, --watch` | Auto-rebuild on changes |
| `-s, --server` | Serve via HTTP |
| `-p, --preview` | Open preview window |
| `--theme <name\|file>` | Override theme |
| `--theme-set <files>` | Additional theme CSS |
| `--html` | Enable HTML tags |
| `--allow-local-files` | Local file access (PDF/PPTX) |

## PDF Options

| Option | Description |
|--------|-------------|
| `--pdf-notes` | Add speaker notes as annotations |
| `--pdf-outlines` | Add bookmarks/outlines |
| `--pdf-outlines.pages` | Include page numbers |
| `--pdf-outlines.headings` | Include headings |

## Metadata Options

| Option | Description |
|--------|-------------|
| `--title <text>` | Document title |
| `--author <text>` | Author |
| `--description <text>` | Description |
| `--keywords <text>` | Keywords (comma-separated) |
| `--url <url>` | Canonical URL |
| `--og-image <url>` | Open Graph image |

## Watch & Server Modes

```bash
# Watch mode
marp -w slide.md

# Server mode (default: localhost:8080)
marp -s ./slides/

# Custom port
PORT=3000 marp -s ./slides/

# Server with format suffix
# Access: http://localhost:8080/slide.md?pdf
```

## Browser Options

```bash
--browser <chrome|edge|firefox>
--browser-path <path>
```

## Configuration File

### .marprc.yml

```yaml
allowLocalFiles: true
html: true
theme: gaia
themeSet: ./themes
pdf: true
options:
  looseYAML: false
  markdown:
    breaks: false
```

### marp.config.mjs

```javascript
export default {
  allowLocalFiles: true,
  html: true,
  theme: 'gaia',
  inputDir: './slides',
  output: './public',
}
```

## Batch Processing

```bash
# Convert directory
marp -I ./slides/

# Specific output directory
marp -I ./slides/ -o ./output/

# With format
marp --pdf -I ./slides/
```

## Docker Usage

```bash
# Basic
docker run --rm -v $PWD:/home/marp/app marpteam/marp-cli slide.md

# PDF export
docker run --rm -v $PWD:/home/marp/app marpteam/marp-cli --pdf slide.md

# Server mode
docker run --rm -p 8080:8080 -v $PWD:/home/marp/app marpteam/marp-cli -s .
```
