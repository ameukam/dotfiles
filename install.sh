#!/usr/bin/env bash
# Symlink tracked config into $HOME (idempotent). Existing files are moved to a
# timestamped backup directory, never overwritten. Secrets stay untracked.
set -euo pipefail
repo="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
backup="$HOME/.local/share/dotfiles-backup/$(date +%Y%m%d-%H%M%S)"

link() { # link <repo-relative source> <absolute target>
  local src="$repo/$1" dst="$2"
  if [ -L "$dst" ] && [ "$(readlink "$dst")" = "$src" ]; then return; fi
  if [ -e "$dst" ] || [ -L "$dst" ]; then
    mkdir -p "$backup/$(dirname "${dst#$HOME/}")"
    mv "$dst" "$backup/${dst#$HOME/}"
    echo "backed up $dst"
  fi
  mkdir -p "$(dirname "$dst")"
  ln -s "$src" "$dst"
  echo "linked $dst"
}

for f in config.fish fish_plugins conf.d/abbr.fish conf.d/pi.fish \
         conf.d/fish_frozen_key_bindings.fish conf.d/fish_frozen_theme.fish \
         functions/copilot.fish functions/zj.fish; do
  link "fish/$f" "$HOME/.config/fish/$f"
done
link nvim                  "$HOME/.config/nvim"
link starship.toml         "$HOME/.config/starship.toml"
link atuin/config.toml     "$HOME/.config/atuin/config.toml"
link zellij/config.kdl     "$HOME/.config/zellij/config.kdl"
link zellij/layouts/dev.kdl "$HOME/.config/zellij/layouts/dev.kdl"
link tmux/tmux.conf.local  "$HOME/.tmux.conf.local"
link git/gitconfig         "$HOME/.gitconfig"
link git/ignore            "$HOME/.config/git/ignore"
link git/allowed_signers   "$HOME/.config/git/allowed_signers"
link bin/git-sync          "$HOME/bin/git-sync"
link bin/terraform         "$HOME/bin/terraform"

"$repo/pi/install.sh"
