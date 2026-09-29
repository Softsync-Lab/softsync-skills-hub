#!/usr/bin/env bash
# Zip each skill for assistants that take skill uploads (Claude.ai, ChatGPT).
# Writes dist/<skill>.zip, each holding one <skill>/SKILL.md folder.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf dist && mkdir dist
for dir in skills/*/; do
  name=$(basename "$dir")
  (cd skills && zip -qr "../dist/$name.zip" "$name")
done
ls dist
