---
name: liteparse
description: Read or extract text, tables, and values from a document file (PDF, DOCX, PPTX, XLSX, or image) locally with the `lit` CLI. Use when a task needs the contents of such a file.
compatibility: Requires Node 18+ and `@llamaindex/liteparse` (`npm i -g @llamaindex/liteparse`, verify `lit --version`). LibreOffice for Office files; ImageMagick for images. The bundled search.py helper needs `uv`.
license: MIT
metadata:
  author: LlamaIndex
  version: "1.0.1"
---

# LiteParse

`lit` extracts text from documents locally without a model. Every `lit parse` re-extracts the whole document, and every line you print stays in context for the rest of the session, so the goal is few parses, few turns, small output.

## Parse once to a file, then search the file

```bash
lit parse "/abs/path/doc.pdf" --format text --no-ocr -o /tmp/doc.txt && wc -l /tmp/doc.txt
```

Reuse `/tmp/doc.txt` for every later question about the document. Never re-run `lit parse` to search.

- **Born-digital PDF** (has a text layer, like most reports): pass `--no-ocr`. It is much faster and gives the same text.
- **Scanned PDF or image**: drop `--no-ocr`. If digits look wrong, read the page visually (below).
- `--format json` only when you need bounding boxes or layout. Search it, never print it whole.

## Search in few turns

- Get the context in the same command: `grep -n -i -C4 "total assets" /tmp/doc.txt | head -40`. Use `sed -n 'A,Bp'` only when you need a wider window than `-C` gave.
- Batch independent lookups into one command:

  ```bash
  for q in "carbon intensity" "scope 1" "total revenue"; do \
    echo "=== $q ==="; grep -n -i -C3 "$q" /tmp/doc.txt | head -25; done
  ```

- Bound every output with `head`. Use shell `grep`/`sed` on the saved file rather than the Read and Grep tools.
- If two targeted greps do not find the answer, run the bundled BM25 ranker once instead of trying keyword variants. Give it a natural-language query with several synonyms. `-k` is the number of matches and `-e` the lines of context around each:

  ```bash
  uv run --script <skill-dir>/scripts/search.py /tmp/doc.txt -q "materiality assessment priority topics" -k 8 -e 5
  ```

## Read a page visually: last resort

Screenshots are the most expensive thing you can put in context. Use one only when text cannot answer the question (dense multi-column tables, figures, charts). Render one page at modest DPI, and re-render higher only if the text is illegible:

```bash
lit screenshot "/abs/path/doc.pdf" --target-pages "13" --dpi 150 -o /tmp/shots/   # then read the PNG
```

The page flag is `--target-pages`, not `--pages`.

## Setup

Go straight to the parse. Skip `lit --version` and `--help` unless something failed. If `lit` is missing: `npm i -g @llamaindex/liteparse`. Office files need LibreOffice and images need ImageMagick; `lit` converts both to PDF.
