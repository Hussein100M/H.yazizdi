#!/usr/bin/env bash
# Set up OmniRoute locally, avoiding the pitfalls found during a real install.
#
#   ./setup-omniroute.sh            # global npm install (recommended, no build)
#   ./setup-omniroute.sh --source   # build from a git clone
#
# Every step here was executed and verified before being written down.

set -euo pipefail

PORT="${PORT:-20128}"
MODE="global"
CLONE_DIR="${CLONE_DIR:-OmniRoute}"
REPO="https://github.com/diegosouzapw/OmniRoute.git"

for arg in "$@"; do
  case "$arg" in
    --source) MODE="source" ;;
    --global) MODE="global" ;;
    -h|--help) sed -n '2,7p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "unknown option: $arg" >&2; exit 2 ;;
  esac
done

say()  { printf '\n\033[1;36m==> %s\033[0m\n' "$1"; }
warn() { printf '\033[1;33m!  %s\033[0m\n' "$1"; }
die()  { printf '\033[1;31mx  %s\033[0m\n' "$1" >&2; exit 1; }

# ---------------------------------------------------------------- requirements

say "Checking requirements"

command -v node >/dev/null 2>&1 || die "Node.js not found. Install Node 22.22.2+ (24 recommended)."
command -v npm  >/dev/null 2>&1 || die "npm not found."

NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
NODE_FULL=$(node -p 'process.versions.node')

# OmniRoute's engines field: >=22.22.2 <23 || >=24.0.0 <27
node -e '
  const [a,b,c] = process.versions.node.split(".").map(Number);
  const ok = (a === 22 && (b > 22 || (b === 22 && c >= 2))) || (a >= 24 && a < 27);
  process.exit(ok ? 0 : 1);
' || die "Node $NODE_FULL is outside the supported range (>=22.22.2 <23 or >=24 <27)."

echo "   node $NODE_FULL  ·  npm $(npm -v)"

# ------------------------------------------------------------------- RAM check
# Building from source peaks well above 12 GB with the default bundler. On a
# machine that cannot supply it the build is SIGKILLed by the OOM killer and
# prints no error at all -- it just stops. Detect this before it happens.

detect_ram_gb() {
  if [ -r /proc/meminfo ]; then
    awk '/MemTotal/ {printf "%d", $2/1024/1024}' /proc/meminfo
  elif command -v sysctl >/dev/null 2>&1; then
    sysctl -n hw.memsize 2>/dev/null | awk '{printf "%d", $1/1024/1024/1024}'
  else
    echo 0
  fi
}

RAM_GB=$(detect_ram_gb)
[ -n "$RAM_GB" ] || RAM_GB=0

# ------------------------------------------------------------- secret helpers

rand_b64() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 "$1" | tr -d '\n'
  else
    node -e "console.log(require('crypto').randomBytes($1).toString('base64'))"
  fi
}

rand_hex() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex "$1"
  else
    node -e "console.log(require('crypto').randomBytes($1).toString('hex'))"
  fi
}

# Set KEY=VALUE in a .env file, replacing the existing line if present.
set_env() {
  local file="$1" key="$2" value="$3"
  KEY="$key" VALUE="$value" FILE="$file" node -e '
    const fs = require("fs");
    const { KEY, VALUE, FILE } = process.env;
    const line = KEY + "=" + VALUE;
    let text = fs.readFileSync(FILE, "utf8");
    const re = new RegExp("^" + KEY.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=.*$", "m");
    text = re.test(text) ? text.replace(re, line) : text.replace(/\n*$/, "\n") + line + "\n";
    fs.writeFileSync(FILE, text);
  '
}

# ------------------------------------------------------------------ global path

if [ "$MODE" = "global" ]; then
  say "Installing omniroute globally"
  echo "   This ships prebuilt -- no compile step, so the memory trap below cannot bite."
  npm install -g omniroute

  say "Done"
  cat <<EOF

   Start it with:   omniroute

   Dashboard        http://localhost:$PORT
   API base URL     http://localhost:$PORT/v1

   Next, in the dashboard:
     1. Providers -> connect "OpenCode Free" (no signup) or "Kiro AI" (free Claude)
     2. Endpoints -> create an API key and copy it
     3. Point your tools at the base URL above, model: auto

   An API key is required even when REQUIRE_API_KEY=false -- see README.md.

EOF
  exit 0
fi

# ------------------------------------------------------------------ source path

say "Setting up from source"

if [ "$RAM_GB" -gt 0 ] && [ "$RAM_GB" -lt 16 ]; then
  warn "Detected ${RAM_GB} GB RAM. Building from source needs ~16 GB with the"
  warn "default bundler. Falling back to the webpack bundler, which peaks far lower."
  warn "If the build still dies silently, run this script without --source instead."
fi

command -v git >/dev/null 2>&1 || die "git not found."

if [ -d "$CLONE_DIR/.git" ]; then
  echo "   Reusing existing clone at $CLONE_DIR"
else
  say "Cloning"
  git clone --depth 1 "$REPO" "$CLONE_DIR"
fi

cd "$CLONE_DIR"

# --------------------------------------------------------------------- .env

if [ -f .env ]; then
  warn "A .env already exists -- leaving it untouched (secrets preserved)."
else
  say "Creating .env and generating the required secrets"
  # .env.example ships these EMPTY; the app refuses to start without them.
  cp .env.example .env

  set_env .env JWT_SECRET                 "$(rand_b64 48)"
  set_env .env API_KEY_SECRET             "$(rand_hex 32)"
  set_env .env OMNIROUTE_WS_BRIDGE_SECRET "$(rand_b64 32)"
  set_env .env STORAGE_ENCRYPTION_KEY     "$(rand_hex 32)"

  ADMIN_PASSWORD="$(rand_b64 12 | tr -d '=/+' | cut -c1-16)"
  set_env .env INITIAL_PASSWORD "$ADMIN_PASSWORD"

  set_env .env PORT "$PORT"
  set_env .env BASE_URL            "http://localhost:$PORT"
  set_env .env NEXT_PUBLIC_BASE_URL "http://localhost:$PORT"

  # Low-memory machines: the default (Turbopack) allocates outside the V8 heap,
  # so --max-old-space-size cannot rein it in. Webpack is the documented escape.
  if [ "$RAM_GB" -gt 0 ] && [ "$RAM_GB" -lt 16 ]; then
    set_env .env OMNIROUTE_USE_TURBOPACK 0
  fi

  printf '\n   Admin password: \033[1m%s\033[0m  (change it after first login)\n' "$ADMIN_PASSWORD"
fi

# ----------------------------------------------------------------- install

say "Installing dependencies (a few minutes)"
npm install --no-audit --no-fund

say "Verifying native dependencies"
npm run check:native-deps

say "Done"
cat <<EOF

   Start the dev server:   cd $CLONE_DIR && PORT=$PORT npm run dev

   Dashboard        http://localhost:$PORT
   API base URL     http://localhost:$PORT/v1
   Health check     http://localhost:$PORT/api/monitoring/health

   Do NOT run a production build and the dev server at the same time --
   together they exhaust memory on anything under ~16 GB.

   See README.md in this folder for the three pitfalls worth knowing.

EOF
