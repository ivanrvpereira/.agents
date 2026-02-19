#!/bin/bash
# Check if marp-cli is installed and provide installation instructions if not

if command -v marp &> /dev/null; then
    echo "marp-cli is installed: $(marp --version)"
    exit 0
fi

if command -v npx &> /dev/null; then
    echo "marp-cli not found globally, but npx is available."
    echo "Use: npx @marp-team/marp-cli <file.md>"
    exit 0
fi

echo "marp-cli is not installed."
echo ""
echo "Install options:"
echo "  npm install -g @marp-team/marp-cli"
echo "  brew install marp-cli"
echo "  Or use: npx @marp-team/marp-cli <file.md>"
exit 1
