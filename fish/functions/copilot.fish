function copilot --description 'Copilot CLI; auto-approves tools under $GOPATH/src/github.com/ameukam'
    set -l gopath (string split -f1 : -- "$GOPATH")
    test -n "$gopath"; or set gopath $HOME/go
    set -l root (path resolve $gopath/src/github.com/ameukam)
    set -l here (path resolve $PWD)

    # "1" (not "true") auto-approves tools without also auto-trusting the folder.
    if test "$here" = "$root"; or string match -q -- "$root/*" $here
        COPILOT_ALLOW_ALL=1 command copilot $argv
    else
        command copilot $argv
    end
end
