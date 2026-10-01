#!/usr/bin/env bash
# Build the plugin ZIP for ChatGPT's plugin directory (platform.openai.com/plugins).
# Writes dist/softsync-plugin.zip with plugin.json, mcp.json, skills/ and assets/
# at the archive root. Other assistants' manifests are left out so ChatGPT reads
# only the portable plugin.json.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p dist
rm -f dist/softsync-plugin.zip
zip -qr dist/softsync-plugin.zip plugin.json mcp.json skills assets README.md LICENSE -x '*.DS_Store'
ls -l dist/softsync-plugin.zip
