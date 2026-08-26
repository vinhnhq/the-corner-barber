#!/usr/bin/env sh
#
# Runs the admin on your machine, against the production database.
#
# /admin has no login, so it is disabled on the deployed site — see
# src/lib/admin.ts. That does not mean the shop cannot use it: the admin is a
# normal page, and the database it reads is reachable from anywhere with the
# credentials. Running it locally gives full access to live bookings while the
# public deployment keeps returning 404.
#
# Needs a .env.turso holding the production credentials:
#
#   DATABASE_URL="libsql://…"
#   DATABASE_AUTH_TOKEN="…"
#
# The file is covered by the .env* ignore rule, so it is never committed.
# Vercel will not give you the token — variables marked Sensitive there are
# write-only and pull back as empty strings. Copy it from Turso instead.
#
# Usage: bun run admin:local   →   http://localhost:3000/admin

set -e

if [ ! -f .env.turso ]; then
  echo "" >&2
  echo "  Missing .env.turso" >&2
  echo "" >&2
  echo "  Create it with the production credentials:" >&2
  echo "" >&2
  echo '    DATABASE_URL="libsql://<db>-<org>.turso.io"' >&2
  echo '    DATABASE_AUTH_TOKEN="<token from: turso db tokens create the-corner>"' >&2
  echo "" >&2
  exit 1
fi

# Exported variables win over .env.local, so this reliably targets the remote
# database rather than the local file.
set -a
. ./.env.turso
set +a

case "${DATABASE_URL:-}" in
  libsql://*|https://*) ;;
  *)
    echo "  DATABASE_URL is not a remote Turso URL — this would edit your local file." >&2
    exit 1
    ;;
esac

if [ -z "${DATABASE_AUTH_TOKEN:-}" ]; then
  echo "  DATABASE_AUTH_TOKEN is empty. Turso will answer 401." >&2
  exit 1
fi

echo "  Admin against PRODUCTION data — changes here are live."
echo "  http://localhost:3000/admin"
echo ""

exec bun run next dev
