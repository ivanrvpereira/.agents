# Modern CLI Tools

When using Bash, prefer these modern tools over traditional Unix commands:

## Use via Bash
- `jq` for JSON processing — avoids dumping raw JSON or writing scripts
- `sd 'pattern' 'replacement'` instead of `sed` — simpler regex, fewer escaping errors
- `trash <file>` instead of `rm` — recoverable deletion, safer for destructive ops
- `bat <file>` for syntax-aware file inspection in pipes (don't alias over cat)
- `gh` for all GitHub operations — prefer over WebFetch for GitHub URLs
- `dua` for disk usage analysis — cleaner output than `du | sort`
- `procs` for process inspection — structured output, better than `ps aux | grep`

## Already handled by built-in tools (skip in Bash)
- Grep tool uses ripgrep internally — don't use `rg` in Bash
- Glob tool provides fd-like matching — don't use `fd` in Bash
- Read tool reads files — don't use `cat` or `bat` for plain file reading
- `eza` adds no value for LLM context — `ls` is fine when Bash is needed
- `fzf` is interactive/TUI — cannot be used by agents
- `zoxide` relies on user history — agents use absolute paths
