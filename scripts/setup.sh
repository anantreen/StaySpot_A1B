#!/usr/bin/env bash
# Bootstrap a fresh StaySpot database, not an existing populated installation.
# Run from any shell directory: this script first moves to its repository root.
# SQL and MongoDB servers must already be reachable; this script does not start them.
set -euo pipefail

# -e stops failed commands, -u catches missing variables, and pipefail exposes
# failed pipeline stages. Preflight checks run before any database writes.
cd "$(dirname "$0")/.."

# Export configured connection values for psql, mongosh and both Python seeders.
# .env is local configuration; the submitted .env.example documents its keys.
if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

# Retain the same portable defaults when a connection value is not supplied.
: "${DATABASE_URL:=postgresql://stayspot:stayspot@localhost:55434/stayspot}"
: "${MONGO_URL:=mongodb://localhost:27021}"
: "${MONGO_DB:=stayspot}"
export DATABASE_URL MONGO_URL MONGO_DB

# Fail before installing schema if a required client or seeder dependency is absent.
for executable in psql mongosh "${PYTHON:-python3}"; do
    if ! command -v "$executable" >/dev/null 2>&1; then
        echo "Missing setup tool: $executable. Install the README prerequisites first." >&2
        exit 1
    fi
done
"${PYTHON:-python3}" -c 'import psycopg, pymongo, faker'

# This is a first-run bootstrap, not a migration or a command to start the app.
# Detect an existing/partial schema before CREATE TABLE produces duplicate errors.
existing=$(psql "$DATABASE_URL" -X -A -t -v ON_ERROR_STOP=1 -c \
    "SELECT count(*) FROM pg_tables WHERE schemaname='public' AND tablename IN ('guests','properties','bookings','wallet_audit_logs','analytics_refresh_state');")
if [ "$existing" -gt 0 ]; then
    echo "Setup stopped: this PostgreSQL database already contains StaySpot tables." >&2
    echo "For an initialized project, use: npm run build, then npm start." >&2
    echo "If this is another project's database or an incomplete setup, check .env and select fresh dedicated databases." >&2
    echo "No existing tables or data were changed." >&2
    exit 1
fi

# Check MongoDB connectivity and avoid mixing new SQL data with old Mongo data.
# Search-session expiry is irrelevant here: reviews/catalogs also mark a used DB.
mongosh "$MONGO_URL/$MONGO_DB" --quiet --eval '
    db.adminCommand({ ping: 1 });
    const names = ["SearchSessions", "PropertyReviews", "PropertyAmenities"];
    if (names.some(name => db.getCollection(name).findOne() !== null)) {
        console.error("Setup stopped: MongoDB already contains StaySpot documents. Check .env before initializing a fresh project.");
        quit(1);
    }
' >/dev/null

# Preserve numbered dependency order and roll back all DDL if a file fails.
# The full seed phase runs afterward; existing datasets are never dropped/reseeded.
sql_arguments=()
for file in sql/0*.sql; do
    sql_arguments+=(-f "$file")
done
psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 --single-transaction \
    "${sql_arguments[@]}" >/dev/null

# Install document validation and indexes BEFORE inserting the generated records.
mongosh "$MONGO_URL/$MONGO_DB" --quiet -f mongo/01_collections_and_indexes.js

# Relational IDs must exist before MongoDB documents can refer to them. PYTHON can
# select a virtual-environment interpreter when the shell has not activated one.
"${PYTHON:-python3}" data_generation/postgres_seeder.py
"${PYTHON:-python3}" data_generation/mongo_seeder.py
echo "StaySpot setup completed. Run npm run build, then npm start."
