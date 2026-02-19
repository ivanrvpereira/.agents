---
name: doc-extract
description: Extract documents to clean markdown using marker. Supports PDF, DOCX, PPTX, XLSX, EPUB, HTML, and images. Use when the user asks to read, extract, parse, or convert document content.
---

# doc-extract

Extract documents to markdown via `~/.agents/skills/doc-extract/doc-extract.sh`.

```bash
# Basic extraction
doc-extract.sh <file|dir> [output_dir]

# LLM-enhanced (better tables, image descriptions) — only when user requests it
doc-extract.sh <file> [output_dir] --use-llm

# Large documents that may crash
doc-extract.sh <file> [output_dir] --low-dpi
```

## Flags

| Flag | Effect |
|------|--------|
| `--use-llm` | Gemini 2.5 Flash enhancement. Key from 1Password — never in config. |
| `--low-dpi` | Lower DPI (72/96) for large docs. Auto-retries with minimum DPI on crash. |

Default to **no flags**. Only add `--use-llm` if the user explicitly asks.

## Supported formats

PDF, DOCX, PPTX, XLSX, EPUB, HTML, PNG, JPG, TIFF, BMP, GIF, WebP.

Format is auto-detected. Non-PDF formats are internally converted to PDF by marker before processing.

## Notes

- Prints the output `.md` path to stdout
- Output dir defaults to a temp dir if omitted
- Remote files: download first with `curl -sL`, then pass the local path
