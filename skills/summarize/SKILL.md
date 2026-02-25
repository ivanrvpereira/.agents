---
name: summarize
description: "Fetch a URL or convert a local file (PDF/DOCX/HTML/etc.) into Markdown using `uvx markitdown` or the `summarize` CLI, optionally it can summarize"
---

Turn "things" (URLs, PDFs, Word docs, PowerPoints, HTML pages, text files, YouTube videos, podcasts, audio/video, etc.) into **Markdown** so they can be inspected/quoted/processed like normal text.

Two tools are available — pick the right one for the job:

| Tool | Best for |
|------|----------|
| `uvx markitdown` / `to-markdown.mjs` | Quick local file conversion (PDF/DOCX/PPTX/HTML → Markdown) |
| `summarize` CLI | YouTube videos, podcasts, audio/video, web pages, LLM-powered summaries |

## When to use

Use this skill when you need to:
- pull down a web page as a document-like Markdown representation
- convert binary docs (PDF/DOCX/PPTX) into Markdown for analysis
- quickly produce a short summary of a long document before deeper work
- **extract transcripts from YouTube videos**
- **summarize YouTube videos, podcasts, or audio/video files**
- **extract slide screenshots from video content**

---

## `summarize` CLI

The [`summarize`](https://github.com/steipete/summarize) CLI handles URLs, files, YouTube, podcasts, and media with LLM-powered summaries. Install: `npm i -g @steipete/summarize`.

### YouTube — extract transcript (no LLM)

```bash
summarize "https://www.youtube.com/watch?v=..." --extract
```

Format transcript as clean Markdown (headings + paragraphs) via LLM:

```bash
summarize "https://www.youtube.com/watch?v=..." --extract --format md --markdown-mode llm
```

Include timestamps:

```bash
summarize "https://www.youtube.com/watch?v=..." --extract --timestamps
```

### YouTube — summarize

```bash
summarize "https://www.youtube.com/watch?v=..."
```

Control length (`short|medium|long|xl|xxl` or character count like `20k`):

```bash
summarize "https://www.youtube.com/watch?v=..." --length long
```

Custom prompt:

```bash
summarize "https://www.youtube.com/watch?v=..." --prompt "Focus on the technical architecture decisions."
```

### YouTube — slides extraction

Extract key slide screenshots from video (scene detection via ffmpeg):

```bash
summarize "https://www.youtube.com/watch?v=..." --slides
```

Slides + OCR (requires `tesseract`):

```bash
summarize "https://www.youtube.com/watch?v=..." --slides --slides-ocr
```

Full transcript interleaved with slides:

```bash
summarize "https://www.youtube.com/watch?v=..." --slides --extract
```

### YouTube — transcript source control

```bash
--youtube auto       # default: best-effort web first, then fallbacks
--youtube web        # web transcript endpoints only
--youtube no-auto    # skip auto-generated captions
--youtube yt-dlp     # force yt-dlp audio download + Whisper transcription
--youtube apify      # use Apify actor (requires APIFY_API_TOKEN)
```

### Web pages

```bash
summarize "https://example.com"
summarize "https://example.com" --extract                # extracted text, no LLM
summarize "https://example.com" --extract --format md    # extracted as Markdown
```

### Podcasts

Supports Apple Podcasts, Spotify, RSS feeds, and more:

```bash
summarize "https://podcasts.apple.com/us/podcast/..."
summarize "https://feeds.npr.org/500005/podcast.xml"
```

### Local files and media

```bash
summarize "/path/to/file.pdf"
summarize "/path/to/audio.mp3"
summarize "/path/to/video.mp4" --video-mode transcript
```

### Stdin

```bash
pbpaste | summarize -
cat document.txt | summarize -
```

### Common flags

| Flag | Description |
|------|-------------|
| `--extract` | Print extracted content, no LLM summary |
| `--length <preset\|chars>` | `short\|medium\|long\|xl\|xxl` or `20k` |
| `--model <provider/model>` | e.g. `openai/gpt-5-mini`, `anthropic/claude-sonnet-4-5`, `google/gemini-3-flash-preview` |
| `--cli <provider>` | Use coding CLI as backend: `claude`, `gemini`, `codex` |
| `--format md\|text` | Extraction format (default: `text`) |
| `--markdown-mode llm` | Format raw transcripts into clean Markdown via LLM |
| `--language <lang>` | Output language (`auto`, `en`, `de`, etc.) |
| `--timestamps` | Include timestamps in transcripts |
| `--prompt <text>` | Custom summary prompt |
| `--json` | Structured JSON output with metrics |
| `--plain` | No ANSI rendering |
| `--verbose` | Debug/diagnostics on stderr |
| `--timeout <duration>` | e.g. `30s`, `2m` (default: `2m`) |

---

## `uvx markitdown` / `to-markdown.mjs`

For quick local conversion of files and URLs to Markdown without LLM summarization.

### Convert a URL or file to Markdown

Run from **this skill folder** (the agent should `cd` here first):

```bash
uvx markitdown <url-or-path>
```

To write Markdown to a temp file (prints the path) use the wrapper:

```bash
node to-markdown.mjs <url-or-path> --tmp
```

Tip: when summarizing, the script will **always** write the full converted Markdown to a temp `.md` file and will **always** print a final "Hint" line with the path (so you can open/inspect the full content).

Write Markdown to a specific file:

```bash
uvx markitdown <url-or-path> > /tmp/doc.md
```

### Convert + summarize with haiku-4-5 (pass context!)

Summaries are only useful when you provide **what you want extracted** and the **audience/purpose**.

```bash
node to-markdown.mjs <url-or-path> --summary --prompt "Summarize focusing on X, for audience Y. Extract Z."
```

Or:

```bash
node to-markdown.mjs <url-or-path> --summary --prompt "Focus on security implications and action items."
```

This will:
1) convert to Markdown via `uvx markitdown`
2) write the full Markdown to a temp `.md` file and print its path as a "Hint" line
3) run `pi --model claude-haiku-4-5` (no-tools, no-session) to summarize using your extra prompt
