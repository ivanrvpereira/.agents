---
name: marker
description: Parse documents to markdown using marker-pdf. Supports PDF, images (PNG/JPG/TIFF/BMP/GIF/WebP), PPTX, DOCX, XLSX, HTML, and EPUB. Use when the user asks to read, extract, parse, or convert document content to markdown.
---

# marker — Document to Markdown

Parse documents into clean markdown via `~/.agents/skills/marker/marker.sh`.

**Supported formats:** PDF, images (PNG/JPG/TIFF/BMP/GIF/WebP), PPTX, DOCX, XLSX, HTML, EPUB

## Quick Reference

```bash
# Basic
marker.sh /path/to/file [output_dir]

# LLM-enhanced (better tables, headers, image descriptions) — requires GOOGLE_API_KEY
marker.sh /path/to/file [output_dir] --use-llm

# Force OCR — fixes garbled text, enables proper inline math
marker.sh /path/to/file [output_dir] --force-ocr

# Specific pages only
marker.sh /path/to/file [output_dir] --page-range=0,5-10,20

# Large documents — lower DPI, ~68% less memory
marker.sh /path/to/file [output_dir] --low-dpi

# Remote file
curl -sL "https://example.com/doc.pdf" -o /tmp/doc.pdf && marker.sh /tmp/doc.pdf
```

Prints the output `.md` path to stdout. Output dir defaults to a temp dir if omitted.

## Flags

| Flag | Effect |
|------|--------|
| `--use-llm` | Gemini 2.5 Flash enhancement — better tables, merged headers, image alt-text. Requires `GOOGLE_API_KEY`. |
| `--force-ocr` | Force OCR on all pages. Use for garbled/corrupted text or to enable proper inline math. |
| `--page-range=` | Convert specific pages, e.g. `0,5-10,20`. |
| `--low-dpi` | Lower DPI (72/96), ~68% less memory — use for large docs (100+ pages). |

## LLM Services

Default LLM is Gemini 2.5 Flash (`GOOGLE_API_KEY`). For other backends (Ollama, Claude, OpenAI, Vertex), call `marker` directly with `--llm_service`. See [upstream docs](https://github.com/datalab-to/marker#llm-services).

## DPI Presets

| Preset | lowres / highres | Memory/page | Use case |
|--------|-----------------|-------------|----------|
| Default | 96 / 192 | ~13 MB | Normal documents |
| Low (`--low-dpi`) | 72 / 96 | ~4 MB | Large documents (100+ pages) |
| Minimum (auto-fallback) | 48 / 72 | ~2 MB | Crash recovery only |

Auto-retries on crash: default → low DPI → minimum DPI.

## Troubleshooting

- **Garbled or wrong text** — use `--force-ocr`
- **Bad tables** — use `--use-llm`
- **Out of memory / crash** — use `--low-dpi`, or split the document
- **Inline math not rendering** — use `--force-ocr` (with `--use-llm` for highest quality)
