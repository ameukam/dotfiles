# If you come from bash you might have to change your $PATH.
# export PATH=$HOME/bin:/usr/local/bin:$PATH

# Path to your oh-my-zsh installation.
export ZSH="/home/ameukam/.oh-my-zsh"


# Set name of the theme to load --- if set to "random", it will
# load a random theme each time oh-my-zsh is loaded, in which case,
# to know which specific one was loaded, run: echo $RANDOM_THEME
# See https://github.com/robbyrussell/oh-my-zsh/wiki/Themes
ZSH_THEME="powerlevel10k/powerlevel10k"

#VISUAL
POWERLEVEL9K_MODE="nerdfont-complete"

POWERLEVEL9K_PROMPT_ON_NEWLINE=true
POWERLEVEL9K_MULTILINE_LAST_PROMPT_PREFIX="▶ "
POWERLEVEL9K_MULTILINE_FIRST_PROMPT_PREFIX=""

POWERLEVEL9K_LEFT_PROMPT_ELEMENTS=(context dir vcs)
POWERLEVEL9K_RIGHT_PROMPT_ELEMENTS=(status background_jobs aws ip kubecontext \
  dir_writable root_indicator vi_mode go_version)
POWERLEVEL9K_SHORTEN_DIR_LENGTH=3
POWERLEVEL9K_SHORTEN_DELIMITER=""
POWERLEVEL9K_SHORTEN_STRATEGY="truncate_from_right"
POWERLEVEL9K_SHOW_CHANGESET=true
POWERLEVEL9K_CHANGESET_HASH_LENGTH=8


POWERLEVEL9K_IP_INTERFACE="enp58s0u1"

POWERLEVEL9K_TIME_FOREGROUND="245"
POWERLEVEL9K_COMMAND_EXECUTION_TIME_FOREGROUND="245"

POWERLEVEL9K_STATUS_OK_FOREGROUND="green"
POWERLEVEL9k_STATUS_ERROR_FOREGROUND="red"
POWERLEVEL9K_STATUS_ERROR_FOREGROUND="red"

POWERLEVEL9K_TIME_BACKGROUND="clear"
POWERLEVEL9K_COMMAND_EXECUTION_TIME_BACKGROUND="clear"

POWERLEVEL9K_STATUS_ERROR_BACKGROUND="black"
POWERLEVEL9K_DIR_WRITABLE_FORBIDDEN_BACKGROUND="clear"
POWERLEVEL9K_DIR_WRITABLE_FORBIDDEN_FOREGROUND="red"

POWERLEVEL9K_COLOR_SCHEME="dark"
# Set list of themes to pick from when loading at random
# Setting this variable when ZSH_THEME=random will cause zsh to load
# a theme from this variable instead of looking in ~/.oh-my-zsh/themes/
# If set to an empty array, this variable will have no effect.
# ZSH_THEME_RANDOM_CANDIDATES=( "robbyrussell" "agnoster" )

# Uncomment the following line to use case-sensitive completion.
# CASE_SENSITIVE="true"

# Uncomment the following line to use hyphen-insensitive completion.
# Case-sensitive completion must be off. _ and - will be interchangeable.
# HYPHEN_INSENSITIVE="true"

# Uncomment the following line to disable bi-weekly auto-update checks.
# DISABLE_AUTO_UPDATE="true"

# Uncomment the following line to automatically update without prompting.
# DISABLE_UPDATE_PROMPT="true"

# Uncomment the following line to change how often to auto-update (in days).
# export UPDATE_ZSH_DAYS=13

# Uncomment the following line if pasting URLs and other text is messed up.
# DISABLE_MAGIC_FUNCTIONS=true

# Uncomment the following line to disable colors in ls.
# DISABLE_LS_COLORS="true"

# Uncomment the following line to disable auto-setting terminal title.
# DISABLE_AUTO_TITLE="true"

# Uncomment the following line to enable command auto-correction.
# ENABLE_CORRECTION="true"

# Uncomment the following line to display red dots whilst waiting for completion.
# COMPLETION_WAITING_DOTS="true"

# Uncomment the following line if you want to disable marking untracked files
# under VCS as dirty. This makes repository status check for large repositories
# much, much faster.
# DISABLE_UNTRACKED_FILES_DIRTY="true"

# Uncomment the following line if you want to change the command execution time
# stamp shown in the history command output.
# You can set one of the optional three formats:
# "mm/dd/yyyy"|"dd.mm.yyyy"|"yyyy-mm-dd"
# or set a custom format using the strftime function format specifications,
# see 'man strftime' for details.
# HIST_STAMPS="mm/dd/yyyy"
HISTFILE=$HOME/.zsh_history
HISTSIZE=1000000
SAVEHIST=$HISTSIZE

# Would you like to use another custom folder than $ZSH/custom?
# ZSH_CUSTOM=/path/to/new-custom-folder

# Which plugins would you like to load?
# Standard plugins can be found in ~/.oh-my-zsh/plugins/*
# Custom plugins may be added to ~/.oh-my-zsh/custom/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# Add wisely, as too many plugins slow down shell startup.
plugins=(
    archlinux
    ansible
    aws
    gcloud
    colorize
    common-aliases
    docker
    fd
    fzf
    git gitfast github git-extras git-prompt
    gpg-agent
    golang
    httpie
    kubectl
    man
    python
    ripgrep
    ssh-agent
    sudo
    systemd
    terraform
    tig
    tmux
    vagrant
    zsh-completions
    zsh-autosuggestions
    zsh-syntax-highlighting
)

source $ZSH/oh-my-zsh.sh
source $HOME/.local/bin/aws_zsh_completer.sh


# User configuration
# Completion.
fpath=(~/.zsh/completions $fpath)
autoload -Uz compinit
compinit
zstyle ':completion:*' matcher-list 'm:{a-z}={A-Z}'
zstyle ':completion:*' completer _expand _complete _ignored _approximate
zstyle ':completion:*' menu select=2
zstyle ':completion:*' select-prompt '%SScrolling active: current selection at %p%s'
zstyle ':completion::complete:*' use-cache 1
zstyle ':completion:*:descriptions' format '%U%F{cyan}%d%f%u'

# Ignore duplicate in history.
setopt hist_ignore_dups


# Prevent record in history entry if preceding them with at least one space
setopt hist_ignore_space

# Nobody need flow control anymore. Troublesome feature.
#stty -ixon
setopt noflowcontrol

# export MANPATH="/usr/local/man:$MANPATH"
export PATH="${KREW_ROOT:-$HOME/.krew}/bin:$PATH"
# You may need to manually set your language environment
export LC_ALL="en_US.UTF-8"
export LANG=en_US.UTF-8

# Preferred editor for local and remote sessions
# if [[ -n $SSH_CONNECTION ]]; then
#   export EDITOR='vim'
# else
#   export EDITOR='mvim'
# fi
export EDITOR="nvim"
# Compilation flags
# export ARCHFLAGS="-arch x86_64"

# Set personal aliases, overriding those provided by oh-my-zsh libs,
# plugins, and themes. Aliases can be placed here, though oh-my-zsh
# users are encouraged to define aliases within the ZSH_CUSTOM folder.
# For a full list of active aliases, run `alias`.
#
# Example aliases
# alias zshconfig="mate ~/.zshrc"
# alias ohmyzsh="mate ~/.oh-my-zsh"

# Golang
export GOPATH="$HOME/go"
export GOBIN="$GOPATH/bin"
export PATH="$PATH:/usr/local/go/bin:$GOBIN"
export GO111MODULE="on"
export GOPROXY="https://proxy.golang.org,direct"
export GOSUMDB="sum.golang.org"
#Docker buildkit
DOCKER_BUILDKIT=1

# Kubectl aliases
[ -f ~/.kubectl_aliases ] && source ~/.kubectl_aliases

export BAT_THEME="Monokai Extended Light"

# To customize prompt, run `p10k configure` or edit ~/.p10k.zsh.
[[ -f ~/.p10k.zsh ]] && source ~/.p10k.zsh
