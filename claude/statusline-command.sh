#!/bin/bash

# Read JSON input from stdin
input=$(cat)

# Extract values from JSON
model=$(echo "$input" | jq -r '.model.display_name // .model.id')
output_style=$(echo "$input" | jq -r '.output_style.name // "default"')
version=$(echo "$input" | jq -r '.version // "unknown"')
cwd=$(echo "$input" | jq -r '.workspace.current_dir // .cwd')
project_dir=$(echo "$input" | jq -r '.workspace.project_dir // ""')

# Cache / cost telemetry inputs (parsed from the live session transcript)
transcript_path=$(echo "$input" | jq -r '.transcript_path // ""')
session_cost=$(echo "$input" | jq -r '.cost.total_cost_usd // empty')

# Extract context window information (using the new API fields)
used_pct=$(echo "$input" | jq -r '.context_window.used_percentage // 0')
context_size=$(echo "$input" | jq -r '.context_window.context_window_size // 200000')

# Calculate tokens from percentage (to match /context display)
total_tokens=$(awk "BEGIN {printf \"%.0f\", $context_size * $used_pct / 100}")

# Round used_pct to integer
used_pct=$(awk "BEGIN {printf \"%.0f\", $used_pct}")

# Get git branch (skip optional locks for performance)
branch=""
if git -C "$cwd" rev-parse --git-dir > /dev/null 2>&1; then
    branch=$(git -C "$cwd" --no-optional-locks rev-parse --abbrev-ref HEAD 2>/dev/null)
    if [ -n "$branch" ]; then
        branch="[$branch]"
    fi
fi


# Shorten the current directory for display
display_cwd="$cwd"
if [ -n "$project_dir" ] && [[ "$cwd" == "$project_dir"* ]]; then
    # Show path relative to project root
    relative_path="${cwd#$project_dir}"
    if [ -z "$relative_path" ]; then
        display_cwd="$(basename "$project_dir")"
    else
        display_cwd="$(basename "$project_dir")$relative_path"
    fi
else
    # Show just the last 2 directories
    display_cwd=$(echo "$cwd" | awk -F/ '{if(NF>2) print $(NF-1)"/"$NF; else print $0}')
fi

# Format context window info with color based on token usage
# Research shows performance degrades significantly after ~50K tokens
# Green (<50K): Optimal zone, minimal degradation
# Yellow (50K-100K): Attention dilution begins
# Red (>100K): Significant "lost in middle" risk
if [ "$total_tokens" -lt 50000 ]; then
    context_color="\033[32m"  # Green
elif [ "$total_tokens" -lt 100000 ]; then
    context_color="\033[33m"  # Yellow
else
    context_color="\033[31m"  # Red
fi

# Format tokens in K (thousands)
if [ "$total_tokens" != "null" ] && [ -n "$total_tokens" ]; then
    tokens_k=$(awk "BEGIN {printf \"%.1f\", $total_tokens/1000}")
    context_k=$(awk "BEGIN {printf \"%.0f\", $context_size/1000}")
    context_display="[${tokens_k}K/${context_k}K ${used_pct}%]"
else
    context_display="[${used_pct}%]"
fi

# Cache health + burst detection, parsed from the live transcript.
# Emits a pre-colored segment: ⚡<hit%> ↻<rewrite×> [⚠BURST+<k>] [$cost]
#   ⚡ hit%     — cache_read / (read + create + input) for the LAST request
#   ↻ rewrite× — Σ cache_creation / current context size (cumulative re-write)
#   ⚠BURST     — last request's established cache read collapsed while re-writing
# Fails silent (empty segment) if the transcript/python are unavailable.
cache_segment=""
if [ -n "$transcript_path" ] && [ -f "$transcript_path" ] && command -v python3 >/dev/null 2>&1; then
    cache_segment=$(python3 - "$transcript_path" "$session_cost" <<'PYCACHE' 2>/dev/null
import json, sys

tp = sys.argv[1] if len(sys.argv) > 1 else ""
cost_raw = sys.argv[2] if len(sys.argv) > 2 else ""

G, Y, R, BR, DIM, RST = "\033[32m", "\033[33m", "\033[31m", "\033[1;91m", "\033[90m", "\033[0m"

msgs = []
seen = set()  # dedup: Claude Code logs one assistant message on several lines
try:
    with open(tp, errors="replace") as f:
        for line in f:
            if '"usage"' not in line:
                continue
            try:
                e = json.loads(line)
            except Exception:
                continue
            if e.get("isSidechain"):
                continue
            m = e.get("message") or {}
            if m.get("role") != "assistant":
                continue
            key = e.get("requestId") or m.get("id")
            if key is not None and key in seen:
                continue
            u = m.get("usage") or {}
            inp = u.get("input_tokens", 0) or 0
            cr = u.get("cache_read_input_tokens", 0) or 0
            cc = u.get("cache_creation_input_tokens", 0) or 0
            if inp == 0 and cr == 0 and cc == 0:
                continue
            if key is not None:
                seen.add(key)
            msgs.append((inp, cr, cc))
except Exception:
    sys.exit(0)

if not msgs:
    sys.exit(0)

tot_cc = sum(m[2] for m in msgs)
li, lcr, lcc = msgs[-1]
ctx = li + lcr + lcc
hit = 100.0 * lcr / ctx if ctx else 0.0
mult = tot_cc / ctx if ctx else 0.0

# Burst: an established cache read collapsed while a large re-write happened.
# Requires the prior request to have been reading a real cache (not warmup).
burst_k = None
if len(msgs) >= 2:
    pin, pcr, pcc = msgs[-2]
    prev_ctx = pin + pcr + pcc
    if pcr > 20000 and prev_ctx > 0 and lcr < 0.6 * prev_ctx and lcc > 15000:
        burst_k = round(lcc / 1000)

hit_c = G if hit >= 85 else (Y if hit >= 50 else R)
mult_c = G if mult < 2 else (Y if mult <= 5 else R)

seg = f"{hit_c}⚡{hit:.0f}%{RST} {mult_c}↻{mult:.1f}×{RST}"
if burst_k is not None:
    seg += f" {BR}⚠BURST+{burst_k}k{RST}"
if cost_raw:
    try:
        seg += f" {DIM}${float(cost_raw):.2f}{RST}"
    except ValueError:
        pass

sys.stdout.write(seg)
PYCACHE
)
fi

# Build status line with colors (using printf for ANSI codes)
printf "\033[36m%s\033[0m" "$model"
if [ "$output_style" != "default" ]; then
    printf " \033[35m%s\033[0m" "($output_style)"
fi
printf " \033[33mv%s\033[0m" "$version"
printf " ${context_color}%s\033[0m" "$context_display"
if [ -n "$cache_segment" ]; then
    printf ' %s' "$cache_segment"
fi
if [ -n "$branch" ]; then
    printf " \033[32m%s\033[0m" "$branch"
fi
printf " \033[34m%s\033[0m" "$display_cwd"
printf "\n"
