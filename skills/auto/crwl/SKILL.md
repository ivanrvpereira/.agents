---
name: crwl
description: Crawl and extract web content with the Crawl4AI CLI (`crwl`). Use when the user asks to crawl or scrape a site, read a page that needs a real browser, or extract structured data from a URL.
---

# crwl

Run `crwl --help` for the full flag list. Prefix commands with `CRAWL4AI_NO_CLOUD_NOTICE=1` to hide the banner.

## House defaults

Always pass the user's config files, unless the user says otherwise. Below, `$CFG` stands for these flags:

```bash
CFG="-B $HOME/.dotfiles/crwl/browser.yml -C $HOME/.dotfiles/crwl/crawler.yml -f $HOME/.dotfiles/crwl/filter_pruning.yml"
```

They set a headless browser, bypass the cache, wait for network idle, strip nav/header/footer/aside, and prune boilerplate.

Read pages as `-o md-fit` (pruned markdown). Use `-o json` only with `-j` or `-e`.

| Task | Command |
|------|---------|
| Read a page | `crwl URL -o md-fit $CFG` |
| Ask about a page | `crwl URL -q "question" $CFG` |
| LLM extraction | `crwl URL -j "what to extract" -o json $CFG` |
| Schema extraction | `crwl URL -e extract.yml -s schema.json -o json $CFG` |
| One element | `crwl URL -c "css_selector=article.main" -o md-fit $CFG` |
| Deep crawl | `crwl URL --deep-crawl bfs --max-pages 10 -o md-fit $CFG` |
| Logged-in page | `crwl URL -p <profile> -o md-fit $CFG` |

## Rules

- Crawl one URL unless the task needs many pages. Every deep crawl sets `--max-pages`.
- `crwl profiles` is interactive: ask the user to run it to create a login profile.
- `-q` and `-j` call the LLM provider set in `crwl config list`. Leave that configuration and its keys to the user.
- For github.com content, use `gh` instead of `crwl`.
