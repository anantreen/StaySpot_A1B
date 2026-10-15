# StaySpot integration tests

Run commands from the project root after installing the JavaScript dependencies and Python requirements. Use a separate, seeded test installation with dedicated PostgreSQL and MongoDB databases configured in its `.env`.

The API suite creates guests, bookings, audit entries and search pins, and refreshes materialized summaries. Those fixtures are retained in the selected test databases. The Python suite rolls back its SQL fixtures; its MongoDB checks are read-only. Do not point either workflow at a database whose demo state must stay unchanged.

```bash
# In the dedicated test installation, following first-time setup:
set -a
source .env
set +a
npm test
python tests/database_checks.py
python scripts/check_members.py
```

The [test entry point](workflows.test.js) imports each member's `tests/workflows.cases.js`; [helpers.js](helpers.js) supplies the real Express/PostgreSQL/MongoDB harness. Missing database environment variables cause explicit skips, rather than a claimed live-engine pass. A full seed is needed for the 1,000-booking pagination case and the assignment-scale checks. The Python telemetry-count check should run soon after seeding because search sessions expire after two hours.

The [setup and layout verification](../docs/structure_verification.md) records a complete fresh seed, 13 API passes, eight database passes and a production build using disposable databases, with the original demo data preserved.
