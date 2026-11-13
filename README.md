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
    <td>tmux</td>
  </tr>
</table>

# Pi coding agent

`pi/agent/` holds the tracked part of `~/.pi/agent` (settings, models, MCP servers,
extensions, prompt templates, subagent definitions). Link it into place with:

```bash
./pi/install.sh
```

Secrets and runtime state (`auth.json`, `sessions/`, `npm/`, caches) stay in
`~/.pi/agent` and are never committed.
