#!/bin/bash

# Read JSON input from stdin
input=$(cat)

# Extract values from JSON
model=$(echo "$input" | jq -r '.model.display_name // .model.id')
output_style=$(echo "$input" | jq -r '.output_style.name // "default"')
version=$(echo "$input" | jq -r '.version // "unknown"')
cwd=$(echo "$input" | jq -r '.workspace.current_dir // .cwd')
project_dir=$(echo "$input" | jq -r '.workspace.project_dir // ""')

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

# Build status line with colors (using printf for ANSI codes)
printf "\033[36m%s\033[0m" "$model"
if [ "$output_style" != "default" ]; then
    printf " \033[35m%s\033[0m" "($output_style)"
fi
printf " \033[33mv%s\033[0m" "$version"
printf " ${context_color}%s\033[0m" "$context_display"
if [ -n "$branch" ]; then
    printf " \033[32m%s\033[0m" "$branch"
fi
printf " \033[34m%s\033[0m" "$display_cwd"
printf "\n"
