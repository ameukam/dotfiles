#!/usr/bin/env bash
# Run the permission-gate regression tests with Node's TypeScript stripping.
# The pi host package is replaced by a one-function stub in a temp dir.
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
stub="$tmp/node_modules/@earendil-works/pi-coding-agent"
mkdir -p "$stub"
echo '{"name":"@earendil-works/pi-coding-agent","type":"module","main":"index.js"}' > "$stub/package.json"
echo 'export const isToolCallEventType = (name, e) => e.toolName === name;' > "$stub/index.js"
cp "$here/../agent/extensions/permission-gate.ts" "$tmp/gate.ts"
cp "$here/permission-gate.test.ts" "$tmp/test.ts"
cd "$tmp" && node test.ts
