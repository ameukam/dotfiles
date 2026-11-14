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
    <td>git + jj (Jujutsu)</td>
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

VS Code settings and the extension list (`code --list-extensions`) are in `vscode/`.
Not tracked: `~/.ssh/config` (it names private hosts; only an old generic copy is here).

# Git / Jujutsu

`git/gitconfig` and `jj/config.toml` share one fork workflow (`origin` = fork, `upstream` =
project), SSH signing and DCO sign-off. Clone forks with `gh repo clone ameukam/<repo>` (adds
`upstream`), then optionally `jj git init --colocate`.

| Task | git | jj |
| --- | --- | --- |
| Start work on fresh upstream | `git new <branch>` | `jj fresh` |
| Rebase onto latest upstream | `git up` | `jj sync` |
| Fix up an earlier commit | `git fix <sha>` | `jj squash --into <rev>` |
| Push / open PR | `git push` then `gh pr create` | `jj pr @-` then `gh pr create` |
| Force-push after rebase | `git pushf` | `jj git push` |
| Clean up merged branches | `git gone` / `git dm` | automatic |
| Format the whole stack | – | `jj fix` (gofmt) |

Large k8s repos (`~/go/src/{k8s.io,sigs.k8s.io}`) get fsmonitor + `feature.manyFiles` via
`git/large-repos`.

# Pi coding agent

`pi/agent/` holds the tracked part of `~/.pi/agent` (settings, models, MCP servers,
extensions, prompt templates, subagent definitions). Link it into place with:

```bash
./pi/install.sh
```

Secrets and runtime state (`auth.json`, `sessions/`, `npm/`, caches) stay in
`~/.pi/agent` and are never committed.
