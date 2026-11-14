function zj --description 'Attach to (or create) a zellij session for the current project'
    if set -q ZELLIJ
        echo "zj: already inside zellij (use Ctrl-o w to switch sessions)" >&2
        return 1
    end

    set -l name $argv[1]
    if test -z "$name"
        set -l root (git rev-parse --show-toplevel 2>/dev/null; or pwd)
        set name (string replace -ra '[^A-Za-z0-9_-]' '_' (path basename $root))
    end

    if zellij list-sessions --short 2>/dev/null | string match -q -- $name
        zellij attach $name
    else
        zellij --session $name --new-session-with-layout dev
    end
end
