---
name: dev-browser
description: Drive a real Chrome with the dev-browser CLI. Use when the user asks to open or click through a site, fill a form, log in, take a screenshot, or test a web app in a browser.
---

# dev-browser

CLI for controlling a real Chrome with short Puppeteer scripts. One warm daemon; named pages persist between runs.

```bash
npm install -g dev-browser@1.0.0-rc.4
dev-browser --version
dev-browser install          # only if the first run says "No Chrome found"
```

Use the pinned 1.0 release candidate for this Puppeteer API. The unqualified npm package currently installs 0.2.9, which uses Playwright.
Scripts run with the daemon's permissions. The script runtime is not a security sandbox.

Run `dev-browser --help` (full guide; `dev-browser help <topic>` for one section) before non-trivial work. Quick start:

```bash
dev-browser <<'EOF'
const page = await browser.getPage("main");        // named page persists across runs
await page.goto("https://example.com");            // default waitUntil: domcontentloaded
await page.snapshot({ interactive: true })         // ARIA tree with refs; last expression is printed
EOF
dev-browser -e 'const p = await browser.getPage("main"); await p.click("ref/e6"); await p.waitForLoad(); p.url()'
```

Gotchas: end lines with semicolons (a line starting with `(` continues the previous one); return an object as
`({ a, b })`; `page.click` never waits (use `waitForSelector` first); page names are per browser (`--headless` and
headed are separate Chromes and profiles); refs reset on navigation — re-snapshot; file paths resolve against your cwd
(uploadFile, screenshot/pdf `path`); do not run parallel dev-browser calls against the same named page.

## Reuse browser instances — do not open new ones

Every distinct `--browser <NAME>` spawns a separate Chromium instance. To avoid window sprawl:

1. **Before the first script of a session, check what already exists:**
   ```bash
   dev-browser browsers
   ```
   If a running instance fits the task (check its named pages), reuse its name with `--browser <NAME>`.
2. **Prefer attaching to an already-open Chrome** when one is running with remote debugging enabled: use `dev-browser --connect` (auto-discovers). Only fall back to daemon-launched browsers when no debuggable Chrome is available.
3. **Never invent a new `--browser` name** unless the user explicitly asks for an isolated session/profile. Otherwise stick to the default instance (omit the flag) or an existing name from `dev-browser browsers`.
4. **Check project instructions** (AGENTS.md) for a project-specific browser name before choosing one — some projects pin a named instance that holds required login sessions.
5. Reuse named pages (`browser.getPage("main")`) instead of creating new pages for every script.
