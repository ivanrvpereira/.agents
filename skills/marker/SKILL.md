---
name: marker
description: Parse documents to markdown using marker-pdf. Supports PDF, images (PNG/JPG/TIFF/etc.), PPTX, DOCX, XLSX, HTML, and EPUB. Use when the user asks to read, extract, or parse document content.
---

# marker — Document to Markdown

Parse documents into clean markdown using `marker-pdf` via the `marker.sh` wrapper script.

Script location: `~/.agents/skills/marker/marker.sh`

**Supported formats:** PDF, images (PNG/JPG/TIFF/BMP/GIF/WebP), PPTX, DOCX, XLSX, HTML, EPUB

## Triggers

- `parse/read/extract this document/pdf/file`
- `convert X to markdown`

## Quick Reference

```bash
# Basic extraction
~/.agents/skills/marker/marker.sh /path/to/file [output_dir]

# With LLM enhancement (Gemini 2.5 Flash — better tables, headers, image descriptions)
~/.agents/skills/marker/marker.sh /path/to/file [output_dir] --use-llm

# Large documents — lower DPI to reduce memory (~68% less)
~/.agents/skills/marker/marker.sh /path/to/file [output_dir] --low-dpi

# Flags can be combined
~/.agents/skills/marker/marker.sh /path/to/file [output_dir] --use-llm --low-dpi
```

## Usage

### Local file

```bash
~/.agents/skills/marker/marker.sh "/path/to/document.docx" /tmp/output
```

Prints the output `.md` path to stdout.

### Remote file

```bash
curl -sL "https://example.com/document.pdf" -o /tmp/document.pdf
~/.agents/skills/marker/marker.sh /tmp/document.pdf /tmp/output
```

### With LLM enhancement

Uses Gemini 2.5 Flash. Requires `GOOGLE_API_KEY` in the environment.

**What LLM adds:** image alt-text, better table merging, improved header detection. Body text extraction is identical without it.

### Large documents (--low-dpi)

Reduces DPI from 96/192 to 72/96, cutting memory ~68% per page. Use for documents that crash or are very large (100+ pages).

### Crash recovery

3-tier auto-retry on crash:

1. **Default DPI** (96/192) — first attempt
2. **Low DPI** (72/96) — auto-retry if default crashes
3. **Minimum DPI** (48/72) — final fallback

If `--low-dpi` is passed, starts at tier 2.

## Flags

| Flag | Effect |
|------|--------|
| `--use-llm` | Gemini 2.5 Flash enhancement (image descriptions, better tables/headers) |
| `--low-dpi` | Lower DPI (72/96), ~68% less memory — use for large documents |

## DPI Presets

| Preset | lowres / highres | Memory/page | Use case |
|--------|-----------------|-------------|----------|
| Default | 96 / 192 | ~13 MB | Normal documents |
| Low (`--low-dpi`) | 72 / 96 | ~4 MB | Large documents (100+ pages) |
| Minimum (auto-fallback) | 48 / 72 | ~2 MB | Crash recovery only |

Note: DPI affects image-based processing (PDFs, scanned images). Text-native formats (DOCX, HTML, EPUB) are less sensitive to DPI settings.

## Notes

- Output dir defaults to a temp dir if omitted (path printed to stderr)
- Accepts a single file or a directory of documents
