# Arnaud's Dotfiles

Dotfiles i have used and tweaked over the time.

# Setup

<table>
  <tr>
    <th>Terminal</th>
    <th>Shell</th>
    <th>Editor</th>
    <th>Version control</th>
    <th>Multiplexer</th>
  </tr>
  <tr>
    <td>Ghostty</td>
    <td>fish</td>
    <td>neovim</td>
    <td>git</td>
    <td>zellij (tmux kept)</td>
  </tr>
</table>

# Install

```bash
./install.sh
```

Symlinks fish, Neovim (LazyVim), starship, atuin, zellij, tmux (`~/.tmux.conf.local` for
[oh-my-tmux](https://github.com/gpakosz/.tmux)), git and `~/bin` scripts into place, then
runs `pi/install.sh`. Existing files are moved to
`~/.local/share/dotfiles-backup/<timestamp>/`, never overwritten. Re-running it is a no-op.

Packages: `packages/pacman.txt` (repo) and `packages/aur.txt` (AUR), from `pacman -Qqen` /
`pacman -Qqem`. Reinstall with `sudo pacman -S --needed - < packages/pacman.txt`.

`bin/terraform` dispatches each directory to its `required_version` via `tfswitch -b`, using a
per-directory link instead of a shared `~/bin/terraform` symlink.

Not tracked here: `.ssh/config` beyond the old copy (it names private hosts) and VS Code
settings (`vscode/`, stale).

# Pi coding agent

`pi/agent/` holds the tracked part of `~/.pi/agent` (settings, models, MCP servers,
extensions, prompt templates, subagent definitions). Link it into place with:

```bash
./pi/install.sh
```

Secrets and runtime state (`auth.json`, `sessions/`, `npm/`, caches) stay in
`~/.pi/agent` and are never committed.
