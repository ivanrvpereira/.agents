---
name: crwl
description: Crawl and extract web content using the Crawl4AI CLI (crwl). Fetches pages as clean markdown, extracts structured data with LLM or CSS strategies, and answers questions about page content.
---

# crwl - Web Crawling & Extraction

Use the `crwl` CLI to fetch web pages, extract structured data, and answer questions about web content. Always run via Bash tool.

## Triggers

- `crawl this page`
- `extract data from this URL`
- `read this web page`
- `scrape this site`
- `what does this page say about`

## Quick Reference

| Task | Command |
|------|---------|
| Fetch as markdown | `crwl URL -o md-fit -B ~/.dotfiles/crwl/browser.yml -C ~/.dotfiles/crwl/crawler.yml -f ~/.dotfiles/crwl/filter_pruning.yml` |
| Ask a question | `crwl URL -q "your question"` |
| LLM extraction | `crwl URL -j "describe what to extract" -o json` |
| CSS extraction | `crwl URL -e extract.yml -s schema.json -o json` |
| Deep crawl (BFS) | `crwl URL --deep-crawl bfs --max-pages 10 -o md-fit` |
| Save to file | `crwl URL -o md-fit -O output.md` |

## Config Files

User config files live at `~/.dotfiles/crwl/`:

| File | Purpose |
|------|---------|
| `browser.yml` | Headless, random user-agent, 1280x720 viewport |
| `crawler.yml` | Bypass cache, networkidle, magic mode, excludes nav/footer/header/aside |
| `filter_pruning.yml` | Pruning content filter at 0.48 threshold |

**Always include these flags** unless the user specifies otherwise:

```
-B ~/.dotfiles/crwl/browser.yml \
-C ~/.dotfiles/crwl/crawler.yml \
-f ~/.dotfiles/crwl/filter_pruning.yml
```

## Output Formats

| Flag | Description |
|------|-------------|
| `-o md` | Full markdown |
| `-o md-fit` | Filtered/pruned markdown (recommended for LLM consumption) |
| `-o json` | JSON with all metadata |
| `-o all` | Everything (html, markdown, metadata) |

**Default to `-o md-fit`** for reading content. Use `-o json` for structured extraction.

## Usage Patterns

### 1. Read a web page

```bash
crwl "https://example.com/article" \
  -o md-fit \
  -B ~/.dotfiles/crwl/browser.yml \
  -C ~/.dotfiles/crwl/crawler.yml \
  -f ~/.dotfiles/crwl/filter_pruning.yml
```

### 2. Ask a question about a page

```bash
crwl "https://example.com" \
  -q "What are the main features listed?" \
  -B ~/.dotfiles/crwl/browser.yml \
  -C ~/.dotfiles/crwl/crawler.yml
```

### 3. Extract structured data with LLM

```bash
crwl "https://example.com/products" \
  -j "Extract all products with name, price, and description" \
  -o json \
  -B ~/.dotfiles/crwl/browser.yml \
  -C ~/.dotfiles/crwl/crawler.yml
```

For schema-based extraction, create a JSON schema file and extraction config:

```bash
crwl "https://example.com/products" \
  -e extract_llm.yml \
  -s schema.json \
  -o json \
  -B ~/.dotfiles/crwl/browser.yml \
  -C ~/.dotfiles/crwl/crawler.yml
```

### 4. Deep crawl a site

```bash
crwl "https://docs.example.com" \
  --deep-crawl bfs \
  --max-pages 20 \
  -o md-fit \
  -B ~/.dotfiles/crwl/browser.yml \
  -C ~/.dotfiles/crwl/crawler.yml \
  -f ~/.dotfiles/crwl/filter_pruning.yml
```

Strategies: `bfs` (breadth-first), `dfs` (depth-first), `best-first` (relevance-based).

### 5. Crawl with authentication (browser profile)

```bash
# First, create a profile interactively (user must do this manually)
crwl profiles

# Then use it
crwl "https://private-site.com/dashboard" \
  -p my-profile \
  -o md-fit \
  -B ~/.dotfiles/crwl/browser.yml \
  -C ~/.dotfiles/crwl/crawler.yml
```

### 6. Target specific content with CSS

```bash
crwl "https://example.com" \
  -c "css_selector=article.main-content" \
  -o md-fit \
  -B ~/.dotfiles/crwl/browser.yml \
  -C ~/.dotfiles/crwl/crawler.yml \
  -f ~/.dotfiles/crwl/filter_pruning.yml
```

## Inline Overrides

Override config file settings with `-b` (browser) and `-c` (crawler) flags:

```bash
# Show browser window
crwl URL -b "headless=false" -B ~/.dotfiles/crwl/browser.yml -C ~/.dotfiles/crwl/crawler.yml

# Target specific element and wait longer
crwl URL -c "css_selector=#content,page_timeout=60000" -B ~/.dotfiles/crwl/browser.yml -C ~/.dotfiles/crwl/crawler.yml
```

## LLM Configuration

The default LLM provider for `-j` and `-q` is configured globally:

```bash
crwl config list                                          # View current settings
crwl config set DEFAULT_LLM_PROVIDER "openai/gpt-4o"     # Set provider
crwl config set DEFAULT_LLM_PROVIDER_TOKEN "your-key"    # Set API key
```

## Anti-Patterns

| Avoid | Instead |
|-------|---------|
| Omitting config flags | Always pass `-B`, `-C`, `-f` from `~/.dotfiles/crwl/` |
| Using `-o md` for LLM input | Use `-o md-fit` — it's pruned and cleaner |
| Deep crawl without `--max-pages` | Always set a limit to avoid runaway crawls |
| Fetching full sites for one page | Use single URL, reserve `--deep-crawl` for multi-page needs |
| Running `crwl profiles` in Bash | Profile creation is interactive — tell the user to run it manually |

## GitHub URLs

Don't use `crwl` for GitHub file URLs — use `curl` with raw URLs instead (faster, no browser needed).

**Convert blob URLs to raw:**

```
https://github.com/{owner}/{repo}/blob/{branch}/{path}
→ https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}
```

**Example:**

```bash
# Instead of: crwl "https://github.com/user/repo/blob/main/src/app.py" ...
curl -sSL "https://raw.githubusercontent.com/user/repo/main/src/app.py"
```

Also works directly for `raw.githubusercontent.com` and `gist.githubusercontent.com/*/raw/` URLs.
