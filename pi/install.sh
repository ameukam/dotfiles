#!/usr/bin/env bash
# Symlink tracked Pi config into ~/.pi/agent (idempotent).
# Secrets and runtime state (auth.json, sessions/, npm/, caches) stay untracked.
set -euo pipefail
src="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/agent"
dst="${PI_CODING_AGENT_DIR:-$HOME/.pi/agent}"
mkdir -p "$dst"
for item in "$src"/* ; do
  name="$(basename "$item")"
  target="$dst/$name"
  if [ -L "$target" ]; then
    rm "$target"
  elif [ -e "$target" ]; then
    mv "$target" "$target.pre-dotfiles.$(date +%s)"
    echo "backed up existing $target"
  fi
  ln -s "$item" "$target"
  echo "linked $target -> $item"
done
