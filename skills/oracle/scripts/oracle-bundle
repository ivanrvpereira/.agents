#!/usr/bin/env bash
set -eo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

MAX_BYTES=$((1024 * 1024))
DRY_RUN=0
PROMPT=""
FILE_SELECTORS=()

usage() {
  cat <<'EOF'
Usage:
  oracle-bundle -p "<task>" --file "path|dir|glob" [--file "..."] [--dry-run] [--max-bytes N]

Notes:
  - Runs from the git repo root when inside a repo; otherwise uses $PWD.
  - --file accepts paths, dirs, or glob-like patterns (string globs).
  - Exclude patterns by prefixing with "!" (e.g. --file "!**/*.test.*").
EOF
}

trim() {
  local s="$1"
  s="${s#"${s%%[!$' \t\r\n']*}"}"
  s="${s%"${s##*[!$' \t\r\n']}"}"
  printf '%s' "$s"
}

has_glob_chars() {
  case "$1" in
    *'*'* | *'?'* | *'['* | *']'* ) return 0 ;;
    * ) return 1 ;;
  esac
}

file_size_bytes() {
  local path="$1"
  local size=""
  size="$(stat -f%z "$path" 2>/dev/null || true)"
  if [[ -n "$size" ]]; then
    printf '%s' "$size"
    return 0
  fi

  size="$(stat -c%s "$path" 2>/dev/null || true)"
  if [[ -n "$size" ]]; then
    printf '%s' "$size"
    return 0
  fi

  wc -c <"$path" | tr -d ' '
}

path_has_ignored_dir() {
  local rel="$1"
  case "$rel" in
    .git/* | */.git/*) return 0 ;;
    node_modules/* | */node_modules/*) return 0 ;;
    dist/* | */dist/*) return 0 ;;
    build/* | */build/*) return 0 ;;
    coverage/* | */coverage/*) return 0 ;;
    .next/* | */.next/*) return 0 ;;
    .turbo/* | */.turbo/*) return 0 ;;
    tmp/* | */tmp/*) return 0 ;;
    *) return 1 ;;
  esac
}

matches_any_pattern() {
  local rel="$1"
  shift
  local pat=""
  for pat in "$@"; do
    # shellcheck disable=SC2053
    [[ "$rel" == $pat ]] && return 0
  done
  return 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -p | --prompt)
      PROMPT="${2-}"
      shift 2
      ;;
    --file | -f)
      FILE_SELECTORS+=("${2-}")
      shift 2
      ;;
    --max-bytes)
      MAX_BYTES="${2-}"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      echo "error: unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

if [[ -z "$PROMPT" && ! -t 0 ]]; then
  PROMPT="$(cat)"
fi

if [[ -z "$(trim "$PROMPT")" ]]; then
  echo "error: prompt is empty (use -p/--prompt)" >&2
  exit 2
fi

cd "${ROOT_DIR}"

selectors=()
for raw in "${FILE_SELECTORS[@]-}"; do
  IFS=',' read -r -a parts <<<"$raw"
  for part in "${parts[@]}"; do
    part="$(trim "$part")"
    [[ -n "$part" ]] && selectors+=("$part")
  done
done

include_patterns=()
exclude_patterns=()

for sel in "${selectors[@]}"; do
  is_exclude=0
  if [[ "$sel" == !* ]]; then
    is_exclude=1
    sel="${sel:1}"
  fi

  sel="$(trim "$sel")"
  sel="${sel%/}"
  if [[ -z "$sel" ]]; then
    continue
  fi

  if [[ "$sel" == /* ]]; then
    if [[ "$sel" == "${ROOT_DIR}/"* ]]; then
      sel="${sel#"${ROOT_DIR}/"}"
    else
      echo "error: absolute paths must be under repo root: ${sel}" >&2
      exit 2
    fi
  fi

  if [[ -e "$sel" && -d "$sel" ]] && ! has_glob_chars "$sel"; then
    sel="${sel}/**"
  fi

  if [[ $is_exclude -eq 1 ]]; then
    exclude_patterns+=("$sel")
  else
    include_patterns+=("$sel")
  fi
done

if [[ "${#include_patterns[@]}" -eq 0 ]]; then
  echo "error: no include patterns provided (need at least one non-! --file)" >&2
  exit 2
fi

all_files=()
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  while IFS= read -r f; do
    [[ -n "$f" ]] && all_files+=("$f")
  done < <(git ls-files -co --exclude-standard)
else
  while IFS= read -r f; do
    f="${f#./}"
    [[ -n "$f" ]] && all_files+=("$f")
  done < <(find . -type f -print)
fi

selected=()
skipped=()

for rel in "${all_files[@]}"; do
  [[ -z "$rel" ]] && continue
  path_has_ignored_dir "$rel" && continue

  if ! matches_any_pattern "$rel" "${include_patterns[@]}"; then
    continue
  fi

  if [[ "${#exclude_patterns[@]}" -gt 0 ]] && matches_any_pattern "$rel" "${exclude_patterns[@]}"; then
    continue
  fi

  if [[ ! -f "$rel" ]]; then
    continue
  fi

  size="$(file_size_bytes "$rel")"
  if [[ "$size" -gt "$MAX_BYTES" ]]; then
    skipped+=("${rel} (too large: ${size} bytes)")
    continue
  fi

  selected+=("$rel")
done

if [[ "$DRY_RUN" -eq 1 ]]; then
  printf '%s\n' "${selected[@]}" | LC_ALL=C sort
  if [[ "${#skipped[@]}" -gt 0 ]]; then
    printf '\nSkipped:\n' >&2
    printf '%s\n' "${skipped[@]}" >&2
  fi
  exit 0
fi

printf '# Task\n\n%s\n\n# Files\n' "$(trim "$PROMPT")"
printf '%s\n' "${selected[@]}" | LC_ALL=C sort | while IFS= read -r rel; do
  [[ -z "$rel" ]] && continue
  printf '\n## %s\n\n```\n' "$rel"
  cat "$rel"
  printf '\n```\n'
done
