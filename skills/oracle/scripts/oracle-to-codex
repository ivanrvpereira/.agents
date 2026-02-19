#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

"${SCRIPT_DIR}/oracle-bundle" "$@" \
  | codex exec \
      -m gpt-5.3-codex \
      -c 'model_reasoning_effort="xhigh"' \
      -c 'approval_policy="never"' \
      -c 'sandbox_mode="read-only"' \
      -C "${ROOT_DIR}" \
      --skip-git-repo-check \
      -
