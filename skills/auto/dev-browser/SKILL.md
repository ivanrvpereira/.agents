---
name: dev-browser
description: Browser automation with persistent page state. Use when users ask to navigate websites, fill forms, take screenshots, extract web data, test web apps, or automate browser workflows. Trigger phrases include "go to [url]", "click on", "fill out the form", "take a screenshot", "scrape", "automate", "test the website", "log into", or any browser interaction request.
---

# Dev Browser

A CLI for controlling browsers with sandboxed JavaScript scripts.

## Installation

```bash
npm install -g dev-browser
dev-browser install
```

## Usage

Run `dev-browser --help` to learn more.

Named daemon-launched browsers persist by default. For unattended work, `--idle-timeout 5m` closes each launched browser after inactivity while preserving its profile and login state. The setting never closes Chrome attached with `--connect`; use `--idle-timeout 0` to disable configured cleanup.

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
