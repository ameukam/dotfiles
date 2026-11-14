if status is-interactive
    # 1Password shell plugins (uncomment after enabling app integration)
    # source /home/arnaudm/.config/op/plugins.sh

    # Install Fisher if missing
    if not functions -q fisher
        curl -sL https://git.io/fisher | source
        fisher install jorgebucaran/fisher
    end

    starship init fish | source
    atuin init fish | source
    fzf --fish | source
    zoxide init fish | source
end

# SSH logins (e.g. over Tailscale from the Mac or Pixel) get no agent socket; reuse the
# desktop session's GNOME agent so SSH commit signing works remotely.
if set -q SSH_CONNECTION; and not set -q SSH_AUTH_SOCK; and test -S /run/user/(id -u)/gcr/ssh
    set -gx SSH_AUTH_SOCK /run/user/(id -u)/gcr/ssh
end

set -xg EDITOR nvim
set -g theme_nerd_fonts yes
set -xg FZF_DEFAULT_COMMAND "fd --type file --color=always --follow --hidden --exclude .git"
set -xg FZF_DEFAULT_OPTS --ansi

test -d $HOME/.local/bin && fish_add_path $HOME/.local/bin
test -d $HOME/bin        && fish_add_path $HOME/bin
test -d $HOME/go         && set -xg GOPATH $HOME/go && fish_add_path $GOPATH/bin
test -d $HOME/.cargo     && fish_add_path $HOME/.cargo/bin

# Cache token: avoid spawning gh on every subshell
if not set -q GITHUB_PERSONAL_ACCESS_TOKEN
    set -gx GITHUB_PERSONAL_ACCESS_TOKEN (gh auth token 2>/dev/null)
end
# Pi's github-copilot provider only reads COPILOT_GITHUB_TOKEN (not GH_TOKEN/GITHUB_TOKEN)
if not set -q COPILOT_GITHUB_TOKEN; and test -n "$GITHUB_PERSONAL_ACCESS_TOKEN"
    set -gx COPILOT_GITHUB_TOKEN $GITHUB_PERSONAL_ACCESS_TOKEN
end
