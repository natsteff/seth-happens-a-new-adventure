#!/bin/sh
set -eu
cd "$(dirname "$0")"
runtime="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies"
if ! command -v node >/dev/null 2>&1 && [ -x "$runtime/node/bin/node" ]; then
  export PATH="$runtime/node/bin:$PATH"
fi
if command -v pnpm >/dev/null 2>&1; then
  exec pnpm dev
fi
runtime="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies"
if [ -x "$runtime/node/bin/node" ] && [ -x "$runtime/bin/fallback/pnpm" ]; then
  export PATH="$runtime/node/bin:$PATH"
  exec "$runtime/bin/fallback/pnpm" dev
fi
printf '%s\n' 'Install Node.js >=22.12 and pnpm 11.25.0, then run pnpm install --frozen-lockfile and pnpm dev.' >&2
exit 1
