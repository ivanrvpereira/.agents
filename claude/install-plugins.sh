#!/usr/bin/env bash
set -euo pipefail

info() { echo -e "\033[0;32m[INFO]\033[0m $*"; }
warn() { echo -e "\033[1;33m[WARN]\033[0m $*"; }

# --- Marketplaces ---
info "Adding marketplaces..."

marketplaces=(
    "anthropics/claude-plugins-official"
    "sawyerhood/dev-browser"
)

for mp in "${marketplaces[@]}"; do
    info "  $mp"
    claude plugin marketplace add "$mp" 2>/dev/null || warn "  already added or failed: $mp"
done

# --- User-scoped plugins ---
info "Installing plugins..."

plugins=(
    "typescript-lsp@claude-plugins-official"
    "pyright-lsp@claude-plugins-official"
    "gopls-lsp@claude-plugins-official"
    "dev-browser@dev-browser-marketplace"
)

for plugin in "${plugins[@]}"; do
    info "  $plugin"
    claude plugin install "$plugin" 2>/dev/null || warn "  failed: $plugin"
done

info "Done — all plugins installed."
