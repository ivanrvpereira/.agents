# Public Pi cache settings

Research date: 2026-10-23 UTC.

## Result

Public personal repositories contain all three native `cacheWarming` values: `idle`, `streaming`, and `off`.
Public shell files also contain explicit `PI_CACHE_RETENTION=long` and `PI_CACHE_RETENTION=short` choices.
These examples show different choices, not which choice saves the most money.

## Method

The searches used `gh search code` with `cacheWarming filename:settings.json`, `PI_CACHE_RETENTION`, and `PI_CACHE_RETENTION short`.
The investigation excluded application translations, benchmarks, workshops, test fixtures, and templates from the personal examples.
For example, `setwhite/pi-setup/config/settings.json` contains provider and model placeholders.
Each source in the tables has a fixed commit reference.
The parent session independently verified each value through `gh api repos/OWNER/REPO/contents/PATH?ref=COMMIT`.
Only relevant fields entered the report.

## Native warming examples

| Public source | `cacheWarming` | Default provider | Default model |
|---|---|---|---|
| [bry-guy/dotfiles](https://github.com/bry-guy/dotfiles/blob/a20e4e37ff4b9bdcfe64090cdedfa3cf5c8332cf/.pi/agent/settings.json) | `idle` | `anthropic` | `claude-opus-5-5` |
| [pcaro90/dotfiles](https://github.com/pcaro90/dotfiles/blob/e1c6215209027a24902c1d11053e1f1da964e9c6/.pi/agent/settings.json) | `idle` | `gateway` | `qwen3.8-27b` |
| [tekumara/setup](https://github.com/tekumara/setup/blob/b2748072f5175e4bd0a32fd14c53288e3c8b3929/dotfiles/.pi/agent/settings.json) | `idle` | `github-copilot` | `gpt-6.1-sol` |
| [mattprice/dotfiles](https://github.com/mattprice/dotfiles/blob/151e4cdb023d5869ab412c3191413ceecdcb62d0/pi/settings.json) | `idle` | `openai` | `gpt-6.1-sol` |
| [LEUNGUU/pi-agent-config](https://github.com/LEUNGUU/pi-agent-config/blob/9e51ac76119f1d1ecfde4b81d08428f159184d3e/settings.json) | `streaming` | `amazon-bedrock` | `global.anthropic.claude-opus-5-5` |
| [drsh4dow/.dotfiles](https://github.com/drsh4dow/.dotfiles/blob/40767bf9f10aff110d2e57fb471d2fe7d98dfb97/.pi/agent/settings.json) | `streaming` | `anthropic` | `claude-opus-5-5` |
| [mattrobenolt/pi-configs](https://github.com/mattrobenolt/pi-configs/blob/5c40e9154a4b564eabdfa8ab734c4822df64e18b/settings.json) | `streaming` | `fireworks` | `accounts/fireworks/models/glm-5p3` |
| [gabrielecanepa/dotfiles](https://github.com/gabrielecanepa/dotfiles/blob/3a81b448dce89a74c7c32cff03720414a3a6e6e8/.pi/agent/settings.json) | `streaming` | `claude-bridge` | `claude-opus-5-5` |
| [woksin/pi-setup](https://github.com/woksin/pi-setup/blob/165b5d62d9278a127039a611304c22038becb9b9/agent/settings.json) | `off` | `anthropic` | `claude-opus-5-5` |
| [akhilsbehl/configs](https://github.com/akhilsbehl/configs/blob/183e9959334e722851bbadf01c08592ae019767f/pi/settings.json) | `off` | `openai-codex` | `gpt-6.1-sol` |
| [clang-engineer/dotfiles](https://github.com/clang-engineer/dotfiles/blob/45e1bb0b0f0395616e425ce8b1324b4ed79e86da/chezmoi/private_dot_pi/agent/settings.json) | `off` | `openai` | `gpt-6-sol` |

Provider and model names are literal file values.
This report does not establish whether those providers support warming or whether the owners deploy these files.

## Retention examples

These sources are separate from the native warming examples.
The investigation did not establish a combined retention-and-warming choice for each owner.

| Public source | Explicit retention |
|---|---|
| [issmirnov/dotfiles](https://github.com/issmirnov/dotfiles/blob/8ae4a338c6f4935b6fce2f5123ec849350f556d7/zsh/config/env.zsh#L12) | `long` |
| [default-anton/dotfiles](https://github.com/default-anton/dotfiles/blob/57eb63ad2cd18ac12835bee84b348b564facf8f2/profile#L23) | `long` |
| [scottbenjamin/dotfiles](https://github.com/scottbenjamin/dotfiles/blob/1bd4dadef8cc73489a6fe009cd7b2fc55ddba72c/fish/conf.d/00-env.fish#L6) | `long` |
| [kansetsu7/dotfiles](https://github.com/kansetsu7/dotfiles/blob/8165ad3088666f50ee3842682664a64e441d221d/zsh/.zshenv#L11) | `long` |
| [tupoiu/dotfiles](https://github.com/tupoiu/dotfiles/blob/f8ad0d8a589646f118797ba5390153433aaba726/container-fish/conf.d/pi.fish#L1) | `short` |

## Limits

The sample contains selected public search results, not a random survey.
Search indexing, copied files, and private settings prevent a reliable estimate of community preferences.
An absent setting is not evidence of explicit `off` or `short`.
Local environment values, overrides, active models, and installed Pi versions remain unknown.
The files do not establish actual refreshes, cache hits, costs, or reasons for each choice.
